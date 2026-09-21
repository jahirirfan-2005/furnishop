<?php
/**
 * FurniShop - export a static product snapshot for offline/static hosting.
 *
 * Run:  php backend/export_fallback.php
 *
 * Writes the frontend catalog snapshot - the same JSON the REST API
 * returns for the storefront (active products, default "featured" order).
 * The frontend imports it as a fallback when the PHP API is unreachable
 * (e.g. the static Vercel deployment), so visitors always see the catalog.
 *
 * Works from BOTH project layouts:
 *   - working copy:  <root>/backend/export_fallback.php -> <root>/furniture/src/
 *   - repo checkout: <repo>/backend/export_fallback.php -> <repo>/src/
 *
 * Re-run after changing products via the admin panel, then commit & push
 * to refresh the static site. MySQL remains the single source of truth.
 */

require_once __DIR__ . '/api/config.php';
/** @var PDO $pdo */

echo "=== FurniShop static catalog export ===\n";

$sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug,
               col.title AS collection_title, col.slug AS collection_slug
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN collections col ON col.id = p.collection_id
        WHERE p.status = 'active'
        ORDER BY p.is_featured DESC, p.id ASC";

$products = array_map('cast_product', $pdo->query($sql)->fetchAll());

// Detect layout: working copy has a sibling "furniture" folder, the repo does not.
$srcDir = is_dir(dirname(__DIR__) . '/furniture')
    ? dirname(__DIR__) . '/furniture/src'
    : dirname(__DIR__) . '/src';
$outPath = $srcDir . '/products_fallback.json';
$json = json_encode(
    $products,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
);

if ($json === false) {
    fwrite(STDERR, "ERROR: failed to encode products as JSON.\n");
    exit(1);
}

if (@file_put_contents($outPath, $json . "\n") === false) {
    fwrite(STDERR, "ERROR: could not write $outPath\n");
    exit(1);
}

echo "Exported " . count($products) . " active products to $outPath\n";
foreach ($products as $p) {
    printf("  - [%3d] %-38s %-14s stock=%d%s\n",
        $p['id'],
        $p['name'],
        $p['category_slug'] ?? '-',
        $p['stock_quantity'] ?? 0,
        !empty($p['image']) ? '' : '  (no image!)'
    );
}
echo "Done. Commit the updated snapshot to refresh static deployments.\n";
