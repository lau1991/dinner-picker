// Slot-machine reel animation. Pure presentation: it rapidly cycles dish names
// in each reel, then settles on the final pick with a staggered stop.

import { dishesByCategory } from './data.js';

const TICK_MS = 70;        // how fast names flip while spinning
const BASE_MS = 800;       // first reel stop time
const STAGGER_MS = 140;    // extra spin per subsequent reel

/**
 * @param reelEls  array of { el, category } — `el` is the name node to flip
 * @param finalMeal  the meal to land on (array of items aligned with reelEls)
 * @returns Promise resolved once every reel has settled
 */
export function spinReels(reelEls, finalMeal) {
  const wrap = reelEls[0]?.el?.closest('.slot-reels');
  if (wrap) wrap.classList.add('is-spinning');

  const animations = reelEls.map((reel, i) => {
    const pool = dishesByCategory[reel.category] || [];
    const stopAt = BASE_MS + i * STAGGER_MS;
    reel.el.closest('.reel')?.classList.add('reel--spin');

    return new Promise((resolve) => {
      const start = performance.now();
      const tick = setInterval(() => {
        const elapsed = performance.now() - start;
        if (elapsed >= stopAt) {
          clearInterval(tick);
          reel.el.textContent = finalMeal[i].dish.name;
          reel.el.closest('.reel')?.classList.remove('reel--spin');
          reel.el.closest('.reel')?.classList.add('reel--land');
          setTimeout(() => reel.el.closest('.reel')?.classList.remove('reel--land'), 350);
          resolve();
        } else {
          const r = pool[Math.floor(Math.random() * pool.length)];
          if (r) reel.el.textContent = r.name;
        }
      }, TICK_MS);
    });
  });

  return Promise.all(animations).then(() => {
    if (wrap) wrap.classList.remove('is-spinning');
  });
}
