-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE similarity_notifications ENABLE ROW LEVEL SECURITY;

-- Categories: Public read access
CREATE POLICY "Categories are publicly readable" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Products: Public read for published, admin all access
CREATE POLICY "Published products are publicly readable" ON products
  FOR SELECT USING (is_draft = false);

CREATE POLICY "Admins can view all products" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admins can modify products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Product Images: Follow product visibility
CREATE POLICY "Product images follow product visibility" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_images.product_id
      AND (
        is_draft = false
        OR EXISTS (
          SELECT 1 FROM customer_profiles
          WHERE id = auth.uid() AND is_admin = true
        )
      )
    )
  );

CREATE POLICY "Only admins can modify product images" ON product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Customer Profiles: Users can read their own, admins can read all
CREATE POLICY "Users can view their own profile" ON customer_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON customer_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON customer_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Orders: Users can only see their own orders, admins see all
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() = customer_id
    OR EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Only admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Order Items: Follow order access
CREATE POLICY "Order items follow order access" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id
      AND (
        customer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM customer_profiles
          WHERE id = auth.uid() AND is_admin = true
        )
      )
    )
  );

CREATE POLICY "Users can create order items for their orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id AND customer_id = auth.uid()
    )
  );

-- Cart Items: Users can only manage their own cart
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Users can manage their own cart items" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Reviews: Users can read all, only modify their own
CREATE POLICY "Reviews are publicly readable" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their purchases" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = auth.uid()
      AND oi.product_id = reviews.product_id
      AND o.status = 'delivered'
    )
  );

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = customer_id);

-- Wishlists: Users can only manage their own
CREATE POLICY "Users can view their own wishlist" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Similarity Notifications: Users can only manage their own
CREATE POLICY "Users can view their own notifications" ON similarity_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notifications" ON similarity_notifications
  FOR ALL USING (auth.uid() = user_id);

-- Function to automatically create customer profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO customer_profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();