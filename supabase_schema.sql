-- ==============================================================================
-- WINNY'S CHRISTIAN ZONE — COMPLETE SUPABASE DATABASE SCHEMA (V1 & V2)
-- Relational Database with Row-Level Security (RLS), Triggers & Initial Seed Data
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN 
    CREATE TYPE user_role AS ENUM ('customer', 'admin'); 
  END IF; 
END $$;

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  full_name TEXT,
  role user_role DEFAULT 'customer',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Automatic user profile creation trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. ADDRESSES (Customer Shipping & Billing Addresses)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India' NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. PRODUCTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_slug TEXT,
  sku TEXT UNIQUE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  compare_at_price NUMERIC(10, 2),
  cost_price NUMERIC(10, 2), -- Admin only
  stock_quantity INTEGER DEFAULT 50 NOT NULL,
  low_stock_threshold INTEGER DEFAULT 5 NOT NULL,
  weight_grams INTEGER DEFAULT 250,
  badge TEXT,
  badge_type TEXT,
  rating NUMERIC(2, 1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  return_policy TEXT DEFAULT '3-Day Returns',
  return_days INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. PRODUCT IMAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, image_url)
);

-- ------------------------------------------------------------------------------
-- 6. PRODUCT VARIANTS (Sizes, Colors, Inventory)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  size TEXT,
  color TEXT,
  price NUMERIC(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 20 NOT NULL,
  weight_grams INTEGER DEFAULT 250,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. ORDERS
-- ------------------------------------------------------------------------------
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_type') THEN 
    CREATE TYPE payment_status_type AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED'); 
  END IF; 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_type') THEN 
    CREATE TYPE order_status_type AS ENUM ('PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'); 
  END IF; 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipping_status_type') THEN 
    CREATE TYPE shipping_status_type AS ENUM ('NOT_SHIPPED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RTO'); 
  END IF; 
END $$;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  shipping_amount NUMERIC(10, 2) DEFAULT 0.00,
  tax_amount NUMERIC(10, 2) DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  payment_status payment_status_type DEFAULT 'PENDING' NOT NULL,
  payment_method TEXT DEFAULT 'RAZORPAY',
  order_status order_status_type DEFAULT 'PLACED' NOT NULL,
  shipping_status shipping_status_type DEFAULT 'NOT_SHIPPED' NOT NULL,
  shipping_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  shipping_address_snapshot JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. ORDER ITEMS (Immutable snapshot of purchase)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  image_url TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 9. PAYMENTS (Razorpay / UPI Integration)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  provider TEXT DEFAULT 'RAZORPAY' NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  status payment_status_type DEFAULT 'PENDING' NOT NULL,
  method TEXT, -- UPI, card, netbanking, wallet, COD
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 10. SHIPMENTS (Shiprocket / XpressBees Integration)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  provider TEXT DEFAULT 'SHIPROCKET' NOT NULL,
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  courier_name TEXT,
  awb_number TEXT,
  tracking_url TEXT,
  shipping_status TEXT DEFAULT 'ORDER_GENERATED',
  pickup_date TIMESTAMP WITH TIME ZONE,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 11. WISHLISTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- ------------------------------------------------------------------------------
-- 12. REVIEWS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 13. COUPONS
-- ------------------------------------------------------------------------------
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coupon_discount_type') THEN 
    CREATE TYPE coupon_discount_type AS ENUM ('percentage', 'flat'); 
  END IF; 
END $$;

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type coupon_discount_type NOT NULL,
  discount_value NUMERIC(10, 2) NOT NULL,
  minimum_order_amount NUMERIC(10, 2) DEFAULT 0,
  maximum_discount NUMERIC(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 14. CARTS & CART ITEMS (Persistent Cross-Device Cart)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(cart_id, product_id)
);

-- ------------------------------------------------------------------------------
-- 15. WHATSAPP MESSAGES (Audit & Assistant Log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL,
  message_id TEXT,
  message_type TEXT DEFAULT 'text',
  message_body TEXT NOT NULL,
  media_url TEXT,
  direction TEXT DEFAULT 'inbound', -- inbound / outbound
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 16. ADMIN LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Categories & Products (Public Read)
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON public.categories;
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public product images are viewable by everyone" ON public.product_images;
CREATE POLICY "Public product images are viewable by everyone" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public product variants are viewable by everyone" ON public.product_variants;
CREATE POLICY "Public product variants are viewable by everyone" ON public.product_variants FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public coupons are viewable by everyone" ON public.coupons;
CREATE POLICY "Public coupons are viewable by everyone" ON public.coupons FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public approved reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Public approved reviews are viewable by everyone" ON public.reviews FOR SELECT USING (is_approved = true);

-- User Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Addresses
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
CREATE POLICY "Users can view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- Carts
DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
CREATE POLICY "Users can manage own cart" ON public.carts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can create order" ON public.orders;
CREATE POLICY "Anyone can create order" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL))
);

DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Wishlists
DROP POLICY IF EXISTS "Users can manage own wishlists" ON public.wishlists;
CREATE POLICY "Users can manage own wishlists" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- INITIAL SEED DATA (Categories & 16 Products with 3-Day Returns)
-- ==============================================================================

-- Categories
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Apparel & Clothing', 'apparel', 'Christian graphic tees, hoodies, sweatshirts and totes', 'images/category_apparel.jpg', 1),
  ('22222222-2222-2222-2222-222222222222', 'Jewelry & Accessories', 'jewelry', 'Gold crosses, silver rosaries, faith bracelets and pendants', 'images/category_jewelry.jpg', 2),
  ('33333333-3333-3333-3333-333333333333', 'Home Décor', 'home', 'Scripture mugs, prayer candles, olive wood crosses and art', 'images/product_mug.jpg', 3),
  ('44444444-4444-4444-4444-444444444444', 'Devotionals & Gifts', 'gifts', 'Leather journals, gift hampers and daily scripture cards', 'images/product_journal.jpg', 4)
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO public.products (id, name, slug, category_slug, sku, price, compare_at_price, cost_price, badge, badge_type, rating, review_count, description, return_policy, return_days, is_featured) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Grace Graphic Tee', 'grace-graphic-tee', 'apparel', 'APP-TEE-001', 2699, 3199, 1100, 'Best Seller', '', 5.0, 148, '100% premium combed cotton tee printed with faith-inspired scripture typography. Includes easy 3-day returns.', '3-Day Returns', 3, true),
  ('a0000001-0000-0000-0000-000000000002', 'Faith Over Fear Hoodie', 'faith-over-fear-hoodie', 'apparel', 'APP-HOD-002', 4899, 5499, 2100, 'Popular', '', 5.0, 89, 'Cozy fleece-lined heavyweight hoodie with bold embroidered scripture artwork. Includes easy 3-day returns.', '3-Day Returns', 3, true),
  ('a0000001-0000-0000-0000-000000000003', 'Gold Cross Necklace', 'gold-cross-necklace', 'jewelry', 'JWL-CRS-003', 3799, 4499, 1500, 'New', 'new', 5.0, 62, '18K gold-plated stainless steel crucifix on an adjustable artisan chain. Includes easy 3-day returns.', '3-Day Returns', 3, true),
  ('a0000001-0000-0000-0000-000000000004', 'Scripture Faith Bracelet', 'scripture-faith-bracelet', 'jewelry', 'JWL-BRC-004', 2299, 2799, 850, 'Handcrafted', '', 4.0, 44, 'Handcrafted natural stone beads featuring an engraved silver verse charm. Includes easy 3-day returns.', '3-Day Returns', 3, true),
  ('a0000001-0000-0000-0000-000000000005', 'John 3:16 Ceramic Mug', 'john-316-ceramic-mug', 'home', 'HOM-MUG-005', 1849, 2199, 650, 'Best Seller', '', 5.0, 201, '12oz microwave & dishwasher safe ceramic mug with gold-foiled scripture. Includes easy 3-day returns.', '3-Day Returns', 3, true),
  ('a0000001-0000-0000-0000-000000000006', 'Blessed Faith Journal', 'blessed-faith-journal', 'gifts', 'GFT-JRN-006', 2849, 3299, 1150, 'New', 'new', 5.0, 77, 'Hardcover devotional journal with 192 lined pages, ribbon marker & scripture. Includes easy 3-day returns.', '3-Day Returns', 3, true),
  ('a0000001-0000-0000-0000-000000000007', 'Angel Wings Earrings', 'angel-wings-earrings', 'jewelry', 'JWL-ERG-007', 2999, 3599, 1200, '', '', 4.0, 33, 'Hypoallergenic 925 sterling silver drop earrings with delicate feather detailing. Includes easy 3-day returns.', '3-Day Returns', 3, false),
  ('a0000001-0000-0000-0000-000000000008', 'Christian Gift Set Deluxe', 'christian-gift-set-deluxe', 'gifts', 'GFT-SET-008', 6499, 7499, 2900, 'Best Seller', '', 5.0, 55, 'Luxurious gift box with devotional journal, scripture mug & scented candle. Includes easy 3-day returns.', '3-Day Returns', 3, true),
  ('a0000001-0000-0000-0000-000000000009', 'Walk by Faith Canvas Tote', 'walk-by-faith-canvas-tote', 'apparel', 'APP-TOT-009', 1999, 2399, 700, 'New', 'new', 5.0, 41, 'Heavy-duty organic canvas tote with reinforced shoulder straps and biblical print. Includes easy 3-day returns.', '3-Day Returns', 3, false),
  ('a0000001-0000-0000-0000-000000000010', 'Sterling Silver Rosary', 'sterling-silver-rosary', 'jewelry', 'JWL-RSY-010', 4299, 4999, 1800, 'Blessed', '', 5.0, 73, 'Solid 925 sterling silver prayer rosary with detailed corpus & Marian medal. Includes easy 3-day returns.', '3-Day Returns', 3, false),
  ('a0000001-0000-0000-0000-000000000011', 'Psalm 23 Olive Wood Wall Cross', 'psalm-23-olive-wood-wall-cross', 'home', 'HOM-CRS-011', 3499, 3999, 1400, 'Handcrafted', '', 5.0, 96, 'Hand-carved natural olive wood wall cross engraved with beloved Psalm 23. Includes easy 3-day returns.', '3-Day Returns', 3, false),
  ('a0000001-0000-0000-0000-000000000012', 'Promises of God Scripture Cards', 'promises-of-god-scripture-cards', 'gifts', 'GFT-CRD-012', 1699, 1999, 600, '', '', 5.0, 68, 'Deck of 52 gold-edged devotional verse reflection cards in a luxury keepsake box. Includes easy 3-day returns.', '3-Day Returns', 3, false),
  ('a0000001-0000-0000-0000-000000000013', 'Be Still & Know Sweatshirt', 'be-still-and-know-sweatshirt', 'apparel', 'APP-SWT-013', 3999, 4599, 1600, 'Best Seller', '', 5.0, 112, 'Soft crewneck fleece sweatshirt with comforting Psalm 46:10 graphic. Includes easy 3-day returns.', '3-Day Returns', 3, false),
  ('a0000001-0000-0000-0000-000000000014', 'Mustard Seed Faith Pendant', 'mustard-seed-faith-pendant', 'jewelry', 'JWL-MST-014', 3199, 3699, 1250, 'New', 'new', 5.0, 51, 'Genuine mustard seed encapsulated in clear resin sphere on a delicate gold chain. Includes easy 3-day returns.', '3-Day Returns', 3, false),
  ('a0000001-0000-0000-0000-000000000015', 'Lavender & Amber Prayer Candle', 'lavender-amber-prayer-candle', 'home', 'HOM-CND-015', 1499, 1799, 500, '', '', 4.0, 39, 'Hand-poured 100% natural soy wax aromatherapy candle with 45-hour burn time. Includes easy 3-day returns.', '3-Day Returns', 3, false),
  ('a0000001-0000-0000-0000-000000000016', 'Leather Bound Devotional Journal', 'leather-bound-devotional-journal', 'gifts', 'GFT-LTH-016', 4599, 5299, 1900, 'Premium', '', 5.0, 84, 'Full-grain genuine leather bound journal with vintage wrap tie & archival paper. Includes easy 3-day returns.', '3-Day Returns', 3, false)
