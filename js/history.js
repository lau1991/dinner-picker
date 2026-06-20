// Recent-meal history (localStorage). Used only to down-weight dishes/proteins
// eaten recently — not a full history view.

import { dishById } from './data.js';

const KEY = 'dinner_picker_history';
const DAY = 86400000;

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

/** Record the dishes chosen for a served meal. */
export function recordMeal(dishIds) {
  const h = loadHistory();
  h.push({ date: new Date().toISOString().slice(0, 10), ts: Date.now(), dishIds });
  try { localStorage.setItem(KEY, JSON.stringify(h.slice(-80))); } catch { /* ignore */ }
}

/** Dish ids eaten within the last `days`. */
export function recentDishIds(days) {
  const cut = Date.now() - days * DAY;
  return new Set(loadHistory().filter((e) => e.ts >= cut).flatMap((e) => e.dishIds));
}

/** Main protein types eaten within the last `days`. */
export function recentProteins(days) {
  const cut = Date.now() - days * DAY;
  const out = new Set();
  loadHistory().filter((e) => e.ts >= cut).forEach((e) =>
    e.dishIds.forEach((id) => {
      const p = dishById[id] && dishById[id].protein;
      if (p && p !== 'none') out.add(p);
    }));
  return out;
}

export function clearHistory() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
