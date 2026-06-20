// ============================================================
// App shell: state + rendering + interactions.
//
// Mode model:
//   state.lockedType = null  -> 日常模式 (家常餸飯 active; 一按開餐 = weighted draw)
//   state.lockedType = id    -> forced 轉個食法 (that chip active)
// First load + tapping 家常餸飯 force a home_style_rice meal.
// ============================================================

import {
  householdProfile, mealTypes, mealTypeById, conditions, items,
} from './data.js';
import { ageLabel } from './age.js';
import {
  buildMeal, rerollSlot, deriveBabyItems, babyTip, babySafetyChips,
  adultSummary, mealReason, totalTime, columnsFor,
  weightedPickMealType, uniformPickMealType, pickHomeStructure,
} from './engine.js';
import { spinReels } from './slot.js';

const HOME = 'home_style_rice';
const VARIATIONS = mealTypes.filter((m) => m.id !== HOME);

// ---------------- State ----------------
const state = {
  lockedType: null,       // null = 日常 weighted mode, else forced meal type id
  mealTypeId: HOME,       // the meal type currently shown
  structure: null,        // current home structure (when home)
  conds: new Set(),       // active condition chips
  meal: [],               // [{ item, role, label, slotIndex }]
  locked: {},             // slotIndex -> { item, role }
  lastAuto: false,        // last result came from a weighted (surprise) draw
  spinning: false,
};

// ---------------- DOM helpers ----------------
const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const hueStyle = (it) => `--hue:${it.hue}`;

// Candidate names for a reel's spin animation.
function poolNames(typeId, role) {
  return items.filter((i) => i.mealTypes.includes(typeId) && i.roles.includes(role)).map((i) => i.name);
}

// ---------------- Chips: 今日主餐 / 轉個食法 / 條件 ----------------
function renderMealChips() {
  const home = $('#chip-home');
  home.classList.toggle('mealchip--on', state.lockedType === null);

  const wrap = $('#variation-meals');
  wrap.innerHTML = '';
  VARIATIONS.forEach((m) => {
    const b = el('button', 'mealchip' + (state.lockedType === m.id ? ' mealchip--on' : ''));
    b.type = 'button';
    b.innerHTML = `<span class="mealchip__emoji">${m.emoji}</span><span class="mealchip__label">${m.displayName}</span>`;
    b.addEventListener('click', () => selectMealType(m.id));
    wrap.appendChild(b);
  });
}

function renderConditionChips() {
  const wrap = $('#conditions');
  wrap.innerHTML = '';
  conditions.forEach((c) => {
    const b = el('button', 'chip' + (state.conds.has(c.id) ? ' chip--on' : ''));
    b.type = 'button';
    b.innerHTML = `<span class="chip__emoji">${c.emoji}</span><span>${c.label}</span>`;
    b.addEventListener('click', () => toggleCondition(c.id));
    wrap.appendChild(b);
  });
}

function selectMealType(id) {
  state.lockedType = id;       // force this variation
  state.locked = {};
  renderMealChips();
  generate({ animate: true, force: id });
}

function backToHome() {
  state.lockedType = null;     // 日常 mode, force a home meal now
  state.locked = {};
  renderMealChips();
  generate({ animate: true, force: HOME });
}

function toggleCondition(id) {
  if (state.conds.has(id)) state.conds.delete(id);
  else state.conds.add(id);
  renderConditionChips();
  generate({ animate: true });
}

// ---------------- Slot reels ----------------
function renderReels() {
  const reels = $('#reels');
  reels.innerHTML = '';
  state.meal.forEach((m) => {
    const reel = el('div', 'reel');
    reel.style.cssText = hueStyle(m.item);
    reel.innerHTML = `
      <div class="reel__label">${m.label}</div>
      <div class="reel__name">${m.item.name}</div>
      <div class="reel__art">${m.item.emoji}</div>`;
    reels.appendChild(reel);
  });
  reels.style.gridTemplateColumns = `repeat(${state.meal.length}, 1fr)`;
  reels.classList.toggle('reels--dense', state.meal.length >= 5);
}

// ---------------- Adult card ----------------
function renderAdultCard() {
  const type = mealTypeById[state.mealTypeId];
  $('#adult-people').textContent = `${householdProfile.adults.length}位成人`;
  $('#adult-mealtype').innerHTML = `${type.emoji} ${type.displayName}`;
  $('#adult-structure').textContent = `組合：${adultSummary(state.mealTypeId, state.meal, state.structure)}`;
  $('#adult-reason').textContent = mealReason(state.mealTypeId, state.conds, state.lastAuto);
  $('#adult-time').textContent = `約 ${totalTime(state.meal)} 分鐘`;

  const card = $('#adult-items');
  card.innerHTML = '';
  state.meal.forEach((m) => {
    const locked = isLocked(m.slotIndex, m.role);
    const cell = el('div', 'dish' + (locked ? ' dish--locked' : ''));
    cell.style.cssText = hueStyle(m.item);
    cell.innerHTML = `
      <div class="dish__art">${m.item.emoji}</div>
      <div class="dish__name">${m.item.name}</div>
      <div class="dish__meta">
        <span class="tag tag--${m.item.kind}">${m.label}</span>
        <span class="dish__time">🕒 ${m.item.cookingTime}分</span>
      </div>
      <div class="dish__actions">
        <button class="iconbtn ${locked ? 'iconbtn--on' : ''}" data-lock="${m.slotIndex}">${locked ? '🔒 已鎖' : '🔓 鎖定'}</button>
        <button class="iconbtn" data-swap="${m.slotIndex}">🔄 換走</button>
      </div>`;
    card.appendChild(cell);
  });
  card.querySelectorAll('[data-lock]').forEach((b) => b.addEventListener('click', () => toggleLock(+b.dataset.lock)));
  card.querySelectorAll('[data-swap]').forEach((b) => b.addEventListener('click', () => swapSlot(+b.dataset.swap)));
}

