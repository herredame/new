// Herre&Dame catalogue, modelled the SFCC way:
//   master product -> colour variants -> size variants (SKU = master-colour-size)
//   PRICE_BOOK     -> list price per master (one honest price, no fake strike-throughs)
//   BUNDLES        -> product sets: each item keeps its own size picker
//   PROMOTIONS     -> cart-level multi-buy rules (see src/lib/pricing.js)
//
// This file is shared by the static pages, the cart script and the order API,
// so the price a customer sees is the price the server charges.

import images from './images.json' with { type: 'json' };

// ---------------------------------------------------------------------------
// Price book (PKR). Polos confirmed by Mansab. Others set from a competitor
// scan on 18 Nov 2026 (Outfitters, Brackets, Cambridge, Fitted, RAAH, Naqees).
// Mark a price `placeholder: true` and the build prints a warning.
// ---------------------------------------------------------------------------
export const PRICE_BOOK = {
  'classic-pique-polo': { price: 2990 },
  'tipped-polo': { price: 3250 },
  'gold-detail-polo': { price: 3250 },
  'unisex-hoodie': { price: 3990 },
  'unisex-sweatshirt': { price: 3490 },
  'womens-tee': { price: 1990 },
  'womens-tank': { price: 1690 },
  'white-sunglasses': { price: 1990 },
};

export const CATEGORIES = [
  {
    id: 'polos', gender: 'men', path: '/men/polo-shirts/', name: 'Polo Shirts', h1: "Men's Polo Shirts",
    title: "Men's Polo Shirts in Pakistan | Piqué & Tipped Polos",
    description: 'Piqué and tipped polo shirts for men. Rs 2,990, any 2 for Rs 5,490, any 3 for Rs 7,990. Cash on delivery across Pakistan.',
    intro: 'Cotton piqué polos cut for a clean, close fit. One honest price, and the more you take the more you save: any 2 for Rs 5,490, any 3 for Rs 7,990.',
  },
  {
    id: 'tees', gender: 'women', path: '/women/t-shirts/', name: 'T-Shirts', h1: "Women's T-Shirts",
    title: "Women's T-Shirts in Pakistan | Everyday Cotton Tees",
    description: "Women's cotton t-shirts in black, white, red and teal. Pair one with his polo for a couple set. Cash on delivery across Pakistan.",
    intro: 'Easy cotton tees in the same colours as his polos, so every couple set matches.',
  },
  {
    id: 'tanks', gender: 'women', path: '/women/tank-tops/', name: 'Tank Tops', h1: "Women's Tank Tops",
    title: "Women's Tank Tops in Pakistan | Ribbed Cotton Tanks",
    description: "Women's tank tops in black, red and teal. Layer under a hoodie or wear alone. Cash on delivery across Pakistan.",
    intro: 'Fitted tanks for warm days and for layering under a hoodie when it cools down.',
  },
  {
    id: 'hoodies', gender: 'unisex', path: '/unisex/hoodies/', name: 'Hoodies', h1: 'Unisex Hoodies',
    title: 'Hoodies in Pakistan for Men & Women | Couple Hoodies',
    description: 'Unisex 320 GSM fleece hoodies in six colours, Rs 3,990. Any 2 save 10%, any 3 save 15%, and His & Hers hoodie sets. Cash on delivery across Pakistan.',
    intro: '320 GSM brushed-fleece hoodies cut to fit him and her. Mix any hoodies and sweatshirts: 2 save 10%, 3 or more save 15%.',
  },
  {
    id: 'sweatshirts', gender: 'unisex', path: '/unisex/sweatshirts/', name: 'Sweatshirts', h1: 'Unisex Sweatshirts',
    title: 'Sweatshirts in Pakistan for Men & Women | 11 Colours',
    description: 'Unisex 320 GSM crew-neck sweatshirts in eleven colours, Rs 3,490. Any 2 save 10%, any 3 save 15%. Cash on delivery across Pakistan.',
    intro: '320 GSM crew-neck sweatshirts in eleven colours, from safe black and navy to pistachio and tea pink. Mix any hoodies and sweatshirts: 2 save 10%, 3 or more save 15%.',
  },
  {
    id: 'accessories', gender: 'unisex', path: '/accessories/', name: 'Accessories', h1: 'Accessories',
    title: 'Sunglasses & Accessories | Herre&Dame',
    description: 'Finish the look with Herre&Dame sunglasses. Cash on delivery across Pakistan.',
    intro: 'The finishing touch.',
  },
];

