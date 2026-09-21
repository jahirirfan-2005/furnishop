<?php
require_once __DIR__ . '/config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_out(["status" => "error", "message" => "Method not allowed"], 405);
    }

    $d = request_data();
    $sid = $d['session_id'] ?? '';

    if (empty($d['customer_name']) || empty($d['customer_email']) || empty($d['shipping_address'])) {
        json_out(["status" => "error", "message" => "customer_name, customer_email and shipping_address are required"], 400);
    }

    $items = $d['items'] ?? [];
    if (!$items && $sid) {
        // Fall back to the server-side cart contents
        $stmt = $pdo->prepare(
            "SELECT p.*, ci.quantity FROM `$db`.cart_items ci
             JOIN `$db`.products p ON p.id = ci.product_id
             WHERE ci.session_id = :sid"
        );
        $stmt->execute([':sid' => $sid]);
        $rows = $stmt->fetchAll();
        foreach ($rows as $r) {
            $items[] = [
                'id'       => (int)$r['id'],
                'name'     => $r['name'],
                'image'    => $r['image'],
                'price'    => (float)$r['price'],
                'quantity' => (int)$r['quantity'],
            ];
        }
    }

    if (!$items) json_out(["status" => "error", "message" => "No items to order"], 400);

    $total = 0.0;
    foreach ($items as $it) {
        $total += ((float)($it['price'] ?? 0)) * max(1, (int)($it['quantity'] ?? 1));
    }

    $orderNumber = 'FURNI-' . strtoupper(bin2hex(random_bytes(4)));

    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        "INSERT INTO `$db`.orders
         (order_number, customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, status)
         VALUES (:on, :cn, :ce, :cp, :sa, :pm, :total, 'Processing')"
    );
    $stmt->execute([
        ':on'     => $orderNumber,
        ':cn'     => trim($d['customer_name']),
        ':ce'     => trim($d['customer_email']),
        ':cp'     => $d['customer_phone'] ?? null,
        ':sa'     => trim($d['shipping_address']),
        ':pm'     => $d['payment_method'] ?? 'Credit Card',
        ':total'  => $total,
    ]);
    $orderId = (int)$pdo->lastInsertId();

    $itemStmt = $pdo->prepare(
        "INSERT INTO `$db`.order_items (order_id, product_id, product_name, product_image, quantity, price)
         VALUES (:oid, :pid, :pname, :pimg, :qty, :price)"
    );
    foreach ($items as $it) {
        $itemStmt->execute([
            ':oid'   => $orderId,
            ':pid'   => !empty($it['id']) ? (int)$it['id'] : null,
            ':pname' => $it['name'] ?? 'Unknown product',
            ':pimg'  => $it['image'] ?? null,
            ':qty'   => max(1, (int)($it['quantity'] ?? 1)),
            ':price' => (float)($it['price'] ?? 0),
        ]);
    }

    // Clear this session's cart after a successful order
    if ($sid) {
        $del = $pdo->prepare("DELETE FROM `$db`.cart_items WHERE session_id = :sid");
        $del->execute([':sid' => $sid]);
    }

    $pdo->commit();

    echo json_encode([
        "status"       => "success",
        "order_number" => $orderNumber,
        "total_amount" => $total,
        "message"      => "Order placed successfully and stored in database",
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    json_out(["status" => "error", "message" => "Database error", "error" => $e->getMessage()], 500);
}
