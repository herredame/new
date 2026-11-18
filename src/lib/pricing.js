// Cart pricing. Runs in the browser (cart, checkout) and on the server
// (functions/api/order.js), so both always agree. The server never trusts
// prices sent by the browser: it only takes SKUs, bundle ids and quantities.
import {
  PROMOTIONS, productById, bundleById, priceOf, bundlePrice, colorOf, parseSku, isValidVariant,
} from '../data/catalog.js';
import { SHIPPING } from '../data/site.js';

/**
 * @param {Array} lines  [{ type: 'item', sku, qty } | { type: 'bundle', bundle, sizes: [..], qty }]
 * @returns {{ lines, subtotal, discounts, discountTotal, shipping, total, itemCount, errors }}
 */
export function priceCart(lines = []) {
  const out = [];
  const errors = [];
  const units = []; // individual non-bundle units, for multi-buy promotions

  for (const raw of lines) {
    const qty = Math.max(1, Math.min(20, parseInt(raw.qty, 10) || 1));
    if (raw.type === 'bundle') {
      const b = bundleById[raw.bundle];
      const sizes = Array.isArray(raw.sizes) ? raw.sizes : [];
      if (!b || sizes.length !== b.items.length || !b.items.every((it, i) => isValidVariant(it.product, it.color, sizes[i]))) {
        errors.push(`Unknown bundle or size: ${raw.bundle}`);
        continue;
      }
      const { list, price } = bundlePrice(b);
      out.push({
        type: 'bundle', bundle: b.id, name: b.name, qty, sizes,
        unitPrice: price, unitList: list, lineTotal: price * qty,
        parts: b.items.map((it, i) => {
          const p = productById[it.product];
          return { product: p.id, name: p.name, color: colorOf(p, it.color).name, colorId: it.color, size: sizes[i] };
        }),
      });
    } else {
      const { product, color, size } = parseSku(raw.sku);
      if (!isValidVariant(product, color, size)) {
        errors.push(`Unknown item: ${raw.sku}`);
        continue;
      }
      const p = productById[product];
      const unitPrice = priceOf(product);
      out.push({
        type: 'item', sku: raw.sku, product, name: p.name, color: colorOf(p, color).name, colorId: color, size, qty,
        unitPrice, lineTotal: unitPrice * qty, category: p.category,
      });
      for (let i = 0; i < qty; i++) units.push({ category: p.category, price: unitPrice });
    }
  }

  const subtotal = out.reduce((s, l) => s + l.lineTotal, 0);
  const discounts = [];

  for (const promo of PROMOTIONS) {
    const eligible = units.filter((u) => promo.categories.includes(u.category)).sort((a, b) => b.price - a.price);
    if (eligible.length < 2) continue;
    let amount = 0;
    if (promo.type === 'fixed-groups') {
      // Greedy: most expensive units first, biggest groups first.
      let i = 0;
      for (const g of promo.groups) {
        while (eligible.length - i >= g.size) {
          const group = eligible.slice(i, i + g.size);
          const list = group.reduce((s, u) => s + u.price, 0);
          amount += Math.max(0, list - g.price);
          i += g.size;
        }
      }
    } else if (promo.type === 'tiered-percent') {
      const tier = promo.tiers.find((t) => eligible.length >= t.min);
      if (tier) amount = Math.round(eligible.reduce((s, u) => s + u.price, 0) * tier.pct);
    }
    if (amount > 0) discounts.push({ id: promo.id, label: promo.label, amount });
  }

  const discountTotal = discounts.reduce((s, d) => s + d.amount, 0);
  const afterDiscount = subtotal - discountTotal;
  const shipping = out.length === 0 || afterDiscount >= SHIPPING.freeThreshold ? 0 : SHIPPING.fee;
  const itemCount = out.reduce((s, l) => s + l.qty * (l.type === 'bundle' ? l.parts.length : 1), 0);

  return { lines: out, subtotal, discounts, discountTotal, shipping, total: afterDiscount + shipping, itemCount, errors };
}

export const formatPKR = (n) => 'Rs ' + Math.round(n).toLocaleString('en-PK');
