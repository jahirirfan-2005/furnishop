<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$sessionId = isset($_GET['session_id']) ? $_GET['session_id'] : (isset($_SERVER['HTTP_X_SESSION_ID']) ? $_SERVER['HTTP_X_SESSION_ID'] : 'guest_session');

switch ($method) {
    case 'GET':
        // Fetch cart items for session
        try {
            $stmt = $pdo->prepare("SELECT c.id as cart_id, c.quantity, p.* 
                                   FROM cart c 
                                   JOIN products p ON c.product_id = p.id 
                                   WHERE c.session_id = ?");
            $stmt->execute([$sessionId]);
            $items = $stmt->fetchAll();

            $totalAmount = 0;
            foreach ($items as &$item) {
                $item['cart_id'] = (int)$item['cart_id'];
                $item['id'] = (int)$item['id'];
                $item['price'] = (float)$item['price'];
                $item['quantity'] = (int)$item['quantity'];
                $totalAmount += $item['price'] * $item['quantity'];
            }

            echo json_encode([
                "status" => "success",
                "session_id" => $sessionId,
                "count" => count($items),
                "total_amount" => $totalAmount,
                "data" => $items
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'POST':
        // Add item to cart or update quantity if exists
        $input = json_decode(file_get_contents('php://input'), true);
        $productId = isset($input['product_id']) ? intval($input['product_id']) : null;
        $quantity = isset($input['quantity']) ? max(1, intval($input['quantity'])) : 1;
        $sessId = isset($input['session_id']) ? $input['session_id'] : $sessionId;

        if (!$productId) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "product_id is required"]);
            exit();
        }

        try {
            // Check if product exists in cart
            $stmtCheck = $pdo->prepare("SELECT id, quantity FROM cart WHERE session_id = ? AND product_id = ?");
            $stmtCheck->execute([$sessId, $productId]);
            $existing = $stmtCheck->fetch();

            if ($existing) {
                $newQty = $existing['quantity'] + $quantity;
                $stmtUpdate = $pdo->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
                $stmtUpdate->execute([$newQty, $existing['id']]);
            } else {
                $stmtInsert = $pdo->prepare("INSERT INTO cart (session_id, product_id, quantity) VALUES (?, ?, ?)");
                $stmtInsert->execute([$sessId, $productId, $quantity]);
            }

            echo json_encode(["status" => "success", "message" => "Item added to cart"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update item quantity
        $input = json_decode(file_get_contents('php://input'), true);
        $productId = isset($input['product_id']) ? intval($input['product_id']) : null;
        $quantity = isset($input['quantity']) ? intval($input['quantity']) : 1;
        $sessId = isset($input['session_id']) ? $input['session_id'] : $sessionId;

        if (!$productId) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "product_id is required"]);
            exit();
        }

        try {
            if ($quantity <= 0) {
                $stmtDelete = $pdo->prepare("DELETE FROM cart WHERE session_id = ? AND product_id = ?");
                $stmtDelete->execute([$sessId, $productId]);
            } else {
                $stmtUpdate = $pdo->prepare("UPDATE cart SET quantity = ? WHERE session_id = ? AND product_id = ?");
                $stmtUpdate->execute([$quantity, $sessId, $productId]);
            }
            echo json_encode(["status" => "success", "message" => "Cart updated"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Remove item or clear cart
        $input = json_decode(file_get_contents('php://input'), true);
        $productId = isset($input['product_id']) ? intval($input['product_id']) : (isset($_GET['product_id']) ? intval($_GET['product_id']) : null);
        $sessId = isset($input['session_id']) ? $input['session_id'] : $sessionId;

        try {
            if ($productId) {
                $stmt = $pdo->prepare("DELETE FROM cart WHERE session_id = ? AND product_id = ?");
                $stmt->execute([$sessId, $productId]);
                echo json_encode(["status" => "success", "message" => "Item removed from cart"]);
            } else {
                $stmt = $pdo->prepare("DELETE FROM cart WHERE session_id = ?");
                $stmt->execute([$sessId]);
                echo json_encode(["status" => "success", "message" => "Cart cleared"]);
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
