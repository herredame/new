// Shared rendering for the cart page and checkout summary.
import { priceCart, formatPKR } from '../lib/pricing.js';
import { productById, bundleById, colorOf, imagesFor, productUrl, bundleUrl, BUNDLE_IMAGES, PROMOTIONS } from '../data/catalog.js';
import { SHIPPING } from '../data/site.js';
import { readCart, replaceCartSilently } from './cart-store.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function lineImage(l) {
  if (l.type === 'bundle') {
    const img = BUNDLE_IMAGES[bundleById[l.bundle].image];
    return img ? `${img.src}-600.webp` : '';
  }
  const p = productById[l.product];
  const img = imagesFor(colorOf(p, l.colorId).folder).images[0];
  return img ? `${img.src}-600.webp` : '';
}

export function lineUrl(l) {
  return l.type === 'bundle' ? bundleUrl(l.bundle) : productUrl(l.product, l.colorId);
}

export function lineDetail(l) {
  if (l.type === 'bundle') return l.parts.map((p) => `${esc(p.name)} (${esc(p.color)}, ${esc(p.size)})`).join('<br>');
  return `${esc(l.color)} · Size ${esc(l.size)}`;
}

// Drops lines that no longer exist in the catalogue, so list indexes match the store.
export function currentCart() {
  const raw = readCart();
  const valid = raw.filter((l) => priceCart([l]).lines.length === 1);
  if (valid.length !== raw.length) replaceCartSilently(valid);
  return priceCart(valid);
}

export function summaryHtml(cart) {
  const rows = [`<div class="sum-row"><span>Subtotal</span><span>${formatPKR(cart.subtotal)}</span></div>`];
  for (const d of cart.discounts) rows.push(`<div class="sum-row disc"><span>${esc(d.label)}</span><span>−${formatPKR(d.amount)}</span></div>`);
  rows.push(`<div class="sum-row"><span>Delivery</span><span>${cart.shipping ? formatPKR(cart.shipping) : 'Free'}</span></div>`);
  rows.push(`<div class="sum-row total"><span>Total</span><span>${formatPKR(cart.total)}</span></div>`);
  return rows.join('');
}

// One upsell line: the cheapest way to unlock the next saving or free delivery.
export function nudgeHtml(cart) {
  const after = cart.subtotal - cart.discountTotal;
  const parts = [];
  if (after < SHIPPING.freeThreshold && after > 0) {
    const pct = Math.min(100, Math.round((after / SHIPPING.freeThreshold) * 100));
    parts.push(`<div class="progress" aria-hidden="true"><span style="width:${pct}%"></span></div><p class="nudge" style="margin-top:4px">Add ${formatPKR(SHIPPING.freeThreshold - after)} more for free delivery.</p>`);
  }
  const polos = cart.lines.filter((l) => l.type === 'item' && l.category === 'polos').reduce((s, l) => s + l.qty, 0);
  const fleece = cart.lines.filter((l) => l.type === 'item' && ['hoodies', 'sweatshirts'].includes(l.category)).reduce((s, l) => s + l.qty, 0);
  if (polos === 1) parts.push(`<p class="nudge">Add one more polo and pay Rs 5,490 for both. <a href="/men/polo-shirts/">Shop polos</a></p>`);
  else if (polos === 2) parts.push(`<p class="nudge">Add a third polo and pay Rs 7,990 for all three. <a href="/men/polo-shirts/">Shop polos</a></p>`);
  else if (fleece === 1) parts.push(`<p class="nudge">Add another hoodie or sweatshirt and save 10% on both. <a href="/unisex/sweatshirts/">Shop sweatshirts</a></p>`);
  else if (fleece === 2) parts.push(`<p class="nudge">Add a third hoodie or sweatshirt and save 15% on all three. <a href="/unisex/hoodies/">Shop hoodies</a></p>`);
  return parts.join('');
}

export { esc, formatPKR };
