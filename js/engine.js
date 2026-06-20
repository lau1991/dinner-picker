// ============================================================
// Rule-based meal recommendation engine.
//   1. pick meal type (weighted, unless forced)
//   2. pick a structure (home style only)
//   3. generate ~30 candidate meals from the dish DB
//   4. score each (balance / filters / heaviness / recency / baby)
//   5. randomly pick one of the top 5 → result
//   6. derive the baby meal from the adult meal (same source)
// Pure-ish: only history.js touches localStorage. Swap for a backend later.
// ============================================================

import { dishes, dishById, mealTypes, mealTypeById } from './data.js';
import { recentDishIds, recentProteins } from './history.js';

const HOME = 'home_style_rice';
const STAPLE_CATS = ['staple', 'rice_bowl_base', 'fried_dish', 'one_pot_base', 'soup_noodle_dish'];

// --- small utils -------------------------------------------------------
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
function pickByWeight(list, weightOf) {
  const arr = list.map((x) => ({ x, w: Math.max(0.001, weightOf(x)) }));
  const total = arr.reduce((s, a) => s + a.w, 0);
  let r = Math.random() * total;
  for (const a of arr) { r -= a.w; if (r <= 0) return a.x; }
  return arr[arr.length - 1].x;
}

// --- meal type / structure selection -----------------------------------
export function weightedPickMealType(conds) {
  const lowEffort = ['one_pot', 'fried_rice_noodles', 'rice_bowl'];
  const boost = conds.has('low_wash') || conds.has('quick');
  return pickByWeight(mealTypes, (m) => {
    let w = m.weight;
    if (boost && lowEffort.includes(m.id)) w *= 2.2;
    return w;
  }).id;
}

export function pickStructure(mealType) {
  return pickByWeight(mealType.structures, (s) => s.weight);
}

function slotsFor(mealType, structure) {
  return mealType.id === HOME ? structure.slots : mealType.slots;
}

// --- candidate generation ----------------------------------------------
function poolFor(mealType, role, excludeId) {
  return dishes.filter((d) =>
    d.mealTypes.includes(mealType.id) && d.slotRoles.includes(role) && d.id !== excludeId);
}

function generateCandidates(mealType, structure, conds, locked, excludeId, n) {
  const slots = slotsFor(mealType, structure);
  const pools = slots.map((slot, i) => {
    if (locked[i] && locked[i].role === slot.role) return [locked[i].dish];
    return poolFor(mealType, slot.role, excludeId);
  });

  const cands = [];
  for (let k = 0; k < n; k++) {
    const used = new Set();
    const meal = slots.map((slot, i) => {
      let pool = pools[i].filter((d) => !used.has(d.id));
      if (!pool.length) pool = pools[i];
      const dish = rnd(pool);
      used.add(dish.id);
      return { dish, role: slot.role, label: slot.label };
    });
    cands.push(meal);
  }
  return cands;
}

