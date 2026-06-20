// ============================================================
// Mock data for 今晚食乜餸啊？ — backend-ready shapes.
//
// Model: 家常餸飯 (home_style_rice) is the DEFAULT mode and dominates the
// weighted draw. The other meal types are "轉個食法" variations the user can
// force. Slot-machine columns are derived from the chosen meal type (and, for
// home style, from a randomly-drawn internal structure).
// ============================================================

// --- Household profile ---
export const householdProfile = {
  adults: ['外母', '爸爸', '媽媽'],
  child: { name: '可可', birthday: '2025-01-27' },
};
// kept for older imports
export const household = householdProfile;

// --- Meal types ---------------------------------------------------------
// `columns` (for non-home types) is an ordered list of { role, label } that
// becomes the slot-machine reels. home_style_rice draws its columns from a
// structure instead (see homeStyleStructures). babyRule drives the 可可餐.
export const mealTypes = [
  {
    id: 'home_style_rice', displayName: '家常餸飯', emoji: '🍚',
    description: '日常晚餐主流程，適合餸、菜、飯、湯', defaultWeight: 70, isDefault: true,
    babyRule: {
      tip: '先分起可可份，再調味。魚肉拆骨，肉剪碎，菜煮軟剪碎，少鹽少油。白飯可改軟飯。',
      safety: ['少鹽', '已去骨', '已切碎', '先分起再調味', '可可友善'],
      extra: [],
    },
  },
  {
    id: 'one_pot', displayName: '一煲到底', emoji: '🍲',
    description: '雞煲、牛肉煲、豆腐魚煲、咖喱雞、番茄薯仔牛肉煲', defaultWeight: 12,
    columns: [
      { role: 'pot_type', label: '煲類' },
      { role: 'pot_protein', label: '主角' },
      { role: 'pot_side', label: '配菜' },
      { role: 'pot_staple', label: '主食/收尾' },
    ],
    babyRule: {
      tip: '落醬、落鹽、落辣前先分起。雞肉牛肉切碎，薯仔紅蘿蔔菇菌煮軟，白飯可改軟飯。濃味醬汁唔好直接俾可可。',
      safety: ['少鹽', '先分起再調味', '已切碎', '易咀嚼', '可可友善'],
      extra: [],
    },
  },
  {
    id: 'fried_rice_noodles', displayName: '炒飯粉麵', emoji: '🍳',
    description: '蛋炒飯、蝦仁炒飯、炒麵、炒米、炒烏冬', defaultWeight: 7,
    columns: [
      { role: 'frn_base', label: '主食' },
      { role: 'frn_protein', label: '蛋白質' },
      { role: 'frn_veg', label: '蔬菜' },
      { role: 'frn_extra', label: '加配/湯' },
    ],
    babyRule: {
      tip: '少油少鹽，飯唔好太乾硬，粉麵剪短，蛋白質切碎，配菜切細。可用白飯拌熟料代替重油炒飯。',
      safety: ['少油', '少鹽', '已切碎', '易咀嚼', '可可友善'],
      extra: [],
    },
  },
  {
    id: 'rice_bowl', displayName: '碟頭飯', emoji: '🍛',
    description: '咖喱雞飯、番茄牛肉飯、蒸肉餅飯、粟米魚柳飯', defaultWeight: 6,
    columns: [
      { role: 'bowl_type', label: '碟頭類型' },
      { role: 'bowl_protein', label: '蛋白質' },
      { role: 'bowl_sauce', label: '汁/風味' },
      { role: 'bowl_side', label: '配菜' },
    ],
    babyRule: {
      tip: '汁另上或只少量，飯煮軟，肉剪碎，配菜煮軟。咖喱、濃汁唔好直接俾太多。',
      safety: ['少鹽', '汁另上', '已切碎', '易咀嚼', '可可友善'],
      extra: [{ name: '軟飯', fromName: '白飯', instruction: '飯多加水煮軟，方便可可咀嚼。', emoji: '🍚', hue: 45, cautions: ['易咀嚼'] }],
    },
  },
  {
    id: 'soup_noodle_congee', displayName: '湯粉麵粥', emoji: '🍜',
    description: '米線、烏冬、通粉、湯飯、粥', defaultWeight: 5,
    columns: [
      { role: 'snc_base', label: '主食' },
      { role: 'snc_broth', label: '湯底' },
      { role: 'snc_protein', label: '蛋白質' },
      { role: 'snc_side', label: '配菜' },
    ],
    babyRule: {
      tip: '湯底先分起再調味，粉麵剪短，粥保持軟身，肉同菜切碎。',
      safety: ['少鹽', '先分起再調味', '已切碎', '易咀嚼', '可可友善'],
      extra: [],
    },
  },
];

// --- home_style_rice internal structures -------------------------------
export const homeStyleStructures = [
  { id: 'simple',           label: '1餸1菜1主食',     weight: 20, slots: [{ role: 'main', label: '主餸' }, { role: 'vegetable', label: '蔬菜' }, { role: 'staple', label: '主食' }] },
  { id: 'normal_with_soup', label: '1餸1菜1湯1主食', weight: 35, slots: [{ role: 'main', label: '主餸' }, { role: 'vegetable', label: '蔬菜' }, { role: 'soup', label: '湯' }, { role: 'staple', label: '主食' }] },
  { id: 'two_dishes',       label: '2餸1菜1主食',     weight: 25, slots: [{ role: 'main', label: '主餸' }, { role: 'side', label: '配餸' }, { role: 'vegetable', label: '蔬菜' }, { role: 'staple', label: '主食' }] },
  { id: 'rich_with_soup',   label: '2餸1菜1湯1主食', weight: 20, slots: [{ role: 'main', label: '主餸' }, { role: 'side', label: '配餸' }, { role: 'vegetable', label: '蔬菜' }, { role: 'soup', label: '湯' }, { role: 'staple', label: '主食' }] },
];

// --- Condition chips (multi-select) ------------------------------------
export const conditions = [
  { id: 'quick',    label: '15分鐘',   emoji: '🕒' },
  { id: 'fridge',   label: '清雪櫃',   emoji: '🧊' },
  { id: 'baby',     label: '可可友善', emoji: '🙂' },
  { id: 'light',    label: '清淡少油', emoji: '🌿' },
  { id: 'low_wash', label: '少洗鑊',   emoji: '🧽' },
];

