import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/data/site.js';
import { PRICE_BOOK } from './src/data/catalog.js';

const placeholders = Object.entries(PRICE_BOOK).filter(([, v]) => v.placeholder).map(([k]) => k);
if (placeholders.length) console.warn(`\n⚠  Placeholder prices still set for: ${placeholders.join(', ')}. Update src/data/catalog.js before launch.\n`);
if (SITE.whatsapp === '920000000000') console.warn('⚠  WhatsApp number is a placeholder. Update src/data/site.js before launch.\n');

// Static output: every product, category and bundle page is prebuilt HTML.
// Orders go to Cloudflare Pages Functions in /functions.
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(cart|checkout|order-confirmed|admin)\//.test(page),
    }),
  ],
});
