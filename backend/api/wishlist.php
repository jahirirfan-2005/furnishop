<?php
require_once __DIR__ . '/config.php';

try {
    // ---------- GET: wishlist contents ----------
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sid = $_GET['session_id'] ?? '';
        if (!$sid) json_out(["status" => "error", "message" => "session_id required"], 400);

        $stmt = $pdo->prepare(
            "SELECT p.*, c.name AS category_name, col.title AS collection_title
             FROM `$db`.wishlist_items wi
             JOIN `$db`.products p ON p.id = wi.product_id
             LEFT JOIN `$db`.categories c ON c.id = p.category_id
             LEFT JOIN `$db`.collections col ON col.id = p.collection_id
             WHERE wi.session_id = :sid
             ORDER BY wi.created_at ASC"
        );
        $stmt->execute([':sid' => $sid]);
        $rows = array_map('cast_product', $stmt->fetchAll());

        echo json_encode(["status" => "success", "count" => count($rows), "data" => $rows]);
        exit();
    }

    // ---------- POST: toggle item in wishlist ----------
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $d = request_data();
        $sid = $d['session_id'] ?? '';
        $pid = (int)($d['product_id'] ?? 0);
        if (!$sid || !$pid) json_out(["status" => "error", "message" => "session_id and product_id required"], 400);

        $chk = $pdo->prepare("SELECT id FROM `$db`.wishlist_items WHERE session_id = :sid AND product_id = :pid");
        $chk->execute([':sid' => $sid, ':pid' => $pid]);
        $existing = $chk->fetch();

        if ($existing) {
            $stmt = $pdo->prepare("DELETE FROM `$db`.wishlist_items WHERE id = :id");
            $stmt->execute([':id' => $existing['id']]);
            echo json_encode(["status" => "success", "action" => "removed", "message" => "Wishlist removed"]);
        } else {
            $stmt = $pdo->prepare("INSERT IGNORE INTO `$db`.wishlist_items (session_id, product_id) VALUES (:sid, :pid)");
            $stmt->execute([':sid' => $sid, ':pid' => $pid]);
            echo json_encode(["status" => "success", "action" => "added", "message" => "Wishlist added"]);
        }
        exit();
    }

    // ---------- DELETE: remove item ----------
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $d = request_data();
        $sid = $d['session_id'] ?? ($_GET['session_id'] ?? '');
        $pid = (int)($d['product_id'] ?? ($_GET['product_id'] ?? 0));
        if (!$sid || !$pid) json_out(["status" => "error", "message" => "session_id and product_id required"], 400);

        $stmt = $pdo->prepare("DELETE FROM `$db`.wishlist_items WHERE session_id = :sid AND product_id = :pid");
        $stmt->execute([':sid' => $sid, ':pid' => $pid]);
        echo json_encode(["status" => "success", "message" => "Item removed from wishlist"]);
        exit();
    }

    json_out(["status" => "error", "message" => "Method not allowed"], 405);

} catch (PDOException $e) {
    json_out(["status" => "error", "message" => "Database error", "error" => $e->getMessage()], 500);
}