export const GENDERS = {
  men: { name: 'Men', path: '/men/', title: "Men's Clothing | Polos, Hoodies & Sweatshirts", h1: 'Men' },
  women: { name: 'Women', path: '/women/', title: "Women's Clothing | Tees, Tanks, Hoodies & Sweatshirts", h1: 'Women' },
  unisex: { name: 'Unisex', path: '/unisex/', title: 'Unisex Hoodies & Sweatshirts', h1: 'Unisex' },
};

// Size charts in inches, garment measured flat (chest = pit to pit x 2).
// TODO: confirm every number against your factory spec before launch.
export const SIZE_CHARTS = {
  polo: { note: 'Regular fit. Model is 5\'11" and wears M.', cols: ['Size', 'Chest', 'Length', 'Shoulder'], rows: [['S', 38, 27, 17], ['M', 40, 28, 18], ['L', 42, 29, 19], ['XL', 44, 30, 20], ['XXL', 46, 31, 21]] },
  tee: { note: 'Relaxed fit. Size down for a closer fit.', cols: ['Size', 'Chest', 'Length'], rows: [['XS', 34, 24], ['S', 36, 25], ['M', 38, 26], ['L', 40, 27], ['XL', 42, 28]] },
  tank: { note: 'Fitted.', cols: ['Size', 'Bust', 'Length'], rows: [['XS', 30, 22], ['S', 32, 23], ['M', 34, 24], ['L', 36, 25], ['XL', 38, 26]] },
  fleece: { note: 'Unisex relaxed fit. Women usually take one size down.', cols: ['Size', 'Chest', 'Length', 'Sleeve'], rows: [['XS', 40, 25, 31], ['S', 42, 26, 32], ['M', 44, 27, 33], ['L', 46, 28, 34], ['XL', 48, 29, 35], ['XXL', 50, 30, 36]] },
};

// Colour variants point at an image folder from "Website image sets".
const c = (id, name, folder, extra = {}) => ({ id, name, folder, ...extra });

