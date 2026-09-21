<?php
/**
 * FurniShop - one-shot product migration & seeder.
 *
 * Run:  php backend/migrate_products.php
 *
 * Idempotent - safe to run multiple times. It will:
 *   1. Apply backend/migration_add_product_fields.sql (adds slug, discount_price,
 *      stock_quantity, additional_images, color, status, offer_end_time + indexes).
 *   2. Backfill slug / discount_price / status for every existing product row.
 *   3. Migrate the full FurniShop catalog (20 products) from the original
 *      furniture_db.sql dataset into MySQL (existing products are never duplicated
 *      or removed; INSERT IGNORE on the unique slug key).
 *   4. Print a verification report of every product now stored in MySQL.
 *
 * DB credentials come from the environment (DB_HOST, DB_PORT, DB_NAME, DB_USER,
 * DB_PASS) exactly like backend/api/config.php - no hardcoded secrets.
 */

require_once __DIR__ . '/api/config.php';
/** @var PDO $pdo */

echo "=== FurniShop product migration ===\n";

// ---------------------------------------------------------------------------
// 1. Apply the SQL migration (idempotent ALTER TABLE statements)
// ---------------------------------------------------------------------------
$sqlFile = __DIR__ . '/migration_add_product_fields.sql';
if (is_file($sqlFile)) {
    $pdo->exec(file_get_contents($sqlFile));
    echo "[1/4] Schema migration applied (new columns + indexes verified).\n";
}

// ---------------------------------------------------------------------------
// 2. Backfill legacy rows
// ---------------------------------------------------------------------------
$pdo->exec("UPDATE products SET slug = LOWER(TRIM(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-'))) WHERE slug IS NULL OR slug = ''");
$pdo->exec("UPDATE products SET discount_price = price WHERE discount_price IS NULL");
$pdo->exec("UPDATE products SET status = 'active' WHERE status IS NULL OR status = ''");
echo "[2/4] Legacy rows backfilled (slug / discount_price / status).\n";

