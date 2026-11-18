// Cloudflare Worker entry: serves the static Astro build from `dist` (static
// assets) and handles the order API. Same handlers as the Pages Functions in
// /functions, so either deployment style works.
import { onRequestPost as placeOrder } from '../../functions/api/order.js';
import { onRequestGet as listOrders, onRequestPost as updateOrder } from '../../functions/api/admin/orders.js';

const routes = {
  'POST /api/order': placeOrder,
  'GET /api/admin/orders': listOrders,
  'POST /api/admin/orders': updateOrder,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '');
    const handler = routes[`${request.method} ${path}`];
    if (handler) return handler({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    }
    return env.ASSETS.fetch(request);
  },
};
