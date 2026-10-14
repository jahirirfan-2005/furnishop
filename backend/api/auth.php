<?php
/**
 * FurniShop Administrator Authentication API.
 *
 * Endpoints:
 * - GET  ?action=status      -> Check if store has configured an administrator
 * - POST ?action=login       -> Authenticate with username/email & password
 * - POST ?action=logout      -> Revoke active session / bearer token
 * - GET  ?action=me          -> Get current authenticated admin profile
 * - POST ?action=init_admin  -> One-time initial setup (LOCKED once any admin exists)
 */

require_once __DIR__ . '/config.php';
/** @var PDO $pdo */

$action = $_GET['action'] ?? 'status';
$method = $_SERVER['REQUEST_METHOD'];
$ip = get_client_ip();

try {
    // -------------------------------------------------------------------------
    // GET ?action=status (Public: tells UI if setup is needed)
    // -------------------------------------------------------------------------
    if ($action === 'status' && $method === 'GET') {
        $count = (int)$pdo->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();
        api_success([
            'has_admin'    => $count > 0,
            'is_logged_in' => get_authenticated_admin($pdo) !== null
        ], 'Auth status retrieved');
    }

    // -------------------------------------------------------------------------
    // POST ?action=init_admin (Strictly one-time; permanently disabled once 1 admin exists)
    // -------------------------------------------------------------------------
    if ($action === 'init_admin' && $method === 'POST') {
        $count = (int)$pdo->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();
        if ($count > 0) {
            api_error('Administrator account already configured. Initial setup is locked.', 403);
        }

        $d = request_data();
        $username = trim($d['username'] ?? '');
        $email    = trim($d['email'] ?? '');
        $password = $d['password'] ?? '';

        if (strlen($username) < 3 || !preg_match('/^[a-zA-Z0-9_\-\.]+$/', $username)) {
            api_error('Username must be at least 3 characters and contain only letters, numbers, underscores, or dashes', 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            api_error('A valid email address is required', 422);
        }
        if (strlen($password) < 8) {
            api_error('Password must be at least 8 characters long for production security', 422);
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        $stmt = $pdo->prepare(
            "INSERT INTO admin_users (username, email, password_hash, role)
             VALUES (:uname, :email, :hash, 'admin')"
        );
        $stmt->execute([
            ':uname' => $username,
            ':email' => $email,
            ':hash'  => $passwordHash
        ]);

        $newId = (int)$pdo->lastInsertId();

        // Auto-create token for immediate login
        $rawToken = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $rawToken);
        $expiresAt = date('Y-m-d H:i:s', time() + 86400);

        $tStmt = $pdo->prepare(
            "INSERT INTO admin_tokens (user_id, token_hash, expires_at)
             VALUES (:uid, :thash, :exp)"
        );
        $tStmt->execute([
            ':uid'   => $newId,
            ':thash' => $tokenHash,
            ':exp'   => $expiresAt
        ]);

        furni_session_start();
        session_regenerate_id(true);
        $_SESSION['admin_user_id'] = $newId;

        api_success([
            'token'      => $rawToken,
            'expires_at' => $expiresAt,
            'user'       => [
                'id'       => $newId,
                'username' => $username,
                'email'    => $email,
                'role'     => 'admin'
            ]
        ], 'Administrator account configured successfully', 201);
    }

    // -------------------------------------------------------------------------
    // POST ?action=login
    // -------------------------------------------------------------------------
    if ($action === 'login' && $method === 'POST') {
        $d = request_data();
        $identifier = trim($d['username'] ?? $d['email'] ?? '');
        $password   = $d['password'] ?? '';

        if ($identifier === '' || $password === '') {
            api_error('Username/email and password are required', 422);
        }

        // Rate limiting check
        if (!check_rate_limit($pdo, $ip, $identifier, 5, 900)) {
            api_error('Too many failed login attempts. Account temporarily locked for 15 minutes.', 429);
        }

        // Query user by username or email
        $stmt = $pdo->prepare(
            "SELECT id, username, email, password_hash, role FROM admin_users
             WHERE username = :id1 OR email = :id2 LIMIT 1"
        );
        $stmt->execute([':id1' => $identifier, ':id2' => $identifier]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            record_login_attempt($pdo, $ip, $identifier, false);
            api_error('Invalid username or password', 401);
        }

        // Successful login
        record_login_attempt($pdo, $ip, $identifier, true);

        // Update last login timestamp
        $up = $pdo->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = :id");
        $up->execute([':id' => $user['id']]);

        // Generate Bearer token
        $rawToken = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $rawToken);
        $expiresAt = date('Y-m-d H:i:s', time() + 86400); // 24 hours

        $tStmt = $pdo->prepare(
            "INSERT INTO admin_tokens (user_id, token_hash, expires_at)
             VALUES (:uid, :thash, :exp)"
        );
        $tStmt->execute([
            ':uid'   => (int)$user['id'],
            ':thash' => $tokenHash,
            ':exp'   => $expiresAt
        ]);

        // Set session
        furni_session_start();
        session_regenerate_id(true);
        $_SESSION['admin_user_id'] = (int)$user['id'];

        api_success([
            'token'      => $rawToken,
            'expires_at' => $expiresAt,
            'user'       => [
                'id'       => (int)$user['id'],
                'username' => $user['username'],
                'email'    => $user['email'],
                'role'     => $user['role']
            ]
        ], 'Login successful');
    }

    // -------------------------------------------------------------------------
    // POST ?action=logout
    // -------------------------------------------------------------------------
    if ($action === 'logout' && $method === 'POST') {
        $token = get_bearer_token();
        if ($token) {
            $tokenHash = hash('sha256', $token);
            $del = $pdo->prepare("DELETE FROM admin_tokens WHERE token_hash = :thash");
            $del->execute([':thash' => $tokenHash]);
        }

        furni_session_start();
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();

        api_success(null, 'Logged out successfully');
    }

    // -------------------------------------------------------------------------
    // GET ?action=me
    // -------------------------------------------------------------------------
    if ($action === 'me' && $method === 'GET') {
        $admin = require_admin_auth($pdo);
        api_success($admin, 'Authenticated admin profile');
    }

    api_error('Invalid action or method not allowed', 405);

} catch (PDOException $e) {
    error_log('[FurniShop Auth] PDOException: ' . $e->getMessage());
    api_error('Authentication service error', 500);
} catch (Throwable $e) {
    error_log('[FurniShop Auth] Throwable: ' . $e->getMessage());
    api_error('Authentication service error', 500);
}
