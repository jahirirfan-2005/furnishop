<?php
/**
 * FurniShop Backend Health Check Endpoint.
 *
 * Verifies:
 * - PHP server availability and version
 * - MariaDB/MySQL database connection and query readiness
 * - Database name, host, port, and key table counts
 *
 * Response:
 * HTTP 200: All services operational
 * HTTP 503: Database or dependent service unavailable
 */

require_once __DIR__ . '/config.php';
/** @var PDO $pdo */

$response = [
    'server'    => 'FurniShop API',
    'status'    => 'healthy',
    'timestamp' => time(),
    'services'  => [
        'php'      => [
            'status'  => 'online',
            'version' => PHP_VERSION,
        ],
        'database' => [
            'status'   => 'unknown',
            'host'     => getenv('DB_HOST') ?: '127.0.0.1',
            'port'     => (int)(getenv('DB_PORT') ?: 3307),
            'database' => getenv('DB_NAME') ?: 'furnishop',
        ],
    ],
];

try {
    // 1. Verify DB query capability
    $stmt = $pdo->query("SELECT 1 AS alive");
    $result = $stmt ? $stmt->fetch() : null;

    if (!$result || ($result['alive'] ?? 0) != 1) {
        throw new Exception("Database ping returned unexpected response");
    }

    // 2. Fetch server version and basic counts
    $dbVersion = $pdo->query("SELECT VERSION()")->fetchColumn();
    $productCount = (int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $categoryCount = (int)$pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    $adminCount = (int)$pdo->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();

    $response['services']['database']['status'] = 'connected';
    $response['services']['database']['version'] = $dbVersion;
    $response['services']['database']['stats'] = [
        'products'    => $productCount,
        'categories'  => $categoryCount,
        'admin_users' => $adminCount,
    ];

    api_success($response, 'FurniShop backend and database are fully operational', 200);

} catch (Throwable $e) {
    error_log('[FurniShop Health Check Error] ' . $e->getMessage());
    $response['status'] = 'degraded';
    $response['services']['database']['status'] = 'disconnected';
    $response['services']['database']['error'] = $e->getMessage();

    json_out([
        'status'  => 'error',
        'success' => false,
        'message' => 'Database service unavailable: ' . $e->getMessage(),
        'data'    => $response
    ], 503);
}
