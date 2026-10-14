-- ============================================================================
-- FurniShop Security & Authentication Migration (Phase 1)
-- Safe to re-run (idempotent). Does NOT alter or delete existing catalog data.
-- ============================================================================

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Admin Active Bearer Tokens Table
CREATE TABLE IF NOT EXISTS `admin_tokens` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `token_hash` CHAR(64) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_token_hash` (`token_hash`),
  INDEX `idx_expires` (`expires_at`),
  FOREIGN KEY (`user_id`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Rate-Limiting / Failed Logins Table
CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `ip_address` VARCHAR(45) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `attempt_time` INT UNSIGNED NOT NULL,
  `success` TINYINT(1) NOT NULL DEFAULT 0,
  INDEX `idx_ip_time` (`ip_address`, `attempt_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Add payment_status column to orders table if missing
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'payment_status');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `orders` ADD COLUMN `payment_status` ENUM(''pending'',''paid'',''failed'',''refunded'') NOT NULL DEFAULT ''pending'' AFTER `status`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
