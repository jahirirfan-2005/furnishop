<?php
/**
 * FurniShop API Bootstrap & Security Gateway.
 *
 * Provides:
 * - Dynamic origin-validated CORS (no wildcard when credentialed)
 * - Hardened PHP session settings (HttpOnly, SameSite, Secure)
 * - Safe environment variable loading
 * - PDO database connection with prepared statement enforcement
 * - Bearer token & session-based Administrator Authentication
 * - Rate limiting against brute-force attacks
 * - Standardized JSON envelopes that never leak database internals
 */

// Load backend/.env into the environment when present
$envFile = dirname(__DIR__) . '/.env';
if (is_file($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if ($key !== '' && getenv($key) === false) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

/*
|--------------------------------------------------------------------------
| Dynamic CORS & Security Headers
|--------------------------------------------------------------------------
*/
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8001',
    'http://127.0.0.1:8001',
];

$configuredOrigin = getenv('ALLOWED_ORIGIN');
if ($configuredOrigin) {
    foreach (explode(',', $configuredOrigin) as $customOrigin) {
        $customOrigin = trim($customOrigin);
        if ($customOrigin !== '' && !in_array($customOrigin, $allowedOrigins, true)) {
            $allowedOrigins[] = $customOrigin;
        }
    }
}

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($requestOrigin && in_array($requestOrigin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $requestOrigin");
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin");
} else {
    // For non-credentialed / direct same-origin requests
    header("Access-Control-Allow-Origin: " . ($allowedOrigins[0] ?? '*'));
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token");
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("X-XSS-Protection: 1; mode=block");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit();
}

/*
|--------------------------------------------------------------------------
| Hardened Session Configuration
|--------------------------------------------------------------------------
*/
function furni_session_start(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['SERVER_PORT'] ?? 0) === 443);
        session_set_cookie_params([
            'lifetime' => 86400, // 24 hours
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isSecure,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        session_start();
    }
}

/*
|--------------------------------------------------------------------------
| Database Connection (PDO)
|--------------------------------------------------------------------------
*/
$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3307';
$db   = getenv('DB_NAME') ?: 'furnishop';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    // If database missing, attempt creation
    try {
        $rootDsn = "mysql:host=$host;port=$port;charset=$charset";
        $pdoRoot = new PDO($rootDsn, $user, $pass, $options);
        $pdoRoot->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $schema = __DIR__ . '/../schema.sql';
        if (is_file($schema)) {
            $pdoRoot->exec(file_get_contents($schema));
        }
        $pdo = new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $inner) {
        error_log('[FurniShop API] DB connection failed: ' . $inner->getMessage());
        http_response_code(500);
        echo json_encode([
            "status"  => "error",
            "success" => false,
            "message" => "Database service unavailable. Please check server logs.",
        ]);
        exit();
    }
}

/*
|--------------------------------------------------------------------------
| Response & Envelope Helpers
|--------------------------------------------------------------------------
*/
function json_out(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
}

function api_success(mixed $data = null, string $message = 'success', int $code = 200): void
{
    json_out([
        'status'  => 'success',
        'success' => true,
        'message' => $message,
        'data'    => $data,
    ], $code);
}

function api_error(string $message, int $code = 400): void
{
    json_out([
        'status'  => 'error',
        'success' => false,
        'message' => $message,
    ], $code);
}

function request_data(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (is_array($data)) {
        return $data;
    }
    return $_POST ?: [];
}

/*
|--------------------------------------------------------------------------
| Authentication Helpers (Bearer Token + Session Support)
|--------------------------------------------------------------------------
*/
function get_bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if ($header && preg_match('/Bearer\s+([a-f0-9]{32,128})/i', $header, $matches)) {
        return $matches[1];
    }
    return null;
}

