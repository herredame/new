import { SITE } from '../data/site.js';
export function GET() {
  return new Response(`User-agent: *\nAllow: /\nDisallow: /cart/\nDisallow: /checkout/\nDisallow: /order-confirmed/\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${new URL('/sitemap-index.xml', SITE.url).href}\n`, { headers: { 'content-type': 'text/plain' } });
}
