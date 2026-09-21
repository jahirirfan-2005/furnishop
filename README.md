# FurniShop — Furniture E-Commerce (React + PHP + MySQL)

Products are **fully database-driven**: the React frontend never hardcodes product data and never touches MySQL directly. Every product operation flows through the PHP REST API into the MySQL/MariaDB database.

```
React frontend  →  PHP REST API (PDO, prepared statements)  →  MySQL (single source of truth)
```

## Project layout

| Path | Purpose |
|---|---|
| `furniture/src/` | React storefront + admin panel (Vite) |
| `backend/api/` | PHP REST endpoints (products, categories, collections, cart, wishlist, checkout, orders, newsletter, upload) |
| `backend/api/config.php` | Shared PDO connection + helpers (credentials from env only) |
| `backend/schema.sql` | Full database schema + seed data (fresh installs) |
| `backend/migration_add_product_fields.sql` | Idempotent migration for existing databases |
| `backend/migrate_products.php` | One-shot migration + catalog seeder + verification report |
| `backend/uploads/products/` | Uploaded product images (paths stored in MySQL) |
| `backend/start-backend.bat` | Starts MariaDB (3307) + PHP API server |
| `backend/.env.example` | Environment config template (copy to `backend/.env`) |

## Quick start (Windows)

1. **Start the backend** — double-click `backend\start-backend.bat`, or manually:
   ```bat
   C:\xampp\mysql\bin\mysqld.exe --defaults-file=backend\my.ini
   C:\xampp\php\php.exe -S 0.0.0.0:8001 -t .
   ```
   On first request the PHP API auto-creates the `furnishop` database and loads `schema.sql`.

2. **Apply the product migration & seed the catalog** (idempotent, safe to re-run):
   ```bat
   C:\xampp\php\php.exe backend\migrate_products.php
   ```

3. **Start the frontend**:
   ```bash
   cd furniture
   npm install
   npm run dev
   ```
   The API base URL lives in one place: `VITE_API_BASE_URL` in `furniture/.env.local`
   (default `http://127.0.0.1:8001/backend/api`). Change it once for deployment.

## API overview

| Endpoint | Methods | Notes |
|---|---|---|
| `backend/api/products.php` | GET, POST, PUT, DELETE | Filters: `id`, `slug`, `category`, `collection`, `search`, `featured`, `trending`, `offers`, `min_price`, `max_price`, `sort`, `page`/`per_page`, `include_inactive` (admin) |
| `backend/api/categories.php` | GET | Live product counts (active only) |
| `backend/api/collections.php` | GET | Live product counts |
| `backend/api/upload.php` | POST | Multipart image upload — JPG/JPEG/PNG/WEBP, ≤5 MB, content-verified |
| `backend/api/cart.php` | GET, POST, PUT, DELETE | Session-based server cart |
| `backend/api/wishlist.php` | GET, POST, DELETE | Session-based |
| `backend/api/checkout.php` | POST | Transactional order + items, clears cart |
| `backend/api/orders.php` | GET, PUT, DELETE | Admin order management |

All responses use `{ "status": "success"|"error", "success": true|false, "message", "data" }` with proper HTTP status codes. All queries use PDO prepared statements; SQL errors are logged server-side and never exposed to clients.

## Configuration

Credentials are read from the environment only — `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`.
Copy `backend/.env.example` → `backend/.env` and adjust. **Never commit real credentials.**

## Database products table

`products` carries: `id, category_id, collection_id, name, slug (unique), description, price, original_price, discount_price, stock_quantity, image, back_image, additional_images (JSON), material, color, dimensions, rating, reviews_count, has_offer, offer_end_time, is_featured, is_trending, stock_status, status (active/inactive), created_at, updated_at` — with indexes on slug, status, category, collection, featured, trending, price and created_at.
