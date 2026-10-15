<?php
/**
 * Migration: Add `sku` and `brand` columns to `products` table.
 * Idempotent: safe to run multiple times.
 */
require_once __DIR__ . '/api/config.php';
/** @var PDO $pdo */

echo "Starting migration: adding sku and brand to products...\n";

// 1. Check and add `brand` column
$colBrand = $pdo->query("SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'brand'")->fetchColumn();

if ((int)$colBrand === 0) {
    $pdo->exec("ALTER TABLE products ADD COLUMN brand VARCHAR(100) NOT NULL DEFAULT 'FurniCraft' AFTER category_id");
    $pdo->exec("ALTER TABLE products ADD INDEX idx_products_brand (brand)");
    echo "✓ Added 'brand' column and index.\n";
} else {
    echo "• 'brand' column already exists.\n";
}

// 2. Check and add `sku` column
$colSku = $pdo->query("SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'sku'")->fetchColumn();

if ((int)$colSku === 0) {
    $pdo->exec("ALTER TABLE products ADD COLUMN sku VARCHAR(100) DEFAULT NULL AFTER name");
    echo "✓ Added 'sku' column.\n";
} else {
    echo "• 'sku' column already exists.\n";
}

// 3. Backfill existing products with unique SKUs if empty
$stmt = $pdo->query("SELECT id, name, category_id, sku, brand FROM products");
$updateStmt = $pdo->prepare("UPDATE products SET sku = :sku, brand = :brand WHERE id = :id");

$categoryPrefixes = [
    1 => 'LIV',
    2 => 'BED',
    3 => 'DIN',
    4 => 'OFF',
    5 => 'OUT',
    6 => 'LUX',
    7 => 'LGT'
];

$defaultBrands = [
    1 => 'Nordic Living',
    2 => 'Royal Sleep',
    3 => 'Artisan Table',
    4 => 'ErgoCraft',
    5 => 'Teak & Patio',
    6 => 'Atelier Luxury',
    7 => 'Lumière Accents'
];

$assignedCount = 0;
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $needsUpdate = false;
    $sku = $row['sku'];
    $brand = $row['brand'];

    if (empty($sku)) {
        $prefix = $categoryPrefixes[$row['category_id']] ?? 'GEN';
        $sku = sprintf('FURNI-%s-%04d', $prefix, $row['id']);
        $needsUpdate = true;
    }

    if (empty($brand) || $brand === 'FurniCraft') {
        $brand = $defaultBrands[$row['category_id']] ?? 'FurniCraft';
        $needsUpdate = true;
    }

    if ($needsUpdate) {
        $updateStmt->execute([
            ':sku'   => $sku,
            ':brand' => $brand,
            ':id'    => $row['id']
        ]);
        $assignedCount++;
    }
}
echo "✓ Backfilled SKU and brand for $assignedCount existing products.\n";

// 4. Ensure unique index on sku
$idxSku = $pdo->query("SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'uq_products_sku'")->fetchColumn();

if ((int)$idxSku === 0) {
    $pdo->exec("ALTER TABLE products ADD UNIQUE INDEX uq_products_sku (sku)");
    echo "✓ Added unique index 'uq_products_sku'.\n";
} else {
    echo "• Unique index 'uq_products_sku' already exists.\n";
}

echo "Migration completed successfully!\n";