ON CONFLICT (slug) DO NOTHING;

-- Product Images
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'images/category_apparel.jpg', 'Grace Graphic Tee Front', true),
  ('a0000001-0000-0000-0000-000000000002', 'images/category_apparel.jpg', 'Faith Over Fear Hoodie Front', true),
  ('a0000001-0000-0000-0000-000000000003', 'images/category_jewelry.jpg', 'Gold Cross Necklace', true),
  ('a0000001-0000-0000-0000-000000000004', 'images/category_jewelry.jpg', 'Scripture Faith Bracelet', true),
  ('a0000001-0000-0000-0000-000000000005', 'images/product_mug.jpg', 'John 3:16 Ceramic Mug', true),
  ('a0000001-0000-0000-0000-000000000006', 'images/product_journal.jpg', 'Blessed Faith Journal', true),
  ('a0000001-0000-0000-0000-000000000007', 'images/category_jewelry.jpg', 'Angel Wings Earrings', true),
  ('a0000001-0000-0000-0000-000000000008', 'images/product_giftset.jpg', 'Christian Gift Set Deluxe', true),
  ('a0000001-0000-0000-0000-000000000009', 'images/category_apparel.jpg', 'Walk by Faith Canvas Tote', true),
  ('a0000001-0000-0000-0000-000000000010', 'images/category_jewelry.jpg', 'Sterling Silver Rosary', true),
  ('a0000001-0000-0000-0000-000000000011', 'images/product_mug.jpg', 'Psalm 23 Olive Wood Wall Cross', true),
  ('a0000001-0000-0000-0000-000000000012', 'images/product_journal.jpg', 'Promises of God Scripture Cards', true),
  ('a0000001-0000-0000-0000-000000000013', 'images/social_faith_tee.jpg', 'Be Still & Know Sweatshirt', true),
  ('a0000001-0000-0000-0000-000000000014', 'images/category_jewelry.jpg', 'Mustard Seed Faith Pendant', true),
  ('a0000001-0000-0000-0000-000000000015', 'images/product_mug.jpg', 'Lavender & Amber Prayer Candle', true),
  ('a0000001-0000-0000-0000-000000000016', 'images/product_journal.jpg', 'Leather Bound Devotional Journal', true)
