# 今晚食乜餸啊？ · Family Dinner Picker

A mobile-first family dinner recommendation prototype — a warm, home-kitchen
"slot machine" that rolls a variable-structure dinner for the adults and
auto-adapts a baby version for the toddler.

**Live demo:** https://lau1991.github.io/dinner-picker/

## Features

- 🎰 **Slot-machine UI** — pull the lever or tap 一按開餐 to roll a meal; reels spin and settle.
- 🍱 **Variable meal structures** — 1餸1菜1湯1主食 / 2餸1菜1主食 / 2餸1菜1湯1主食 / 快手餐.
- 🔒 **Lock & 🔄 swap** — keep a dish you like, re-roll a single slot, or re-draw the rest.
- 👶 **Baby meal, auto-derived** — the toddler's plate is adapted from the adults' dishes
  (e.g. 白飯 → 軟飯, 清蒸魚 → 蒸魚肉細碎) with safety chips (少鹽 / 已去骨 / 已切碎…).
- 🎂 **Age from birthday** — `calculateAgeInMonths()` derives the child's age; never hard-coded.
- 🌿 **Filter chips** — 清淡 / 15分鐘 / 清雪櫃 / 可可友善 bias the recommendation.

## Tech

Plain HTML / CSS / vanilla JS (ES modules) — no framework, no build step. The
recommendation logic in `js/engine.js` is pure and backend-ready: swap `buildMeal()`
for an API call and the data shapes stay the same.

```
index.html
css/styles.css
js/  data.js · age.js · engine.js · slot.js · app.js
```

## Run locally

No build needed, but ES modules require HTTP (not `file://`). Any static server works.
On Windows without Node/Python, use the included PowerShell server:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1 -Port 8770
# then open http://localhost:8770/
```
