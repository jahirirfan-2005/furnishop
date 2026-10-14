-- ==============================================================================
-- FurniShop Phase 2 Rollback Script
-- Reverts Phase 2 schema additions without dropping any core tables or product data.
-- ==============================================================================

USE furnishop;

-- 1. Remove added indexes
DROP INDEX IF EXISTS idx_orders_customer_email ON orders;
DROP INDEX IF EXISTS idx_orders_status ON orders;
DROP INDEX IF EXISTS idx_orders_payment_status ON orders;
DROP INDEX IF EXISTS idx_orders_created ON orders;
DROP INDEX IF EXISTS uq_orders_idempotency ON orders;
DROP INDEX IF EXISTS idx_order_items_product ON order_items;
DROP INDEX IF EXISTS idx_products_name ON products;
DROP INDEX IF EXISTS idx_products_rating_reviews ON products;
DROP INDEX IF EXISTS idx_cart_session ON cart_items;
DROP INDEX IF EXISTS idx_wishlist_session ON wishlist_items;

-- 2. Drop added columns from order_items
ALTER TABLE order_items
  DROP COLUMN IF EXISTS subtotal;

-- 3. Drop added columns from orders
ALTER TABLE orders
  DROP COLUMN IF EXISTS subtotal_amount,
  DROP COLUMN IF EXISTS shipping_fee,
  DROP COLUMN IF EXISTS discount_amount,
  DROP COLUMN IF EXISTS shipping_city,
  DROP COLUMN IF EXISTS shipping_pincode,
  DROP COLUMN IF EXISTS idempotency_key,
  DROP COLUMN IF EXISTS session_id;
