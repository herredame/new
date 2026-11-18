-- Cloudflare D1 schema for Herre&Dame orders.
-- Apply with: npx wrangler d1 execute herre-dame-orders --remote --file=schema.sql
CREATE TABLE IF NOT EXISTS orders (
  id          TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL,
  updated_at  TEXT,
  status      TEXT NOT NULL DEFAULT 'new',
  payment     TEXT NOT NULL DEFAULT 'cod',
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  address     TEXT NOT NULL,
  area        TEXT,
  city        TEXT NOT NULL,
  notes       TEXT,
  gift        INTEGER NOT NULL DEFAULT 0,
  items_json  TEXT NOT NULL,
  subtotal    INTEGER NOT NULL,
  discount    INTEGER NOT NULL DEFAULT 0,
  shipping    INTEGER NOT NULL DEFAULT 0,
  total       INTEGER NOT NULL,
  ip_country  TEXT,
  user_agent  TEXT
);
CREATE INDEX IF NOT EXISTS orders_created ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS orders_phone ON orders (phone);