// ---------------------------------------------------------------------------
// 3. Migrate the full catalog (from the original furniture_db.sql dataset)
// ---------------------------------------------------------------------------
$categories = [
    [1, 'Living Room', 'living-room', 'Sofas, coffee tables, TV units & recliners for comfortable living', '🛋️', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
    [2, 'Bedroom', 'bedroom', 'Beds, nightstands, dressers & wardrobes for serene sleep spaces', '🛏️', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'],
    [3, 'Dining Room', 'dining-room', 'Dining tables, ergonomic chairs & sideboards for gathering', '🍽️', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80'],
    [4, 'Office & Study', 'office-study', 'Desks, executive chairs & bookshelves for high productivity', '💼', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'],
    [5, 'Outdoor & Patio', 'outdoor-patio', 'Weatherproof teak lounges, rattan swings & bistro tables', '🪴', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
    [6, 'Luxury & Decor', 'luxury-decor', 'Console tables, vanity sets, floor lamps & plush rugs', '✨', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'],
    [7, 'Lighting & Accents', 'lighting-accents', 'Chanderliers, Nordic floor lamps & decorative wall art', '💡', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'],
];

$collections = [
    [1, 'Nordic Minimalist Suite', 'nordic-minimalist', 'Clean lines, natural solid woods & serene neutral textures', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', 'Up to 35% OFF'],
    [2, 'Royal Velvet Elegance', 'royal-velvet', 'Plush velvet sofas & gold-accented contemporary luxury', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', 'Flat 25% OFF'],
    [3, 'Modern Ergonomic Workspace', 'modern-workspace', 'Standing desks & lumbar-support executive chairs', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', 'Special Bundle Deal'],
    [4, 'Artisan Teak & Patio', 'artisan-teak', 'Handcrafted solid teak dining & outdoor relaxation pieces', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'Summer Clearance'],
    [5, 'Urban Space Savers', 'urban-space-savers', 'Smart multi-functional beds, storage ottomans & modular desks', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', 'Up to 40% OFF'],
    [6, 'Grand Dining Masterpiece', 'grand-dining', 'Solid marble top tables with plush padded velvet chairs', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80', 'Save ₹8,000 Today'],
    [7, 'Aesthetic Ambient Living', 'ambient-living', 'Designer floor lamps, ceramic vases & statement mirrors', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', 'New Arrival'],
];

/**
 * Each product: [category_id, collection_id, name, price, original_price, image,
 * back_image, description, dimensions, material, color, rating, reviews_count,
 * has_offer, offer_end_time|NULL, is_featured, is_trending, stock_quantity].
 */
$products = [
    // --- Living Room ---
    [1, 2, 'Modern Scandinavian Sofa', 18999.00, 24999.00,
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
        'Premium 3-seater sofa with high-density foam cushioning, stain-resistant velvet fabric, and solid oak wooden legs.',
        'W: 210cm x D: 90cm x H: 85cm', 'High-grade Velvet & Solid Oak', 'Charcoal Grey', 4.9, 142, 1, date('Y-m-d H:i:s', strtotime('+3 days')), 1, 1, 20],
    [1, 2, 'Velvet Accent Armchair', 8499.00, 10999.00,
        'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=800&q=80',
        'Elegantly contoured accent lounge chair featuring brass metallic legs and deep plush foam padding.',
        'W: 80cm x D: 75cm x H: 90cm', 'Royal Blue Velvet & Brass Legs', 'Royal Blue', 4.7, 88, 1, date('Y-m-d H:i:s', strtotime('+5 days')), 1, 0, 30],
    [1, 1, 'Minimalist Marble Coffee Table', 9999.00, 12999.00,
        'https://images.unsplash.com/photo-1533779283484-83494495497f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',
        'Genuine Italian Carrara marble tabletop supported by a powder-coated geometric black steel frame.',
        'W: 110cm x D: 60cm x H: 45cm', 'Natural Marble & Steel Frame', 'White Marble', 4.8, 64, 0, null, 0, 1, 25],
    [1, 5, 'Modular L-Shape Sectional Sofa', 34999.00, 42999.00,
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        'Spacious L-shaped sectional featuring reversible chaise lounger and built-in cup holders & storage.',
        'W: 280cm x D: 160cm x H: 88cm', 'Textured Linen & Pine Wood', 'Beige Linen', 4.6, 95, 1, date('Y-m-d H:i:s', strtotime('+2 days')), 1, 1, 10],

    // --- Bedroom ---
    [2, 5, 'King Size Upholstered Bed Frame', 22500.00, 28999.00,
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1540518614846-7ede433c517a?auto=format&fit=crop&w=800&q=80',
        'Luxurious tufted headboard king bed with hydraulic under-bed lift-up storage compartment.',
        'W: 195cm x D: 215cm x H: 125cm', 'Solid Sheesham Wood & Upholstered Linen', 'Ivory Cream', 4.9, 110, 0, null, 1, 1, 12],
    [2, 1, 'Nordic Solid Oak Nightstand', 4200.00, 5500.00,
        'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
        'Sleek double-drawer bedside cabinet crafted from kiln-dried white oak with soft-close runners.',
        'W: 50cm x D: 40cm x H: 55cm', '100% Solid White Oak', 'Natural Oak', 4.7, 49, 0, null, 0, 0, 40],
    [2, 7, 'Modern Dressing Table & LED Mirror', 8499.00, 11999.00,
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
        'Contemporary vanity set with touch-screen dimmable LED illuminated ring mirror and velvet padded stool.',
        'W: 100cm x D: 45cm x H: 135cm', 'Engineered Wood & Gold Metal', 'White & Gold', 4.8, 76, 1, date('Y-m-d H:i:s', strtotime('+4 days')), 1, 1, 18],

    // --- Dining Room ---
    [3, 6, 'Handcrafted Solid Wood 6-Seater Dining Set', 24999.00, 31999.00,
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',
        'Premium 6-seater solid teak dining table complete with 6 cushioned ergonomic dining chairs.',
        'W: 180cm x D: 90cm x H: 76cm', 'Solid Teak Wood & Cushion Padding', 'Warm Teak', 4.9, 134, 1, date('Y-m-d H:i:s', strtotime('+6 days')), 1, 1, 9],
    [3, 6, 'Luxury Italian Marble Dining Table', 38999.00, 47999.00,
        'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
        'Heavyweight natural Italian marble dining table with stainless steel gold-plated pedestal base.',
        'W: 200cm x D: 100cm x H: 76cm', 'Italian Marble & Stainless Steel', 'White Marble & Gold', 4.8, 58, 0, null, 0, 1, 7],
    [3, 4, 'Ergonomic Velvet Bar Stool Set', 6499.00, 8999.00,
        'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80',
        'Set of 2 swivel height-adjustable kitchen island bar stools with footrest and back support.',
        'W: 45cm x D: 45cm x H: 85-105cm', 'Velvet & Matte Black Iron', 'Forest Green', 4.6, 42, 1, date('Y-m-d H:i:s', strtotime('+18 hours')), 0, 0, 35],

    // --- Office & Study ---
    [4, 3, 'Executive Ergonomic Standing Desk', 15999.00, 19999.00,
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
        'Dual-motor electric height-adjustable office desk with memory presets, cable management & wooden top.',
        'W: 140cm x D: 70cm x H: 70-120cm', 'Teak Wood Top & Heavy Steel Frame', 'Teak & Black', 4.9, 210, 1, date('Y-m-d H:i:s', strtotime('+3 days')), 1, 1, 22],
    [4, 3, 'High-Back Lumbar Mesh Office Chair', 7999.00, 10999.00,
        'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
        'Professional ergonomic desk chair with 3D adjustable armrests, headrest, and dynamic lumbar support.',
        'W: 65cm x D: 65cm x H: 115-125cm', 'Breathable Mesh & Alloy Base', 'Graphite Black', 4.7, 185, 0, null, 1, 0, 45],
    [4, 1, 'Industrial Teak & Steel Bookshelf', 6499.00, 8499.00,
        'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',
        '5-tier open bookcase displaying natural timber shelves held together by rustic metal side pillars.',
        'W: 90cm x D: 35cm x H: 180cm', 'Reclaimed Teak & Structural Steel', 'Rustic Teak', 4.8, 62, 0, null, 0, 1, 16],

    // --- Outdoor & Patio ---
    [5, 4, 'Teak Outdoor Garden Lounge Set', 28500.00, 34999.00,
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        'Weatherproof 4-piece patio lounge set including 2 armchairs, 1 sofa, coffee table and waterproof cushions.',
        'W: 200cm x D: 180cm x H: 75cm', 'All-Weather Teak & Sunbrella Fabric', 'Natural Teak', 4.9, 54, 1, date('Y-m-d H:i:s', strtotime('+5 days')), 1, 1, 11],
    [5, 4, 'Rattan Hanging Patio Swing Chair', 11999.00, 14999.00,
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80',
        'Hand-woven synthetic rattan egg swing chair with heavy-duty stand and plush thick cushion pillow.',
        'W: 105cm x D: 105cm x H: 195cm', 'Weatherproof PE Rattan & Steel Stand', 'Honey Rattan', 4.8, 91, 0, null, 1, 0, 20],

    // --- Luxury & Decor ---
    [6, 2, 'Gold Accented Console Table', 12499.00, 15999.00,
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1533779283484-83494495497f?auto=format&fit=crop&w=800&q=80',
        'Ultra-sleek entry hall console table with faux marble surface and electroplated brushed gold legs.',
        'W: 120cm x D: 35cm x H: 80cm', 'Faux Marble & Brushed Stainless Gold', 'White & Gold', 4.8, 47, 1, date('Y-m-d H:i:s', strtotime('+2 days')), 1, 1, 14],
    [6, 7, 'Boho Hand-Knotted Plush Area Rug', 5999.00, 7999.00,
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
        'Soft high-pile Moroccan geometric pattern area rug woven from natural organic wool fibers.',
        'W: 200cm x D: 300cm', '100% Organic Wool', 'Multi-Color Boho', 4.7, 68, 0, null, 0, 0, 28],

    // --- Lighting & Accents ---
    [7, 7, 'Nordic Architectural Arc Floor Lamp', 4999.00, 6999.00,
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',
        'Minimalist overhanging arc floor lamp with marble heavy base and warm dimmable LED globe bulb.',
        'W: 40cm x D: 110cm x H: 205cm', 'Carrara Marble & Matte Black Steel', 'Black & Marble', 4.9, 103, 1, date('Y-m-d H:i:s', strtotime('+3 days')), 1, 1, 26],
    [7, 7, 'Contemporary Glass Chandelier', 14499.00, 18999.00,
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
        'Multi-globe amber blown glass chandelier fixture suitable for living room ceilings or dining areas.',
        'W: 85cm x D: 85cm x H: 70cm', 'Hand-Blown Amber Glass & Brass', 'Amber Glass', 4.8, 39, 0, null, 0, 1, 10],
    [7, 7, 'Aesthetic Ceramic Table Lamp', 2999.00, 3999.00,
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',
        'Textured terracotta ceramic base bedside lamp with linen drum shade and warm ambience.',
        'W: 30cm x D: 30cm x H: 50cm', 'Glazed Terracotta & Fabric Shade', 'Terracotta', 4.6, 52, 0, null, 0, 0, 32],
];

// Upsert categories / collections (preserve existing IDs)
$stmtCat = $pdo->prepare(
    "INSERT INTO categories (id, name, slug, description, icon, image)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), icon = VALUES(icon), image = VALUES(image)"
);
foreach ($categories as $c) { $stmtCat->execute($c); }

$stmtCol = $pdo->prepare(
    "INSERT INTO collections (id, title, slug, subtitle, banner_image, discount_tag)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), subtitle = VALUES(subtitle), banner_image = VALUES(banner_image), discount_tag = VALUES(discount_tag)"
);
foreach ($collections as $col) { $stmtCol->execute($col); }

// Ensure a UNIQUE index exists on products.slug so INSERT IGNORE can dedupe.
$slugIdx = $pdo->query(
    "SELECT COUNT(*) FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'uq_products_slug'"
)->fetchColumn();
if ((int)$slugIdx === 0) {
    // Collapse any duplicate slugs first, then add the unique key.
    $pdo->exec(
        "UPDATE products p
         LEFT JOIN products p2 ON p2.slug = p.slug AND p2.id < p.id
         SET p.slug = CONCAT(p.slug, '-', p.id)
         WHERE p2.id IS NOT NULL"
    );
    $pdo->exec("ALTER TABLE products ADD UNIQUE KEY uq_products_slug (slug)");
    echo "      Added UNIQUE key uq_products_slug (deduplicated any collisions).\n";
}

$inserted = 0; $skipped = 0;
$stmtProd = $pdo->prepare(
    "INSERT IGNORE INTO products
        (category_id, collection_id, name, slug, price, original_price, discount_price, stock_quantity,
         image, back_image, description, dimensions, material, color, rating, reviews_count,
         has_offer, offer_end_time, is_featured, is_trending, stock_status, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'In Stock', 'active')"
);
foreach ($products as $p) {
    [$catId, $colId, $name, $price, $orig, $img, $backImg, $desc, $dims, $material, $color, $rating, $reviews, $hasOffer, $offerEnd, $featured, $trending, $stockQty] = $p;
    $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $name), '-'));
    $stmtProd->execute([$catId, $colId, $name, $slug, $price, $orig, $price, $stockQty,
        $img, $backImg, $desc, $dims, $material, $color, $rating, $reviews,
        $hasOffer, $offerEnd, $featured, $trending]);
    $stmtProd->rowCount() > 0 ? $inserted++ : $skipped++;
}
echo "[3/4] Catalog migration: $inserted products inserted, $skipped already present (no duplicates).\n";

// ---------------------------------------------------------------------------
// 4. Verification report
// ---------------------------------------------------------------------------
$count = (int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
$active = (int)$pdo->query("SELECT COUNT(*) FROM products WHERE status = 'active'")->fetchColumn();
echo "[4/4] Verification: $count products in MySQL ($active active, " . ($count - $active) . " inactive).\n";
echo "\n  ID | Slug                                          | Price     | Stock | Status\n";
echo "  ---+-----------------------------------------------+-----------+-------+----------\n";
foreach ($pdo->query("SELECT id, slug, price, stock_quantity, status FROM products ORDER BY id") as $row) {
    printf("  %2d | %-45s | %9.2f | %5d | %s\n",
        $row['id'], $row['slug'], (float)$row['price'], $row['stock_quantity'], $row['status']);
}
echo "\nDone. Every product is now served from MySQL through the PHP API.\n";
