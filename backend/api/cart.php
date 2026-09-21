<?php
require_once __DIR__ . '/config.php';

$table = "`" . $db . "`";

try {
    // ---------- GET: cart contents + subtotal ----------
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sid = $_GET['session_id'] ?? '';
        if (!$sid) json_out(["status" => "error", "message" => "session_id required"], 400);

        $stmt = $pdo->prepare(
            "SELECT p.*, ci.quantity, ci.id AS cart_id,
                    (p.price * ci.quantity) AS subtotal,
                    c.name AS category_name, col.title AS collection_title
             FROM `$db`.cart_items ci
             JOIN `$db`.products p ON p.id = ci.product_id
             LEFT JOIN `$db`.categories c ON c.id = p.category_id
             LEFT JOIN `$db`.collections col ON col.id = p.collection_id
             WHERE ci.session_id = :sid
             ORDER BY ci.created_at ASC"
        );
        $stmt->execute([':sid' => $sid]);
        $rows = array_map('cast_product', $stmt->fetchAll());

        foreach ($rows as &$r) {
            $r['cart_id'] = (int)$r['cart_id'];
            $r['quantity'] = (int)$r['quantity'];
            $r['subtotal'] = (float)$r['subtotal'];
        }
        unset($r);

        $subtotal = array_sum(array_column($rows, 'subtotal'));
        echo json_encode(["status" => "success", "count" => count($rows), "data" => $rows, "subtotal" => $subtotal]);
        exit();
    }

    // ---------- POST: add to cart ----------
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $d = request_data();
        $sid = $d['session_id'] ?? '';
        $pid = (int)($d['product_id'] ?? 0);
        $qty = max(1, (int)($d['quantity'] ?? 1));
        if (!$sid || !$pid) json_out(["status" => "error", "message" => "session_id and product_id required"], 400);

        // Ensure product exists
        $chk = $pdo->prepare("SELECT id FROM `$db`.products WHERE id = :pid");
        $chk->execute([':pid' => $pid]);
        if (!$chk->fetch()) json_out(["status" => "error", "message" => "Product not found"], 404);

        $stmt = $pdo->prepare(
            "INSERT INTO `$db`.cart_items (session_id, product_id, quantity)
             VALUES (:sid, :pid, :qty)
             ON DUPLICATE KEY UPDATE quantity = quantity + :qty2"
        );
        $stmt->execute([':sid' => $sid, ':pid' => $pid, ':qty' => $qty, ':qty2' => $qty]);

        echo json_encode(["status" => "success", "message" => "Item added to cart"]);
        exit();
    }

    // ---------- PUT: update quantity (0 deletes) ----------
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $d = request_data();
        $sid = $d['session_id'] ?? '';
        $pid = (int)($d['product_id'] ?? 0);
        $qty = (int)($d['quantity'] ?? 0);
        if (!$sid || !$pid) json_out(["status" => "error", "message" => "session_id and product_id required"], 400);

        if ($qty <= 0) {
            $stmt = $pdo->prepare("DELETE FROM `$db`.cart_items WHERE session_id = :sid AND product_id = :pid");
            $stmt->execute([':sid' => $sid, ':pid' => $pid]);
            echo json_encode(["status" => "success", "message" => "Item removed"]);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE `$db`.cart_items SET quantity = :qty WHERE session_id = :sid AND product_id = :pid");
        $stmt->execute([':sid' => $sid, ':pid' => $pid, ':qty' => $qty]);
        echo json_encode(["status" => "success", "message" => "Cart updated"]);
        exit();
    }

    // ---------- DELETE: remove item ----------
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $d = request_data();
        $sid = $d['session_id'] ?? ($_GET['session_id'] ?? '');
        $pid = (int)($d['product_id'] ?? ($_GET['product_id'] ?? 0));
        if (!$sid || !$pid) json_out(["status" => "error", "message" => "session_id and product_id required"], 400);

        $stmt = $pdo->prepare("DELETE FROM `$db`.cart_items WHERE session_id = :sid AND product_id = :pid");
        $stmt->execute([':sid' => $sid, ':pid' => $pid]);
        echo json_encode(["status" => "success", "message" => "Item removed from cart"]);
        exit();
    }

    json_out(["status" => "error", "message" => "Method not allowed"], 405);

} catch (PDOException $e) {
    json_out(["status" => "error", "message" => "Database error", "error" => $e->getMessage()], 500);
}
