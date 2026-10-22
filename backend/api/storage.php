<?php
/**
 * FurniShop Persistent Media Storage Engine
 *
 * Supports:
 * 1. Cloudinary (Recommended for production - zero-dependency, permanent across container restarts)
 * 2. AWS S3 / Cloudflare R2 / S3-compatible Object Storage (Signature V4)
 * 3. Local Filesystem (Development fallback with dynamic origin resolution)
 */

if (!defined('MAX_UPLOAD_BYTES')) {
    define('MAX_UPLOAD_BYTES', 5 * 1024 * 1024); // 5 MB
}

/**
 * Detect the active storage provider based on environment variables.
 */
function furni_get_storage_provider(): string
{
    $cloudUrl   = getenv('CLOUDINARY_URL');
    $cloudName  = getenv('CLOUDINARY_CLOUD_NAME');
    $cloudKey   = getenv('CLOUDINARY_API_KEY');
    $cloudSec   = getenv('CLOUDINARY_API_SECRET');
    $cloudPrest = getenv('CLOUDINARY_UPLOAD_PRESET');

    if ($cloudUrl || ($cloudName && (($cloudKey && $cloudSec) || $cloudPrest))) {
        return 'cloudinary';
    }

    $s3Key    = getenv('AWS_ACCESS_KEY_ID');
    $s3Secret = getenv('AWS_SECRET_ACCESS_KEY');
    $s3Bucket = getenv('AWS_BUCKET');

    if ($s3Key && $s3Secret && $s3Bucket) {
        return 's3';
    }

    return 'local';
}

/**
 * Store an uploaded image into the active persistent storage provider.
 *
 * @param string $tmpFilePath   Path to the uploaded temporary file.
 * @param string $originalName  Original client filename.
 * @param string $folder        Target directory/folder key.
 * @return array{url: string, path: string, provider: string, filename: string, bytes: int}
 */
function furni_store_image(string $tmpFilePath, string $originalName = '', string $folder = 'furnishop/products'): array
{
    if (!is_file($tmpFilePath) || !is_readable($tmpFilePath)) {
        throw new InvalidArgumentException('Uploaded file does not exist or is not readable.');
    }

    $provider = furni_get_storage_provider();

    if ($provider === 'cloudinary') {
        return furni_upload_to_cloudinary($tmpFilePath, $originalName, $folder);
    }

    if ($provider === 's3') {
        return furni_upload_to_s3($tmpFilePath, $originalName, $folder);
    }

    return furni_store_locally($tmpFilePath, $originalName);
}

/**
 * Upload an image to Cloudinary using direct REST API.
 */
