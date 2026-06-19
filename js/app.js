// ============================================================
// App shell: state + rendering + interactions.
// Kept declarative — state changes call render(), which redraws the cards.
// The slot reels are animated imperatively so the spin feels physical.
// ============================================================

import { household, filters, structures, categoryMeta } from './data.js';
import { ageLabel } from './age.js';
import {
  buildMeal, rerollSlot, deriveBabyItems, babySafetyChips,
  cookingTip, mealReason, totalTime, findStructure, slotLabel,
} from './engine.js';
import { spinReels } from './slot.js';

// ---------------- State ----------------
const state = {
  structureId: 'st-2m1v1s1g',
  activeFilters: new Set(),
  locked: new Set(),      // slot indices the user has locked
  meal: [],               // array of { dish, slotIndex, category, label }
  spinning: false,
};

function structure() { return findStructure(state.structureId); }

function lockedMap() {
  const map = {};
  state.meal.forEach((it) => { if (state.locked.has(it.slotIndex)) map[it.slotIndex] = it.dish; });
  return map;
}

// ---------------- DOM helpers ----------------
const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const dishStyle = (d) => `--hue:${d.hue}`;

// ---------------- Filter chips ----------------
function renderFilters() {
  const bar = $('#filters');
  bar.innerHTML = '';
  filters.forEach((f) => {
    const chip = el('button', 'chip' + (state.activeFilters.has(f.id) ? ' chip--on' : ''));
    chip.type = 'button';
    chip.innerHTML = `<span class="chip__emoji">${f.emoji}</span><span>${f.label}</span>`;
    chip.addEventListener('click', () => toggleFilter(f.id));
    bar.appendChild(chip);
  });
}

function toggleFilter(id) {
  // Single-select: tapping the active chip clears it, otherwise replace.
  if (state.activeFilters.has(id)) state.activeFilters.clear();
  else { state.activeFilters.clear(); state.activeFilters.add(id); }
  renderFilters();
  // Light feedback: re-roll the unlocked slots under the new preference.
  generate({ animate: true });
}

// ---------------- Slot machine ----------------
function renderReels() {
  const reels = $('#reels');
  reels.innerHTML = '';
  state.meal.forEach((it) => {
    const reel = el('div', 'reel');
    reel.style.cssText = dishStyle(it.dish);
    reel.innerHTML = `
      <div class="reel__label">${it.label}</div>
      <div class="reel__name">${it.dish.name}</div>
      <div class="reel__art">${it.dish.emoji}</div>`;
    reels.appendChild(reel);
  });
  // Always fit every column in view — one equal track per item.
  reels.style.gridTemplateColumns = `repeat(${state.meal.length}, 1fr)`;
  reels.classList.toggle('reels--dense', state.meal.length >= 5);
}

// ---------------- Adult card ----------------
function renderAdultCard() {
  const card = $('#adult-items');
  card.innerHTML = '';
  state.meal.forEach((it) => {
    const locked = state.locked.has(it.slotIndex);
    const cell = el('div', 'dish' + (locked ? ' dish--locked' : ''));
    cell.style.cssText = dishStyle(it.dish);
    cell.innerHTML = `
      <div class="dish__art">${it.dish.emoji}${it.label.startsWith('主菜') ? `<span class="dish__ribbon">${it.label}</span>` : ''}</div>
      <div class="dish__name">${it.dish.name}</div>
      <div class="dish__meta">
        <span class="tag tag--${it.category}">${categoryMeta[it.category].tag}</span>
        <span class="dish__time">🕒 ${it.dish.cookingTime}分</span>
      </div>
      <div class="dish__actions">
        <button class="iconbtn ${locked ? 'iconbtn--on' : ''}" data-lock="${it.slotIndex}" title="鎖定">${locked ? '🔒 已鎖' : '🔓 鎖定'}</button>
        <button class="iconbtn" data-swap="${it.slotIndex}" title="換走">🔄 換走</button>
      </div>`;
    card.appendChild(cell);
  });

  card.querySelectorAll('[data-lock]').forEach((b) =>
    b.addEventListener('click', () => toggleLock(+b.dataset.lock)));
  card.querySelectorAll('[data-swap]').forEach((b) =>
    b.addEventListener('click', () => swapSlot(+b.dataset.swap)));

  $('#adult-people').textContent = `${household.adults.length}位成人`;
  $('#adult-structure').textContent = `組合：${structure().label}`;
  $('#adult-tip').textContent = `今晚貼士：${cookingTip(state.meal)}`;
  $('#adult-reason').textContent = mealReason(structure(), state.activeFilters);
  $('#adult-time').textContent = `約 ${totalTime(state.meal)} 分鐘`;
}

