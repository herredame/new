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
| Order API (COD) | `functions/api/order.js` | Order placement controller |
| Order admin (status, WhatsApp confirm, CSV) | `/admin/` + `functions/api/admin/orders.js` | Business Manager orders |
| Images | `public/img/` (WebP, made by `npm run images`) | Dynamic imaging service |

Clean URLs: `/men/polo-shirts/`, `/unisex/hoodies/`, `/products/tipped-polo-black/`, `/bundles/his-and-hers-hoodie-set/`. Sitemap and robots.txt are generated.

## Run locally

```bash
npm install
npm run dev                 # site only, http://localhost:4321
cp .dev.vars.example .dev.vars
npm run db:local            # create the local orders table
npm run dev:full            # site + order API + local D1, http://localhost:8788
```

## Before launch: things to change

1. `src/data/catalog.js`: replace the placeholder prices (hoodie, sweatshirt, tee, tank, sunglasses). The build warns while any remain. Check the size charts and product details.
2. `src/data/site.js`: domain (`url`), WhatsApp number, email, Instagram.
3. Re-import images after adding new photos: `npm run images -- "<path to Relaunch Edits 2026>" "<path to HomePage content>"`.

## Deploy to Cloudflare Pages (one time, about 10 minutes)

1. `npx wrangler login`
2. `npx wrangler d1 create herre-dame-orders` and paste the `database_id` into `wrangler.toml`.
3. `npm run db:remote` to create the orders table.
4. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick this repo.
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
5. Project → Settings → Bindings → add D1 database, variable name `DB`, database `herre-dame-orders`.
6. Project → Settings → Variables and secrets → add secret `ADMIN_TOKEN` (a long random string). Optional: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` for new-order alerts.
7. Project → Custom domains → add your domain. If the domain's DNS is not on Cloudflare yet, Cloudflare shows the records to add at your registrar.
8. Submit `https://<domain>/sitemap-index.xml` in Google Search Console.

Every push to `main` deploys automatically. Pull requests get preview URLs.

## Managing orders

Open `https://<domain>/admin/`, enter the `ADMIN_TOKEN`, and update each order's status. Each order has a WhatsApp button with a pre-written confirmation message. Download CSV for your courier.

## Later

- Card and wallet payments (Safepay, PayFast, JazzCash, Easypaisa) once a merchant account is approved.
- Reviews with AggregateRating schema once the first orders are in.
- Landing pages: "polo shirts Lahore", "couple polo shirts", and a fit guide.
