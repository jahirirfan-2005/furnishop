<?php
require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->query(
        "SELECT c.id, c.name, c.slug, c.description, c.icon, c.image,
                (SELECT COUNT(*) FROM `$db`.products p
                  WHERE p.category_id = c.id AND p.status = 'active') AS products_count
         FROM `$db`.categories c
         ORDER BY c.id ASC"
    );
    $rows = array_map(function ($r) {
        $r['id'] = (int)$r['id'];
        $r['products_count'] = (int)$r['products_count'];
        // Alias for compatibility with components reading `product_count`.
        $r['product_count'] = $r['products_count'];
        return $r;
    }, $stmt->fetchAll());
    echo json_encode(["status" => "success", "success" => true, "data" => $rows]);
} catch (PDOException $e) {
    error_log('[FurniShop API] categories.php: ' . $e->getMessage());
    json_out(["status" => "error", "success" => false, "message" => "Something went wrong"], 500);
}
