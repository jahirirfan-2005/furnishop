<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $collection = isset($_GET['collection']) ? $_GET['collection'] : null;
        $search = isset($_GET['search']) ? trim($_GET['search']) : null;
        $sort = isset($_GET['sort']) ? $_GET['sort'] : 'featured';
        $minPrice = isset($_GET['min_price']) ? floatval($_GET['min_price']) : null;
        $maxPrice = isset($_GET['max_price']) ? floatval($_GET['max_price']) : null;

        // Single product detail lookup
        if ($id) {
            $stmt = $pdo->prepare("SELECT p.*, c.name as category_name, col.title as collection_title 
                                   FROM products p 
                                   LEFT JOIN categories c ON p.category_id = c.id 
                                   LEFT JOIN collections col ON p.collection_id = col.id 
                                   WHERE p.id = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch();

            if ($product) {
                echo json_encode(["status" => "success", "data" => $product]);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Product not found"]);
            }
            exit();
        }

        // List products query
        $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug, col.title as collection_title, col.slug as collection_slug 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                LEFT JOIN collections col ON p.collection_id = col.id 
                WHERE 1=1";
        $params = [];

        if ($category && $category !== 'all') {
            if (is_numeric($category)) {
                $sql .= " AND p.category_id = ?";
                $params[] = intval($category);
            } else {
                $sql .= " AND c.slug = ?";
                $params[] = $category;
            }
        }

        if ($collection && $collection !== 'all') {
            if (is_numeric($collection)) {
                $sql .= " AND p.collection_id = ?";
                $params[] = intval($collection);
            } else {
                $sql .= " AND col.slug = ?";
                $params[] = $collection;
            }
        }

        if ($search) {
            $sql .= " AND (p.name LIKE ? OR p.description LIKE ? OR p.material LIKE ? OR c.name LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if ($minPrice !== null && $minPrice > 0) {
            $sql .= " AND p.price >= ?";
            $params[] = $minPrice;
        }

        if ($maxPrice !== null && $maxPrice > 0) {
            $sql .= " AND p.price <= ?";
            $params[] = $maxPrice;
        }

        // Sorting
        switch ($sort) {
            case 'price_low':
                $sql .= " ORDER BY p.price ASC";
                break;
            case 'price_high':
                $sql .= " ORDER BY p.price DESC";
                break;
            case 'rating':
                $sql .= " ORDER BY p.rating DESC";
                break;
            case 'newest':
                $sql .= " ORDER BY p.created_at DESC";
                break;
            case 'offers':
                $sql .= " ORDER BY p.has_offer DESC, p.id ASC";
                break;
            case 'featured':
            default:
                $sql .= " ORDER BY p.is_featured DESC, p.id ASC";
                break;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();

        // Format numeric types and timestamps for JSON response
        foreach ($products as &$item) {
            $item['id'] = (int)$item['id'];
            $item['category_id'] = (int)$item['category_id'];
            $item['collection_id'] = $item['collection_id'] ? (int)$item['collection_id'] : null;
            $item['price'] = (float)$item['price'];
            $item['original_price'] = $item['original_price'] ? (float)$item['original_price'] : null;
            $item['rating'] = (float)$item['rating'];
            $item['reviews_count'] = (int)$item['reviews_count'];
            $item['has_offer'] = (bool)$item['has_offer'];
            $item['is_featured'] = (bool)$item['is_featured'];
            $item['is_trending'] = (bool)$item['is_trending'];
        }

        echo json_encode(["status" => "success", "count" => count($products), "data" => $products]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database query failed: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
