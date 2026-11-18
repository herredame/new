// GET  /api/admin/orders?status=new        -> latest 200 orders
// POST /api/admin/orders {id, status}      -> update status
// Protected by the ADMIN_TOKEN secret (Authorization: Bearer <token>).
const STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

async function authorised(request, env) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || !token) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(token)), crypto.subtle.digest('SHA-256', enc.encode(env.ADMIN_TOKEN))]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function onRequestGet({ request, env }) {
  if (!(await authorised(request, env))) return json({ error: 'Unauthorised' }, 401);
  const status = new URL(request.url).searchParams.get('status');
  const q = STATUSES.includes(status)
    ? env.DB.prepare('SELECT * FROM orders WHERE status = ?1 ORDER BY created_at DESC LIMIT 200').bind(status)
    : env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200');
  const { results } = await q.all();
  return json({ orders: results.map((o) => ({ ...o, items: JSON.parse(o.items_json || '{}') })) });
}

export async function onRequestPost({ request, env }) {
  if (!(await authorised(request, env))) return json({ error: 'Unauthorised' }, 401);
  const { id, status } = await request.json().catch(() => ({}));
  if (!id || !STATUSES.includes(status)) return json({ error: 'Bad request' }, 400);
  await env.DB.prepare('UPDATE orders SET status = ?1, updated_at = ?2 WHERE id = ?3').bind(status, new Date().toISOString(), id).run();
  return json({ ok: true });
}