export const PRODUCTS = [
  {
    id: 'classic-pique-polo', category: 'polos', name: 'Classic Piqué Polo', sizeChart: 'polo',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    short: 'A clean cotton piqué polo with a two-button placket and the gold H&D mark on the chest.',
    details: ['Cotton piqué knit that breathes in the heat', 'Two-button placket, ribbed collar and cuffs', 'Embroidered H&D chest mark', 'Regular fit, true to size'],
    care: 'Machine wash cold inside out. Do not bleach. Dry in shade. Warm iron, avoid the logo.',
    colors: [c('teal', 'Teal', 'teal-polo'), c('pink', 'Pink', 'pink-polo')],
  },
  {
    id: 'tipped-polo', category: 'polos', name: 'Tipped Piqué Polo', sizeChart: 'polo',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    short: 'Our signature polo: contrast tipping on the collar and cuffs, finished with the gold H&D mark.',
    details: ['Cotton piqué knit', 'Contrast-tipped collar and sleeve cuffs', 'Embroidered H&D chest mark', 'Regular fit, true to size'],
    care: 'Machine wash cold inside out. Do not bleach. Dry in shade. Warm iron, avoid the logo.',
    colors: [
      c('black', 'Black, double tipping', 'black-double-tipping-polo'),
      c('royal-blue', 'Royal Blue, white tipping', 'royal-blue-white-tipping-polo'),
    ],
  },
  {
    id: 'gold-detail-polo', category: 'polos', name: 'Gold Detail Polo', sizeChart: 'polo',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    short: 'A crisp white piqué polo with a gold H&D mark. Pairs with our white tee for a matching couple set.',
    details: ['Cotton piqué knit', 'Gold embroidered H&D chest mark', 'Two-button placket', 'Regular fit, true to size'],
    care: 'Machine wash cold, wash whites separately. Do not bleach. Dry in shade.',
    colors: [c('white', 'White & Gold', 'white-gold-polo')],
  },
  {
    id: 'unisex-hoodie', category: 'hoodies', name: 'Signature Hoodie', sizeChart: 'fleece',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    short: 'A 320 GSM brushed-fleece hoodie with a kangaroo pocket and the H&D chest mark. Made for winter evenings, and made to be shared.',
    details: ['320 GSM brushed fleece, soft on the inside', 'Lined hood with drawcords', 'Kangaroo pocket, ribbed cuffs and hem', 'Unisex relaxed fit'],
    care: 'Machine wash cold inside out with similar colours. Do not tumble dry. Dry flat in shade.',
    colors: [
      c('black', 'Black', 'black-hoodie'), c('white', 'White', 'white-hoodie'), c('maroon', 'Maroon & Gold', 'maroon-gold-hoodie'),
      c('navy', 'Navy', 'navy-hoodie'), c('nude', 'Nude', 'nude-hoodie'), c('lilac', 'Lilac', 'lilac-hoodie'),
    ],
  },
  {
    id: 'unisex-sweatshirt', category: 'sweatshirts', name: 'Crew Sweatshirt', sizeChart: 'fleece',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    short: 'A clean crew-neck sweatshirt in 320 GSM brushed fleece. The everyday winter layer, in eleven colours.',
    details: ['320 GSM brushed fleece, soft on the inside', 'Crew neck with ribbed collar, cuffs and hem', 'Embroidered H&D chest mark', 'Unisex relaxed fit'],
    care: 'Machine wash cold inside out with similar colours. Do not tumble dry. Dry flat in shade.',
    colors: [
      c('black', 'Black', 'black-sweatshirt'), c('navy', 'Navy', 'navy-sweatshirt'), c('olive', 'Olive Green', 'olive-sweatshirt'),
      c('nude', 'Nude', 'nude-sweatshirt'), c('maroon', 'Maroon', 'maroon-sweatshirt'), c('chocolate', 'Chocolate', 'chocolate-sweatshirt'),
      c('tea-pink', 'Tea Pink', 'tea-pink-sweatshirt'), c('pistachio', 'Pistachio', 'pistachio-sweatshirt'), c('camo', 'Camo', 'camo-sweatshirt'),
      c('yellow', 'Yellow', 'yellow-sweatshirt'), c('grey-heather', 'Grey Heather', 'grey-heather-sweatshirt'),
    ],
  },
  {
    id: 'womens-tee', category: 'tees', name: 'Everyday Tee', sizeChart: 'tee',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    short: 'A soft cotton tee with a relaxed shape and the gold H&D mark. Matches his polos colour for colour.',
    details: ['Soft cotton jersey', 'Crew neck, short sleeves', 'Gold embroidered H&D chest mark', 'Relaxed fit'],
    care: 'Machine wash cold inside out. Do not bleach. Dry in shade.',
    colors: [c('black', 'Black', 'black-tee'), c('white', 'White', 'white-tee'), c('red', 'Red', 'red-tee'), c('teal', 'Teal', 'teal-tee')],
  },
  {
    id: 'womens-tank', category: 'tanks', name: 'Fitted Tank Top', sizeChart: 'tank',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    short: 'A fitted cotton tank with a high neckline. Wear it alone in summer or layer it under a hoodie.',
    details: ['Stretch cotton rib', 'High round neck', 'Fitted through the body', 'Pairs with the Everyday Tee for the Summer Set'],
    care: 'Machine wash cold. Do not bleach. Dry flat in shade.',
    colors: [c('black', 'Black', 'black-tank'), c('red', 'Red', 'red-tank'), c('teal', 'Turquoise', 'teal-tank')],
  },
  {
    id: 'white-sunglasses', category: 'accessories', name: 'White Frame Sunglasses', sizeChart: null,
    sizes: ['One Size'],
    short: 'Statement white frames with dark lenses. The finishing touch for summer sets.',
    details: ['White frame, dark tinted lenses', 'Unisex'],
    care: 'Wipe with a soft microfibre cloth. Store in a case.',
    colors: [c('white', 'White', 'white-sunglasses')],
  },
];

