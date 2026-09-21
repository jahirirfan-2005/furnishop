<?php
/**
 * Product image upload endpoint (admin).
 *
 * POST multipart/form-data with one or more "image" (or "image[]") file fields.
 * Multiple files are stored in the order received, so the response `paths`
 * array maps 1:1 to the order of files sent.
 *
 * Rules:
 *   - Only JPG, JPEG, PNG and WEBP are allowed (checked by extension, MIME and
 *     real image content via getimagesize).
 *   - Max size 5 MB per file.
 *   - Executable content is rejected; PHP files cannot pass the extension or
 *     content checks, and uploads are served as static files only.
 *   - Stored under backend/uploads/products/ with a safe unique filename.
 *
 * Response: { status: "success", success: true, data: { urls: [...], paths: [...] } }
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    api_error('Method not allowed', 405);
}

define('MAX_UPLOAD_BYTES', 5 * 1024 * 1024); // 5 MB
$allowedExt  = ['jpg', 'jpeg', 'png', 'webp'];
$allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

$uploadDir = realpath(__DIR__ . '/../uploads/products');
if ($uploadDir === false) {
    $target = __DIR__ . '/../uploads/products';
    if (!mkdir($target, 0775, true)) {
        api_error('Could not create upload directory', 500);
    }
    $uploadDir = realpath($target);
}

$results = [];
$files = $_FILES['image'] ?? $_FILES['image[]'] ?? null;

// Normalize the $_FILES structure for single or multiple uploads.
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

foreach ($entries as $f) {
    if (!isset($f['error']) || $f['error'] !== UPLOAD_ERR_OK) {
        api_error(match ($f['error'] ?? -1) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File is too large (server limit)',
            UPLOAD_ERR_NO_FILE => 'No file received',
            default => 'File upload failed (code ' . ($f['error'] ?? '?') . ')',
        }, 422);
    }

    if ($f['size'] > MAX_UPLOAD_BYTES) {
        api_error('Image is larger than 5 MB', 422);
    }

    $origName = $f['name'] ?? '';
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) {
        // Special case: reject anything that smells executable right away.
        if (preg_match('/\.(php\d?|phtml|phar|asp|aspx|jsp|exe|sh|bat|cmd)$/i', $origName)) {
            api_error('Executable files are not allowed', 422);
        }
        api_error('Invalid file type. Only JPG, JPEG, PNG and WEBP images are allowed', 422);
    }

    // Verify real image content (also rejects renamed scripts).
    $info = @getimagesize($f['tmp_name']);
    if ($info === false || !in_array($info['mime'], $allowedMime, true)) {
        api_error('File content is not a valid image', 422);
    }

    // Safe unique filename: slug prefix + timestamp + random, no user text.
    $safeBase = strtolower(preg_replace("/[^a-zA-Z0-9]+/", '-', pathinfo($origName, PATHINFO_FILENAME)));
    $safeBase = substr(trim($safeBase, '-'), 0, 40);
    $filename = ($safeBase ?: 'product') . '-' . time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    $dest = $uploadDir . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($f['tmp_name'], $dest)) {
        api_error('Failed to save the uploaded image', 500);
    }

    $results[] = [
        'file'    => $filename,
        'path'    => 'backend/uploads/products/' . $filename,
        'url'     => '/backend/uploads/products/' . $filename,
    ];
}

api_success([
    'urls'  => array_column($results, 'url'),
    'paths' => array_column($results, 'path'),
    'files' => $results,
], 'Image uploaded successfully');
