<?php
require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->query("SELECT c.*, COUNT(p.id) as product_count 
                         FROM categories c 
                         LEFT JOIN products p ON c.id = p.category_id 
                         GROUP BY c.id 
                         ORDER BY c.id ASC");
    $categories = $stmt->fetchAll();

    foreach ($categories as &$cat) {
        $cat['id'] = (int)$cat['id'];
        $cat['product_count'] = (int)$cat['product_count'];
    }

    echo json_encode(["status" => "success", "data" => $categories]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
