<?php
require_once __DIR__ . '/config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_out(["status" => "error", "message" => "Method not allowed"], 405);
    }

    $d = request_data();
    $email = trim($d['email'] ?? '');

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_out(["status" => "error", "message" => "A valid email is required"], 400);
    }

    // Keep subscriptions in their own table (created on demand)
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `$db`.newsletter_subscribers (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(150) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $stmt = $pdo->prepare("INSERT IGNORE INTO `$db`.newsletter_subscribers (email) VALUES (:email)");
    $stmt->execute([':email' => $email]);

    echo json_encode(["status" => "success", "message" => "Thank you for subscribing!"]);
} catch (PDOException $e) {
    json_out(["status" => "error", "message" => "Database error", "error" => $e->getMessage()], 500);
}
