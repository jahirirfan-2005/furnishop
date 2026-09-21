<?php
/**
 * FurniShop API bootstrap.
 *
 * Shared CORS handling, PDO database connection (credentials come from
 * environment variables - never hardcoded) and helpers used by every endpoint.
 *
 * Frontend code must NEVER contain DB credentials; it only talks to this API.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/*
|--------------------------------------------------------------------------
| Database Configuration
|--------------------------------------------------------------------------
| Local project MariaDB instance (XAMPP binaries) on port 3307 by default.
| Override any value with environment variables: DB_HOST, DB_PORT, DB_NAME,
| DB_USER, DB_PASS. Copy backend/.env.example to backend/.env to change them.
|--------------------------------------------------------------------------
*/

// Load backend/.env into the environment when present (the PHP built-in
// server does not read .env files itself).
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

$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3307';
$db   = getenv('DB_NAME') ?: 'furnishop';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    try {
        $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=$charset", $user, $pass, $options);
    } catch (PDOException $inner) {
        // Database may not exist yet - create it, load the schema, reconnect.
        $pdoRoot = new PDO($dsn, $user, $pass, $options);
        $pdoRoot->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $schema = __DIR__ . '/../schema.sql';
        if (is_file($schema)) {
            $sql = file_get_contents($schema);
            $pdoRoot->exec($sql);
        }
        $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=$charset", $user, $pass, $options);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "success" => false,
        "message" => "Database connection failed",
    ]);
    error_log('[FurniShop API] DB connection failed: ' . $e->getMessage());
    exit();
}

/** Send a JSON response and stop. */
function json_out($payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload);
    exit();
}

/** Standard success envelope (both "status" and "success" keys for compatibility). */
function api_success($data, string $message = 'success', int $code = 200): void
{
    json_out([
        'status'  => 'success',
        'success' => true,
        'message' => $message,
        'data'    => $data,
    ], $code);
}

/** Standard error envelope - never leaks SQL or internal error details. */
function api_error(string $message, int $code = 400): void
{
    json_out([
        'status'  => 'error',
        'success' => false,
        'message' => $message,
    ], $code);
}

/** Decode the JSON request body (with form-data fallback). */
function request_data(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (is_array($data)) {
        return $data;
    }
    return $_POST ?: [];
}

/**
 * Convert a DB product row's numeric/flag columns into the shapes the
 * frontend expects, and expose computed fields for the product UI.
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

    // Legacy flag aliases so old consumers keep working.
    $p['in_stock'] = ($p['stock_status'] ?? 'In Stock') !== 'Out of Stock' && ($p['stock_quantity'] ?? 1) > 0;

    // Split the additional_images JSON column into an array for the frontend.
    if (array_key_exists('additional_images', $p)) {
        $decoded = json_decode($p['additional_images'] ?? '', true);
        $p['additional_images_arr'] = is_array($decoded) ? $decoded : [];
    }

    return $p;
}

/** Build a URL-safe unique slug from a product name. */
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

/**
 * Make sure the products table carries the newer columns. Runs the migration
 * SQL once per request only when columns are actually missing (cheap check).
 */
function ensure_product_schema(PDO $pdo): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $cols = $pdo->query("SHOW COLUMNS FROM products")->fetchAll(PDO::FETCH_COLUMN);
    $needed = ['slug', 'discount_price', 'stock_quantity', 'additional_images', 'color', 'status', 'offer_end_time'];
    if (count(array_diff($needed, $cols)) > 0) {
        $sqlFile = __DIR__ . '/../migration_add_product_fields.sql';
        if (is_file($sqlFile)) {
            $pdo->exec(file_get_contents($sqlFile));
        }
    }
    $done = true;
}