// Meal types that benefit from 少洗鑊 / 15分鐘 (boosted under those conditions).
export const lowEffortTypes = ['one_pot', 'fried_rice_noodles', 'rice_bowl'];

// ============================================================
// Items. Each item: id, name, kind (tag colour), emoji, hue,
//   roles[] (which column roles it can fill), mealTypes[],
//   tags[], cookingTime, difficulty, babyAdaptable (+ baby* fields),
//   caution[], allergens[], optional short (for summaries) & ingredients.
// ============================================================
export const items = [
  // ===================== HOME STYLE — 主餸/配餸 (mains) =====================
  { id: 'd-steamed-fish', name: '清蒸魚', kind: 'main', emoji: '🐟', hue: 200, roles: ['main', 'side'], mealTypes: ['home_style_rice'],
    tags: ['light', 'highprotein'], cookingTime: 15, difficulty: '易',
    babyAdaptable: true, babyVersionName: '蒸魚碎', babyInstruction: '拆走魚骨，取魚腩肉壓碎，少許蒸魚汁拌軟飯。', babyCautions: ['已去骨', '已切碎', '少油'],
    caution: [], allergens: ['魚'], ingredients: [{ n: '鮮魚', q: '1條(約1斤)' }, { n: '薑', q: '3片' }, { n: '蔥', q: '2條' }, { n: '蒸魚豉油', q: '2湯匙' }] },
  { id: 'd-steam-pork', name: '梅菜蒸肉餅', kind: 'main', emoji: '🥩', hue: 18, roles: ['main', 'side'], mealTypes: ['home_style_rice'],
    tags: ['fridge', 'highprotein'], cookingTime: 20, difficulty: '易',
    babyAdaptable: true, babyVersionName: '蒸肉餅碎', babyInstruction: '取未沾梅菜的中心肉，壓散去多餘油，拌少量飯。', babyCautions: ['少鹽', '已切碎'],
    caution: [], allergens: [], ingredients: [{ n: '免治豬肉', q: '300g' }, { n: '梅菜', q: '50g' }, { n: '薑蓉', q: '1茶匙' }, { n: '生粉', q: '1湯匙' }] },
  { id: 'd-tomato-egg', name: '番茄炒蛋', kind: 'main', emoji: '🍅', hue: 8, roles: ['main', 'side'], mealTypes: ['home_style_rice'],
    tags: ['light', 'quick', 'fridge'], cookingTime: 12, difficulty: '易',
    babyAdaptable: true, babyVersionName: '番茄蛋碎', babyInstruction: '炒嫩一點，少鹽少油，切碎後拌軟飯。', babyCautions: ['少鹽', '已切碎', '含蛋'],
    caution: ['蛋'], allergens: ['蛋'], ingredients: [{ n: '番茄', q: '3個' }, { n: '雞蛋', q: '4隻' }, { n: '糖', q: '1茶匙' }, { n: '蔥', q: '1條' }] },
  { id: 'd-ginger-chicken', name: '薑蔥蒸雞', kind: 'main', emoji: '🍗', hue: 38, roles: ['main', 'side'], mealTypes: ['home_style_rice'],
    tags: ['highprotein'], cookingTime: 25, difficulty: '中',
    babyAdaptable: true, babyVersionName: '雞肉蓉', babyInstruction: '取雞腿肉去皮去骨，撕成幼絲再剁碎。', babyCautions: ['已去骨', '已切碎', '去皮'],
    caution: [], allergens: [], ingredients: [{ n: '雞', q: '半隻(約600g)' }, { n: '薑', q: '5片' }, { n: '蔥', q: '3條' }] },
  { id: 'd-shrimp-egg', name: '滑蛋蝦仁', kind: 'main', emoji: '🍤', hue: 14, roles: ['main', 'side'], mealTypes: ['home_style_rice'],
    tags: ['quick', 'highprotein'], cookingTime: 12, difficulty: '中',
    babyAdaptable: false, caution: ['蝦', '蛋'], allergens: ['蝦', '蛋'], ingredients: [{ n: '蝦仁', q: '200g' }, { n: '雞蛋', q: '3隻' }, { n: '蔥', q: '1條' }] },
  { id: 'd-soy-spareribs', name: '豉汁蒸排骨', kind: 'main', emoji: '🍖', hue: 22, roles: ['main', 'side'], mealTypes: ['home_style_rice'],
    tags: ['highprotein'], cookingTime: 30, difficulty: '中',
    babyAdaptable: false, caution: ['骨'], allergens: ['黃豆'], ingredients: [{ n: '排骨', q: '400g' }, { n: '豆豉', q: '1湯匙' }, { n: '蒜蓉', q: '2瓣' }] },

  // ===================== HOME STYLE — 蔬菜 =====================
  { id: 'd-garlic-choisum', name: '蒜蓉炒菜心', kind: 'vegetable', emoji: '🥬', hue: 130, roles: ['vegetable'], mealTypes: ['home_style_rice'],
    tags: ['light', 'quick', 'fridge'], cookingTime: 8, difficulty: '易',
    babyAdaptable: true, babyVersionName: '菜心碎', babyInstruction: '取嫩葉灼軟，剪成細碎，免蒜免油。', babyCautions: ['已切碎', '少油'],
    caution: [], allergens: [], ingredients: [{ n: '菜心', q: '1斤' }, { n: '蒜', q: '3瓣' }, { n: '油', q: '1湯匙' }] },
  { id: 'd-poached-peashoot', name: '上湯浸豆苗', kind: 'vegetable', emoji: '🌱', hue: 120, roles: ['vegetable'], mealTypes: ['home_style_rice'],
    tags: ['light', 'quick'], cookingTime: 8, difficulty: '易',
    babyAdaptable: true, babyVersionName: '豆苗碎', babyInstruction: '灼軟後剪碎，用原湯（未調味）拌飯。', babyCautions: ['已切碎', '少鹽'],
    caution: [], allergens: [], ingredients: [{ n: '豆苗', q: '1盒(約300g)' }, { n: '上湯', q: '1碗' }, { n: '蒜', q: '2瓣' }] },
  { id: 'd-broccoli', name: '白灼西蘭花', kind: 'vegetable', emoji: '🥦', hue: 110, roles: ['vegetable'], mealTypes: ['home_style_rice'],
    tags: ['light', 'quick'], cookingTime: 10, difficulty: '易',
    babyAdaptable: true, babyVersionName: '西蘭花蓉', babyInstruction: '灼至軟身，只取花蕾壓成蓉。', babyCautions: ['已切碎', '少油'],
    caution: [], allergens: [], ingredients: [{ n: '西蘭花', q: '1個' }, { n: '蒜', q: '2瓣' }] },
  { id: 'd-stirfry-kailan', name: '蒜炒芥蘭', kind: 'vegetable', emoji: '🥗', hue: 135, roles: ['vegetable'], mealTypes: ['home_style_rice'],
    tags: ['fridge'], cookingTime: 9, difficulty: '易',
    babyAdaptable: false, caution: [], allergens: [], ingredients: [{ n: '芥蘭', q: '1斤' }, { n: '蒜', q: '3瓣' }] },

  // ===================== HOME STYLE — 湯 =====================
  { id: 'd-tomato-beef-soup', name: '番茄薯仔牛肉湯', kind: 'soup', emoji: '🍲', hue: 6, roles: ['soup'], mealTypes: ['home_style_rice'],
    tags: ['fridge', 'highprotein'], cookingTime: 40, difficulty: '中',
    babyAdaptable: true, babyVersionName: '番茄薯仔牛肉湯（先分起再調味）', babyInstruction: '未下鹽前先盛起可可份，壓爛薯仔番茄，牛肉剁碎。', babyCautions: ['少鹽', '先分起', '已切碎'],
    caution: [], allergens: [], ingredients: [{ n: '牛展', q: '300g' }, { n: '番茄', q: '3個' }, { n: '薯仔', q: '2個' }] },
  { id: 'd-carrot-pork-soup', name: '青紅蘿蔔煲瘦肉', kind: 'soup', emoji: '🥕', hue: 28, roles: ['soup'], mealTypes: ['home_style_rice'],
    tags: ['light'], cookingTime: 90, difficulty: '易',
    babyAdaptable: true, babyVersionName: '蘿蔔湯（先分起）', babyInstruction: '先盛起原味湯，蘿蔔壓蓉，瘦肉撕碎。', babyCautions: ['少鹽', '先分起'],
    caution: [], allergens: [], ingredients: [{ n: '青蘿蔔', q: '1條' }, { n: '紅蘿蔔', q: '1條' }, { n: '瘦肉', q: '300g' }, { n: '蜜棗', q: '2粒' }] },
  { id: 'd-wintermelon-soup', name: '冬瓜薏米湯', kind: 'soup', emoji: '🥣', hue: 90, roles: ['soup'], mealTypes: ['home_style_rice'],
    tags: ['light'], cookingTime: 60, difficulty: '易',
    babyAdaptable: true, babyVersionName: '冬瓜蓉湯', babyInstruction: '冬瓜煲腍，取出壓蓉，少量原湯拌勻。', babyCautions: ['少鹽', '易咀嚼'],
    caution: [], allergens: [], ingredients: [{ n: '冬瓜', q: '1斤' }, { n: '薏米', q: '50g' }, { n: '瘦肉', q: '250g' }] },
  { id: 'd-seaweed-egg-soup', name: '紫菜蛋花湯', kind: 'soup', emoji: '🍜', hue: 205, roles: ['soup', 'frn_extra'], mealTypes: ['home_style_rice', 'fried_rice_noodles'],
    tags: ['light', 'quick'], cookingTime: 10, difficulty: '易',
    babyAdaptable: false, caution: ['蛋'], allergens: ['蛋'], ingredients: [{ n: '紫菜', q: '1片' }, { n: '雞蛋', q: '2隻' }] },

  // ===================== HOME STYLE — 主食 =====================
  { id: 'd-rice', name: '白飯', kind: 'staple', emoji: '🍚', hue: 45, roles: ['staple', 'pot_staple'], mealTypes: ['home_style_rice', 'one_pot'],
    tags: ['light', 'quick', 'fridge'], cookingTime: 15, difficulty: '易',
    babyAdaptable: true, babyVersionName: '軟飯', babyInstruction: '多加少許水煮軟，或用原飯加湯焗軟。', babyCautions: ['易咀嚼', '少鹽'],
    caution: [], allergens: [], ingredients: [{ n: '白米', q: '2杯' }] },
  { id: 'd-grain-rice', name: '五穀飯', kind: 'staple', emoji: '🌾', hue: 40, roles: ['staple'], mealTypes: ['home_style_rice'],
    tags: ['light'], cookingTime: 20, difficulty: '易',
    babyAdaptable: true, babyVersionName: '軟五穀飯', babyInstruction: '多加水煮至軟身，確保粒粒鬆軟。', babyCautions: ['易咀嚼'],
    caution: [], allergens: [], ingredients: [{ n: '五穀米', q: '1杯' }, { n: '白米', q: '1杯' }] },
  { id: 'd-noodle-line', name: '麵線', kind: 'staple', emoji: '🍝', hue: 48, roles: ['staple'], mealTypes: ['home_style_rice'],
    tags: ['quick'], cookingTime: 10, difficulty: '易',
    babyAdaptable: true, babyVersionName: '碎麵線', babyInstruction: '灼軟後剪短，用原湯（未調味）拌勻。', babyCautions: ['已切碎', '含麩質'],
    caution: ['麩質'], allergens: ['麩質'], ingredients: [{ n: '麵線', q: '3束' }, { n: '上湯', q: '1碗' }] },

  // ===================== ONE POT — 煲類 =====================
  { id: 'p-satay-chicken', name: '沙嗲雞煲', kind: 'pot', emoji: '🍲', hue: 24, roles: ['pot_type'], mealTypes: ['one_pot'], tags: [], cookingTime: 35, difficulty: '中', babyAdaptable: false, caution: ['辣', '花生'], allergens: ['花生'] },
  { id: 'p-tomato-beef', name: '番茄薯仔牛肉煲', kind: 'pot', emoji: '🍅', hue: 6, roles: ['pot_type'], mealTypes: ['one_pot'], tags: ['fridge'], cookingTime: 40, difficulty: '中', babyAdaptable: false, caution: [], allergens: [] },
  { id: 'p-tofu-fish', name: '豆腐魚頭煲', kind: 'pot', emoji: '🐟', hue: 200, roles: ['pot_type'], mealTypes: ['one_pot'], tags: [], cookingTime: 35, difficulty: '中', babyAdaptable: false, caution: ['骨'], allergens: ['魚', '黃豆'] },
  { id: 'p-curry-chicken', name: '咖喱雞煲', kind: 'pot', emoji: '🍛', hue: 35, roles: ['pot_type'], mealTypes: ['one_pot'], tags: [], cookingTime: 40, difficulty: '中', babyAdaptable: false, caution: ['辣'], allergens: [] },
  { id: 'p-spicy-beef', name: '麻辣牛肉煲', kind: 'pot', emoji: '🌶️', hue: 2, roles: ['pot_type'], mealTypes: ['one_pot'], tags: [], cookingTime: 40, difficulty: '中', babyAdaptable: false, caution: ['辣'], allergens: [] },

  // ===================== ONE POT — 主角 (protein) =====================
  { id: 'p-chicken', name: '雞件', kind: 'protein', emoji: '🍗', hue: 38, roles: ['pot_protein'], mealTypes: ['one_pot'], tags: ['highprotein'], cookingTime: 30, difficulty: '易',
    babyAdaptable: true, babyVersionName: '清煮雞肉碎', babyInstruction: '落醬前先夾起，雞肉去皮去骨切碎。', babyCautions: ['已去骨', '已切碎', '先分起'],
    caution: [], allergens: [], ingredients: [{ n: '雞', q: '半隻' }] },
  { id: 'p-beef', name: '牛肋條', kind: 'protein', emoji: '🥩', hue: 12, roles: ['pot_protein'], mealTypes: ['one_pot'], tags: ['highprotein'], cookingTime: 50, difficulty: '中',
    babyAdaptable: true, babyVersionName: '牛肉碎', babyInstruction: '取腍身牛肉，剁碎，未調味先分起。', babyCautions: ['已切碎', '先分起'],
    caution: [], allergens: [], ingredients: [{ n: '牛肋條', q: '300g' }] },
  { id: 'p-fish-chunk', name: '魚塊', kind: 'protein', emoji: '🐟', hue: 200, roles: ['pot_protein'], mealTypes: ['one_pot'], tags: ['highprotein'], cookingTime: 20, difficulty: '中',
    babyAdaptable: true, babyVersionName: '魚肉碎（去骨）', babyInstruction: '徹底拆骨，取魚腩壓碎。', babyCautions: ['已去骨', '已切碎'],
    caution: ['骨'], allergens: ['魚'], ingredients: [{ n: '魚塊', q: '300g' }] },
  { id: 'p-tofu', name: '豆腐', kind: 'protein', emoji: '🧈', hue: 50, roles: ['pot_protein'], mealTypes: ['one_pot'], tags: ['light'], cookingTime: 15, difficulty: '易',
    babyAdaptable: true, babyVersionName: '豆腐碎', babyInstruction: '取嫩豆腐壓碎，先分起未調味。', babyCautions: ['已切碎', '先分起'],
    caution: [], allergens: ['黃豆'], ingredients: [{ n: '滑豆腐', q: '1磚' }] },
  { id: 'p-pork-belly', name: '豬腩肉', kind: 'protein', emoji: '🥓', hue: 20, roles: ['pot_protein'], mealTypes: ['one_pot'], tags: [], cookingTime: 35, difficulty: '中',
    babyAdaptable: false, caution: ['肥'], allergens: [], ingredients: [{ n: '豬腩肉', q: '300g' }] },

  // ===================== ONE POT — 配菜 =====================
  { id: 'p-potato-mush', name: '薯仔菇菌', kind: 'vegetable', emoji: '🥔', hue: 40, roles: ['pot_side'], mealTypes: ['one_pot'], tags: ['fridge'], cookingTime: 20, difficulty: '易',
    babyAdaptable: true, babyVersionName: '薯仔碎', babyInstruction: '薯仔煮腍壓碎，菇菌可免。', babyCautions: ['已切碎', '易咀嚼'],
    caution: [], allergens: [], ingredients: [{ n: '薯仔', q: '2個' }, { n: '鮮菇', q: '1包' }] },
  { id: 'p-carrot-corn', name: '紅蘿蔔粟米', kind: 'vegetable', emoji: '🥕', hue: 28, roles: ['pot_side'], mealTypes: ['one_pot'], tags: ['light'], cookingTime: 20, difficulty: '易',
    babyAdaptable: true, babyVersionName: '紅蘿蔔碎', babyInstruction: '紅蘿蔔煮腍壓碎；粟米粒去衣。', babyCautions: ['已切碎', '易咀嚼'],
    caution: [], allergens: [], ingredients: [{ n: '紅蘿蔔', q: '1條' }, { n: '粟米', q: '1條' }] },
  { id: 'p-cabbage-tofu', name: '椰菜豆卜', kind: 'vegetable', emoji: '🥬', hue: 110, roles: ['pot_side'], mealTypes: ['one_pot'], tags: ['light'], cookingTime: 15, difficulty: '易',
    babyAdaptable: true, babyVersionName: '椰菜碎', babyInstruction: '椰菜煮軟剪碎，豆卜偏油可免。', babyCautions: ['已切碎', '少油'],
    caution: [], allergens: ['黃豆'], ingredients: [{ n: '椰菜', q: '半個' }, { n: '豆卜', q: '6個' }] },
  { id: 'p-babychoy-mushroom', name: '娃娃菜冬菇', kind: 'vegetable', emoji: '🍄', hue: 95, roles: ['pot_side'], mealTypes: ['one_pot'], tags: ['light'], cookingTime: 18, difficulty: '易',
    babyAdaptable: true, babyVersionName: '娃娃菜碎', babyInstruction: '娃娃菜煮軟剪碎，冬菇可免。', babyCautions: ['已切碎'],
    caution: [], allergens: [], ingredients: [{ n: '娃娃菜', q: '2棵' }, { n: '冬菇', q: '4朵' }] },

  // ===================== ONE POT — 主食/收尾 =====================
  { id: 'p-udon', name: '烏冬', kind: 'staple', emoji: '🍜', hue: 48, roles: ['pot_staple', 'snc_base'], mealTypes: ['one_pot', 'soup_noodle_congee'], tags: ['quick'], cookingTime: 8, difficulty: '易', short: '烏冬',
    babyAdaptable: true, babyVersionName: '剪短烏冬', babyInstruction: '灼軟剪短，用原湯（未調味）拌勻。', babyCautions: ['已切碎', '含麩質'],
    caution: ['麩質'], allergens: ['麩質'], ingredients: [{ n: '烏冬', q: '3個' }] },
  { id: 'p-instant-noodle', name: '即食麵', kind: 'staple', emoji: '🍝', hue: 46, roles: ['pot_staple'], mealTypes: ['one_pot'], tags: ['quick'], cookingTime: 5, difficulty: '易',
    babyAdaptable: false, caution: ['鈉高'], allergens: ['麩質'], ingredients: [{ n: '即食麵', q: '3個' }] },

  // ===================== FRIED RICE / NOODLES — 主食 =====================
  { id: 'f-egg-fried-rice', name: '蛋炒飯', kind: 'base', emoji: '🍳', hue: 45, roles: ['frn_base'], mealTypes: ['fried_rice_noodles'], tags: ['quick', 'fridge'], cookingTime: 12, difficulty: '易',
    babyAdaptable: true, babyVersionName: '少油軟飯（拌蛋碎）', babyInstruction: '用白飯拌熟蛋碎，少油少鹽，唔好太乾。', babyCautions: ['少油', '少鹽', '含蛋'],
    caution: ['蛋'], allergens: ['蛋'], ingredients: [{ n: '隔夜飯', q: '3碗' }, { n: '雞蛋', q: '3隻' }] },
  { id: 'f-yangchow', name: '揚州炒飯', kind: 'base', emoji: '🍚', hue: 44, roles: ['frn_base'], mealTypes: ['fried_rice_noodles'], tags: ['fridge'], cookingTime: 15, difficulty: '中',
    babyAdaptable: true, babyVersionName: '少油軟飯', babyInstruction: '白飯拌軟熟料，去蝦殼，少油少鹽。', babyCautions: ['少油', '少鹽', '已切碎'],
    caution: [], allergens: ['蝦', '蛋'], ingredients: [{ n: '隔夜飯', q: '3碗' }, { n: '叉燒蝦仁', q: '少許' }] },
  { id: 'f-soy-noodle', name: '豉油王炒麵', kind: 'base', emoji: '🍜', hue: 38, roles: ['frn_base'], mealTypes: ['fried_rice_noodles'], tags: ['quick'], cookingTime: 12, difficulty: '中',
    babyAdaptable: true, babyVersionName: '剪短炒麵（少油）', babyInstruction: '麵灼軟剪短，少油少豉油。', babyCautions: ['少油', '少鹽', '已切碎', '含麩質'],
    caution: ['麩質'], allergens: ['麩質'], ingredients: [{ n: '蛋麵', q: '3個' }, { n: '豉油', q: '2湯匙' }, { n: '芽菜', q: '1份' }] },
  { id: 'f-singapore-mei', name: '星洲炒米', kind: 'base', emoji: '🍝', hue: 35, roles: ['frn_base'], mealTypes: ['fried_rice_noodles'], tags: [], cookingTime: 15, difficulty: '中',
    babyAdaptable: true, babyVersionName: '剪短米粉', babyInstruction: '米粉灼軟剪短，免咖喱粉。', babyCautions: ['少油', '已切碎'],
    caution: ['辣'], allergens: ['蝦', '蛋'], ingredients: [{ n: '米粉', q: '1包' }, { n: '咖喱粉', q: '1茶匙' }] },
  { id: 'f-fried-udon', name: '炒烏冬', kind: 'base', emoji: '🍲', hue: 48, roles: ['frn_base'], mealTypes: ['fried_rice_noodles'], tags: ['quick'], cookingTime: 12, difficulty: '易',
    babyAdaptable: true, babyVersionName: '剪短烏冬', babyInstruction: '烏冬灼軟剪短，少油少鹽。', babyCautions: ['少油', '已切碎', '含麩質'],
    caution: ['麩質'], allergens: ['麩質'], ingredients: [{ n: '烏冬', q: '3個' }] },

  // ===================== FRIED RICE / NOODLES — 蛋白質 =====================
  { id: 'f-shrimp', name: '蝦仁', kind: 'protein', emoji: '🍤', hue: 14, roles: ['frn_protein'], mealTypes: ['fried_rice_noodles'], tags: ['highprotein'], cookingTime: 5, difficulty: '易', short: '蝦仁',
    babyAdaptable: true, babyVersionName: '蝦仁碎', babyInstruction: '蝦仁去腸切碎，確認無殼。', babyCautions: ['已切碎', '含蝦'],
    caution: ['蝦'], allergens: ['蝦'], ingredients: [{ n: '蝦仁', q: '150g' }] },
  { id: 'f-charsiu', name: '叉燒', kind: 'protein', emoji: '🍖', hue: 4, roles: ['frn_protein'], mealTypes: ['fried_rice_noodles'], tags: ['fridge'], cookingTime: 3, difficulty: '易', short: '叉燒',
    babyAdaptable: false, caution: ['鹹'], allergens: ['黃豆'], ingredients: [{ n: '叉燒', q: '150g' }] },
  { id: 'f-chicken-shred', name: '雞絲', kind: 'protein', emoji: '🍗', hue: 38, roles: ['frn_protein'], mealTypes: ['fried_rice_noodles'], tags: ['highprotein'], cookingTime: 8, difficulty: '易', short: '雞絲',
    babyAdaptable: true, babyVersionName: '雞肉碎', babyInstruction: '雞肉撕碎再剁細。', babyCautions: ['已切碎', '已去骨'],
    caution: [], allergens: [], ingredients: [{ n: '雞柳', q: '150g' }] },
  { id: 'f-luncheon', name: '午餐肉', kind: 'protein', emoji: '🥓', hue: 6, roles: ['frn_protein'], mealTypes: ['fried_rice_noodles'], tags: ['quick'], cookingTime: 3, difficulty: '易', short: '午餐肉',
    babyAdaptable: false, caution: ['鈉高'], allergens: [], ingredients: [{ n: '午餐肉', q: '半罐' }] },
  { id: 'f-soft-egg', name: '滑蛋', kind: 'protein', emoji: '🍳', hue: 45, roles: ['frn_protein'], mealTypes: ['fried_rice_noodles'], tags: ['quick'], cookingTime: 4, difficulty: '易', short: '滑蛋',
    babyAdaptable: true, babyVersionName: '蛋碎', babyInstruction: '蛋炒嫩切碎。', babyCautions: ['已切碎', '含蛋'],
    caution: ['蛋'], allergens: ['蛋'], ingredients: [{ n: '雞蛋', q: '3隻' }] },

  // ===================== FRIED RICE / NOODLES — 蔬菜 =====================
  { id: 'f-corn-veg', name: '粟米菜粒', kind: 'vegetable', emoji: '🌽', hue: 50, roles: ['frn_veg'], mealTypes: ['fried_rice_noodles'], tags: ['light'], cookingTime: 5, difficulty: '易',
    babyAdaptable: true, babyVersionName: '菜粒', babyInstruction: '菜切細煮軟，粟米去衣。', babyCautions: ['已切碎'],
    caution: [], allergens: [], ingredients: [{ n: '粟米粒', q: '1碗' }, { n: '雜菜', q: '1碗' }] },
  { id: 'f-beansprout', name: '芽菜韭黃', kind: 'vegetable', emoji: '🌱', hue: 60, roles: ['frn_veg'], mealTypes: ['fried_rice_noodles'], tags: ['quick'], cookingTime: 4, difficulty: '易',
    babyAdaptable: false, caution: [], allergens: [], ingredients: [{ n: '芽菜', q: '1份' }, { n: '韭黃', q: '1份' }] },
  { id: 'f-mixed-veg', name: '雜菜粒', kind: 'vegetable', emoji: '🥕', hue: 30, roles: ['frn_veg'], mealTypes: ['fried_rice_noodles'], tags: ['light', 'fridge'], cookingTime: 5, difficulty: '易',
    babyAdaptable: true, babyVersionName: '雜菜碎', babyInstruction: '雜菜煮軟切碎。', babyCautions: ['已切碎', '易咀嚼'],
    caution: [], allergens: [], ingredients: [{ n: '急凍雜菜', q: '1碗' }] },
  { id: 'f-blanch-choisum', name: '灼菜心', kind: 'vegetable', emoji: '🥬', hue: 130, roles: ['frn_veg'], mealTypes: ['fried_rice_noodles'], tags: ['light'], cookingTime: 6, difficulty: '易',
    babyAdaptable: true, babyVersionName: '菜心碎', babyInstruction: '灼軟剪碎。', babyCautions: ['已切碎'],
    caution: [], allergens: [], ingredients: [{ n: '菜心', q: '半斤' }] },

  // ===================== FRIED RICE / NOODLES — 加配/湯 =====================
  { id: 'f-daily-soup', name: '是日例湯', kind: 'soup', emoji: '🍲', hue: 35, roles: ['frn_extra'], mealTypes: ['fried_rice_noodles'], tags: ['light'], cookingTime: 10, difficulty: '易', babyAdaptable: false, caution: [], allergens: [] },
  { id: 'f-blanch-lettuce', name: '灼生菜', kind: 'vegetable', emoji: '🥬', hue: 120, roles: ['frn_extra'], mealTypes: ['fried_rice_noodles'], tags: ['light', 'quick'], cookingTime: 4, difficulty: '易',
    babyAdaptable: true, babyVersionName: '生菜碎', babyInstruction: '灼軟剪碎。', babyCautions: ['已切碎'], caution: [], allergens: [] },
  { id: 'f-fried-egg', name: '煎蛋', kind: 'protein', emoji: '🍳', hue: 45, roles: ['frn_extra'], mealTypes: ['fried_rice_noodles'], tags: ['quick'], cookingTime: 4, difficulty: '易',
    babyAdaptable: true, babyVersionName: '蛋碎', babyInstruction: '蛋煎熟切碎。', babyCautions: ['已切碎', '含蛋'], caution: ['蛋'], allergens: ['蛋'] },

  // ===================== RICE BOWL — 碟頭類型 =====================
  { id: 'b-curry-rice', name: '咖喱飯', kind: 'base', emoji: '🍛', hue: 35, roles: ['bowl_type'], mealTypes: ['rice_bowl'], tags: [], cookingTime: 20, difficulty: '易', babyAdaptable: false, caution: ['辣'], allergens: [] },
  { id: 'b-tomato-rice', name: '茄汁飯', kind: 'base', emoji: '🍅', hue: 6, roles: ['bowl_type'], mealTypes: ['rice_bowl'], tags: ['fridge'], cookingTime: 18, difficulty: '易', babyAdaptable: false, caution: [], allergens: [] },
  { id: 'b-blackpepper-rice', name: '黑椒飯', kind: 'base', emoji: '🌶️', hue: 20, roles: ['bowl_type'], mealTypes: ['rice_bowl'], tags: [], cookingTime: 18, difficulty: '易', babyAdaptable: false, caution: ['辣'], allergens: [] },
  { id: 'b-corn-rice', name: '粟米飯', kind: 'base', emoji: '🌽', hue: 50, roles: ['bowl_type'], mealTypes: ['rice_bowl'], tags: ['light'], cookingTime: 18, difficulty: '易', babyAdaptable: false, caution: [], allergens: [] },

  // ===================== RICE BOWL — 蛋白質 =====================
  { id: 'b-chicken', name: '雞件', kind: 'protein', emoji: '🍗', hue: 38, roles: ['bowl_protein'], mealTypes: ['rice_bowl'], tags: ['highprotein'], cookingTime: 15, difficulty: '易', short: '雞',
    babyAdaptable: true, babyVersionName: '清雞肉碎', babyInstruction: '落汁前先分起，雞肉去骨切碎。', babyCautions: ['已去骨', '已切碎', '先分起'],
    caution: [], allergens: [], ingredients: [{ n: '雞扒', q: '2塊' }] },
  { id: 'b-beef', name: '牛肉', kind: 'protein', emoji: '🥩', hue: 12, roles: ['bowl_protein'], mealTypes: ['rice_bowl'], tags: ['highprotein'], cookingTime: 10, difficulty: '易', short: '牛肉',
    babyAdaptable: true, babyVersionName: '牛肉碎', babyInstruction: '牛肉煮腍切碎，先分起。', babyCautions: ['已切碎', '先分起'],
    caution: [], allergens: [], ingredients: [{ n: '牛肉片', q: '200g' }] },
  { id: 'b-fishfillet', name: '魚柳', kind: 'protein', emoji: '🐟', hue: 200, roles: ['bowl_protein'], mealTypes: ['rice_bowl'], tags: ['highprotein'], cookingTime: 10, difficulty: '易', short: '魚柳',
    babyAdaptable: true, babyVersionName: '魚柳碎（去骨）', babyInstruction: '確認去骨，壓碎。', babyCautions: ['已去骨', '已切碎'],
    caution: ['骨'], allergens: ['魚'], ingredients: [{ n: '魚柳', q: '2件' }] },
  { id: 'b-porkpatty', name: '蒸肉餅', kind: 'protein', emoji: '🥩', hue: 18, roles: ['bowl_protein'], mealTypes: ['rice_bowl'], tags: ['fridge'], cookingTime: 18, difficulty: '易', short: '肉餅',
    babyAdaptable: true, babyVersionName: '肉餅碎', babyInstruction: '取中心肉壓散，少鹽。', babyCautions: ['已切碎', '少鹽'],
    caution: [], allergens: [], ingredients: [{ n: '免治豬肉', q: '250g' }] },

  // ===================== RICE BOWL — 汁/風味 =====================
  { id: 'b-jp-curry', name: '日式咖喱', kind: 'sauce', emoji: '🍛', hue: 35, roles: ['bowl_sauce'], mealTypes: ['rice_bowl'], tags: [], cookingTime: 5, difficulty: '易', short: '咖喱', babyAdaptable: false, caution: ['辣'], allergens: ['麩質'] },
  { id: 'b-tomato-sauce', name: '茄汁', kind: 'sauce', emoji: '🍅', hue: 6, roles: ['bowl_sauce'], mealTypes: ['rice_bowl'], tags: ['fridge'], cookingTime: 5, difficulty: '易', short: '番茄', babyAdaptable: false, caution: [], allergens: [] },
  { id: 'b-blackpepper-sauce', name: '黑椒汁', kind: 'sauce', emoji: '🌶️', hue: 20, roles: ['bowl_sauce'], mealTypes: ['rice_bowl'], tags: [], cookingTime: 5, difficulty: '易', short: '黑椒', babyAdaptable: false, caution: ['辣'], allergens: ['黃豆'] },
  { id: 'b-corn-sauce', name: '粟米汁', kind: 'sauce', emoji: '🌽', hue: 50, roles: ['bowl_sauce'], mealTypes: ['rice_bowl'], tags: ['light'], cookingTime: 5, difficulty: '易', short: '粟米', babyAdaptable: false, caution: [], allergens: [] },

  // ===================== RICE BOWL — 配菜 =====================
  { id: 'b-broccoli', name: '灼西蘭花', kind: 'vegetable', emoji: '🥦', hue: 110, roles: ['bowl_side'], mealTypes: ['rice_bowl'], tags: ['light'], cookingTime: 6, difficulty: '易',
    babyAdaptable: true, babyVersionName: '西蘭花蓉', babyInstruction: '灼軟取花蕾壓蓉。', babyCautions: ['已切碎'], caution: [], allergens: [], ingredients: [{ n: '西蘭花', q: '半個' }] },
  { id: 'b-choisum', name: '灼菜心', kind: 'vegetable', emoji: '🥬', hue: 130, roles: ['bowl_side'], mealTypes: ['rice_bowl'], tags: ['light'], cookingTime: 6, difficulty: '易',
    babyAdaptable: true, babyVersionName: '菜心碎', babyInstruction: '灼軟剪碎。', babyCautions: ['已切碎'], caution: [], allergens: [], ingredients: [{ n: '菜心', q: '半斤' }] },
  { id: 'b-seasonal', name: '灼時菜', kind: 'vegetable', emoji: '🥗', hue: 120, roles: ['bowl_side'], mealTypes: ['rice_bowl'], tags: ['light', 'fridge'], cookingTime: 6, difficulty: '易',
    babyAdaptable: true, babyVersionName: '時菜碎', babyInstruction: '灼軟剪碎。', babyCautions: ['已切碎'], caution: [], allergens: [], ingredients: [{ n: '時菜', q: '半斤' }] },

  // ===================== SOUP / NOODLE / CONGEE — 主食 =====================
  { id: 's-rice-noodle', name: '米線', kind: 'base', emoji: '🍜', hue: 44, roles: ['snc_base'], mealTypes: ['soup_noodle_congee'], tags: ['quick'], cookingTime: 8, difficulty: '易', short: '米線',
    babyAdaptable: true, babyVersionName: '剪短米線', babyInstruction: '灼軟剪短，原湯未調味先分起。', babyCautions: ['已切碎', '少鹽'],
    caution: [], allergens: [], ingredients: [{ n: '米線', q: '2個' }] },
  { id: 's-macaroni', name: '通粉', kind: 'base', emoji: '🍝', hue: 46, roles: ['snc_base'], mealTypes: ['soup_noodle_congee'], tags: ['quick'], cookingTime: 8, difficulty: '易', short: '通粉',
    babyAdaptable: true, babyVersionName: '剪短通粉', babyInstruction: '煮軟剪短。', babyCautions: ['已切碎', '含麩質'],
    caution: ['麩質'], allergens: ['麩質'], ingredients: [{ n: '通粉', q: '2碗' }] },
  { id: 's-congee', name: '白粥', kind: 'base', emoji: '🥣', hue: 45, roles: ['snc_base'], mealTypes: ['soup_noodle_congee'], tags: ['light'], cookingTime: 40, difficulty: '易', short: '粥',
    babyAdaptable: true, babyVersionName: '軟粥', babyInstruction: '粥煮軟身，料切碎拌入。', babyCautions: ['易咀嚼', '少鹽'],
    caution: [], allergens: [], ingredients: [{ n: '米', q: '1杯' }] },
  { id: 's-soup-rice', name: '湯飯', kind: 'base', emoji: '🍚', hue: 42, roles: ['snc_base'], mealTypes: ['soup_noodle_congee'], tags: ['quick', 'fridge'], cookingTime: 10, difficulty: '易', short: '湯飯',
    babyAdaptable: true, babyVersionName: '軟湯飯', babyInstruction: '飯加湯焗軟，料切碎。', babyCautions: ['易咀嚼', '少鹽'],
    caution: [], allergens: [], ingredients: [{ n: '白飯', q: '2碗' }] },

  // ===================== SOUP / NOODLE / CONGEE — 湯底 =====================
  { id: 's-tomato-broth', name: '番茄湯', kind: 'broth', emoji: '🍅', hue: 6, roles: ['snc_broth'], mealTypes: ['soup_noodle_congee'], tags: ['light', 'fridge'], cookingTime: 15, difficulty: '易', short: '番茄', babyAdaptable: false, caution: [], allergens: [] },
  { id: 's-superior-broth', name: '上湯', kind: 'broth', emoji: '🍲', hue: 40, roles: ['snc_broth'], mealTypes: ['soup_noodle_congee'], tags: ['light'], cookingTime: 10, difficulty: '易', short: '', babyAdaptable: false, caution: [], allergens: [] },
  { id: 's-century-pork', name: '皮蛋瘦肉', kind: 'broth', emoji: '🥚', hue: 30, roles: ['snc_broth'], mealTypes: ['soup_noodle_congee'], tags: [], cookingTime: 20, difficulty: '易', short: '皮蛋', babyAdaptable: false, caution: ['皮蛋'], allergens: ['蛋'] },
  { id: 's-pork-bone', name: '豬骨湯', kind: 'broth', emoji: '🍖', hue: 22, roles: ['snc_broth'], mealTypes: ['soup_noodle_congee'], tags: [], cookingTime: 25, difficulty: '易', short: '', babyAdaptable: false, caution: [], allergens: [] },

  // ===================== SOUP / NOODLE / CONGEE — 蛋白質 =====================
  { id: 's-beef', name: '牛肉', kind: 'protein', emoji: '🥩', hue: 12, roles: ['snc_protein'], mealTypes: ['soup_noodle_congee'], tags: ['highprotein'], cookingTime: 5, difficulty: '易', short: '牛肉',
    babyAdaptable: true, babyVersionName: '牛肉碎', babyInstruction: '牛肉灼熟切碎，先分起。', babyCautions: ['已切碎', '先分起'],
    caution: [], allergens: [], ingredients: [{ n: '牛肉片', q: '150g' }] },
  { id: 's-chicken-shred', name: '雞絲', kind: 'protein', emoji: '🍗', hue: 38, roles: ['snc_protein'], mealTypes: ['soup_noodle_congee'], tags: ['highprotein'], cookingTime: 8, difficulty: '易', short: '雞絲',
    babyAdaptable: true, babyVersionName: '雞肉碎', babyInstruction: '雞肉撕碎剁細。', babyCautions: ['已切碎', '已去骨'],
    caution: [], allergens: [], ingredients: [{ n: '雞柳', q: '150g' }] },
  { id: 's-lean-pork', name: '瘦肉', kind: 'protein', emoji: '🥩', hue: 18, roles: ['snc_protein'], mealTypes: ['soup_noodle_congee'], tags: ['highprotein'], cookingTime: 12, difficulty: '易', short: '瘦肉',
    babyAdaptable: true, babyVersionName: '瘦肉碎', babyInstruction: '瘦肉煮腍剁碎。', babyCautions: ['已切碎'],
    caution: [], allergens: [], ingredients: [{ n: '瘦肉', q: '150g' }] },
  { id: 's-fish-slice', name: '魚片', kind: 'protein', emoji: '🐟', hue: 200, roles: ['snc_protein'], mealTypes: ['soup_noodle_congee'], tags: ['highprotein'], cookingTime: 5, difficulty: '中', short: '魚片',
    babyAdaptable: true, babyVersionName: '魚片碎（去骨）', babyInstruction: '確認去骨，壓碎。', babyCautions: ['已去骨', '已切碎'],
    caution: ['骨'], allergens: ['魚'], ingredients: [{ n: '魚片', q: '150g' }] },

  // ===================== SOUP / NOODLE / CONGEE — 配菜 =====================
  { id: 's-lettuce', name: '生菜', kind: 'vegetable', emoji: '🥬', hue: 120, roles: ['snc_side'], mealTypes: ['soup_noodle_congee'], tags: ['light', 'quick'], cookingTime: 3, difficulty: '易',
    babyAdaptable: true, babyVersionName: '生菜碎', babyInstruction: '灼軟剪碎。', babyCautions: ['已切碎'], caution: [], allergens: [], ingredients: [{ n: '生菜', q: '1棵' }] },
  { id: 's-choisum', name: '灼菜心', kind: 'vegetable', emoji: '🥗', hue: 130, roles: ['snc_side'], mealTypes: ['soup_noodle_congee'], tags: ['light'], cookingTime: 5, difficulty: '易',
    babyAdaptable: true, babyVersionName: '菜心碎', babyInstruction: '灼軟剪碎。', babyCautions: ['已切碎'], caution: [], allergens: [], ingredients: [{ n: '菜心', q: '半斤' }] },
  { id: 's-seasonal', name: '時菜', kind: 'vegetable', emoji: '🥦', hue: 110, roles: ['snc_side'], mealTypes: ['soup_noodle_congee'], tags: ['light', 'fridge'], cookingTime: 5, difficulty: '易',
    babyAdaptable: true, babyVersionName: '時菜碎', babyInstruction: '灼軟剪碎。', babyCautions: ['已切碎'], caution: [], allergens: [], ingredients: [{ n: '時菜', q: '半斤' }] },
];

// --- Convenience lookups ---
export const mealTypeById = Object.fromEntries(mealTypes.map((m) => [m.id, m]));
