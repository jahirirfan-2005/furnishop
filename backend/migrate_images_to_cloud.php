<?php
/**
 * FurniShop - Production Image Repair & Cloud Migration Tool
 *
 * Scans all product records in MariaDB.
 * - Detects local relative paths (/backend/uploads/products/...)
 * - If cloud storage (Cloudinary or AWS S3) is configured, automatically uploads the local file
 *   to persistent cloud storage and updates the MariaDB record with the permanent HTTPS URL.
 * - Reports any missing or broken image references without deleting products.
 * - Refreshes the fallback catalog snapshot (products_fallback.json).
 *
 * Usage:
 *   php backend/migrate_images_to_cloud.php [--force]
 */

require_once __DIR__ . '/api/config.php';
require_once __DIR__ . '/api/storage.php';
/** @var PDO $pdo */

$isCli = (php_sapi_name() === 'cli');

function log_line(string $msg): void {
    echo $msg . PHP_EOL;
}

log_line("==================================================================");
log_line("  FurniShop Production Image Repair & Cloud Migration");
log_line("==================================================================");

$provider = furni_get_storage_provider();
log_line("Active Storage Provider: " . strtoupper($provider));
if ($provider === 'local') {
    log_line("NOTE: Cloud storage credentials (Cloudinary or AWS S3) are not currently configured.");
    log_line("Local image paths will be verified on disk. Configure CLOUDINARY_* in backend/.env to migrate to permanent cloud storage.");
} else {
    log_line("Local images will be uploaded to " . strtoupper($provider) . " and database records updated permanently.");
}
log_line("------------------------------------------------------------------");

$uploadDir = realpath(__DIR__ . '/uploads/products');
if (!$uploadDir) {
    $uploadDir = __DIR__ . '/uploads/products';
}

$stmt = $pdo->query("SELECT id, name, sku, image, back_image, additional_images, status FROM products ORDER BY id ASC");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

log_line("Total products in database: " . count($products));
log_line("");

$stats = [
    'total'         => count($products),
    'already_cloud' => 0,
    'migrated'      => 0,
    'local_intact'  => 0,
    'missing_files' => [],
    'corrupted'     => 0,
];

foreach ($products as $prod) {
    $id    = (int)$prod['id'];
    $name  = $prod['name'];
    $sku   = $prod['sku'];
    $image = trim($prod['image'] ?? '');
    $back  = trim($prod['back_image'] ?? '');

    $needsUpdate = false;
    $newImage = $image;
    $newBack  = $back;

    // Helper to process an image string
    $processField = function(string $imgField, string $fieldLabel) use ($id, $name, $sku, $uploadDir, $provider, &$stats, &$needsUpdate): string {
        if ($imgField === '') return $imgField;

        // Check if already an absolute HTTP/HTTPS URL
        if (preg_match('#^https?://#i', $imgField)) {
            // Verify if it has string corruption (e.g. descriptive text mistakenly inserted inside URL)
            if (preg_match('#https?://ima[a-zA-Z\s]+unsplash\.com#i', $imgField)) {
                $fixed = preg_replace('#https?://ima[a-zA-Z\s]+unsplash\.com#i', 'https://images.unsplash.com', $imgField);
                log_line("  [REPAIRED URL] Product #{$id} ({$name}) {$fieldLabel} had corrupted URL. Restored.");
                $stats['corrupted']++;
                $needsUpdate = true;
                return $fixed;
            }
            return $imgField;
        }

        // It is a local / relative path
        $basename = basename($imgField);
        $localPath = $uploadDir . DIRECTORY_SEPARATOR . $basename;

        if (is_file($localPath)) {
            if ($provider !== 'local') {
                try {
                    $stored = furni_store_image($localPath, $basename, 'furnishop/products');
                    log_line("  [MIGRATED] Product #{$id} ({$name}) {$fieldLabel} -> {$stored['url']}");
                    $stats['migrated']++;
                    $needsUpdate = true;
                    return $stored['url'];
                } catch (Throwable $e) {
                    log_line("  [ERROR] Failed to upload {$basename} for product #{$id}: " . $e->getMessage());
                    return $imgField;
                }
            } else {
                $stats['local_intact']++;
                // Normalize local path format
                $normalized = '/backend/uploads/products/' . $basename;
                if ($imgField !== $normalized) {
                    $needsUpdate = true;
                    return $normalized;
                }
                return $imgField;
            }
        } else {
            // File does NOT exist on disk!
            $stats['missing_files'][] = [
                'id'       => $id,
                'name'     => $name,
                'sku'      => $sku,
                'field'    => $fieldLabel,
                'path'     => $imgField,
                'filename' => $basename,
            ];
            log_line("  [MISSING FILE] Product #{$id} ({$name}) {$fieldLabel} references '{$basename}', but file was NOT found in {$uploadDir}");
            return $imgField;
        }
    };

    $newImage = $processField($image, 'main image');
    $newBack  = $processField($back, 'back image');

    // Process additional images if present
    $newAddlJson = $prod['additional_images'];
    if (!empty($prod['additional_images'])) {
        $decoded = json_decode($prod['additional_images'], true);
        if (is_array($decoded)) {
            $updatedAddl = [];
            foreach ($decoded as $idx => $addlImg) {
                $processed = $processField((string)$addlImg, "additional image #{$idx}");
                $updatedAddl[] = $processed;
            }
            $newAddlJson = json_encode($updatedAddl);
            if ($newAddlJson !== $prod['additional_images']) {
                $needsUpdate = true;
            }
        }
    }

    if ($needsUpdate) {
        $upStmt = $pdo->prepare("UPDATE products SET image = :img, back_image = :back, additional_images = :addl WHERE id = :id");
        $upStmt->execute([
            ':img'  => $newImage,
            ':back' => $newBack,
            ':addl' => $newAddlJson,
            ':id'   => $id,
        ]);
    } else {
        if (preg_match('#^https?://#i', $newImage)) {
            $stats['already_cloud']++;
        }
    }
}

log_line("");
log_line("==================================================================");
log_line("  Migration & Inspection Summary");
log_line("==================================================================");
log_line("Total Products Inspected:  " . $stats['total']);
log_line("Already on Cloud / CDN:    " . $stats['already_cloud']);
log_line("Successfully Migrated:     " . $stats['migrated']);
log_line("Local Files Intact:        " . $stats['local_intact']);
log_line("Corrupted URLs Repaired:   " . $stats['corrupted']);
log_line("Missing Image Files:       " . count($stats['missing_files']));

if (!empty($stats['missing_files'])) {
    log_line("");
    log_line("ATTENTION: The following product(s) reference local files that do not exist on disk:");
    foreach ($stats['missing_files'] as $m) {
        log_line("  - Product #{$m['id']} [{$m['sku']}]: \"{$m['name']}\" ({$m['field']}) -> missing '{$m['filename']}'");
    }
    log_line("These products need their images uploaded again via the Admin Dashboard.");
}

// Re-export fallback snapshot
log_line("");
log_line("Updating static catalog snapshot (products_fallback.json)...");
ob_start();
include __DIR__ . '/export_fallback.php';
$exportOutput = ob_get_clean();
log_line("Snapshot refreshed successfully.");
log_line("Done.");