function furni_upload_to_cloudinary(string $tmpFilePath, string $originalName = '', string $folder = 'furnishop/products'): array
{
    $cloudName = getenv('CLOUDINARY_CLOUD_NAME');
    $apiKey    = getenv('CLOUDINARY_API_KEY');
    $apiSecret = getenv('CLOUDINARY_API_SECRET');
    $cloudUrl  = getenv('CLOUDINARY_URL');

    if ($cloudUrl && (!$cloudName || !$apiKey || !$apiSecret)) {
        if (preg_match('#^cloudinary://([^:]+):([^@]+)@(.+)$#i', trim($cloudUrl), $matches)) {
            $apiKey    = $matches[1];
            $apiSecret = $matches[2];
            $cloudName = $matches[3];
        }
    }

    if (!$cloudName) {
        throw new RuntimeException('Cloudinary cloud name is missing. Please configure CLOUDINARY_CLOUD_NAME or CLOUDINARY_URL.');
    }

    $endpoint = "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload";
    $timestamp = time();

    $postFields = [
        'timestamp' => (string)$timestamp,
        'folder'    => trim($folder, '/'),
    ];

    $uploadPreset = getenv('CLOUDINARY_UPLOAD_PRESET');
    if ($uploadPreset && (!$apiKey || !$apiSecret)) {
        $postFields['upload_preset'] = $uploadPreset;
    } elseif ($apiKey && $apiSecret) {
        $postFields['api_key'] = $apiKey;

        // Build sorted parameter signature string
        $paramsToSign = [
            'folder'    => $postFields['folder'],
            'timestamp' => $postFields['timestamp'],
        ];
        ksort($paramsToSign);

        $signString = '';
        foreach ($paramsToSign as $k => $v) {
            $signString .= ($signString === '' ? '' : '&') . "$k=$v";
        }
        $signString .= $apiSecret;
        $postFields['signature'] = sha1($signString);
    } else {
        throw new RuntimeException('Cloudinary requires either CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET or CLOUDINARY_UPLOAD_PRESET.');
    }

    $mime = function_exists('mime_content_type') ? mime_content_type($tmpFilePath) : 'image/jpeg';
    if (!$mime) $mime = 'image/jpeg';

    $postFields['file'] = new CURLFile($tmpFilePath, $mime, $originalName ?: basename($tmpFilePath));

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $endpoint,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $postFields,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 45,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $raw = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        throw new RuntimeException("Cloudinary network communication failure: {$curlError}");
    }

    $res = json_decode((string)$raw, true);
    if ($httpCode < 200 || $httpCode >= 300 || empty($res['secure_url'])) {
        $errorDetail = $res['error']['message'] ?? ("HTTP {$httpCode} status received from Cloudinary");
        throw new RuntimeException("Cloudinary upload failed: {$errorDetail}");
    }

    $secureUrl = $res['secure_url'];

    return [
        'url'       => $secureUrl,
        'path'      => $secureUrl,
        'provider'  => 'cloudinary',
        'public_id' => $res['public_id'] ?? '',
        'filename'  => basename((string)parse_url($secureUrl, PHP_URL_PATH)),
        'bytes'     => (int)($res['bytes'] ?? filesize($tmpFilePath)),
    ];
}

/**
 * Upload an image to AWS S3 or S3-compatible service (Cloudflare R2, MinIO, etc.).
 */
function furni_upload_to_s3(string $tmpFilePath, string $originalName = '', string $folder = 'furnishop/products'): array
{
    $accessKey = getenv('AWS_ACCESS_KEY_ID') ?: '';
    $secretKey = getenv('AWS_SECRET_ACCESS_KEY') ?: '';
    $region    = getenv('AWS_REGION') ?: 'us-east-1';
    $bucket    = getenv('AWS_BUCKET') ?: '';
    $endpoint  = getenv('AWS_ENDPOINT') ?: ''; // e.g. https://<account_id>.r2.cloudflarestorage.com

    if (!$accessKey || !$secretKey || !$bucket) {
        throw new RuntimeException('AWS S3 credentials incomplete. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_BUCKET.');
    }

    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION)) ?: 'jpg';
    $filename = 'product-' . time() . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
    $key = trim($folder, '/') . '/' . $filename;

    $content = file_get_contents($tmpFilePath);
    if ($content === false) {
        throw new RuntimeException('Failed to read file content for S3 upload.');
    }

    $mime = function_exists('mime_content_type') ? mime_content_type($tmpFilePath) : 'image/jpeg';
    if (!$mime) $mime = 'image/jpeg';

    $host = $endpoint ? parse_url($endpoint, PHP_URL_HOST) : "{$bucket}.s3.{$region}.amazonaws.com";
    $service = 's3';
    $amzDate = gmdate('Ymd\THis\Z');
    $dateStamp = gmdate('Ymd');

    $payloadHash = hash('sha256', $content);
    $canonicalUri = '/' . ($endpoint ? ($bucket . '/' . $key) : $key);
    $canonicalHeaders = "content-type:{$mime}\nhost:{$host}\nx-amz-content-sha256:{$payloadHash}\nx-amz-date:{$amzDate}\n";
    $signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

    $canonicalRequest = "PUT\n{$canonicalUri}\n\n{$canonicalHeaders}\n{$signedHeaders}\n{$payloadHash}";
    $algorithm = 'AWS4-HMAC-SHA256';
    $credentialScope = "{$dateStamp}/{$region}/{$service}/aws4_request";
    $stringToSign = "{$algorithm}\n{$amzDate}\n{$credentialScope}\n" . hash('sha256', $canonicalRequest);

    $kDate    = hash_hmac('sha256', $dateStamp, 'AWS4' . $secretKey, true);
    $kRegion  = hash_hmac('sha256', $region, $kDate, true);
    $kService = hash_hmac('sha256', $service, $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
    $signature = hash_hmac('sha256', $stringToSign, $kSigning);

    $authorization = "{$algorithm} Credential={$accessKey}/{$credentialScope}, SignedHeaders={$signedHeaders}, Signature={$signature}";

    $url = ($endpoint ? rtrim($endpoint, '/') . '/' . $bucket : "https://{$host}") . '/' . $key;

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_CUSTOMREQUEST  => 'PUT',
        CURLOPT_POSTFIELDS     => $content,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 45,
        CURLOPT_HTTPHEADER     => [
            "Content-Type: {$mime}",
            "Host: {$host}",
            "x-amz-date: {$amzDate}",
            "x-amz-content-sha256: {$payloadHash}",
            "Authorization: {$authorization}",
        ],
    ]);

    $raw = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        throw new RuntimeException("S3 network upload error: {$curlErr}");
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        throw new RuntimeException("S3 upload failed with HTTP {$httpCode}: {$raw}");
    }

    $customDomain = getenv('AWS_S3_CUSTOM_DOMAIN') ?: getenv('AWS_URL');
    $publicUrl = $customDomain ? (rtrim($customDomain, '/') . '/' . $key) : $url;

    return [
        'url'       => $publicUrl,
        'path'      => $publicUrl,
        'provider'  => 's3',
        'public_id' => $key,
        'filename'  => $filename,
        'bytes'     => strlen($content),
    ];
}