// --- scoring -----------------------------------------------------------
function scoreMeal(meal, ctx) {
  const ds = meal.map((m) => m.dish);
  const proteins = ds.map((d) => d.protein).filter((p) => p && p !== 'none');
  const hasVeg = ds.some((d) => d.category === 'vegetable' || d.vegetables.length > 0);
  const hasStaple = ds.some((d) => STAPLE_CATS.includes(d.category));
  let s = 0;

  // --- balance ---
  if (hasVeg) s += 8;
  if (hasStaple) s += 4;
  if (proteins.length >= 1) s += 4;
  if (hasVeg && hasStaple && proteins.length >= 1) s += 6;          // complete meal
  s -= (proteins.length - new Set(proteins).size) * 8;             // duplicate protein
  if (ctx.mealType.id === HOME && !hasVeg) s -= 12;                // home needs a veg

  // --- not too heavy ---
  const rich = ds.filter((d) => d.oilLevel >= 4 || d.flavourProfile.includes('rich')).length;
  s -= Math.max(0, rich - 1) * 5;
  const fried = ds.filter((d) => d.cookingMethods.includes('pan_fry') || d.cookingMethods.includes('stir_fry')).length;
  s -= Math.max(0, fried - 2) * 3;
  if (ds.filter((d) => d.category === 'soup').length > 1) s -= 10;  // double soup
  if (ds.filter((d) => d.category === 'staple').length > 1) s -= 10; // double staple

  // --- goodWith / avoidWith ---
  for (const a of ds) {
    for (const b of ds) {
      if (a === b) continue;
      if (a.avoidWith.includes(b.id)) s -= 6;
      if (a.goodWith.includes(b.id)) s += 3;
    }
  }

  // --- filters ---
  if (ctx.conds.has('quick')) {
    s += ds.every((d) => d.timeMinutes <= 20) ? 6 : 0;
    s -= ds.filter((d) => d.timeMinutes > 25).length * 3;
  }
  if (ctx.conds.has('fridge')) s += ds.filter((d) => d.tags.includes('清雪櫃')).length * 3;
  if (ctx.conds.has('light')) {
    s += ds.filter((d) => d.tags.includes('清淡') || d.tags.includes('少油')).length * 3;
    s -= ds.filter((d) => d.oilLevel >= 4).length * 4;
    s -= ds.filter((d) => d.saltLevel >= 4).length * 3;
  }
  if (ctx.conds.has('low_wash')) {
    if (ctx.mealType.id !== HOME) s += 8;
    s += ds.filter((d) => d.cookingMethods.includes('one_pot') || d.cookingMethods.includes('rice_cooker')).length * 3;
  }
  if (ctx.conds.has('baby')) {
    s += ds.filter((d) => babyOk(d)).length * 5;
    s -= ds.filter((d) => !babyOk(d)).length * 12;
    s -= ds.filter((d) => d.flavourProfile.includes('spicy') || d.flavourProfile.includes('curry')).length * 8;
  }
  // mild baseline preference for baby-friendly even without the filter
  s += ds.filter((d) => babyOk(d)).length * 1.5;

  // --- recency ---
  s -= ds.filter((d) => ctx.recentIds.has(d.id)).length * 7;
  s -= proteins.filter((p) => ctx.recentProteins.has(p)).length * 2;

  // --- weekday: don't over-cook ---
  s -= Math.max(0, ds.length - 4) * 1;

  return s;
}

// A dish counts as baby-OK if it adapts or carries baby components, and isn't spicy.
function babyOk(d) {
  const adaptable = d.babyAdaptable || (Array.isArray(d.babyItems) && d.babyItems.length > 0);
  return adaptable && !d.flavourProfile.includes('spicy');
}

// --- public: recommend -------------------------------------------------
export function recommend({ mealTypeId, conds, locked = {}, structureKey = null, excludeId = null }) {
  const mealType = mealTypeById[mealTypeId];
  const structure = mealType.id === HOME
    ? (structureKey ? mealType.structures.find((s) => s.key === structureKey) : pickStructure(mealType))
    : null;

  const ctx = {
    mealType, conds,
    recentIds: recentDishIds(7),
    recentProteins: recentProteins(3),
  };

  const cands = generateCandidates(mealType, structure, conds, locked, excludeId, 30);
  const scored = cands
    .map((meal) => ({ meal, score: scoreMeal(meal, ctx) }))
    .sort((a, b) => b.score - a.score);

  // keep distinct meals (by dish-id signature), then random pick from top 5
  const seen = new Set();
  const distinct = [];
  for (const sc of scored) {
    const sig = sc.meal.map((m) => m.dish.id).slice().sort().join(',');
    if (!seen.has(sig)) { seen.add(sig); distinct.push(sc); }
  }
  const top = distinct.slice(0, 5);
  const chosen = rnd(top);

  const adultItems = chosen.meal;
  const babyItems = deriveBabyItems(mealType, adultItems);
  const reasons = buildReasons(mealType, structure, adultItems, conds);

  return {
    mealType: mealType.id,
    mealTypeDisplayName: mealType.displayName,
    mealTypeEmoji: mealType.emoji,
    structureKey: structure ? structure.key : null,
    structureLabel: structure ? structure.label : adultItems.map((m) => m.dish.displayName).join(' + '),
    slotColumns: adultItems.map((m) => ({ role: m.role, label: m.label })),
    adultItems,
    babyItems,
    score: Math.round(chosen.score),
    reasons,
    timeEstimate: Math.max(...adultItems.map((m) => m.dish.timeMinutes)) + 10,
    difficulty: Math.max(...adultItems.map((m) => m.dish.difficulty)),
    filtersApplied: [...conds],
  };
}

// --- baby meal: same-source adaptation ---------------------------------
const PROTEIN_TAG = { fish: ['已去骨', '已切碎'], beef: ['已切碎'], pork: ['已切碎'], chicken: ['已切碎'], shrimp: ['已切碎'], egg: ['已切碎'], tofu: ['已切碎'] };

