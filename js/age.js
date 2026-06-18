// Age helpers — child age is always derived from birthday, never hard-coded.

/** Whole months between birthday and `now` (default: today). */
export function calculateAgeInMonths(birthday, now = new Date()) {
  const b = new Date(birthday);
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  return Math.max(0, months);
}

/** Human label, e.g. 16個月 / 2歲3個月. */
export function ageLabel(birthday, now = new Date()) {
  const m = calculateAgeInMonths(birthday, now);
  if (m < 24) return `${m}個月`;
  const years = Math.floor(m / 12);
  const rem = m % 12;
  return rem ? `${years}歲${rem}個月` : `${years}歲`;
}
