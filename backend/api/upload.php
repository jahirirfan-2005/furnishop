<?php
/**
 * FurniShop Product Image Upload Endpoint
 *
 * Security & Reliability:
 * - Requires administrator authentication (Bearer token or session).
 * - Enforces strict file extension whitelist (jpg, jpeg, png, webp).
 * - Rejects multiple extensions, double dots, or directory traversal attempts.
 * - Inspects actual image headers with getimagesize() and fileinfo MIME verification.
 * - Stores files permanently via active persistent storage provider (Cloudinary, AWS S3, or local fallback).
 * - Caps files at 5 MB per image with clear user-friendly error messages.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/storage.php';
/** @var PDO $pdo */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    api_error('Method not allowed', 405);
}

// 1. Enforce Administrator Authentication
require_admin_auth($pdo);

$allowedExt  = ['jpg', 'jpeg', 'png', 'webp'];
$allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

$files = $_FILES['image'] ?? $_FILES['image[]'] ?? null;
$entries = [];

if (is_array($files['name'] ?? null)) {
    foreach ($files['name'] as $i => $n) {
        $entries[] = [
            'name'     => $files['name'][$i],
            'type'     => $files['type'][$i],
            'tmp_name' => $files['tmp_name'][$i],
            'error'    => $files['error'][$i],
            'size'     => $files['size'][$i],
        ];
    }
} elseif ($files) {
    $entries[] = $files;
}

if (!$entries) {
    api_error('No file received. Please provide an image file using multipart/form-data with the "image" field.', 422);
}

$results = [];

foreach ($entries as $f) {
    if (!isset($f['error']) || $f['error'] !== UPLOAD_ERR_OK) {
        $msg = match ($f['error'] ?? -1) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'Image file exceeds maximum 5 MB upload limit.',
            UPLOAD_ERR_PARTIAL => 'Image file was only partially uploaded. Please try again.',
            UPLOAD_ERR_NO_FILE => 'No image file was received.',
            default => 'File upload failed with error code ' . ($f['error'] ?? 'unknown'),
        };
        api_error($msg, 422);
    }

    if ($f['size'] > MAX_UPLOAD_BYTES || $f['size'] <= 0) {
        api_error('Image must be between 1 byte and 5 MB in size.', 422);
    }

    $origName = basename($f['name'] ?? '');

    // Prevent double extensions like file.php.jpg or file.phtml.png
    if (preg_match('/\.(php\d?|phtml|phar|asp|aspx|jsp|exe|sh|bat|cmd|cgi|pl)\./i', $origName)) {
        api_error('Suspicious or prohibited filename structure detected.', 422);
    }

    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) {
        api_error('Invalid file extension. Only JPG, JPEG, PNG, and WEBP images are accepted.', 422);
    }

    // Verify real image dimensions and content when possible
    $info = @getimagesize($f['tmp_name']);
    if ($info !== false && !in_array($info['mime'], $allowedMime, true)) {
        api_error('File content is not a recognized valid image format (JPG, PNG, WEBP).', 422);
    }

    // Double-check MIME with FileInfo if available
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $realMime = finfo_file($finfo, $f['tmp_name']);
        finfo_close($finfo);
        if ($realMime && !in_array($realMime, $allowedMime, true)) {
            api_error('Image signature validation failed. Please upload a genuine JPG, PNG, or WEBP image.', 422);
        }
    }

    // Store through active storage engine (Cloudinary, S3, or Local)
    try {
        $stored = furni_store_image($f['tmp_name'], $origName);
        $results[] = $stored;
    } catch (Throwable $e) {
        error_log('[FurniShop Storage Error] ' . $e->getMessage());
        api_error('Failed to store image: ' . $e->getMessage(), 500);
    }
}

$provider = $results[0]['provider'] ?? furni_get_storage_provider();

api_success([
    'urls'             => array_column($results, 'url'),
    'paths'            => array_column($results, 'path'),
    'files'            => $results,
    'storage_provider' => $provider,
], 'Image uploaded successfully to ' . ucfirst($provider) . ' storage');
