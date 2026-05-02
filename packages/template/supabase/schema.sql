-- create-zuri Database Schema
-- Paste this into your Supabase dashboard → SQL Editor and run it.

-- Products
CREATE TABLE IF NOT EXISTS products (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  images      TEXT[] DEFAULT '{}',
  sizes       TEXT[] DEFAULT '{}',
  colors      TEXT[] DEFAULT '{}',
  category    TEXT DEFAULT 'General',
  available   BOOLEAN DEFAULT true,
  featured    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name    TEXT,
  customer_email   TEXT,
  customer_phone   TEXT,
  delivery_address TEXT,
  items            JSONB NOT NULL DEFAULT '[]',
  total            DECIMAL(10,2) NOT NULL,
  status           TEXT DEFAULT 'pending'
                     CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled')),
  source           TEXT DEFAULT 'paystack'
                     CHECK (source IN ('paystack','whatsapp')),
  paystack_ref     TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Products: public read
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);

-- Products: admin write
CREATE POLICY "products_admin_write" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders: admin read
CREATE POLICY "orders_admin_read" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

-- Orders: admin update (status changes)
CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Orders: anyone can insert (customers placing orders)
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (true);

-- Subscribers: admin read
CREATE POLICY "subscribers_admin_read" ON subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Subscribers: anyone can insert
CREATE POLICY "subscribers_public_insert" ON subscribers
  FOR INSERT WITH CHECK (true);

-- ── Storage ───────────────────────────────────────────────────
-- Run these separately or create the bucket via the Supabase dashboard.
--
-- 1. Create bucket:
--    INSERT INTO storage.buckets (id, name, public)
--    VALUES ('product-images', 'product-images', true);
--
-- 2. Public read:
--    CREATE POLICY "product_images_public_read" ON storage.objects
--      FOR SELECT USING (bucket_id = 'product-images');
--
-- 3. Admin upload:
--    CREATE POLICY "product_images_admin_upload" ON storage.objects
--      FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
--
-- 4. Admin delete:
--    CREATE POLICY "product_images_admin_delete" ON storage.objects
--      FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