ON CONFLICT (product_id, image_url) DO NOTHING;

-- Example Apparel Product Variants (Sizes & Colors)
INSERT INTO public.product_variants (product_id, sku, size, color, price, stock_quantity) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'APP-TEE-001-S', 'S', 'White', 2699, 20),
  ('a0000001-0000-0000-0000-000000000001', 'APP-TEE-001-M', 'M', 'White', 2699, 25),
  ('a0000001-0000-0000-0000-000000000001', 'APP-TEE-001-L', 'L', 'White', 2699, 30),
  ('a0000001-0000-0000-0000-000000000001', 'APP-TEE-001-XL', 'XL', 'White', 2699, 15),
  ('a0000001-0000-0000-0000-000000000002', 'APP-HOD-002-S', 'S', 'Oatmeal', 4899, 15),
  ('a0000001-0000-0000-0000-000000000002', 'APP-HOD-002-M', 'M', 'Oatmeal', 4899, 25),
  ('a0000001-0000-0000-0000-000000000002', 'APP-HOD-002-L', 'L', 'Oatmeal', 4899, 20)
ON CONFLICT (sku) DO NOTHING;

-- Initial Active Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, minimum_order_amount, maximum_discount, is_active) VALUES
  ('FAITH10', 'percentage', 10.00, 1000.00, 500.00, true),
  ('BLESSINGS', 'flat', 250.00, 2000.00, 250.00, true)
ON CONFLICT (code) DO NOTHING;