function safetyTagsFor(dish, extra = []) {
  const set = new Set(['少鹽']);
  (PROTEIN_TAG[dish.protein] || []).forEach((t) => set.add(t));
  if (dish.category === 'soup' || dish.cookingMethods.includes('soup')) set.add('先分起再調味');
  if (STAPLE_CATS.includes(dish.category)) set.add('易咀嚼');
  if (dish.category === 'vegetable') set.add('已切碎');
  extra.forEach((t) => set.add(t));
  set.add('可可友善');
  return [...set];
}

export function deriveBabyItems(mealType, adultItems) {
  const out = [];
  adultItems.forEach((it) => {
    const d = it.dish;
    if (Array.isArray(d.babyItems) && d.babyItems.length) {
      d.babyItems.forEach((b) => out.push({
        name: b.name,
        derivedFrom: d.displayName,
        instruction: b.instruction || '',
        emoji: d.emoji, hue: d.hue,
        safetyTags: safetyTagsFor(d, b.cautions || []),
      }));
    } else if (d.babyAdaptable) {
      out.push({
        name: d.babyVersionName || `${d.name}（細碎）`,
        derivedFrom: d.displayName,
        instruction: d.babyInstruction,
        emoji: d.emoji, hue: d.hue,
        safetyTags: safetyTagsFor(d),
      });
    } else {
      // not suitable as-is → find a baby-friendly替代 of the same category
      const rep = dishes.find((x) => x.category === d.category && x.babyAdaptable && x.id !== d.id);
      if (rep) {
        out.push({
          name: rep.babyVersionName,
          derivedFrom: `${d.displayName}（改用${rep.displayName}）`,
          instruction: rep.babyInstruction,
          emoji: rep.emoji, hue: rep.hue,
          safetyTags: safetyTagsFor(rep),
        });
      } else {
        out.push({
          name: '另備清淡軟食',
          derivedFrom: d.displayName,
          instruction: '呢道偏重口味，建議另煮清淡版（例如軟飯＋蒸蛋）俾可可。',
          emoji: '🍚', hue: 45,
          safetyTags: ['少鹽', '易咀嚼', '可可友善'],
        });
      }
    }
  });
  return out;
}

export function babyTip(mealTypeId) { return mealTypeById[mealTypeId].babyTip; }

// --- reasons (rule-based) ----------------------------------------------
function buildReasons(mealType, structure, adultItems, conds) {
  const ds = adultItems.map((m) => m.dish);
  const out = [];

  // completeness
  if (mealType.id === HOME) {
    const hasSoup = ds.some((d) => d.category === 'soup');
    const mains = ds.filter((d) => d.category === 'main').length;
    if (hasSoup) out.push(`呢餐有${mains >= 2 ? '兩餸' : '主菜'}、蔬菜同湯，配白飯比較完整。`);
    else out.push('有餸、有菜、有飯，搭配均衡又夠飽。');
  } else {
    out.push(`${mealType.displayName}一道過，慳時間又少洗鑊。`);
  }

  // filter-driven
  if (conds.has('baby')) out.push('揀咗可可友善，已經避開辣味同重口味，魚肉菜都易分出可可份。');
  if (conds.has('light')) out.push('揀咗清淡少油，揀咗少油少鹽嘅做法。');
  if (conds.has('quick')) out.push('揀咗15分鐘，全部都係快手菜。');
  if (conds.has('fridge')) out.push('揀咗清雪櫃，多數用常備食材。');
  if (conds.has('low_wash')) out.push('揀咗少洗鑊，所以推薦一鑊／一煲到底嘅食法。');

  // cooking-order tip (home only)
  if (mealType.id === HOME) {
    const steps = [];
    if (ds.some((d) => d.cookingMethods.includes('soup'))) steps.push('先煲湯');
    if (ds.some((d) => d.cookingMethods.includes('steam'))) steps.push('再蒸餸');
    if (ds.some((d) => d.cookingMethods.includes('stir_fry'))) steps.push('最後炒菜');
    if (steps.length >= 2) out.push(`${steps.join('，')}，時間比較順。`);
  }

  // fish makes baby portions easy
  if (!conds.has('baby') && ds.some((d) => d.protein === 'fish')) {
    out.push('今晚有魚，肉嫩又容易拆骨分俾可可。');
  }

  return out.slice(0, 3);
}
