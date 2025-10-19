-- Enable RLS and UUID extension
ALTER DATABASE postgres SET "app.environment" = 'development';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  age_group TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Products table (one-of-a-kind model)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  story TEXT,
  price DECIMAL(10,2) NOT NULL,
  price_usd DECIMAL(10,2),
  price_eur DECIMAL(10,2),
  price_gbp DECIMAL(10,2),
  size TEXT NOT NULL,
  age_group TEXT NOT NULL,
  color_primary TEXT,
  color_secondary TEXT,
  fabric TEXT,
  care_instructions TEXT,
  measurements JSONB,
  is_featured BOOLEAN DEFAULT false,
  is_sold BOOLEAN DEFAULT false,
  sold_at TIMESTAMP WITH TIME ZONE,
  is_reserved BOOLEAN DEFAULT false,
  reserved_until TIMESTAMP WITH TIME ZONE,
  is_draft BOOLEAN DEFAULT true,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product images table
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customer profiles extending auth.users
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  currency_preference TEXT DEFAULT 'AUD',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  currency TEXT DEFAULT 'AUD',
  subtotal DECIMAL(10,2) NOT NULL,
  gst_amount DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  exchange_rate DECIMAL(8,6) DEFAULT 1,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  tracking_number TEXT,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  price_at_purchase DECIMAL(10,2) NOT NULL,
  currency_at_purchase TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cart items with reservation system
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '15 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(product_id) -- Ensures only one reservation per product
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  customer_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Wishlist table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  notify_similar BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(user_id, product_id)
);

-- Similar item notifications table
CREATE TABLE similarity_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_product_id UUID REFERENCES products(id),
  size_preference TEXT,
  age_group_preference TEXT,
  color_preference TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sold ON products(is_sold);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_age_group ON products(age_group);
CREATE INDEX idx_products_reserved ON products(is_reserved);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_expires ON cart_items(expires_at);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to release expired cart reservations
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS void AS $$
BEGIN
  -- Release expired cart items
  DELETE FROM cart_items WHERE expires_at < now();

  -- Update product reservation status
  UPDATE products
  SET is_reserved = false, reserved_until = null
  WHERE id NOT IN (SELECT product_id FROM cart_items WHERE expires_at > now())
    AND is_reserved = true;
END;
$$ LANGUAGE plpgsql;

-- Function to reserve a product
CREATE OR REPLACE FUNCTION reserve_product(product_uuid UUID, user_uuid UUID, session_uuid TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  reservation_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  reservation_expires := now() + interval '15 minutes';

  -- Check if product exists and is available
  IF NOT EXISTS (
    SELECT 1 FROM products
    WHERE id = product_uuid
    AND is_sold = false
    AND (is_reserved = false OR reserved_until < now())
    AND is_draft = false
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not available');
  END IF;

  -- Remove any existing reservations for this product
  DELETE FROM cart_items WHERE product_id = product_uuid;

  -- Create new reservation
  INSERT INTO cart_items (user_id, session_id, product_id, expires_at)
  VALUES (user_uuid, session_uuid, product_uuid, reservation_expires);

  -- Update product reservation status
  UPDATE products
  SET is_reserved = true, reserved_until = reservation_expires
  WHERE id = product_uuid;

  RETURN jsonb_build_object(
    'success', true,
    'expires_at', reservation_expires,
    'message', 'Product reserved for 15 minutes'
  );
END;
$$ LANGUAGE plpgsql;

-- Insert default categories
INSERT INTO categories (name, slug, age_group, display_order) VALUES
('Onesies & Bodysuits', 'onesies-bodysuits', ARRAY['0-3m', '3-12m'], 1),
('Dresses & Skirts', 'dresses-skirts', ARRAY['3-12m', '1-3y', '3-5y', '5-10y'], 2),
('Tops & Shirts', 'tops-shirts', ARRAY['0-3m', '3-12m', '1-3y', '3-5y', '5-10y'], 3),
('Pants & Leggings', 'pants-leggings', ARRAY['0-3m', '3-12m', '1-3y', '3-5y', '5-10y'], 4),
('Outerwear', 'outerwear', ARRAY['0-3m', '3-12m', '1-3y', '3-5y', '5-10y'], 5),
('Sets & Outfits', 'sets-outfits', ARRAY['0-3m', '3-12m', '1-3y', '3-5y', '5-10y'], 6),
('Accessories', 'accessories', ARRAY['0-3m', '3-12m', '1-3y', '3-5y', '5-10y'], 7);