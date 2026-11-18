// POST /api/order  (Cloudflare Pages Function)
// Recalculates every price from the catalogue, stores the order in D1 and
// optionally pings Telegram. The browser only sends SKUs, sizes and quantities.
import { priceCart } from '../../src/lib/pricing.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

function normalisePhone(v) {
  const d = String(v || '').replace(/[^\d+]/g, '').replace(/^\+?92/, '0').replace(/^0092/, '0');
  return /^03\d{9}$/.test(d) ? d : null;
}

function orderId() {
  const now = new Date(Date.now() + 5 * 3600 * 1000); // Pakistan time
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, '');
  const rand = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(4, '0').slice(-4);
  return `HD-${ymd}-${rand}`;
}

export async function onRequestPost({ request, env, waitUntil }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const c = body?.customer || {};
  if (c.website) return json({ orderId: 'HD-OK', total: 0 }); // honeypot: pretend success for bots

  const customer = {
    name: clean(c.name, 80),
    phone: normalisePhone(c.phone),
    email: clean(c.email, 120),
    address: clean(c.address, 300),
    area: clean(c.area, 80),
    city: clean(c.city, 60),
    notes: clean(c.notes, 500),
    gift: c.gift ? 1 : 0,
  };
  if (!customer.name || !customer.address || !customer.city) return json({ error: 'Please fill in your name, address and city.' }, 400);
  if (!customer.phone) return json({ error: 'Please enter a Pakistani mobile number, like 0300 1234567.' }, 400);

  const lines = Array.isArray(body.lines) ? body.lines.slice(0, 50) : [];
  const cart = priceCart(lines);
  if (!cart.lines.length) return json({ error: 'Your bag is empty or has items we no longer sell.' }, 400);

  const id = orderId();
  const createdAt = new Date().toISOString();

  if (!env.DB) return json({ error: 'Orders are not set up yet (no database bound). Please order on WhatsApp.' }, 503);

  await env.DB.prepare(
    `INSERT INTO orders (id, created_at, status, payment, name, phone, email, address, area, city, notes, gift, items_json, subtotal, discount, shipping, total, ip_country, user_agent)
     VALUES (?1, ?2, 'new', 'cod', ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)`,
  )
    .bind(
      id, createdAt, customer.name, customer.phone, customer.email, customer.address, customer.area, customer.city, customer.notes, customer.gift,
      JSON.stringify({ lines: cart.lines, discounts: cart.discounts }), cart.subtotal, cart.discountTotal, cart.shipping, cart.total,
      request.headers.get('cf-ipcountry') || '', clean(request.headers.get('user-agent'), 200),
    )
    .run();

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    const items = cart.lines
      .map((l) => l.type === 'bundle'
        ? `• ${l.qty} × ${l.name}: ${l.parts.map((p) => `${p.color} ${p.size}`).join(' + ')}`
        : `• ${l.qty} × ${l.name} (${l.color}, ${l.size})`)
      .join('\n');
    const text = `New order ${id}\n${customer.name} · ${customer.phone}\n${customer.address}${customer.area ? ', ' + customer.area : ''}, ${customer.city}\n${items}\nTotal Rs ${cart.total.toLocaleString('en-PK')} (COD)${customer.gift ? '\nGIFT: hide prices' : ''}${customer.notes ? '\nNotes: ' + customer.notes : ''}`;
    const send = fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    }).catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(send);
    else await send;
  }

  return json({ orderId: id, total: cart.total });
}
