// Tiny cart store in localStorage. Holds only SKUs, bundle ids, sizes and
// quantities; prices are always recalculated from the catalogue.
const KEY = 'hd_cart_v1';

export function readCart() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function writeCart(lines) {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
  window.dispatchEvent(new CustomEvent('cart:change'));
}

const keyOf = (l) => (l.type === 'bundle' ? `b:${l.bundle}:${l.sizes.join(',')}` : `i:${l.sku}`);

export function addLine(line) {
  const lines = readCart();
  const k = keyOf(line);
  const found = lines.find((l) => keyOf(l) === k);
  if (found) found.qty = Math.min(20, found.qty + (line.qty || 1));
  else lines.push({ ...line, qty: line.qty || 1 });
  writeCart(lines);
}

export function setQty(index, qty) {
  const lines = readCart();
  if (!lines[index]) return;
  if (qty <= 0) lines.splice(index, 1);
  else lines[index].qty = Math.min(20, qty);
  writeCart(lines);
}

export function replaceCartSilently(lines) {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
}

export function clearCart() { writeCart([]); }

export function cartCount() {
  return readCart().reduce((s, l) => s + (l.qty || 0), 0);
}

export function toast(html) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.innerHTML = html;
  el.setAttribute('data-show', 'true');
  clearTimeout(window.__hdToast);
  window.__hdToast = setTimeout(() => el.setAttribute('data-show', 'false'), 3500);
}
