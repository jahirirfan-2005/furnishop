<?php
/**
 * Product REST API - the single gateway between the frontend and MySQL.
 *
 * GET    /backend/api/products.php                          -> list (filters below)
 * GET    ?id=5                                              -> single product by id
 * GET    ?slug=nordic-minimalist-oak-armchair               -> single product by slug
 * GET    ?category=living-room                              -> by category slug or id
 * GET    ?collection=royal-velvet                           -> by collection slug or id
 * GET    ?search=sofa                                       -> keyword search
 * GET    ?featured=1 | ?trending=1 | ?offers=1              -> flag filters
 * GET    ?min_price=5000&max_price=25000                    -> price range
 * GET    ?sort=featured|price_low|price_high|rating|newest|offers
 * GET    ?page=1&per_page=12                                -> pagination
 * GET    ?include_inactive=1                                -> admin: include inactive
 * POST   {product fields}                                   -> create (admin)
 * PUT    {id, ...fields}                                    -> update (admin)
 * DELETE ?id=5                                              -> delete (admin)
 */

require_once __DIR__ . '/config.php';
/** @var PDO $pdo */

ensure_product_schema($pdo);

$method = $_SERVER['REQUEST_METHOD'];

try {
    // =====================================================================
    // GET - list / search / single product
    // =====================================================================
    if ($method === 'GET') {
        $baseSelect = "SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                              col.title AS collection_title, col.slug AS collection_slug
                       FROM products p
                       LEFT JOIN categories c ON c.id = p.category_id
                       LEFT JOIN collections col ON col.id = p.collection_id";

        // ---------- Single product by id ----------
        if (!empty($_GET['id'])) {
            $stmt = $pdo->prepare("$baseSelect WHERE p.id = :id LIMIT 1");
            $stmt->execute([':id' => (int)$_GET['id']]);
            $row = $stmt->fetch();
            if (!$row) {
                api_error('Product not found', 404);
            }
            api_success(cast_product($row), 'Product fetched');
        }

        // ---------- Single product by slug ----------
        if (!empty($_GET['slug'])) {
            $stmt = $pdo->prepare("$baseSelect WHERE p.slug = :slug LIMIT 1");
            $stmt->execute([':slug' => trim($_GET['slug'])]);
            $row = $stmt->fetch();
            if (!$row) {
                api_error('Product not found', 404);
            }
            api_success(cast_product($row), 'Product fetched');
        }

        // ---------- List with filters ----------
        $where  = [];
        $params = [];

        // Storefront never sees inactive products unless explicitly asked (admin).
        if (empty($_GET['include_inactive'])) {
            $where[] = "p.status = 'active'";
        } elseif (($_GET['include_inactive'] ?? '') === 'inactive') {
            $where[] = "p.status = 'inactive'";
        }

        if (!empty($_GET['category']) && $_GET['category'] !== 'all') {
            if (ctype_digit((string)$_GET['category'])) {
                $where[] = "p.category_id = :category";
                $params[':category'] = (int)$_GET['category'];
            } else {
                $where[] = "(c.slug = :category OR c.name = :category2)";
                $params[':category']  = $_GET['category'];
                $params[':category2'] = $_GET['category'];
            }
        }

        if (!empty($_GET['collection']) && $_GET['collection'] !== 'all') {
            if (ctype_digit((string)$_GET['collection'])) {
                $where[] = "p.collection_id = :collection";
                $params[':collection'] = (int)$_GET['collection'];
            } else {
                $where[] = "col.slug = :collection";
                $params[':collection'] = $_GET['collection'];
            }
        }

        // Keyword search across name, description, material, color and category name.
        if (!empty($_GET['search'])) {
            $search = trim($_GET['search']);
            if ($search !== '') {
                $where[] = "(p.name LIKE :search OR p.description LIKE :search2
                             OR p.material LIKE :search3 OR p.color LIKE :search4
                             OR c.name LIKE :search5 OR p.slug LIKE :search6)";
                $q = '%' . $search . '%';
                $params[':search']  = $q;
                $params[':search2'] = $q;
                $params[':search3'] = $q;
                $params[':search4'] = $q;
                $params[':search5'] = $q;
                $params[':search6'] = $q;
            }
        }

        if (!empty($_GET['featured']))     { $where[] = "p.is_featured = 1"; }
        if (!empty($_GET['trending']))     { $where[] = "p.is_trending = 1"; }
        if (!empty($_GET['offers']))       { $where[] = "p.has_offer = 1"; }
        if (!empty($_GET['in_stock_only'])) { $where[] = "p.stock_quantity > 0 AND p.stock_status <> 'Out of Stock'"; }

        if (isset($_GET['min_price']) && is_numeric($_GET['min_price'])) {
            $where[] = "p.price >= :min_price";
            $params[':min_price'] = (float)$_GET['min_price'];
        }
        if (isset($_GET['max_price']) && is_numeric($_GET['max_price'])) {
            $where[] = "p.price <= :max_price";
            $params[':max_price'] = (float)$_GET['max_price'];
        }

        $sql = $baseSelect;
        if ($where) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }

        // Sorting (whitelisted - never from raw input).
        switch ($_GET['sort'] ?? '') {
            case 'price_low':  $sql .= " ORDER BY p.price ASC"; break;
            case 'price_high': $sql .= " ORDER BY p.price DESC"; break;
            case 'rating':     $sql .= " ORDER BY p.rating DESC, p.reviews_count DESC"; break;
            case 'newest':     $sql .= " ORDER BY p.created_at DESC, p.id DESC"; break;
            case 'offers':     $sql .= " ORDER BY p.has_offer DESC, p.price ASC"; break;
            case 'name':       $sql .= " ORDER BY p.name ASC"; break;
            case 'featured':
            default:           $sql .= " ORDER BY p.is_featured DESC, p.id ASC"; break;
        }

        // Pagination.
        $page    = max(1, (int)($_GET['page'] ?? 1));
        $perPage = (int)($_GET['per_page'] ?? 0);
        if ($perPage > 0) {
            $perPage = min(100, max(1, $perPage));
            $countStmt = $pdo->prepare("SELECT COUNT(*) FROM ($sql) AS counted");
            $countStmt->execute($params);
            $total = (int)$countStmt->fetchColumn();

            $offset = ($page - 1) * $perPage;
            $sql .= " LIMIT $perPage OFFSET $offset";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $rows = array_map('cast_product', $stmt->fetchAll());

            json_out([
                'status'    => 'success',
                'success'   => true,
                'message'   => 'Products fetched',
                'data'      => $rows,
                'count'     => count($rows),
                'total'     => $total,
                'page'      => $page,
                'per_page'  => $perPage,
                'last_page' => (int)ceil($total / $perPage),
            ]);
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = array_map('cast_product', $stmt->fetchAll());

        json_out([
            'status'  => 'success',
            'success' => true,
            'message' => 'Products fetched',
            'data'    => $rows,
            'count'   => count($rows),
            'total'   => count($rows),
        ]);
    }

    // =====================================================================
    // POST - create product (admin)
    // =====================================================================
    if ($method === 'POST') {
        $d = request_data();

        // Required fields.
        $name  = trim($d['name'] ?? '');
        $price = $d['price'] ?? null;
        $image = trim($d['image'] ?? '');

        if ($name === '')          api_error('Product name is required', 422);
        if ($price === null || !is_numeric($price) || (float)$price <= 0) {
            api_error('A valid price greater than 0 is required', 422);
        }
        if ($image === '')         api_error('A product image is required', 422);
        if (mb_strlen($name) > 255) api_error('Product name is too long (max 255 characters)', 422);

        // Optional / derived fields.
        $categoryTable = "categories";
        $categoryId = (int)($d['category_id'] ?? 0);
        if ($categoryId > 0) {
            $chk = $pdo->prepare("SELECT id FROM `$categoryTable` WHERE id = :id");
            $chk->execute([':id' => $categoryId]);
            if (!$chk->fetch()) api_error('Selected category does not exist', 422);
        } else {
            $categoryId = 1; // Default: Living Room
        }

        $collectionId = !empty($d['collection_id']) ? (int)$d['collection_id'] : null;

        $originalPrice = !empty($d['original_price']) && is_numeric($d['original_price']) ? (float)$d['original_price'] : null;
        $discountPrice = isset($d['discount_price']) && $d['discount_price'] !== '' && is_numeric($d['discount_price'])
            ? (float)$d['discount_price'] : null;

        $stockQty = isset($d['stock_quantity']) && is_numeric($d['stock_quantity']) ? max(0, (int)$d['stock_quantity']) : 25;

        // Additional images: accept an array or comma-separated string; store as JSON.
        $additional = $d['additional_images'] ?? [];
        if (is_string($additional)) {
            $additional = array_values(array_filter(array_map('trim', explode(',', $additional))));
        }
        if (!is_array($additional)) {
            $additional = [];
        }
        $additionalJson = json_encode(array_slice($additional, 0, 10));

        $status = ($d['status'] ?? 'active') === 'inactive' ? 'inactive' : 'active';
        $stockStatus = trim($d['stock_status'] ?? '');
        if ($stockStatus === '') {
            // Derive a sensible stock label from the quantity.
            if ($stockQty <= 0)            $stockStatus = 'Out of Stock';
            elseif ($stockQty <= 5)        $stockStatus = 'Low Stock';
            else                           $stockStatus = 'In Stock';
        }

        $slug = !empty($d['slug']) ? make_slug($pdo, $d['slug'], '`products`') : make_slug($pdo, $name, '`products`');

        $stmt = $pdo->prepare(
            "INSERT INTO products
                (category_id, collection_id, name, slug, price, original_price, discount_price,
                 stock_quantity, image, back_image, additional_images, description, dimensions,
                 material, color, rating, reviews_count, has_offer, offer_end_time,
                 is_featured, is_trending, stock_status, status)
             VALUES
                (:category_id, :collection_id, :name, :slug, :price, :original_price, :discount_price,
                 :stock_quantity, :image, :back_image, :additional_images, :description, :dimensions,
                 :material, :color, :rating, :reviews_count, :has_offer, :offer_end_time,
                 :is_featured, :is_trending, :stock_status, :status)"
        );
        $stmt->execute([
            ':category_id'       => $categoryId,
            ':collection_id'     => $collectionId,
            ':name'              => $name,
            ':slug'              => $slug,
            ':price'             => (float)$price,
            ':original_price'    => $originalPrice,
            ':discount_price'    => $discountPrice,
            ':stock_quantity'    => $stockQty,
            ':image'             => $image,
            ':back_image'        => !empty($d['back_image']) ? trim($d['back_image']) : $image,
            ':additional_images' => $additionalJson,
            ':description'       => trim($d['description'] ?? ''),
            ':dimensions'        => !empty($d['dimensions']) ? trim($d['dimensions']) : null,
            ':material'          => !empty($d['material']) ? trim($d['material']) : null,
            ':color'             => !empty($d['color']) ? trim($d['color']) : null,
            ':rating'            => isset($d['rating']) && is_numeric($d['rating']) ? min(5.0, max(1.0, (float)$d['rating'])) : 4.5,
            ':reviews_count'     => (int)($d['reviews_count'] ?? 0),
            ':has_offer'         => !empty($d['has_offer']) ? 1 : 0,
            ':offer_end_time'    => !empty($d['offer_end_time']) ? $d['offer_end_time'] : null,
            ':is_featured'       => !empty($d['is_featured']) ? 1 : 0,
            ':is_trending'       => !empty($d['is_trending']) ? 1 : 0,
            ':stock_status'      => $stockStatus,
            ':status'            => $status,
        ]);

        $newId = (int)$pdo->lastInsertId();

        $fetch = $pdo->prepare(
            "SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                    col.title AS collection_title, col.slug AS collection_slug
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             LEFT JOIN collections col ON col.id = p.collection_id
             WHERE p.id = :id"
        );
        $fetch->execute([':id' => $newId]);
        $row = cast_product($fetch->fetch());

        json_out([
            'status'  => 'success',
            'success' => true,
            'message' => 'Product stored in database',
            'data'    => $row,
        ], 201);
    }

    // =====================================================================
    // PUT - update product (admin). Accepts full form or single-field patch.
    // =====================================================================
    if ($method === 'PUT') {
        $d = request_data();
        $id = (int)($d['id'] ?? 0);
        if (!$id) api_error('Product id is required', 400);

        $exists = $pdo->prepare("SELECT id FROM products WHERE id = :id");
        $exists->execute([':id' => $id]);
        if (!$exists->fetch()) api_error('Product not found', 404);

        $allowed = ['name', 'price', 'original_price', 'discount_price', 'image', 'back_image',
                    'description', 'dimensions', 'material', 'color', 'rating', 'reviews_count',
                    'has_offer', 'offer_end_time', 'is_featured', 'is_trending',
                    'stock_status', 'status', 'category_id', 'collection_id', 'stock_quantity', 'slug'];

        $sets   = [];
        $params = [':id' => $id];

        foreach ($allowed as $col) {
            if (!array_key_exists($col, $d)) continue;

            $v = $d[$col];

            // Field-level validation.
            if ($col === 'name' && trim((string)$v) === '') api_error('Product name cannot be empty', 422);
            if (in_array($col, ['price', 'discount_price'], true) && $v !== '' && $v !== null && (!is_numeric($v) || (float)$v < 0)) {
                api_error("Invalid value for $col", 422);
            }
            if ($col === 'status' && !in_array($v, ['active', 'inactive'], true)) api_error('Invalid status', 422);
            if ($col === 'rating' && $v !== '' && $v !== null) {
                $v = min(5.0, max(1.0, (float)$v));
            }

            // Normalize additional_images to JSON if provided.
            if ($col === 'additional_images') {
                if (is_string($v)) {
                    $v = array_values(array_filter(array_map('trim', explode(',', $v))));
                }
                $v = json_encode(is_array($v) ? array_slice($v, 0, 10) : []);
            }

            // Empty price-ish values become NULL.
            if (in_array($col, ['original_price', 'discount_price', 'offer_end_time', 'collection_id'], true) && ($v === '' || $v === null)) {
                $v = null;
            }

            $sets[] = "`$col` = :$col";
            $params[":$col"] = $v;
        }

        // Auto-regenerate slug when the name changes (unless a slug is given).
        if (isset($d['name']) && !isset($d['slug'])) {
            $sets[] = "`slug` = :slug_auto";
            $params[':slug_auto'] = make_slug($pdo, $d['name'], '`products`', $id);
        }

        if (!$sets) api_error('Nothing to update', 400);

        $stmt = $pdo->prepare("UPDATE products SET " . implode(', ', $sets) . " WHERE id = :id");
        $stmt->execute($params);

        $fetch = $pdo->prepare(
            "SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                    col.title AS collection_title, col.slug AS collection_slug
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             LEFT JOIN collections col ON col.id = p.collection_id
             WHERE p.id = :id"
        );
        $fetch->execute([':id' => $id]);
        $row = cast_product($fetch->fetch());

        api_success($row, 'Product updated');
    }

    // =====================================================================
    // DELETE - remove product (admin)
    // =====================================================================
    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) {
            $d = request_data();
            $id = (int)($d['id'] ?? 0);
        }
        if (!$id) api_error('Product id is required', 400);

        $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) api_error('Product not found', 404);

        api_success(['id' => $id], 'Product deleted from database');
    }

    api_error('Method not allowed', 405);

} catch (PDOException $e) {
    // Log internally; never expose SQL details to the client.
    error_log('[FurniShop API] products.php PDOException: ' . $e->getMessage());
    api_error('Something went wrong while processing your request', 500);
} catch (Throwable $e) {
    error_log('[FurniShop API] products.php Throwable: ' . $e->getMessage());
    api_error('Something went wrong while processing your request', 500);
}