/**
 * Store an uploaded file in the local backend/uploads/products/ folder.
 */
function furni_store_locally(string $tmpFilePath, string $originalName = ''): array
{
    $uploadDir = realpath(__DIR__ . '/../uploads/products');
    if ($uploadDir === false) {
        $target = __DIR__ . '/../uploads/products';
        if (!mkdir($target, 0755, true) && !is_dir($target)) {
            throw new RuntimeException('Could not create upload directory: ' . $target);
        }
        $uploadDir = realpath($target);
    }

    // Execution prevention .htaccess in uploads directory
    $htaccessFile = $uploadDir . DIRECTORY_SEPARATOR . '.htaccess';
    if (!file_exists($htaccessFile)) {
        @file_put_contents($htaccessFile, "# Disable PHP execution in upload directory\n<FilesMatch \"\\.(php|phtml|phar|pl|py|jsp|asp|sh|cgi|bat|cmd)$\">\n    Deny from all\n</FilesMatch>\nphp_flag engine off\nOptions -ExecCGI -Indexes\n");
    }

    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION)) ?: 'jpg';
    $filename = 'product-' . time() . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
    $dest = $uploadDir . DIRECTORY_SEPARATOR . $filename;

    if (!copy($tmpFilePath, $dest) && !move_uploaded_file($tmpFilePath, $dest)) {
        throw new RuntimeException('Failed to save uploaded image to local storage directory.');
    }

    @chmod($dest, 0644);

    $relativeUrl = '/backend/uploads/products/' . $filename;
    $fullUrl = furni_resolve_local_url($relativeUrl);

    return [
        'url'       => $fullUrl,
        'path'      => 'backend/uploads/products/' . $filename,
        'provider'  => 'local',
        'public_id' => $filename,
        'filename'  => $filename,
        'bytes'     => (int)filesize($dest),
    ];
}

/**
 * Resolve a local relative path to a fully qualified URL using MEDIA_BASE_URL or server host.
 */
function furni_resolve_local_url(string $relativePath): string
{
    $mediaBase = getenv('MEDIA_BASE_URL') ?: getenv('APP_URL') ?: '';
    if ($mediaBase) {
        return rtrim($mediaBase, '/') . '/' . ltrim($relativePath, '/');
    }

    $host = $_SERVER['HTTP_HOST'] ?? '';
    if ($host) {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        return "{$scheme}://{$host}/" . ltrim($relativePath, '/');
    }

    return '/' . ltrim($relativePath, '/');
}
