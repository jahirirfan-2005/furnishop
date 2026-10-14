-- ==============================================================================
-- FurniShop Phase 2 Database Migration: Reliable REST APIs & DB Operations
-- Version: 2.0.0
-- Non-destructive: preserves all existing products, categories, orders and users.
-- ==============================================================================

USE furnishop;

-- 1. Enhance `orders` table with subtotal_amount, shipping, discount, idempotency, city, pincode, session_id
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(20) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS session_id VARCHAR(80) DEFAULT NULL;

-- Performance indexes for order lookups, tracking, admin filtering and duplicate prevention
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_idempotency ON orders (idempotency_key);

-- 2. Enhance `order_items` table with subtotal column and index
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00;
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);

-- 3. Enhance `products` table performance indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products (name(100));
CREATE INDEX IF NOT EXISTS idx_products_rating_reviews ON products (rating, reviews_count);

-- 4. Enhance `cart_items` table with session index for fast cart retrieval
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items (session_id);

-- 5. Enhance `wishlist_items` table with session index
CREATE INDEX IF NOT EXISTS idx_wishlist_session ON wishlist_items (session_id);

-- 6. Backfill existing orders and order_items
UPDATE order_items SET subtotal = price * quantity WHERE subtotal = 0.00;
UPDATE orders SET subtotal_amount = total_amount WHERE subtotal_amount = 0.00;
