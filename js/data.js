// ============================================================
// Mock data for 今晚食乜餸啊？ — designed to be backend-ready.
// Replace this module with API calls later; the shapes stay the same.
// ============================================================

// --- Household profile ---
export const household = {
  adults: ['外母', '爸爸', '媽媽'],
  child: { name: '可可', birthday: '2025-01-27' },
};

// --- Meal structures (可變組合) ---
// `slots` is an ordered list of dish categories the meal is built from.
export const structures = [
  { id: 'st-1m1v1s1g', label: '1餸1菜1湯1主食', slots: ['main', 'vegetable', 'soup', 'staple'] },
  { id: 'st-2m1v1g',   label: '2餸1菜1主食',     slots: ['main', 'main', 'vegetable', 'staple'] },
  { id: 'st-2m1v1s1g', label: '2餸1菜1湯1主食', slots: ['main', 'main', 'vegetable', 'soup', 'staple'] },
  { id: 'st-quick',    label: '快手餐 · 1主菜1菜1主食', slots: ['main', 'vegetable', 'staple'], quick: true },
];

// --- Category metadata (label + accent used on reels & tags) ---
export const categoryMeta = {
  main:      { tag: '主菜', emoji: '🍳' },
  vegetable: { tag: '蔬菜', emoji: '🥬' },
  soup:      { tag: '湯',   emoji: '🍲' },
  staple:    { tag: '主食', emoji: '🍚' },
};

// --- Filter chips (single-select: choose one or none) ---
export const filters = [
  { id: 'quick',  label: '15分鐘', emoji: '🕒' },
  { id: 'fridge', label: '清雪櫃', emoji: '🧊' },
];