// ---------------------------------------------------------------------------
// Bundles (product sets). Each item is a fixed master + colour; the shopper
// picks a size for each. Price = sum of list prices less `discount`,
// rounded down to the nearest Rs ..90.
// ---------------------------------------------------------------------------
export const BUNDLES = [
  {
    id: 'his-and-hers-hoodie-set', name: 'His & Hers Hoodie Set', discount: 0.12, audience: 'couple',
    image: 'couple-hoodie-set_white-black', altImage: 'flat_couple-hoodies_black-white',
    short: 'Two hoodies, black and white, one for each of you. Separate sizes for each.',
    items: [{ product: 'unisex-hoodie', color: 'black', label: 'Black hoodie' }, { product: 'unisex-hoodie', color: 'white', label: 'White hoodie' }],
  },
  {
    id: 'couple-polo-tee-set-black', name: 'Couple Set: Black Polo + Tee', discount: 0.1, audience: 'couple',
    image: 'couple-black-set_polo-tee',
    short: 'His black tipped polo and her black tee, gold marks on both.',
    items: [{ product: 'tipped-polo', color: 'black', label: 'His polo' }, { product: 'womens-tee', color: 'black', label: 'Her tee' }],
  },
  {
    id: 'couple-polo-tee-set-white', name: 'Couple Set: White Polo + Tee', discount: 0.1, audience: 'couple',
    image: 'couple-white-set_polo-tee',
    short: 'His white and gold polo and her white tee. Clean, bright and easy to match.',
    items: [{ product: 'gold-detail-polo', color: 'white', label: 'His polo' }, { product: 'womens-tee', color: 'white', label: 'Her tee' }],
  },
  {
    id: 'winter-sweatshirt-3-pack', name: 'Winter Sweatshirt 3-Pack', discount: 0.18, audience: 'him',
    image: 'flat_winter-sweatshirt-3-pack_black-navy-olive',
    short: 'Black, navy and olive. Three sweatshirts, sorted for the whole winter.',
    items: [{ product: 'unisex-sweatshirt', color: 'black' }, { product: 'unisex-sweatshirt', color: 'navy' }, { product: 'unisex-sweatshirt', color: 'olive' }],
  },
  {
    id: 'her-neutral-sweatshirt-trio', name: 'Her Neutral Sweatshirt Trio', discount: 0.18, audience: 'her',
    image: 'her-sweatshirt-trio_nude-olive-navy',
    short: 'Nude, olive and navy: three easy neutrals that go with everything.',
    items: [{ product: 'unisex-sweatshirt', color: 'nude' }, { product: 'unisex-sweatshirt', color: 'olive' }, { product: 'unisex-sweatshirt', color: 'navy' }],
  },
  {
    id: 'hoodie-sweatshirt-pair', name: 'Hoodie + Sweatshirt Pair', discount: 0.1, audience: 'her',
    image: 'flat_hoodie-plus-sweatshirt_maroon-nude',
    short: 'A maroon and gold hoodie with a nude sweatshirt. Warm, wintry, and made to layer.',
    items: [{ product: 'unisex-hoodie', color: 'maroon' }, { product: 'unisex-sweatshirt', color: 'nude' }],
  },
  {
    id: 'layering-set', name: 'Layering Set: Hoodie + Tee', discount: 0.08, audience: 'any',
    image: 'flat_layering-set_hoodie-tee_navy-white',
    short: 'A navy hoodie with a white tee underneath. The easiest outfit in the shop.',
    items: [{ product: 'unisex-hoodie', color: 'navy' }, { product: 'womens-tee', color: 'white' }],
  },
  {
    id: 'her-summer-set', name: 'Her Summer Set: Tee + Tank', discount: 0.08, audience: 'her',
    image: 'flat_her-summer-set_tee-tank_white-black',
    short: 'A white tee and a black tank for warm days.',
    items: [{ product: 'womens-tee', color: 'white' }, { product: 'womens-tank', color: 'black' }],
  },
];

// Cart-level multi-buy promotions, applied to items bought on their own (not in a bundle).
export const PROMOTIONS = [
  { id: 'polo-multibuy', type: 'fixed-groups', categories: ['polos'], label: 'Polo multi-buy', groups: [{ size: 3, price: 7990 }, { size: 2, price: 5490 }], blurb: 'Any 2 polos for Rs 5,490 · any 3 for Rs 7,990' },
  { id: 'fleece-multibuy', type: 'tiered-percent', categories: ['hoodies', 'sweatshirts'], label: 'Hoodies & sweatshirts multi-buy', tiers: [{ min: 3, pct: 0.15 }, { min: 2, pct: 0.1 }], blurb: 'Any 2 hoodies or sweatshirts save 10% · 3 or more save 15%' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export const productById = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const bundleById = Object.fromEntries(BUNDLES.map((b) => [b.id, b]));

export function priceOf(productId) {
  return PRICE_BOOK[productId]?.price ?? null;
}

export function colorOf(product, colorId) {
  return product.colors.find((c) => c.id === colorId);
}

export function imagesFor(folder) {
  return images.products[folder] || { images: [], flat: null, swatch: null };
}

export function productUrl(productId, colorId) {
  return `/products/${productId}-${colorId}/`;
}

export function bundleUrl(bundleId) {
  return `/bundles/${bundleId}/`;
}

export function roundDown90(n) {
  return Math.floor((n + 10) / 100) * 100 - 10;
}

export function bundlePrice(bundle) {
  const list = bundle.items.reduce((s, it) => s + priceOf(it.product), 0);
  const price = Math.min(list, roundDown90(list * (1 - bundle.discount)));
  return { list, price, saving: list - price };
}

export function skuOf(productId, colorId, size) {
  return `${productId}__${colorId}__${size}`;
}

export function parseSku(sku) {
  const [product, color, size] = String(sku).split('__');
  return { product, color, size };
}

export function isValidVariant(productId, colorId, size) {
  const p = productById[productId];
  if (!p) return false;
  return !!colorOf(p, colorId) && p.sizes.includes(size);
}

export const BUNDLE_IMAGES = images.bundles;
export const HERO = images.hero;
