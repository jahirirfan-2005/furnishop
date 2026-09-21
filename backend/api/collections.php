<?php
require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->query(
        "SELECT col.id, col.title, col.slug, col.subtitle, col.banner_image, col.discount_tag,
                (SELECT COUNT(*) FROM `$db`.products p
                  WHERE p.collection_id = col.id AND p.status = 'active') AS products_count
         FROM `$db`.collections col
         ORDER BY col.id ASC"
    );
    $rows = array_map(function ($r) {
        $r['id'] = (int)$r['id'];
        $r['products_count'] = (int)$r['products_count'];
        return $r;
    }, $stmt->fetchAll());
    echo json_encode(["status" => "success", "success" => true, "data" => $rows]);
} catch (PDOException $e) {
    error_log('[FurniShop API] collections.php: ' . $e->getMessage());
    json_out(["status" => "error", "success" => false, "message" => "Something went wrong"], 500);
}
