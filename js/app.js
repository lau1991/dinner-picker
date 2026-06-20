// ============================================================
// App shell: state + rendering + interactions.
// All recommendation logic lives in engine.js; this file only drives the UI.
//
// Mode: state.lockedType = null -> 日常 (家常餸飯 active; 一按開餐 = home)
//       state.lockedType = id   -> forced variation. 驚喜抽 = weighted surprise.
// Selecting a chip only sets state; results appear on 一按開餐 / 拉桿 / 驚喜抽.
// ============================================================

import {
  householdProfile, mealTypes, conditions, dishes,
} from './data.js';
import { ageLabel } from './age.js';
import { recommend, weightedPickMealType, babyTip } from './engine.js';
import { recordMeal } from './history.js';
import { spinReels } from './slot.js';

const HOME = 'home_style_rice';
const VARIATIONS = mealTypes.filter((m) => m.id !== HOME);

const state = {
  lockedType: null,
  conds: new Set(),
  locked: {},          // slotIndex -> { dish, role }
  result: null,
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
const hueStyle = (d) => `--hue:${d.hue}`;
const poolNames = (mealTypeId, role) =>
  dishes.filter((d) => d.mealTypes.includes(mealTypeId) && d.slotRoles.includes(role)).map((d) => d.name);

// ---------------- Chips ----------------
function renderMealChips() {
  $('#chip-home').classList.toggle('mealchip--on', state.lockedType === null);
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

// Selecting a chip only sets state — no result until a button is pressed.
function selectMealType(id) { state.lockedType = id; state.locked = {}; renderMealChips(); }
function backToHome() { state.lockedType = null; state.locked = {}; renderMealChips(); }
function toggleCondition(id) {
  if (state.conds.has(id)) state.conds.clear();
  else { state.conds.clear(); state.conds.add(id); }
  renderConditionChips();
}

// ---------------- Reels ----------------
function renderReels() {
  const reels = $('#reels');
  reels.innerHTML = '';
  state.result.adultItems.forEach((it) => {
    const reel = el('div', 'reel');
    reel.style.cssText = hueStyle(it.dish);
    reel.innerHTML = `
      <div class="reel__label">${it.label}</div>
      <div class="reel__name">${it.dish.name}</div>
      <div class="reel__art">${it.dish.emoji}</div>`;
    reels.appendChild(reel);
  });
  reels.style.gridTemplateColumns = `repeat(${state.result.adultItems.length}, 1fr)`;
  reels.classList.toggle('reels--dense', state.result.adultItems.length >= 5);
}

// ---------------- Adult card ----------------
function renderAdultCard() {
  const r = state.result;
  $('#adult-people').textContent = `${householdProfile.adults.length}位成人`;
  $('#adult-mealtype').innerHTML = `${r.mealTypeEmoji} ${r.mealTypeDisplayName}`;
  $('#adult-structure').textContent = `組合：${r.structureLabel}`;
  $('#adult-time').textContent = `約 ${r.timeEstimate} 分鐘`;

  const reasons = $('#adult-reasons');
  reasons.innerHTML = '';
  r.reasons.forEach((txt) => reasons.appendChild(el('li', 'reasons__item', `<span>💡</span><span>${txt}</span>`)));

  const card = $('#adult-items');
  card.innerHTML = '';
  r.adultItems.forEach((it) => {
    const locked = isLocked(it.slotIndex, it.role);
    const cell = el('div', 'dish' + (locked ? ' dish--locked' : ''));
    cell.style.cssText = hueStyle(it.dish);
    cell.innerHTML = `
      <div class="dish__art">${it.dish.emoji}</div>
      <div class="dish__name">${it.dish.name}</div>
      <div class="dish__meta">
        <span class="tag tag--${it.dish.kind}">${it.label}</span>
        <span class="dish__time">🕒 ${it.dish.timeMinutes}分</span>
      </div>
      <div class="dish__actions">
        <button class="iconbtn ${locked ? 'iconbtn--on' : ''}" data-lock="${it.slotIndex}">${locked ? '🔒 已鎖' : '🔓 鎖定'}</button>
        <button class="iconbtn" data-swap="${it.slotIndex}">🔄 換走</button>
      </div>`;
    card.appendChild(cell);
  });
  card.querySelectorAll('[data-lock]').forEach((b) => b.addEventListener('click', () => toggleLock(+b.dataset.lock)));
  card.querySelectorAll('[data-swap]').forEach((b) => b.addEventListener('click', () => swapSlot(+b.dataset.swap)));
}

// adultItems carry slotIndex (assigned in generate); locks key on it.
function isLocked(slotIndex, role) {
  const l = state.locked[slotIndex];
  return !!l && l.role === role;
}

// ---------------- Baby card ----------------
function renderBabyCard() {
  const r = state.result;
  $('#baby-age').textContent = ageLabel(householdProfile.child.birthday);
  $('#baby-name').textContent = householdProfile.child.name;
  $('#baby-mode').textContent = `今晚跟「${r.mealTypeDisplayName}」同源改造`;

  const wrap = $('#baby-items');
  wrap.innerHTML = '';
  r.babyItems.forEach((b) => {
    const cell = el('div', 'bdish');
    cell.style.cssText = `--hue:${b.hue}`;
    cell.innerHTML = `
      <div class="bdish__art">${b.emoji}</div>
      <div class="bdish__name">${b.name}</div>
      <div class="bdish__from">源自 ${b.derivedFrom}</div>
      ${b.instruction ? `<div class="bdish__how">${b.instruction}</div>` : ''}`;
    wrap.appendChild(cell);
  });

  const safety = new Set();
  r.babyItems.forEach((b) => b.safetyTags.forEach((t) => safety.add(t)));
  const chips = $('#baby-safety');
  chips.innerHTML = '';
  [...safety].forEach((c) => chips.appendChild(el('span', 'safety', c)));

  $('#baby-tip').textContent = `餵食貼士：${babyTip(r.mealType)}`;
}

// ---------------- Ingredient list ----------------
function renderIngredientsCard() {
  const wrap = $('#ingredient-list');
  wrap.innerHTML = '';
  state.result.adultItems.forEach((it) => {
    const rows = (it.dish.ingredients.length ? it.dish.ingredients : [{ n: it.dish.name, q: '適量' }])
      .map((g) => `<li class="irow"><span class="irow__n">${g.n}</span><span class="irow__q">${g.q}</span></li>`)
      .join('');
    const block = el('div', 'iblock');
    block.style.cssText = hueStyle(it.dish);
    block.innerHTML = `
      <div class="iblock__head">
        <span class="iblock__emoji">${it.dish.emoji}</span>
        <span class="iblock__name">${it.dish.name}</span>
        <span class="tag tag--${it.dish.kind}">${it.label}</span>
      </div>
      <ul class="irows">${rows}</ul>`;
    wrap.appendChild(block);
  });
}

// ---------------- Generation ----------------
function applyResult(result, { animate }) {
  // tag each adult item with its slot index for lock/swap bookkeeping
  result.adultItems.forEach((it, i) => { it.slotIndex = i; });
  state.result = result;
  recordMeal(result.adultItems.map((it) => it.dish.id));

  renderReels();
  renderAdultCard();
  renderBabyCard();
  renderIngredientsCard();

  if (!animate) return;
  state.spinning = true;
  const reelEls = [...$('#reels').querySelectorAll('.reel')].map((reel, i) => ({
    el: reel.querySelector('.reel__name'),
    pool: poolNames(result.mealType, result.adultItems[i].role),
  }));
  spinReels(reelEls, result.adultItems.map((it) => it.dish.name)).then(() => { state.spinning = false; });
}

function generate({ force, animate, auto }) {
  if (state.spinning) return;
  const mealTypeId = force ?? state.lockedType ?? HOME;
  // Keep the current structure when locks are in play so locked slots stay valid.
  const keepStructure = Object.keys(state.locked).length && state.result && state.result.mealType === mealTypeId
    ? state.result.structureKey : null;
  const result = recommend({ mealTypeId, conds: state.conds, locked: state.locked, structureKey: keepStructure });
  state.lastAuto = !!auto;
  result.reasons = auto && mealTypeId !== HOME
    ? ['日常隨機抽中：' + result.reasons[0], ...result.reasons.slice(1)] : result.reasons;
  applyResult(result, { animate });
}

function surprise() {
  const t = weightedPickMealType(state.conds);
  state.lockedType = t === HOME ? null : t;
  state.locked = {};
  renderMealChips();
  generate({ force: t, animate: true, auto: true });
}

// ---------------- Lock / swap ----------------
function toggleLock(slotIndex) {
  const it = state.result.adultItems.find((x) => x.slotIndex === slotIndex);
  if (isLocked(slotIndex, it.role)) delete state.locked[slotIndex];
  else state.locked[slotIndex] = { dish: it.dish, role: it.role };
  renderAdultCard();
}

function swapSlot(slotIndex) {
  if (state.spinning) return;
  const r = state.result;
  const cur = r.adultItems.find((x) => x.slotIndex === slotIndex);
  // Lock every other slot, free only this one, exclude the current dish.
  const lockOthers = {};
  r.adultItems.forEach((it) => { if (it.slotIndex !== slotIndex) lockOthers[it.slotIndex] = { dish: it.dish, role: it.role }; });
  delete state.locked[slotIndex];

  const result = recommend({
    mealTypeId: r.mealType, conds: state.conds, locked: lockOthers,
    structureKey: r.structureKey, excludeId: cur.dish.id,
  });
  // preserve user's existing locks (minus the swapped slot)
  result.adultItems.forEach((it, i) => { it.slotIndex = i; });
  state.result = result;
  recordMeal(result.adultItems.map((it) => it.dish.id));

  state.spinning = true;
  renderReels();
  const reelEl = {
    el: $('#reels').children[slotIndex].querySelector('.reel__name'),
    pool: poolNames(result.mealType, result.adultItems[slotIndex].role),
  };
  spinReels([reelEl], [result.adultItems[slotIndex].dish.name]).then(() => { state.spinning = false; });
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
  generate({ force: HOME, animate: false });  // first load: a home meal, no spin
}

document.addEventListener('DOMContentLoaded', init);
