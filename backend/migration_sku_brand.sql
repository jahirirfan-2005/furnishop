-- ============================================================================
-- FurniShop migration: add sku and brand to products table
-- Idempotent: safe to run multiple times.
-- ============================================================================

-- Add brand column if missing
SET @col_brand := (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'brand');
SET @sql := IF(@col_brand = 0,
    'ALTER TABLE products ADD COLUMN brand VARCHAR(100) NOT NULL DEFAULT \'FurniCraft\' AFTER category_id, ADD INDEX idx_products_brand (brand)',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add sku column if missing
SET @col_sku := (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'sku');
SET @sql := IF(@col_sku = 0,
    'ALTER TABLE products ADD COLUMN sku VARCHAR(100) DEFAULT NULL AFTER name',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add unique index on sku if missing
SET @idx_sku := (SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'uq_products_sku');
SET @sql := IF(@idx_sku = 0,
    'ALTER TABLE products ADD UNIQUE INDEX uq_products_sku (sku)',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
