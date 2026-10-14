<?php
/**
 * Orders REST API Gateway.
 *
 * Security:
 * - Listing all orders is strictly restricted to authenticated administrators.
 * - Public visitors can only query their own single order by providing both
 *   the exact order_number AND matching customer_email.
 * - Modifying order status or deleting orders requires administrator authentication.
 */

require_once __DIR__ . '/config.php';
/** @var PDO $pdo */

$method = $_SERVER['REQUEST_METHOD'];

try {
    // -------------------------------------------------------------------------
    // GET: List all orders (Admin only) OR Track Single Order (Customer)
    // -------------------------------------------------------------------------
    if ($method === 'GET') {
        $admin = get_authenticated_admin($pdo);

        // 1. Single order lookup for customer tracking (No admin auth required)
        if (!empty($_GET['order_number']) && !empty($_GET['email'])) {
            $orderNum = trim($_GET['order_number']);
            $email    = trim($_GET['email']);

            $stmt = $pdo->prepare(
                "SELECT * FROM orders WHERE order_number = :on AND customer_email = :email LIMIT 1"
            );
            $stmt->execute([':on' => $orderNum, ':email' => $email]);
            $ord = $stmt->fetch();

            if (!$ord) {
                api_error('Order not found or email does not match', 404);
            }

            $ord['id'] = (int)$ord['id'];
            $ord['total_amount'] = (float)$ord['total_amount'];

            $itemsStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = :oid ORDER BY id ASC");
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

            api_success($ord, 'Order details retrieved');
        }

        // 2. Bulk order list: Strictly requires administrator authentication
        if (!$admin) {
            api_error('Administrator authentication required to access order records', 401);
        }

        $stmt = $pdo->query(
            "SELECT * FROM orders ORDER BY created_at DESC, id DESC"
        );
        $orders = $stmt->fetchAll();

        $itemsStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = :oid ORDER BY id ASC");
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

        json_out([
            'status'  => 'success',
            'success' => true,
            'count'   => count($orders),
            'data'    => $orders
        ]);
    }

    // -------------------------------------------------------------------------
    // PUT: Update order status (Admin only)
    // -------------------------------------------------------------------------
    if ($method === 'PUT') {
        require_admin_auth($pdo);

        $d = request_data();
        $id = (int)($d['id'] ?? 0);
        $status = $d['status'] ?? '';
        $allowed = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

        if (!$id || !in_array($status, $allowed, true)) {
            api_error('Valid order ID and permitted status required', 400);
        }

        $stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);

        if ($stmt->rowCount() === 0) {
            $check = $pdo->prepare("SELECT id FROM orders WHERE id = :id");
            $check->execute([':id' => $id]);
            if (!$check->fetch()) {
                api_error('Order not found', 404);
            }
        }

        api_success(['id' => $id, 'status' => $status], "Order status updated to $status");
    }

    // -------------------------------------------------------------------------
    // DELETE: Remove order (Admin only)
    // -------------------------------------------------------------------------
    if ($method === 'DELETE') {
        require_admin_auth($pdo);

        $id = (int)($_GET['id'] ?? 0);
        if (!$id) {
            $d = request_data();
            $id = (int)($d['id'] ?? 0);
        }
        if (!$id) api_error('Order id required', 400);

        $stmt = $pdo->prepare("DELETE FROM orders WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            api_error('Order not found', 404);
        }

        api_success(['id' => $id], 'Order deleted from database');
    }

    api_error('Method not allowed', 405);

} catch (PDOException $e) {
    error_log('[FurniShop Orders] PDOException: ' . $e->getMessage());
    api_error('Failed to process order request', 500);
} catch (Throwable $e) {
    error_log('[FurniShop Orders] Throwable: ' . $e->getMessage());
    api_error('Failed to process order request', 500);
}
