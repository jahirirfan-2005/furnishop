<?php
require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->query("SELECT col.*, COUNT(p.id) as product_count 
                         FROM collections col 
                         LEFT JOIN products p ON col.id = p.collection_id 
                         GROUP BY col.id 
                         ORDER BY col.id ASC");
    $collections = $stmt->fetchAll();

    foreach ($collections as &$col) {
        $col['id'] = (int)$col['id'];
        $col['product_count'] = (int)$col['product_count'];
    }

    echo json_encode(["status" => "success", "data" => $collections]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
