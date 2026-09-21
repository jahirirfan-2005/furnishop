-- FurniShop database schema + seed data
CREATE DATABASE IF NOT EXISTS furnishop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE furnishop;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  icon VARCHAR(16) DEFAULT NULL,
  image VARCHAR(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS collections (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  subtitle VARCHAR(255) DEFAULT NULL,
  banner_image VARCHAR(500) DEFAULT NULL,
  discount_tag VARCHAR(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  collection_id INT UNSIGNED DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) DEFAULT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) DEFAULT NULL,
  discount_price DECIMAL(10,2) DEFAULT NULL,
  stock_quantity INT NOT NULL DEFAULT 25,
  image VARCHAR(500) NOT NULL,
  back_image VARCHAR(500) DEFAULT NULL,
  additional_images TEXT DEFAULT NULL,
  material VARCHAR(150) DEFAULT NULL,
  color VARCHAR(100) DEFAULT NULL,
  dimensions VARCHAR(120) DEFAULT NULL,
  rating DECIMAL(3,1) NOT NULL DEFAULT 4.5,
  reviews_count INT NOT NULL DEFAULT 0,
  has_offer TINYINT(1) NOT NULL DEFAULT 0,
  offer_end_time DATETIME DEFAULT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_trending TINYINT(1) NOT NULL DEFAULT 0,
  stock_status VARCHAR(50) NOT NULL DEFAULT 'In Stock',
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Performance indexes for product listing, search, filters and admin views
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_collection ON products (collection_id);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_featured ON products (is_featured);
CREATE INDEX idx_products_trending ON products (is_trending);
CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_products_created ON products (created_at);

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30) DEFAULT NULL,
  shipping_address TEXT NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Credit Card',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED DEFAULT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500) DEFAULT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(80) NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_session_product (session_id, product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wishlist_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(80) NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wl_session_product (session_id, product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed categories
