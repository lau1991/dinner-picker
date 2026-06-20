// Slot-machine reel animation. Pure presentation: rapidly flips candidate
// names in each reel, then settles on the final pick with a staggered stop.

const TICK_MS = 70;        // how fast names flip while spinning
const BASE_MS = 800;       // first reel stop time
const STAGGER_MS = 140;    // extra spin per subsequent reel

/**
 * @param reelEls    array of { el, pool } — `el` is the name node, `pool` is
 *                   an array of candidate names to flash while spinning
 * @param finalNames array of final names aligned with reelEls
 * @returns Promise resolved once every reel has settled
 */
export function spinReels(reelEls, finalNames) {
  const wrap = reelEls[0]?.el?.closest('.slot-reels');
  if (wrap) wrap.classList.add('is-spinning');

  const animations = reelEls.map((reel, i) => {
    const pool = reel.pool && reel.pool.length ? reel.pool : [finalNames[i]];
    const stopAt = BASE_MS + i * STAGGER_MS;
    reel.el.closest('.reel')?.classList.add('reel--spin');

    return new Promise((resolve) => {
      const start = performance.now();
      const tick = setInterval(() => {
        const elapsed = performance.now() - start;
        if (elapsed >= stopAt) {
          clearInterval(tick);
          reel.el.textContent = finalNames[i];
          const cell = reel.el.closest('.reel');
          cell?.classList.remove('reel--spin');
          cell?.classList.add('reel--land');
          setTimeout(() => cell?.classList.remove('reel--land'), 350);
          resolve();
        } else {
          reel.el.textContent = pool[Math.floor(Math.random() * pool.length)];
        }
      }, TICK_MS);
    });
  });

  return Promise.all(animations).then(() => {
    if (wrap) wrap.classList.remove('is-spinning');
  });
}
