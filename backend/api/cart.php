<?php
/**
 * FurniShop Cart REST API Gateway.
 *
 * Requirements:
 * - Validate session IDs, product IDs and item quantities (1 to 50).
 * - Enforce available stock limits.
 * - Always calculate prices dynamically from live MySQL products table.
 * - Reject malformed input and inactive products.
 */

require_once __DIR__ . '/config.php';
/** @var PDO $pdo */

function validate_cart_session(string $sid): string
{
    $clean = trim($sid);
    if ($clean === '' || strlen($clean) < 8 || strlen($clean) > 80 || !preg_match('/^[a-zA-Z0-9_\-\.]+$/', $clean)) {
        api_error('A valid session identifier (8-80 characters) is required', 400);
    }
    return $clean;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    // -------------------------------------------------------------------------
    // GET: Retrieve cart contents & calculate live subtotal from MySQL
    // -------------------------------------------------------------------------
    if ($method === 'GET') {
        $sid = validate_cart_session($_GET['session_id'] ?? '');

        $stmt = $pdo->prepare(
            "SELECT p.*, ci.quantity, ci.id AS cart_id,
                    c.name AS category_name, col.title AS collection_title
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             LEFT JOIN categories c ON c.id = p.category_id
             LEFT JOIN collections col ON col.id = p.collection_id
             WHERE ci.session_id = :sid
             ORDER BY ci.created_at ASC"
        );
        $stmt->execute([':sid' => $sid]);
        $rawRows = $stmt->fetchAll();

        $items = [];
        $subtotal = 0.0;

        foreach ($rawRows as $row) {
            $p = cast_product($row);
            $qty = max(1, (int)$row['quantity']);

            // Live pricing from database - never client-supplied
            $unitPrice = (float)$p['price'];
            if (!empty($p['has_offer']) && !empty($p['discount_price']) && (empty($p['offer_end_time']) || strtotime($p['offer_end_time']) > time())) {
                $unitPrice = (float)$p['discount_price'];
            }

            $lineSubtotal = round($unitPrice * $qty, 2);
            $subtotal += $lineSubtotal;

            $p['cart_id']        = (int)$row['cart_id'];
            $p['quantity']       = $qty;
            $p['unit_price']     = $unitPrice;
            $p['subtotal']       = $lineSubtotal;
            $p['in_stock']       = ($p['status'] === 'active' && $p['stock_quantity'] >= $qty);
            $p['stock_available']= (int)$p['stock_quantity'];

            $items[] = $p;
        }

        api_success([
            'count'    => count($items),
            'subtotal' => round($subtotal, 2),
            'items'    => $items,
            'data'     => $items // backward compatibility with frontend
        ], 'Cart retrieved');
    }

    // -------------------------------------------------------------------------
    // POST: Add item to cart
    // -------------------------------------------------------------------------
    if ($method === 'POST') {
        $d = request_data();
        $sid = validate_cart_session($d['session_id'] ?? '');
        $pid = (int)($d['product_id'] ?? 0);
        $qty = (int)($d['quantity'] ?? 1);

        if ($pid <= 0) {
            api_error('Valid product ID is required', 400);
        }
        if ($qty < 1 || $qty > 50) {
            api_error('Quantity must be between 1 and 50 units', 422);
        }

        // Verify product exists and is active
        $prodStmt = $pdo->prepare(
            "SELECT id, name, stock_quantity, status FROM products WHERE id = :id LIMIT 1"
        );
        $prodStmt->execute([':id' => $pid]);
        $prod = $prodStmt->fetch();

        if (!$prod || $prod['status'] !== 'active') {
            api_error('Product not found or currently unavailable', 404);
        }

        $stock = (int)$prod['stock_quantity'];
        if ($stock <= 0) {
            api_error("Product '{$prod['name']}' is out of stock", 422);
        }

        // Check existing cart quantity
        $cartStmt = $pdo->prepare(
            "SELECT quantity FROM cart_items WHERE session_id = :sid AND product_id = :pid LIMIT 1"
        );
        $cartStmt->execute([':sid' => $sid, ':pid' => $pid]);
        $existingQty = (int)$cartStmt->fetchColumn();

        $newTotalQty = $existingQty + $qty;
        if ($newTotalQty > 50) {
            api_error('Cannot add more than 50 units of the same item', 422);
        }
        if ($newTotalQty > $stock) {
            api_error("Cannot add {$qty} item(s). Only {$stock} available in stock ({$existingQty} already in your cart)", 422);
        }

        $insStmt = $pdo->prepare(
            "INSERT INTO cart_items (session_id, product_id, quantity)
             VALUES (:sid, :pid, :qty)
             ON DUPLICATE KEY UPDATE quantity = quantity + :qty2"
        );
        $insStmt->execute([
            ':sid'  => $sid,
            ':pid'  => $pid,
            ':qty'  => $qty,
            ':qty2' => $qty
        ]);

        api_success([
            'product_id' => $pid,
            'quantity'   => $newTotalQty
        ], "Added {$prod['name']} to cart");
    }

    // -------------------------------------------------------------------------
    // PUT: Update quantity (0 removes item)
    // -------------------------------------------------------------------------
    if ($method === 'PUT') {
        $d = request_data();
        $sid = validate_cart_session($d['session_id'] ?? '');
        $pid = (int)($d['product_id'] ?? 0);
        $qty = (int)($d['quantity'] ?? 0);

        if ($pid <= 0) {
            api_error('Valid product ID is required', 400);
        }

        if ($qty <= 0) {
            $del = $pdo->prepare("DELETE FROM cart_items WHERE session_id = :sid AND product_id = :pid");
            $del->execute([':sid' => $sid, ':pid' => $pid]);
            api_success(['product_id' => $pid, 'quantity' => 0], 'Item removed from cart');
        }

        if ($qty > 50) {
            api_error('Maximum 50 units allowed per item', 422);
        }

        // Verify product stock
        $prodStmt = $pdo->prepare("SELECT stock_quantity, status FROM products WHERE id = :id LIMIT 1");
        $prodStmt->execute([':id' => $pid]);
        $prod = $prodStmt->fetch();

        if (!$prod || $prod['status'] !== 'active') {
            api_error('Product not found or unavailable', 404);
        }

        $stock = (int)$prod['stock_quantity'];
        if ($qty > $stock) {
            api_error("Requested quantity ({$qty}) exceeds available stock ({$stock})", 422);
        }

        $upd = $pdo->prepare("UPDATE cart_items SET quantity = :qty WHERE session_id = :sid AND product_id = :pid");
        $upd->execute([':qty' => $qty, ':sid' => $sid, ':pid' => $pid]);

        api_success(['product_id' => $pid, 'quantity' => $qty], 'Cart quantity updated');
    }

    // -------------------------------------------------------------------------
    // DELETE: Remove item from cart
    // -------------------------------------------------------------------------
    if ($method === 'DELETE') {
        $d = request_data();
        $sid = validate_cart_session($d['session_id'] ?? ($_GET['session_id'] ?? ''));
        $pid = (int)($d['product_id'] ?? ($_GET['product_id'] ?? 0));

        if ($pid <= 0) {
            api_error('Valid product ID is required', 400);
        }

        $del = $pdo->prepare("DELETE FROM cart_items WHERE session_id = :sid AND product_id = :pid");
        $del->execute([':sid' => $sid, ':pid' => $pid]);

        api_success(['product_id' => $pid], 'Item removed from cart');
    }

    api_error('Method not allowed', 405);

} catch (PDOException $e) {
    error_log('[FurniShop API] cart.php PDOException: ' . $e->getMessage());
    api_error('Database error processing cart operation', 500);
} catch (Throwable $e) {
    error_log('[FurniShop API] cart.php Throwable: ' . $e->getMessage());
    api_error('Failed to process cart request', 500);
}
