# Herre&Dame storefront

Fast, SEO-first shop for Herre&Dame. Static Astro site on Cloudflare Pages (free plan, commercial use allowed), with cash-on-delivery orders stored in Cloudflare D1.

## How it is built

| Part | Where | SFCC equivalent |
| --- | --- | --- |
| Catalogue: products, colours, sizes, bundles, promotions | `src/data/catalog.js` | Catalog + price book + product sets + promotions |
| Store settings: domain, WhatsApp, delivery fee, free-delivery threshold | `src/data/site.js` | Site preferences |
| Cart pricing, shared by browser and server | `src/lib/pricing.js` | Promotion engine / basket calculation |
| JSON-LD (ProductGroup, Offer, BreadcrumbList, Organization) | `src/lib/schema.js` | SEO cartridge |
| Pages: home, category (PLP), product (PDP), bundles, cart, checkout | `src/pages/` | ISML templates + controllers |
| Order API (COD) | `functions/api/order.js`, routed by `src/server/worker.js` | Order placement controller |
| Order admin (status, WhatsApp confirm, CSV) | `/admin/` + `functions/api/admin/orders.js` | Business Manager orders |
| Images | `public/img/` (WebP, made by `npm run images`) | Dynamic imaging service |

Clean URLs: `/men/polo-shirts/`, `/unisex/hoodies/`, `/products/tipped-polo-black/`, `/bundles/his-and-hers-hoodie-set/`. Sitemap and robots.txt are generated.

## Run locally

```bash
npm install
npm run dev                 # site only, http://localhost:4321
cp .dev.vars.example .dev.vars
npm run db:local            # create the local orders table
npm run dev:full            # site + order API + local D1, http://localhost:8787
```

## Before launch: things to change

1. `src/data/catalog.js`: replace the placeholder prices (hoodie, sweatshirt, tee, tank, sunglasses). The build warns while any remain. Check the size charts and product details.
2. `src/data/site.js`: domain (`url`), WhatsApp number, email, Instagram.
3. Re-import images after adding new photos: `npm run images -- "<path to Relaunch Edits 2026>" "<path to HomePage content>"`.

## Deploy (Cloudflare Workers with static assets)

The live site is the Worker `new` in the Herredame.contact Cloudflare account, built from `main` on every push.

- Build command: `npm run build` · Deploy command: `npx wrangler deploy` (both set in the dashboard)
- `wrangler.toml` holds the Worker name, the `dist` assets folder and the D1 binding `DB`
- `src/server/worker.js` handles `/api/order` and `/api/admin/orders`, and everything else is served from `dist`
- Secret `ADMIN_TOKEN` (and optional `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) are set under the Worker's Settings → Variables and Secrets
- Custom domain: Worker → Settings → Domains & Routes → Add → Custom domain (`herredame.com`, `www.herredame.com`)

Deploy by hand from your Mac with `npm run deploy` after `npx wrangler login`.

## Managing orders

Open `https://<domain>/admin/`, enter the `ADMIN_TOKEN`, and update each order's status. Each order has a WhatsApp button with a pre-written confirmation message. Download CSV for your courier.

## Later

- Card and wallet payments (Safepay, PayFast, JazzCash, Easypaisa) once a merchant account is approved.
- Reviews with AggregateRating schema once the first orders are in.
- Landing pages: "polo shirts Lahore", "couple polo shirts", and a fit guide.