// ---------------- Baby card ----------------
function renderBabyCard() {
  const babyItems = deriveBabyItems(state.meal);
  $('#baby-age').textContent = ageLabel(household.child.birthday);
  $('#baby-name').textContent = household.child.name;

  const wrap = $('#baby-items');
  wrap.innerHTML = '';
  if (!babyItems.length) {
    wrap.appendChild(el('p', 'baby-empty', '今晚的餸未必適合可可，換一兩味可可友善的試試 🙂'));
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
  babySafetyChips(babyItems).forEach((c) =>
    chips.appendChild(el('span', 'safety', c)));
}

// ---------------- Ingredient / shopping list ----------------
function renderIngredientsCard() {
  const wrap = $('#ingredient-list');
  wrap.innerHTML = '';
  state.meal.forEach((it) => {
    const block = el('div', 'iblock');
    block.style.cssText = dishStyle(it.dish);
    const rows = (it.dish.ingredients || [])
      .map((ing) => `<li class="irow"><span class="irow__n">${ing.n}</span><span class="irow__q">${ing.q}</span></li>`)
      .join('');
    block.innerHTML = `
      <div class="iblock__head">
        <span class="iblock__emoji">${it.dish.emoji}</span>
        <span class="iblock__name">${it.dish.name}</span>
        <span class="tag tag--${it.category}">${categoryMeta[it.category].tag}</span>
      </div>
      <ul class="irows">${rows}</ul>`;
    wrap.appendChild(block);
  });
}

// ---------------- Structure picker ----------------
function renderStructurePicker() {
  const sel = $('#structure-picker');
  sel.innerHTML = '';
  structures.forEach((s) => {
    const b = el('button', 'struct' + (s.id === state.structureId ? ' struct--on' : ''));
    b.type = 'button';
    b.textContent = s.label;
    b.addEventListener('click', () => {
      state.structureId = s.id;
      state.locked.clear();
      renderStructurePicker();
      generate({ animate: true });
    });
    sel.appendChild(b);
  });
}

// ---------------- Generation flows ----------------
function generate({ animate }) {
  if (state.spinning) return;
  const newMeal = buildMeal(structure(), state.activeFilters, lockedMap());

  if (!animate) {
    state.meal = newMeal;
    renderAll();
    return;
  }

  // Render reels for the new column count first (names still show old/spin),
  // then animate each reel to its final dish.
  state.meal = newMeal;
  renderReels();
  renderAdultCard();
  renderBabyCard();
  renderIngredientsCard();

  state.spinning = true;
  const reelEls = [...$('#reels').querySelectorAll('.reel')].map((r, i) => ({
    el: r.querySelector('.reel__name'),
    category: state.meal[i].category,
  }));
  spinReels(reelEls, state.meal).then(() => {
    state.spinning = false;
  });
}

function randomCombo() {
  state.structureId = structures[Math.floor(Math.random() * structures.length)].id;
  state.locked.clear();
  renderStructurePicker();
  generate({ animate: true });
}

function toggleLock(slotIndex) {
  if (state.locked.has(slotIndex)) state.locked.delete(slotIndex);
  else state.locked.add(slotIndex);
  renderAdultCard();
}

function swapSlot(slotIndex) {
  if (state.spinning) return;
  // Swap overrides any lock on that one slot.
  state.locked.delete(slotIndex);
  state.meal = rerollSlot(state.meal, structure(), slotIndex, state.activeFilters);
  // Quick single-reel spin for feedback.
  state.spinning = true;
  renderReels();
  const reelNode = $('#reels').children[slotIndex];
  const reelEl = { el: reelNode.querySelector('.reel__name'), category: state.meal[slotIndex].category };
  spinReels([reelEl], state.meal.slice(slotIndex, slotIndex + 1).map((it) => ({ dish: it.dish })))
    .then(() => { state.spinning = false; });
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

// ---------------- Render orchestration ----------------
function renderAll() {
  renderReels();
  renderAdultCard();
  renderBabyCard();
  renderIngredientsCard();
}

function init() {
  renderFilters();
  renderStructurePicker();
  wireNav();

  $('#btn-serve').addEventListener('click', () => generate({ animate: true }));
  $('#lever').addEventListener('click', () => generate({ animate: true }));
  $('#btn-random').addEventListener('click', randomCombo);

  // First meal — no spin on load.
  generate({ animate: false });
}

document.addEventListener('DOMContentLoaded', init);
