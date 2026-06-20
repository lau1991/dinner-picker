// ============================================================
// Recommendation engine — pure functions over the mock data.
// Swap these for a backend later; the result shape stays the same.
// ============================================================

import {
  items, mealTypes, mealTypeById, homeStyleStructures, lowEffortTypes,
} from './data.js';

const HOME = 'home_style_rice';

// --- Generic weighted pick ---------------------------------------------
function pickByWeight(list, weightOf) {
  const arr = list.map((x) => ({ x, w: Math.max(0.001, weightOf(x)) }));
  const total = arr.reduce((s, a) => s + a.w, 0);
  let r = Math.random() * total;
  for (const a of arr) { r -= a.w; if (r <= 0) return a.x; }
  return arr[arr.length - 1].x;
}

// --- Meal-type selection -----------------------------------------------
/** Weighted draw across meal types. 少洗鑊/15分鐘 boost the low-effort types. */
export function weightedPickMealType(conds) {
  const boost = conds.has('low_wash') || conds.has('quick');
  return pickByWeight(mealTypes, (m) => {
    let w = m.defaultWeight;
    if (boost && lowEffortTypes.includes(m.id)) w *= 2.2;
    return w;
  }).id;
}

/** Uniform "surprise me" — any meal type, equal odds. */
export function uniformPickMealType() {
  return mealTypes[Math.floor(Math.random() * mealTypes.length)].id;
}

export function pickHomeStructure() {
  return pickByWeight(homeStyleStructures, (s) => s.weight);
}

// --- Columns for a meal type -------------------------------------------
/** Returns [{ role, label }] for the reels. Home style uses its structure. */
export function columnsFor(typeId, structure) {
  if (typeId === HOME) return structure.slots.map((s) => ({ role: s.role, label: s.label }));
  return mealTypeById[typeId].columns.map((c) => ({ ...c }));
}

// --- Item pool for a (mealType, role) ----------------------------------
function poolFor(typeId, role) {
  // Home style maps 主餸/配餸 onto the shared "main" dishes by role membership.
  return items.filter((i) => i.mealTypes.includes(typeId) && i.roles.includes(role));
}

function pickItem(typeId, role, conds, usedIds) {
  let pool = poolFor(typeId, role).filter((i) => !usedIds.has(i.id));
  if (!pool.length) pool = poolFor(typeId, role);

  // Hard conditions (with fallback so the meal is never left incomplete).
  if (conds.has('baby')) {
    const b = pool.filter((i) => i.babyAdaptable);
    if (b.length) pool = b;
  }
  if (conds.has('quick')) {
    const q = pool.filter((i) => i.cookingTime <= 15);
    if (q.length) pool = q;
  }
  // Soft conditions nudge the odds.
  return pickByWeight(pool, (i) => {
    let w = 1;
    if (conds.has('light') && i.tags.includes('light')) w += 3;
    if (conds.has('fridge') && i.tags.includes('fridge')) w += 3;
    return w;
  });
}

// --- Build a full meal -------------------------------------------------
// locked: map slotIndex -> { item, role } kept across re-rolls when the
// column at that index still has the same role.
export function buildMeal(typeId, structure, conds, locked = {}) {
  const cols = columnsFor(typeId, structure);
  const usedIds = new Set();
  Object.entries(locked).forEach(([i, l]) => {
    if (cols[i] && cols[i].role === l.role) usedIds.add(l.item.id);
  });

  return cols.map((c, i) => {
    const keep = locked[i] && cols[i].role === locked[i].role;
    if (keep) return { item: locked[i].item, role: c.role, label: c.label, slotIndex: i };
    const item = pickItem(typeId, c.role, conds, usedIds);
    usedIds.add(item.id);
    return { item, role: c.role, label: c.label, slotIndex: i };
  });
}

/** Reroll a single column only. Excludes the current item so it actually changes. */
export function rerollSlot(typeId, meal, slotIndex, conds) {
  const used = new Set(meal.map((m) => m.item.id)); // includes current -> forces a change
  const role = meal[slotIndex].role;
  const item = pickItem(typeId, role, conds, used);
  return meal.map((m) => (m.slotIndex === slotIndex ? { ...m, item } : m));
}

// --- Summaries ---------------------------------------------------------
function find(meal, role) { const m = meal.find((x) => x.role === role); return m ? m.item : null; }
const nm = (it) => (it ? it.name : '');
const sh = (it) => (it ? (it.short ?? it.name) : '');

/** The "組合" line: structure label for home, a dish-like combo otherwise. */
export function adultSummary(typeId, meal, structure) {
  switch (typeId) {
    case 'one_pot':
      return `${nm(find(meal, 'pot_type'))} + ${nm(find(meal, 'pot_staple'))}`;
    case 'fried_rice_noodles': {
      const extra = find(meal, 'frn_extra');
      const head = `${sh(find(meal, 'frn_protein'))}${nm(find(meal, 'frn_base'))}`;
      return extra ? `${head} + ${nm(extra)}` : head;
    }
    case 'rice_bowl':
      return `${sh(find(meal, 'bowl_sauce'))}${sh(find(meal, 'bowl_protein'))}飯 + ${nm(find(meal, 'bowl_side'))}`;
    case 'soup_noodle_congee':
      return `${sh(find(meal, 'snc_broth'))}${sh(find(meal, 'snc_protein'))}${sh(find(meal, 'snc_base'))} + 菜`;
    default:
      return structure ? structure.label : '';
  }
}

// --- Baby meal: same-source adaptation ---------------------------------
export function deriveBabyItems(typeId, meal) {
  const rule = mealTypeById[typeId].babyRule;
  const out = (rule.extra || []).map((e) => ({ ...e }));
  meal.forEach((m) => {
    if (m.item.babyAdaptable) {
      out.push({
        name: m.item.babyVersionName,
        fromName: m.item.name,
        instruction: m.item.babyInstruction,
        emoji: m.item.emoji,
        hue: m.item.hue,
        cautions: m.item.babyCautions || [],
      });
    }
  });
  return out;
}

export function babyTip(typeId) { return mealTypeById[typeId].babyRule.tip; }

export function babySafetyChips(typeId, babyItems) {
  const set = new Set(mealTypeById[typeId].babyRule.safety);
  babyItems.forEach((b) => (b.cautions || []).forEach((c) => set.add(c)));
  return [...set];
}

// --- Reason + time -----------------------------------------------------
export function mealReason(typeId, conds, auto) {
  const bits = [mealTypeById[typeId].displayName];
  if (conds.has('light')) bits.push('清淡少油');
  if (conds.has('quick')) bits.push('15分鐘');
  if (conds.has('fridge')) bits.push('用埋雪櫃');
  if (conds.has('low_wash')) bits.push('少洗鑊');
  if (conds.has('baby')) bits.push('可可友善');
  if (bits.length === 1) bits.push('一家四口啱食');
  const base = bits.join(' · ');
  return auto && typeId !== HOME ? `${base}（日常隨機抽中）` : base;
}

export function totalTime(meal) {
  const max = Math.max(...meal.map((m) => m.item.cookingTime));
  return max + 10;
}
