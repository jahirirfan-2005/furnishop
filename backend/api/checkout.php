<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$customerName = isset($input['customer_name']) ? trim($input['customer_name']) : '';
$customerEmail = isset($input['customer_email']) ? trim($input['customer_email']) : '';
$customerPhone = isset($input['customer_phone']) ? trim($input['customer_phone']) : '';
$shippingAddress = isset($input['shipping_address']) ? trim($input['shipping_address']) : '';
$paymentMethod = isset($input['payment_method']) ? trim($input['payment_method']) : 'Credit Card';
$sessionId = isset($input['session_id']) ? $input['session_id'] : 'guest_session';
$items = isset($input['items']) ? $input['items'] : [];

if (empty($customerName) || empty($customerEmail) || empty($shippingAddress) || empty($items)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Please complete all required fields (Name, Email, Address, Cart Items)"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // Calculate total amount
    $totalAmount = 0;
    foreach ($items as $item) {
        $price = floatval($item['price']);
        $qty = intval($item['quantity']);
        $totalAmount += $price * $qty;
    }

    // Generate Order Number
    $orderNumber = 'FURNI-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));

    // Insert Order
    $stmtOrder = $pdo->prepare("INSERT INTO orders 
        (order_number, customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Processing')");
    $stmtOrder->execute([
        $orderNumber,
        $customerName,
        $customerEmail,
        $customerPhone,
        $shippingAddress,
        $paymentMethod,
        $totalAmount
    ]);

    $orderId = $pdo->lastInsertId();

    // Insert Order Items
    $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($items as $item) {
        $stmtItem->execute([
            $orderId,
            intval($item['id']),
            intval($item['quantity']),
            floatval($item['price'])
        ]);
    }

    // Clear user's session cart in database
    $stmtClear = $pdo->prepare("DELETE FROM cart WHERE session_id = ?");
    $stmtClear->execute([$sessionId]);

    $pdo->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Order successfully placed!",
        "order_number" => $orderNumber,
        "total_amount" => $totalAmount,
        "customer_name" => $customerName
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to process order: " . $e->getMessage()]);
}
