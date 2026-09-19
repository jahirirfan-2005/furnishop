<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$sessionId = isset($_GET['session_id']) ? $_GET['session_id'] : 'guest_session';

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->prepare("SELECT w.id as wishlist_id, p.* 
                                   FROM wishlist w 
                                   JOIN products p ON w.product_id = p.id 
                                   WHERE w.session_id = ?");
            $stmt->execute([$sessionId]);
            $items = $stmt->fetchAll();

            foreach ($items as &$item) {
                $item['wishlist_id'] = (int)$item['wishlist_id'];
                $item['id'] = (int)$item['id'];
                $item['price'] = (float)$item['price'];
            }

            echo json_encode(["status" => "success", "session_id" => $sessionId, "data" => $items]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $productId = isset($input['product_id']) ? intval($input['product_id']) : null;
        $sessId = isset($input['session_id']) ? $input['session_id'] : $sessionId;

        if (!$productId) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "product_id is required"]);
            exit();
        }

        try {
            $stmtCheck = $pdo->prepare("SELECT id FROM wishlist WHERE session_id = ? AND product_id = ?");
            $stmtCheck->execute([$sessId, $productId]);
            $exists = $stmtCheck->fetch();

            if ($exists) {
                $stmtDelete = $pdo->prepare("DELETE FROM wishlist WHERE id = ?");
                $stmtDelete->execute([$exists['id']]);
                echo json_encode(["status" => "success", "action" => "removed", "message" => "Removed from wishlist"]);
            } else {
                $stmtInsert = $pdo->prepare("INSERT INTO wishlist (session_id, product_id) VALUES (?, ?)");
                $stmtInsert->execute([$sessId, $productId]);
                echo json_encode(["status" => "success", "action" => "added", "message" => "Added to wishlist"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not allowed"]);
        break;
}
