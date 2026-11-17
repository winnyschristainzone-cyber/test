-- ==============================================================================
-- WINNY'S CHRISTIAN ZONE — COMPLETE STORE MANAGEMENT & STOCK SUITE
-- 1. Automatic Stock Decrement on Order Payment
-- 2. Clean Product Catalog (Only ₹1 Test Item; live items controlled via Admin)
-- 3. Secure Admin Authentication & Catalog Mutation RPCs
-- ==============================================================================

-- 1. AUTOMATIC STOCK ADJUSTMENT FUNCTION
-- Decrements stock_quantity when an order is marked PAID
CREATE OR REPLACE FUNCTION public.decrement_product_stock_on_order(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Iterate through all items associated with this order
  FOR v_item IN 
    SELECT oi.product_id, oi.quantity 
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.order_number = p_order_id OR o.id::text = p_order_id
  LOOP
    IF v_item.product_id IS NOT NULL THEN
      UPDATE products
      SET stock_quantity = GREATEST(0, stock_quantity - v_item.quantity),
          updated_at = NOW()
      WHERE id = v_item.product_id;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 2. UPDATE PAYMENT VERIFIER TO TRIGGER STOCK DECREMENT AUTOMATICALLY
CREATE OR REPLACE FUNCTION verify_razorpay_payment(
  p_order_id TEXT,
  p_payment_id TEXT,
  p_signature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_secret TEXT;
  v_expected_sig TEXT;
  v_db_order_id UUID;
BEGIN
  -- Grab private secret securely
  SELECT key_secret INTO v_secret FROM private_gateway_secrets WHERE id = 1;

  -- Compute HMAC-SHA256 signature in PostgreSQL
  v_expected_sig := encode(
    hmac(p_order_id || '|' || p_payment_id, v_secret, 'sha256'),
    'hex'
  );

  IF v_expected_sig = p_signature THEN
    -- Mark order as PAID automatically in orders table
    UPDATE orders 
    SET payment_status = 'PAID',
        razorpay_payment_id = p_payment_id,
        razorpay_order_id = p_order_id,
        razorpay_signature = p_signature,
        updated_at = NOW()
    WHERE order_number = p_order_id OR id::text = p_order_id
    RETURNING id INTO v_db_order_id;

    -- Automatically adjust stock for purchased items
    IF v_db_order_id IS NOT NULL THEN
      PERFORM public.decrement_product_stock_on_order(p_order_id);
    END IF;

    RETURN jsonb_build_object('verified', true, 'message', 'Payment signature verified and inventory updated');
  ELSE
    RETURN jsonb_build_object('verified', false, 'error', 'Invalid payment signature');
  END IF;
END;
$$;

-- 3. STORE ADMIN PASSKEY STORAGE
-- Stores your private administrative passkey securely
CREATE TABLE IF NOT EXISTS public.admin_config (
  id INT PRIMARY KEY DEFAULT 1,
  admin_passkey TEXT NOT NULL DEFAULT 'WinnyAdmin2026!',
  authorized_phone TEXT NOT NULL DEFAULT '+919281234772',
  CONSTRAINT single_admin_config CHECK (id = 1)
);

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_config FROM anon, authenticated;

INSERT INTO public.admin_config (id, admin_passkey, authorized_phone)
VALUES (1, 'WinnyAdmin2026!', '+919281234772')
ON CONFLICT (id) DO NOTHING;

-- 4. ADMIN AUTH VERIFIER RPC
CREATE OR REPLACE FUNCTION verify_admin_access(p_passkey TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_real_passkey TEXT;
BEGIN
  SELECT admin_passkey INTO v_real_passkey FROM admin_config WHERE id = 1;
  IF p_passkey = v_real_passkey THEN
    RETURN jsonb_build_object('authorized', true, 'role', 'admin');
  ELSE
    RETURN jsonb_build_object('authorized', false, 'error', 'Invalid credentials');
  END IF;
END;
$$;

-- 5. ADMIN PRODUCT MANAGEMENT RPCs (CREATE, UPDATE, DELETE, STOCK ADJUST)
CREATE OR REPLACE FUNCTION admin_save_product(
  p_passkey TEXT,
  p_product JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_real_passkey TEXT;
  v_prod_id UUID;
  v_price NUMERIC;
  v_stock INT;
  v_sku TEXT;
  v_slug TEXT;
BEGIN
  SELECT admin_passkey INTO v_real_passkey FROM admin_config WHERE id = 1;
  IF p_passkey != v_real_passkey THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  v_price := (p_product->>'price')::NUMERIC;
  v_stock := COALESCE((p_product->>'stock_quantity')::INT, 10);
  v_sku := COALESCE(p_product->>'sku', 'WCZ-' || floor(random() * 900000 + 100000)::text);
  v_slug := lower(regexp_replace(COALESCE(p_product->>'name', 'product'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || floor(random() * 9000 + 1000)::text;

  IF p_product->>'id' IS NOT NULL AND (p_product->>'id') ~ '^[0-9a-fA-F-]{36}$' THEN
    -- Update existing product
    v_prod_id := (p_product->>'id')::UUID;
    UPDATE products
    SET name = COALESCE(p_product->>'name', name),
        price = v_price,
        stock_quantity = v_stock,
        category_slug = COALESCE(p_product->>'category', category_slug),
        description = COALESCE(p_product->>'desc', description),
        badge = p_product->>'badge',
        updated_at = NOW()
    WHERE id = v_prod_id;
  ELSE
    -- Insert new product
    INSERT INTO products (
      name, slug, sku, price, stock_quantity, category_slug, description, badge, is_active
    ) VALUES (
      p_product->>'name',
      v_slug,
      v_sku,
      v_price,
      v_stock,
      COALESCE(p_product->>'category', 'gifts'),
      COALESCE(p_product->>'desc', 'Includes easy 3-day returns.'),
      p_product->>'badge',
      true
    )
    RETURNING id INTO v_prod_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'id', v_prod_id);
END;
$$;

CREATE OR REPLACE FUNCTION admin_delete_product(
  p_passkey TEXT,
  p_product_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_real_passkey TEXT;
BEGIN
  SELECT admin_passkey INTO v_real_passkey FROM admin_config WHERE id = 1;
  IF p_passkey != v_real_passkey THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  IF p_product_id ~ '^[0-9a-fA-F-]{36}$' THEN
    DELETE FROM products WHERE id = p_product_id::UUID;
    RETURN jsonb_build_object('success', true);
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid UUID format');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION admin_update_stock(
  p_passkey TEXT,
  p_product_id TEXT,
  p_new_stock INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_real_passkey TEXT;
BEGIN
  SELECT admin_passkey INTO v_real_passkey FROM admin_config WHERE id = 1;
  IF p_passkey != v_real_passkey THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  IF p_product_id ~ '^[0-9a-fA-F-]{36}$' THEN
    UPDATE products SET stock_quantity = GREATEST(0, p_new_stock), updated_at = NOW() WHERE id = p_product_id::UUID;
    RETURN jsonb_build_object('success', true);
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid product id');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION admin_get_all_orders(p_passkey TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_real_passkey TEXT;
  v_result JSONB;
BEGIN
  SELECT admin_passkey INTO v_real_passkey FROM admin_config WHERE id = 1;
  IF p_passkey != v_real_passkey THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'customer_name', o.customer_name,
      'customer_phone', o.customer_phone,
      'customer_email', o.customer_email,
      'total_amount', o.total_amount,
      'payment_status', o.payment_status,
      'shipping_status', o.shipping_status,
      'created_at', o.created_at,
      'shipping_address', o.shipping_address_snapshot
    ) ORDER BY o.created_at DESC
  ) INTO v_result
  FROM orders o;

  RETURN jsonb_build_object('success', true, 'orders', COALESCE(v_result, '[]'::jsonb));
END;
$$;

-- 6. PURGE HARDCODED PLACEHOLDERS FROM SUPABASE PRODUCTS TABLE
-- Keeps ONLY the clean catalog; you add your real inventory through the Admin Dashboard
DELETE FROM products WHERE sku LIKE 'WCZ-TEST-%' OR id::text LIKE 'a0000001-%';

-- Grant execution permissions on RPCs
GRANT EXECUTE ON FUNCTION verify_admin_access(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_save_product(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_product(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_stock(TEXT, TEXT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_orders(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_product_stock_on_order(TEXT) TO anon, authenticated;
