<?php
/**
 * Product Image Upload Endpoint.
 *
 * Security:
 * - Requires administrator authentication (Bearer token or session).
 * - Enforces strict file extension whitelist (jpg, jpeg, png, webp).
 * - Rejects multiple extensions, double dots, or directory traversal attempts.
 * - Inspects actual image headers with getimagesize() and fileinfo MIME verification.
 * - Generates cryptographically randomized filenames; user names are never used in destination paths.
 * - Caps files at 5 MB per image.
 */

require_once __DIR__ . '/config.php';
/** @var PDO $pdo */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    api_error('Method not allowed', 405);
}

// 1. Enforce Administrator Authentication
require_admin_auth($pdo);

define('MAX_UPLOAD_BYTES', 5 * 1024 * 1024); // 5 MB
$allowedExt  = ['jpg', 'jpeg', 'png', 'webp'];
$allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

$uploadDir = realpath(__DIR__ . '/../uploads/products');
if ($uploadDir === false) {
    $target = __DIR__ . '/../uploads/products';
    if (!mkdir($target, 0755, true)) {
        api_error('Could not create upload directory', 500);
    }
    $uploadDir = realpath($target);
}

// Ensure .htaccess execution prevention file exists in uploads folder
$htaccessFile = $uploadDir . DIRECTORY_SEPARATOR . '.htaccess';
if (!file_exists($htaccessFile)) {
    @file_put_contents($htaccessFile, "# Disable PHP execution in upload directory\n<FilesMatch \"\\.(php|phtml|phar|pl|py|jsp|asp|sh|cgi|bat|cmd)$\">\n    Deny from all\n</FilesMatch>\nphp_flag engine off\nOptions -ExecCGI -Indexes\n");
}

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
    api_error('No file received. Send multipart/form-data with an "image" file field.', 422);
}

$results = [];

foreach ($entries as $f) {
    if (!isset($f['error']) || $f['error'] !== UPLOAD_ERR_OK) {
        api_error(match ($f['error'] ?? -1) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File exceeds maximum upload limit',
            UPLOAD_ERR_NO_FILE => 'No file received',
            default => 'File upload failed',
        }, 422);
    }

    if ($f['size'] > MAX_UPLOAD_BYTES || $f['size'] <= 0) {
        api_error('Image must be between 1 byte and 5 MB in size', 422);
    }

    $origName = basename($f['name'] ?? '');

    // Prevent double extensions like file.php.jpg or file.phtml.png
    if (preg_match('/\.(php\d?|phtml|phar|asp|aspx|jsp|exe|sh|bat|cmd|cgi|pl)\./i', $origName)) {
        api_error('Suspicious or prohibited filename structure detected', 422);
    }

    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) {
        api_error('Invalid file extension. Only JPG, JPEG, PNG, and WEBP images are allowed.', 422);
    }

    // Verify real image dimensions and content
    $info = @getimagesize($f['tmp_name']);
    if ($info === false || !in_array($info['mime'], $allowedMime, true)) {
        api_error('File content is not a valid image format.', 422);
    }

    // Double-check MIME with FileInfo if available
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $realMime = finfo_file($finfo, $f['tmp_name']);
        finfo_close($finfo);
        if (!in_array($realMime, $allowedMime, true)) {
            api_error('Image signature validation failed.', 422);
        }
    }

    // Safe unique filename: purely random hex - no user-controlled path segments
    $filename = 'product-' . time() . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
    $dest = $uploadDir . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($f['tmp_name'], $dest)) {
        error_log('[FurniShop Upload] move_uploaded_file failed for destination: ' . $dest);
        api_error('Failed to save the uploaded image securely', 500);
    }

    // Set safe permissions on saved image (read-only for group/others)
    @chmod($dest, 0644);

    $results[] = [
        'file' => $filename,
        'path' => 'backend/uploads/products/' . $filename,
        'url'  => '/backend/uploads/products/' . $filename,
    ];
}

api_success([
    'urls'  => array_column($results, 'url'),
    'paths' => array_column($results, 'path'),
    'files' => $results,
], 'Image uploaded successfully');
