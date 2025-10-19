-- Add product categorization columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_gift_idea BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS gift_category VARCHAR(100);

-- Create subscribers table for email capture
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_gift_idea ON products(is_gift_idea);
CREATE INDEX IF NOT EXISTS idx_products_gift_category ON products(gift_category);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);