function isLocked(slotIndex, role) {
  const l = state.locked[slotIndex];
  return !!l && l.role === role;
}

// ---------------- Baby card ----------------
function renderBabyCard() {
  $('#baby-age').textContent = ageLabel(householdProfile.child.birthday);
  $('#baby-name').textContent = householdProfile.child.name;
  const type = mealTypeById[state.mealTypeId];
  $('#baby-mode').textContent = `今晚跟「${type.displayName}」同源改造`;

  const babyItems = deriveBabyItems(state.mealTypeId, state.meal);
  const wrap = $('#baby-items');
  wrap.innerHTML = '';
  if (!babyItems.length) {
    wrap.appendChild(el('p', 'baby-empty', '今晚的餸未必適合可可，揀「可可友善」或轉個食法試試 🙂'));
  }
  babyItems.forEach((b) => {
    const cell = el('div', 'bdish');
    cell.style.cssText = `--hue:${b.hue}`;
    cell.innerHTML = `
      <div class="bdish__art">${b.emoji}</div>
      <div class="bdish__name">${b.name}</div>
      <div class="bdish__from">源自 ${b.fromName}</div>`;
    wrap.appendChild(cell);
  });

  const chips = $('#baby-safety');
  chips.innerHTML = '';
  babySafetyChips(state.mealTypeId, babyItems).forEach((c) => chips.appendChild(el('span', 'safety', c)));

  $('#baby-tip').textContent = `餵食貼士：${babyTip(state.mealTypeId)}`;
}

// ---------------- Ingredient / shopping list ----------------
function renderIngredientsCard() {
  const wrap = $('#ingredient-list');
  wrap.innerHTML = '';
  state.meal.forEach((m) => {
    const rows = (m.item.ingredients && m.item.ingredients.length
      ? m.item.ingredients
      : [{ n: m.item.name, q: '適量' }])
      .map((ing) => `<li class="irow"><span class="irow__n">${ing.n}</span><span class="irow__q">${ing.q}</span></li>`)
      .join('');
    const block = el('div', 'iblock');
    block.style.cssText = hueStyle(m.item);
    block.innerHTML = `
      <div class="iblock__head">
        <span class="iblock__emoji">${m.item.emoji}</span>
        <span class="iblock__name">${m.item.name}</span>
        <span class="tag tag--${m.item.kind}">${m.label}</span>
      </div>
      <ul class="irows">${rows}</ul>`;
    wrap.appendChild(block);
  });
}

// ---------------- Generation ----------------
function chooseType({ force, uniform }) {
  if (force) return force;
  if (uniform) return uniformPickMealType();
  if (state.lockedType) return state.lockedType;
  return weightedPickMealType(state.conds);
}

function generate({ animate, force, uniform }) {
  if (state.spinning) return;

  const typeId = chooseType({ force, uniform });
  state.lastAuto = !force && !state.lockedType;   // came from a weighted/surprise draw
  state.mealTypeId = typeId;
  state.structure = typeId === HOME ? pickHomeStructure() : null;
  state.meal = buildMeal(typeId, state.structure, state.conds, state.locked);

  renderReels();
  renderAdultCard();
  renderBabyCard();
  renderIngredientsCard();

  if (!animate) return;

  state.spinning = true;
  const reelEls = [...$('#reels').querySelectorAll('.reel')].map((r, i) => ({
    el: r.querySelector('.reel__name'),
    pool: poolNames(typeId, state.meal[i].role),
  }));
  spinReels(reelEls, state.meal.map((m) => m.item.name)).then(() => { state.spinning = false; });
}

function surprise() {
  state.lockedType = null;        // surprise returns to 日常 mode
  state.locked = {};
  renderMealChips();
  generate({ animate: true, uniform: true });
}

// ---------------- Lock / swap ----------------
function toggleLock(slotIndex) {
  const m = state.meal.find((x) => x.slotIndex === slotIndex);
  if (isLocked(slotIndex, m.role)) delete state.locked[slotIndex];
  else state.locked[slotIndex] = { item: m.item, role: m.role };
  renderAdultCard();
}

function swapSlot(slotIndex) {
  if (state.spinning) return;
  delete state.locked[slotIndex];     // swap overrides a lock on that slot
  state.meal = rerollSlot(state.mealTypeId, state.meal, slotIndex, state.conds);

  state.spinning = true;
  renderReels();
  const m = state.meal[slotIndex];
  const reelEl = {
    el: $('#reels').children[slotIndex].querySelector('.reel__name'),
    pool: poolNames(state.mealTypeId, m.role),
  };
  spinReels([reelEl], [m.item.name]).then(() => { state.spinning = false; });
  renderAdultCard();
  renderBabyCard();
  renderIngredientsCard();
}

// ---------------- Bottom nav ----------------
function wireNav() {
  document.querySelectorAll('.nav__tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav__tab').forEach((t) => t.classList.remove('nav__tab--on'));
      tab.classList.add('nav__tab--on');
    });
  });
}

// ---------------- Init ----------------
function init() {
  renderMealChips();
  renderConditionChips();
  wireNav();

  $('#chip-home').addEventListener('click', backToHome);
  $('#btn-serve').addEventListener('click', () => generate({ animate: true }));
  $('#lever').addEventListener('click', () => generate({ animate: true }));
  $('#btn-random').addEventListener('click', surprise);

  // First load: a home_style_rice meal, no spin.
  generate({ animate: false, force: HOME });
}

document.addEventListener('DOMContentLoaded', init);
