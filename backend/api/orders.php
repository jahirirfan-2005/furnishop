<?php
require_once __DIR__ . '/config.php';

try {
    // ---------- GET: all orders with their items ----------
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query(
            "SELECT * FROM `$db`.orders ORDER BY created_at DESC, id DESC"
        );
        $orders = $stmt->fetchAll();

        $itemsStmt = $pdo->prepare("SELECT * FROM `$db`.order_items WHERE order_id = :oid ORDER BY id ASC");
        foreach ($orders as &$ord) {
            $ord['id'] = (int)$ord['id'];
            $ord['total_amount'] = (float)$ord['total_amount'];
            $itemsStmt->execute([':oid' => $ord['id']]);
            $items = $itemsStmt->fetchAll();
            foreach ($items as &$it) {
                $it['id'] = (int)$it['id'];
                $it['product_id'] = $it['product_id'] === null ? null : (int)$it['product_id'];
                $it['quantity'] = (int)$it['quantity'];
                $it['price'] = (float)$it['price'];
            }
            unset($it);
            $ord['items'] = $items;
        }
        unset($ord);

        echo json_encode(["status" => "success", "count" => count($orders), "data" => $orders]);
        exit();
    }

    // ---------- PUT: update order status ----------
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $d = request_data();
        $id = (int)($d['id'] ?? 0);
        $status = $d['status'] ?? '';
        $allowed = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!$id || !in_array($status, $allowed, true)) {
            json_out(["status" => "error", "message" => "id and valid status required"], 400);
        }
        $stmt = $pdo->prepare("UPDATE `$db`.orders SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);
        echo json_encode(["status" => "success", "message" => "Order status updated to $status"]);
        exit();
    }

    // ---------- DELETE: remove order (cascades to items) ----------
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) json_out(["status" => "error", "message" => "id required"], 400);
        $stmt = $pdo->prepare("DELETE FROM `$db`.orders WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["status" => "success", "message" => "Order deleted from database"]);
        exit();
    }

    json_out(["status" => "error", "message" => "Method not allowed"], 405);

} catch (PDOException $e) {
    json_out(["status" => "error", "message" => "Database error", "error" => $e->getMessage()], 500);
}
