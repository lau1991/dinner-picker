// ============================================================
// Recommendation engine — pure functions over the mock data.
// No DOM here, so this is the part you'd later swap for a backend call.
// ============================================================

import { dishesByCategory, structures, categoryMeta } from './data.js';

// Weighted random pick: dishes matching active filters get a boost.
function pickWeighted(candidates, activeFilters) {
  const weighted = candidates.map((d) => {
    let w = 1;
    if (activeFilters.has('light') && d.tags.includes('light')) w += 3;
    if (activeFilters.has('quick') && (d.tags.includes('quick') || d.cookingTime <= 15)) w += 3;
    if (activeFilters.has('fridge') && d.tags.includes('fridge')) w += 3;
    if (activeFilters.has('baby') && d.babyAdaptable) w += 3;
    return { d, w };
  });
  const total = weighted.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const { d, w } of weighted) {
    r -= w;
    if (r <= 0) return d;
  }
  return weighted[weighted.length - 1].d;
}

// Pick one dish for a category, avoiding ids already chosen for the same meal.
function pickForCategory(category, activeFilters, usedIds) {
  const pool = (dishesByCategory[category] || []).filter((d) => !usedIds.has(d.id));
  const candidates = pool.length ? pool : dishesByCategory[category] || [];
  return pickWeighted(candidates, activeFilters);
}

/** Compute the reel label for a slot, disambiguating 主菜1 / 主菜2 when needed. */
export function slotLabel(slots, index) {
  const cat = slots[index];
  const base = categoryMeta[cat].tag;
  const sameCat = slots.filter((c) => c === cat);
  if (sameCat.length > 1) {
    const ordinal = slots.slice(0, index + 1).filter((c) => c === cat).length;
    return `${base}${ordinal}`;
  }
  return base;
}

/** Build a full meal for a structure. `locked` maps slot index -> dish (kept as-is). */
export function buildMeal(structure, activeFilters, locked = {}) {
  const usedIds = new Set(Object.values(locked).map((d) => d.id));
  const items = structure.slots.map((cat, i) => {
    if (locked[i]) return locked[i];
    const dish = pickForCategory(cat, activeFilters, usedIds);
    usedIds.add(dish.id);
    return dish;
  });
  return items.map((dish, i) => ({
    dish,
    slotIndex: i,
    category: structure.slots[i],
    label: slotLabel(structure.slots, i),
  }));
}

/** Reroll a single slot only, keeping every other item. */
export function rerollSlot(meal, structure, slotIndex, activeFilters) {
  const cat = structure.slots[slotIndex];
  const usedIds = new Set(meal.filter((it, i) => i !== slotIndex).map((it) => it.dish.id));
  const dish = pickForCategory(cat, activeFilters, usedIds);
  return meal.map((it) => (it.slotIndex === slotIndex ? { ...it, dish } : it));
}

// --- Baby meal: adapted from the adult meal, not chosen independently. ---
export function deriveBabyItems(meal) {
  return meal
    .filter((it) => it.dish.babyAdaptable)
    .map((it) => ({
      name: it.dish.babyVersionName,
      fromName: it.dish.name,
      instruction: it.dish.babyInstruction,
      cautions: it.dish.babyCautions,
      emoji: it.dish.emoji,
      hue: it.dish.hue,
    }));
}

// Aggregate every safety chip across the baby items (deduped).
export function babySafetyChips(babyItems) {
  const set = new Set();
  babyItems.forEach((b) => b.cautions.forEach((c) => set.add(c)));
  set.add('可可友善');
  return [...set];
}

// --- Cooking-order tip, generated from what's actually on the menu. ---
export function cookingTip(meal) {
  const steps = [];
  const has = (cat) => meal.some((it) => it.category === cat);
  if (has('soup')) steps.push('先煲湯');
  if (meal.some((it) => it.category === 'main' && it.dish.name.includes('蒸'))) steps.push('再蒸餸');
  else if (has('main')) steps.push('再煮主菜');
  if (has('vegetable')) steps.push('最後炒菜');
  if (steps.length < 2) return '備好材料，由耐煮到快熟逐樣上，時間更順手！';
  return `${steps.join('，')}，時間更順手！`;
}

// --- Reason line, built from structure + active filters. ---
export function mealReason(structure, activeFilters) {
  const bits = [];
  if (activeFilters.has('light')) bits.push('清淡');
  if (activeFilters.has('quick')) bits.push('快手');
  if (activeFilters.has('fridge')) bits.push('用埋雪櫃食材');
  if (activeFilters.has('baby')) bits.push('可可友善');
  if (!bits.length) bits.push('營養均衡', '一家四口啱食');
  return bits.join('、');
}

export function totalTime(meal) {
  // Dishes mostly cook in parallel — estimate by the slowest plus a little prep.
  const max = Math.max(...meal.map((it) => it.dish.cookingTime));
  return max + 10;
}

export function findStructure(id) {
  return structures.find((s) => s.id === id) || structures[0];
}
