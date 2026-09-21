-- ============================================================================
-- FurniShop migration: full database-driven product fields
-- Safe to run multiple times (idempotent). Existing product rows are kept.
-- Applies: slug, discount_price, stock_quantity, additional_images, color,
--          status (active/inactive), offer_end_time + performance indexes.
-- ============================================================================

-- --- New columns (added only when missing) ---
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'slug');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER name',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'discount_price');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2) DEFAULT NULL AFTER original_price',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'stock_quantity');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN stock_quantity INT NOT NULL DEFAULT 25 AFTER discount_price',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'additional_images');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN additional_images TEXT DEFAULT NULL AFTER back_image',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'color');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN color VARCHAR(100) DEFAULT NULL AFTER material',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'offer_end_time');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN offer_end_time DATETIME DEFAULT NULL AFTER has_offer',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'status');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN status ENUM(''active'',''inactive'') NOT NULL DEFAULT ''active'' AFTER stock_status',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- --- Performance indexes (added only when missing) ---
SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_slug');
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE products ADD INDEX idx_products_slug (slug)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_status');
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE products ADD INDEX idx_products_status (status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_featured');
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE products ADD INDEX idx_products_featured (is_featured)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_trending');
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE products ADD INDEX idx_products_trending (is_trending)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_price');
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE products ADD INDEX idx_products_price (price)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_created');
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE products ADD INDEX idx_products_created (created_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- --- Backfill values for rows created before this migration ---
UPDATE products SET slug = LOWER(TRIM(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-'))) WHERE slug IS NULL OR slug = '';
UPDATE products SET discount_price = price WHERE discount_price IS NULL;
UPDATE products SET status = 'active' WHERE status IS NULL OR status = '';