function get_client_ip(): string
{
    return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

/**
 * Validates whether the incoming request is from an authenticated admin.
 * Returns the admin row or null.
 */
function get_authenticated_admin(PDO $pdo): ?array
{
    // 1. Check Bearer Token
    $token = get_bearer_token();
    if ($token) {
        $tokenHash = hash('sha256', $token);
        $stmt = $pdo->prepare(
            "SELECT u.id, u.username, u.email, u.role, t.expires_at
             FROM admin_tokens t
             JOIN admin_users u ON u.id = t.user_id
             WHERE t.token_hash = :hash AND t.expires_at > NOW()
             LIMIT 1"
        );
        $stmt->execute([':hash' => $tokenHash]);
        $row = $stmt->fetch();
        if ($row) {
            return [
                'id'       => (int)$row['id'],
                'username' => $row['username'],
                'email'    => $row['email'],
                'role'     => $row['role']
            ];
        }
    }

    // 2. Check Session
    furni_session_start();
    if (!empty($_SESSION['admin_user_id'])) {
        $stmt = $pdo->prepare("SELECT id, username, email, role FROM admin_users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => (int)$_SESSION['admin_user_id']]);
        $row = $stmt->fetch();
        if ($row) {
            return [
                'id'       => (int)$row['id'],
                'username' => $row['username'],
                'email'    => $row['email'],
                'role'     => $row['role']
            ];
        }
    }

    return null;
}

/**
 * Enforces admin authentication; aborts with HTTP 401 if unauthorized.
 */
function require_admin_auth(PDO $pdo): array
{
    $admin = get_authenticated_admin($pdo);
    if (!$admin) {
        api_error('Administrator authentication required', 401);
    }
    return $admin;
}

/**
 * Rate limiting check (e.g., login attempts).
 */
function check_rate_limit(PDO $pdo, string $ip, string $username, int $maxAttempts = 5, int $windowSeconds = 900): bool
{
    $threshold = time() - $windowSeconds;
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) FROM login_attempts
         WHERE (ip_address = :ip OR username = :uname) AND success = 0 AND attempt_time > :thresh"
    );
    $stmt->execute([
        ':ip'     => $ip,
        ':uname'  => $username,
        ':thresh' => $threshold
    ]);
    $failures = (int)$stmt->fetchColumn();
    return $failures < $maxAttempts;
}

function record_login_attempt(PDO $pdo, string $ip, string $username, bool $success): void
{
    $stmt = $pdo->prepare(
        "INSERT INTO login_attempts (ip_address, username, attempt_time, success)
         VALUES (:ip, :uname, :time, :success)"
    );
    $stmt->execute([
        ':ip'      => $ip,
        ':uname'   => $username,
        ':time'    => time(),
        ':success' => $success ? 1 : 0
    ]);
}

/*
|--------------------------------------------------------------------------
| Product Formatting Helpers
|--------------------------------------------------------------------------
*/
function cast_product(array $p): array
{
    foreach (['id', 'category_id', 'reviews_count', 'stock_quantity', 'has_offer', 'is_featured', 'is_trending'] as $k) {
        if (isset($p[$k])) $p[$k] = (int)$p[$k];
    }
    if (array_key_exists('collection_id', $p)) {
        $p['collection_id'] = $p['collection_id'] === null ? null : (int)$p['collection_id'];
    }
    foreach (['price', 'original_price', 'discount_price', 'rating'] as $k) {
        if (isset($p[$k]) && $p[$k] !== null) $p[$k] = (float)$p[$k];
    }

    $p['in_stock'] = ($p['stock_status'] ?? 'In Stock') !== 'Out of Stock' && ($p['stock_quantity'] ?? 1) > 0;

    if (array_key_exists('additional_images', $p)) {
        $decoded = json_decode($p['additional_images'] ?? '', true);
        $p['additional_images_arr'] = is_array($decoded) ? $decoded : [];
    }

    return $p;
}

function make_slug(PDO $pdo, string $name, string $table, int $ignoreId = 0): string
{
    $base = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $name), '-'));
    if ($base === '') {
        $base = 'product-' . time();
    }
    $slug = $base;
    $i = 2;
    while (true) {
        $stmt = $pdo->prepare("SELECT id FROM $table WHERE slug = :slug AND id != :id LIMIT 1");
        $stmt->execute([':slug' => $slug, ':id' => $ignoreId]);
        if (!$stmt->fetch()) {
            return $slug;
        }
        $slug = $base . '-' . $i++;
    }
}
