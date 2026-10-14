<?php
/**
 * CLI utility to securely provision an Administrator account.
 *
 * Usage:
 *   php backend/create_admin.php <username> <email> <password>
 */

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "This utility can only be run from the command line.\n";
    exit(1);
}

require_once __DIR__ . '/api/config.php';
/** @var PDO $pdo */

$username = $argv[1] ?? '';
$email    = $argv[2] ?? '';
$password = $argv[3] ?? '';

if (!$username || !$email || !$password) {
    echo "=== FurniShop Admin Provisioning Tool ===\n";
    echo "Usage: php backend/create_admin.php <username> <email> <password>\n";
    echo "Example: php backend/create_admin.php admin admin@furnishop.com LuxuryStore2026!\n";
    exit(1);
}

if (strlen($username) < 3 || !preg_match('/^[a-zA-Z0-9_\-\.]+$/', $username)) {
    fwrite(STDERR, "ERROR: Username must be at least 3 characters (alphanumeric, underscore, dash only).\n");
    exit(1);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "ERROR: Invalid email format.\n");
    exit(1);
}

if (strlen($password) < 8) {
    fwrite(STDERR, "ERROR: Password must be at least 8 characters long for production security.\n");
    exit(1);
}

$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

try {
    $stmt = $pdo->prepare(
        "INSERT INTO admin_users (username, email, password_hash, role)
         VALUES (:uname, :email, :hash, 'admin')
         ON DUPLICATE KEY UPDATE password_hash = :hash2, email = :email2"
    );
    $stmt->execute([
        ':uname'  => $username,
        ':email'  => $email,
        ':hash'   => $hash,
        ':hash2'  => $hash,
        ':email2' => $email
    ]);

    echo "SUCCESS: Administrator '$username' ($email) has been provisioned successfully.\n";
} catch (PDOException $e) {
    fwrite(STDERR, "ERROR: Could not create admin: " . $e->getMessage() . "\n");
    exit(1);
}