INSERT IGNORE INTO categories (id, name, slug, description, icon, image) VALUES
(1, 'Living Room', 'living-room', 'Sofas, coffee tables & recliners', '🛋️', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'),
(2, 'Bedroom', 'bedroom', 'Beds, nightstands & dressers', '🛏️', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'),
(3, 'Dining Room', 'dining-room', 'Dining tables & ergonomic chairs', '🍽️', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80'),
(4, 'Office & Study', 'office-study', 'Desks & executive chairs', '💼', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'),
(5, 'Outdoor & Patio', 'outdoor-patio', 'Teak lounges & patio sets', '🪴', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'),
(6, 'Luxury & Decor', 'luxury-decor', 'Console tables & plush rugs', '✨', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'),
(7, 'Lighting & Accents', 'lighting-accents', 'Floor lamps & wall art', '💡', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80');

-- Seed collections
INSERT IGNORE INTO collections (id, title, slug, subtitle, banner_image, discount_tag) VALUES
(1, 'Nordic Minimalist Suite', 'nordic-minimalist', 'Clean lines & natural solid woods', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', 'Up to 35% OFF'),
(2, 'Royal Velvet Elegance', 'royal-velvet', 'Plush velvet sofas & gold accents', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', 'Flat 25% OFF'),
(3, 'Modern Ergonomic Workspace', 'modern-workspace', 'Standing desks & lumbar support', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80', 'Special Bundle Deal'),
(4, 'Artisan Teak & Patio', 'artisan-teak', 'Handcrafted solid teak furniture', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Summer Clearance'),
(5, 'Urban Space Savers', 'urban-space-savers', 'Smart multi-functional furniture', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80', 'Up to 40% OFF'),
(6, 'Grand Dining Masterpiece', 'grand-dining', 'Solid marble tables & velvet chairs', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80', 'Save 8000 Today'),
(7, 'Aesthetic Ambient Living', 'ambient-living', 'Designer floor lamps & ceramics', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80', 'New Arrival');

-- Seed products (single source of truth: MySQL)
INSERT IGNORE INTO products
(id, category_id, collection_id, name, slug, price, original_price, discount_price, stock_quantity,
 image, back_image, description, dimensions, material, color, rating, reviews_count,
 has_offer, is_featured, is_trending, stock_status) VALUES
(1, 1, 1, 'Nordic Minimalist Oak Armchair', 'nordic-minimalist-oak-armchair', 14999.00, 19999.00, 14999.00, 25,
 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1580481072645-022f9a6d1276?auto=format&fit=crop&w=800&q=80',
 'Handcrafted white oak armchair with soft linen upholstery and ergonomic lumbar angle.',
 'W: 75cm x D: 80cm x H: 85cm', 'Solid White Oak & Organic Linen', 'Natural Oak White', 4.8, 42, 1, 1, 1, 'In Stock'),
(2, 1, 2, 'Royal Emerald Velvet 3-Seater Sofa', 'royal-emerald-velvet-3-seater-sofa', 49999.00, 64999.00, 49999.00, 15,
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
 'Deep tufted emerald green velvet sofa featuring brushed gold metal legs.',
 'W: 220cm x D: 95cm x H: 88cm', 'Plush Royal Velvet & Gold Brass Base', 'Emerald Green', 4.9, 88, 1, 1, 1, 'In Stock'),
(3, 2, 5, 'Aura Hydraulic Storage Platform Bed', 'aura-hydraulic-storage-platform-bed', 38999.00, 49999.00, 38999.00, 12,
 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1540518614846-7ede433c5163?auto=format&fit=crop&w=800&q=80',
 'Queen size hydraulic bed with padded headboard and massive under-bed storage compartment.',
 'W: 160cm x L: 205cm x H: 110cm', 'Solid Teak & Premium Microfiber', 'Walnut Brown', 4.7, 36, 1, 1, 0, 'In Stock'),
(4, 3, 6, 'Carrara Italian Marble 6-Seater Dining Set', 'carrara-italian-marble-6-seater-dining-set', 68999.00, 84999.00, 68999.00, 8,
 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',
 'Natural Carrara white marble top dining table accompanied by 6 velvet cushioned chairs.',
 'W: 180cm x D: 90cm x H: 76cm', 'Italian Marble & Solid Teak Frame', 'White Marble & Teak', 5.0, 54, 1, 1, 1, 'In Stock'),
(5, 4, 3, 'Zenith Electric Dual-Motor Standing Desk', 'zenith-electric-dual-motor-standing-desk', 27999.00, 34999.00, 27999.00, 20,
 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
 'Whisper-quiet dual motor standing desk with 4 memory height presets and cable channel.',
 'W: 140cm x D: 70cm x H: 65-130cm', 'Solid Walnut Top & Heavy Duty Steel Frame', 'Walnut & Matte Black', 4.8, 67, 1, 1, 1, 'In Stock'),
(6, 5, 4, 'Bali Handcrafted Outdoor Teak Sun Lounge', 'bali-handcrafted-outdoor-teak-sun-lounge', 21999.00, 28999.00, NULL, 18,
 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&w=800&q=80',
 'Weather-proof solid Indonesian teak lounge with quick-dry outdoor foam cushion.',
 'L: 200cm x W: 70cm x H: 35cm', 'Grade A Indonesian Teak Wood', 'Natural Teak', 4.9, 29, 0, 0, 1, 'In Stock'),
(7, 7, 7, 'Nordic Arch Brass Floor Lamp', 'nordic-arch-brass-floor-lamp', 8999.00, 11999.00, 8999.00, 30,
 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
 'Sleek metallic brass arch floor lamp with weighted marble base and warm LED shade.',
 'Base: 35cm x Arch Span: 110cm x H: 210cm', 'Brushed Brass & Heavy Marble Base', 'Brushed Brass', 4.6, 19, 1, 0, 1, 'In Stock'),
(8, 6, 1, 'Kyoto Geometric Teak Console Table', 'kyoto-geometric-teak-console-table', 16999.00, 21999.00, 16999.00, 14,
 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
 'Minimalist console table with fluted wooden slats and hidden touch-latch drawers.',
 'W: 130cm x D: 40cm x H: 80cm', 'Solid Teak & Brass Knobs', 'Teak Brown', 4.8, 31, 0, 1, 0, 'In Stock');
