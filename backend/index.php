<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'service'     => 'FurniShop PHP API Gateway',
    'status'      => 'online',
    'healthCheck' => '/backend/api/health.php',
    'productsApi' => '/backend/api/products.php',
    'categories'  => '/backend/api/categories.php',
    'collections' => '/backend/api/collections.php',
    'timestamp'   => time()
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
