<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $collection = isset($_GET['collection']) ? $_GET['collection'] : null;
        $search = isset($_GET['search']) ? preg_replace('/\s+/', ' ', trim($_GET['search'])) : null;
        if ($search === '') {
            $search = null;
        }
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
} else if ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            $input = $_POST;
        }

        $name = isset($input['name']) ? trim($input['name']) : '';
        $category_id = isset($input['category_id']) ? intval($input['category_id']) : 0;
        $price = isset($input['price']) ? floatval($input['price']) : 0.0;
        $image = isset($input['image']) ? trim($input['image']) : '';

        if (empty($name) || $category_id <= 0 || $price <= 0 || empty($image)) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Required fields missing: name, category_id, price, and image are required"
            ]);
            exit();
        }

        $collection_id = !empty($input['collection_id']) ? intval($input['collection_id']) : null;
        $original_price = !empty($input['original_price']) ? floatval($input['original_price']) : null;
        $back_image = !empty($input['back_image']) ? trim($input['back_image']) : $image;
        $description = isset($input['description']) ? trim($input['description']) : '';
        $dimensions = !empty($input['dimensions']) ? trim($input['dimensions']) : 'W: 180cm x D: 90cm x H: 85cm';
        $material = !empty($input['material']) ? trim($input['material']) : 'Solid Teak Wood & Velvet';
        $rating = isset($input['rating']) ? floatval($input['rating']) : 4.5;
        $reviews_count = isset($input['reviews_count']) ? intval($input['reviews_count']) : 0;
        $has_offer = !empty($input['has_offer']) ? 1 : 0;
        $offer_end_time = !empty($input['offer_end_time']) ? $input['offer_end_time'] : null;
        $is_featured = !empty($input['is_featured']) ? 1 : 0;
        $is_trending = !empty($input['is_trending']) ? 1 : 0;
        $stock_status = !empty($input['stock_status']) ? trim($input['stock_status']) : 'In Stock';

        $stmt = $pdo->prepare("INSERT INTO products (
            category_id, collection_id, name, price, original_price, image, back_image,
            description, dimensions, material, rating, reviews_count, has_offer,
            offer_end_time, is_featured, is_trending, stock_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $category_id, $collection_id, $name, $price, $original_price, $image, $back_image,
            $description, $dimensions, $material, $rating, $reviews_count, $has_offer,
            $offer_end_time, $is_featured, $is_trending, $stock_status
        ]);

        $newId = (int)$pdo->lastInsertId();

        // Fetch inserted product details with category and collection details
        $fetchStmt = $pdo->prepare("SELECT p.*, c.name as category_name, c.slug as category_slug, col.title as collection_title, col.slug as collection_slug 
                                    FROM products p 
                                    LEFT JOIN categories c ON p.category_id = c.id 
                                    LEFT JOIN collections col ON p.collection_id = col.id 
                                    WHERE p.id = ?");
        $fetchStmt->execute([$newId]);
        $newProduct = $fetchStmt->fetch();

        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Product stored successfully in database",
            "data" => $newProduct
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to store product: " . $e->getMessage()]);
    }
} else if ($method === 'DELETE') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($input['id']) ? intval($input['id']) : null);

        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Product ID required for deletion"]);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(["status" => "success", "message" => "Product deleted successfully from database"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete product: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}