// --- Dish dataset ---
// caution / babyCautions feed the 可可餐 safety chips.
export const dishes = [
  // ---------- MAINS ----------
  {
    id: 'd-steamed-fish', name: '清蒸魚', category: 'main', emoji: '🐟', hue: 200,
    tags: ['light', 'baby', 'highprotein'],
    adultServingNote: '一條約 1 斤，足夠 3 位成人',
    ingredients: [{ n: '鮮魚', q: '1條(約1斤)' }, { n: '薑', q: '3片' }, { n: '蔥', q: '2條' }, { n: '蒸魚豉油', q: '2湯匙' }],
    babyAdaptable: true, babyVersionName: '蒸魚肉（細碎）',
    babyInstruction: '拆走魚骨，取魚腩肉壓碎，少許蒸魚汁拌軟飯。',
    cookingTime: 15, difficulty: '易',
    caution: [], babyCautions: ['已去骨', '已切碎', '少油'],
  },
  {
    id: 'd-steam-pork', name: '梅菜蒸肉餅', category: 'main', emoji: '🥩', hue: 18,
    tags: ['fridge', 'baby', 'highprotein'],
    adultServingNote: '免治豬肉 約 300g',
    ingredients: [{ n: '免治豬肉', q: '300g' }, { n: '梅菜', q: '50g' }, { n: '薑蓉', q: '1茶匙' }, { n: '生粉', q: '1湯匙' }],
    babyAdaptable: true, babyVersionName: '蒸肉餅（細碎）',
    babyInstruction: '取未沾梅菜的中心肉，壓散去多餘油，拌少量飯。',
    cookingTime: 20, difficulty: '易',
    caution: [], babyCautions: ['少鹽', '已切碎'],
  },
  {
    id: 'd-tomato-egg', name: '番茄炒蛋', category: 'main', emoji: '🍅', hue: 8,
    tags: ['light', 'quick', 'baby', 'fridge'],
    adultServingNote: '番茄 3 個、蛋 4 隻',
    ingredients: [{ n: '番茄', q: '3個' }, { n: '雞蛋', q: '4隻' }, { n: '糖', q: '1茶匙' }, { n: '蔥', q: '1條' }],
    babyAdaptable: true, babyVersionName: '番茄蛋碎',
    babyInstruction: '炒嫩一點，少鹽少油，切碎後拌軟飯。',
    cookingTime: 12, difficulty: '易',
    caution: ['蛋'], babyCautions: ['少鹽', '已切碎', '含蛋'],
  },
  {
    id: 'd-ginger-chicken', name: '薑蔥蒸雞', category: 'main', emoji: '🍗', hue: 38,
    tags: ['baby', 'highprotein'],
    adultServingNote: '半隻雞，連薑蔥同蒸',
    ingredients: [{ n: '雞', q: '半隻(約600g)' }, { n: '薑', q: '5片' }, { n: '蔥', q: '3條' }, { n: '紹酒', q: '1湯匙' }],
    babyAdaptable: true, babyVersionName: '雞肉蓉',
    babyInstruction: '取雞腿肉去皮去骨，撕成幼絲再剁碎。',
    cookingTime: 25, difficulty: '中',
    caution: [], babyCautions: ['已去骨', '已切碎', '去皮'],
  },
  {
    id: 'd-shrimp-egg', name: '滑蛋蝦仁', category: 'main', emoji: '🍤', hue: 14,
    tags: ['quick', 'highprotein'],
    adultServingNote: '蝦仁 200g、蛋 3 隻',
    ingredients: [{ n: '蝦仁', q: '200g' }, { n: '雞蛋', q: '3隻' }, { n: '蔥', q: '1條' }],
    babyAdaptable: false, babyVersionName: '', babyInstruction: '',
    cookingTime: 12, difficulty: '中',
    caution: ['蝦', '蛋'], babyCautions: [],
  },
  {
    id: 'd-soy-spareribs', name: '豉汁蒸排骨', category: 'main', emoji: '🍖', hue: 22,
    tags: ['highprotein'],
    adultServingNote: '排骨 400g，豉汁蒜蓉醃 20 分鐘',
    ingredients: [{ n: '排骨', q: '400g' }, { n: '豆豉', q: '1湯匙' }, { n: '蒜蓉', q: '2瓣' }, { n: '生粉', q: '1湯匙' }],
    babyAdaptable: false, babyVersionName: '', babyInstruction: '',
    cookingTime: 30, difficulty: '中',
    caution: ['骨'], babyCautions: [],
  },

  // ---------- VEGETABLES ----------
  {
    id: 'd-garlic-choisum', name: '蒜蓉炒菜心', category: 'vegetable', emoji: '🥬', hue: 130,
    tags: ['light', 'quick', 'baby', 'fridge'],
    adultServingNote: '菜心一斤，蒜蓉爆香',
    ingredients: [{ n: '菜心', q: '1斤' }, { n: '蒜', q: '3瓣' }, { n: '油', q: '1湯匙' }],
    babyAdaptable: true, babyVersionName: '菜心碎',
    babyInstruction: '取嫩葉部分灼軟，剪成細碎，免蒜免油。',
    cookingTime: 8, difficulty: '易',
    caution: [], babyCautions: ['已切碎', '少油'],
  },
  {
    id: 'd-poached-peashoot', name: '上湯浸豆苗', category: 'vegetable', emoji: '🌱', hue: 120,
    tags: ['light', 'quick', 'baby'],
    adultServingNote: '豆苗一盒，上湯灼熟',
    ingredients: [{ n: '豆苗', q: '1盒(約300g)' }, { n: '上湯', q: '1碗' }, { n: '蒜', q: '2瓣' }],
    babyAdaptable: true, babyVersionName: '豆苗碎',
    babyInstruction: '灼軟後剪碎，用原湯（未調味）拌飯。',
    cookingTime: 8, difficulty: '易',
    caution: [], babyCautions: ['已切碎', '少鹽'],
  },
  {
    id: 'd-broccoli', name: '白灼西蘭花', category: 'vegetable', emoji: '🥦', hue: 110,
    tags: ['light', 'quick', 'baby'],
    adultServingNote: '西蘭花一個，白灼蘸豉油',
    ingredients: [{ n: '西蘭花', q: '1個' }, { n: '蒜', q: '2瓣' }, { n: '蠔油', q: '1湯匙' }],
    babyAdaptable: true, babyVersionName: '西蘭花蓉',
    babyInstruction: '灼至軟身，只取花蕾部分壓成蓉。',
    cookingTime: 10, difficulty: '易',
    caution: [], babyCautions: ['已切碎', '少油'],
  },
  {
    id: 'd-stirfry-kailan', name: '蒜炒芥蘭', category: 'vegetable', emoji: '🥗', hue: 135,
    tags: ['fridge'],
    adultServingNote: '芥蘭一斤，走油快炒',
    ingredients: [{ n: '芥蘭', q: '1斤' }, { n: '蒜', q: '3瓣' }, { n: '糖', q: '半茶匙' }],
    babyAdaptable: false, babyVersionName: '', babyInstruction: '',
    cookingTime: 9, difficulty: '易',
    caution: [], babyCautions: [],
  },

  // ---------- SOUPS ----------
  {
    id: 'd-tomato-beef-soup', name: '番茄薯仔牛肉湯', category: 'soup', emoji: '🍲', hue: 6,
    tags: ['baby', 'fridge', 'highprotein'],
    adultServingNote: '牛肉 300g、番茄薯仔同煲',
    ingredients: [{ n: '牛展', q: '300g' }, { n: '番茄', q: '3個' }, { n: '薯仔', q: '2個' }, { n: '薑', q: '2片' }],
    babyAdaptable: true, babyVersionName: '番茄薯仔牛肉湯（先分起再調味）',
    babyInstruction: '未下鹽前先盛起可可份，壓爛薯仔番茄，牛肉剁碎。',
    cookingTime: 40, difficulty: '中',
    caution: [], babyCautions: ['少鹽', '先分起', '已切碎'],
  },
  {
    id: 'd-carrot-pork-soup', name: '青紅蘿蔔煲瘦肉', category: 'soup', emoji: '🥕', hue: 28,
    tags: ['light', 'baby'],
    adultServingNote: '青紅蘿蔔加瘦肉，煲 1.5 小時',
    ingredients: [{ n: '青蘿蔔', q: '1條' }, { n: '紅蘿蔔', q: '1條' }, { n: '瘦肉', q: '300g' }, { n: '蜜棗', q: '2粒' }],
    babyAdaptable: true, babyVersionName: '蘿蔔湯（先分起）',
    babyInstruction: '先盛起原味湯，蘿蔔壓蓉，瘦肉撕碎。',
    cookingTime: 90, difficulty: '易',
    caution: [], babyCautions: ['少鹽', '先分起'],
  },
  {
    id: 'd-wintermelon-soup', name: '冬瓜薏米湯', category: 'soup', emoji: '🥣', hue: 90,
    tags: ['light', 'baby'],
    adultServingNote: '冬瓜連薏米煲瘦肉',
    ingredients: [{ n: '冬瓜', q: '1斤' }, { n: '薏米', q: '50g' }, { n: '瘦肉', q: '250g' }],
    babyAdaptable: true, babyVersionName: '冬瓜蓉湯',
    babyInstruction: '冬瓜煲至腍身，取出壓蓉，少量原湯拌勻。',
    cookingTime: 60, difficulty: '易',
    caution: [], babyCautions: ['少鹽', '易咀嚼'],
  },
  {
    id: 'd-seaweed-egg-soup', name: '紫菜蛋花湯', category: 'soup', emoji: '🍜', hue: 200,
    tags: ['light', 'quick'],
    adultServingNote: '紫菜加蛋花，滾湯即成',
    ingredients: [{ n: '紫菜', q: '1片' }, { n: '雞蛋', q: '2隻' }, { n: '蔥', q: '1條' }],
    babyAdaptable: false, babyVersionName: '', babyInstruction: '',
    cookingTime: 10, difficulty: '易',
    caution: ['蛋'], babyCautions: [],
  },

  // ---------- STAPLES ----------
  {
    id: 'd-rice', name: '白飯', category: 'staple', emoji: '🍚', hue: 45,
    tags: ['light', 'quick', 'baby', 'fridge'],
    adultServingNote: '3 人份白飯',
    ingredients: [{ n: '白米', q: '2杯' }],
    babyAdaptable: true, babyVersionName: '軟飯',
    babyInstruction: '多加少許水煮軟，或用原飯加湯焗軟。',
    cookingTime: 15, difficulty: '易',
    caution: [], babyCautions: ['易咀嚼', '少鹽'],
  },
  {
    id: 'd-grain-rice', name: '五穀飯', category: 'staple', emoji: '🌾', hue: 40,
    tags: ['light', 'baby'],
    adultServingNote: '五穀米同白米各半',
    ingredients: [{ n: '五穀米', q: '1杯' }, { n: '白米', q: '1杯' }],
    babyAdaptable: true, babyVersionName: '軟五穀飯',
    babyInstruction: '比例多加水煮至軟身，確保粒粒鬆軟。',
    cookingTime: 20, difficulty: '易',
    caution: [], babyCautions: ['易咀嚼'],
  },
  {
    id: 'd-noodles', name: '麵線', category: 'staple', emoji: '🍝', hue: 48,
    tags: ['quick', 'baby'],
    adultServingNote: '麵線灼熟拌湯',
    ingredients: [{ n: '麵線', q: '3束' }, { n: '上湯', q: '1碗' }],
    babyAdaptable: true, babyVersionName: '碎麵線',
    babyInstruction: '灼軟後剪短，用原湯（未調味）拌勻。',
    cookingTime: 10, difficulty: '易',
    caution: ['麩質'], babyCautions: ['已切碎', '含麩質'],
  },
];

// Convenience: group dishes by category once.
export const dishesByCategory = dishes.reduce((acc, d) => {
  (acc[d.category] = acc[d.category] || []).push(d);
  return acc;
}, {});
