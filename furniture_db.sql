-- FurniShop Furniture E-Commerce Database Dump
-- Exported on 2026-09-19 11:57:01

USE `if0_42957803_furnishop`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT '?',
  `image` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `image`) VALUES
('1', 'Living Room', 'living-room', 'Sofas, coffee tables, TV units & recliners for comfortable living', '🛋️', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80');

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `image`) VALUES
('2', 'Bedroom', 'bedroom', 'Beds, nightstands, dressers & wardrobes for serene sleep spaces', '🛏️', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80');

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `image`) VALUES
('3', 'Dining Room', 'dining-room', 'Dining tables, ergonomic chairs & sideboards for gathering', '🍽️', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80');

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `image`) VALUES
('4', 'Office & Study', 'office-study', 'Desks, executive chairs & bookshelves for high productivity', '💼', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80');

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `image`) VALUES
('5', 'Outdoor & Patio', 'outdoor-patio', 'Weatherproof teak lounges, rattan swings & bistro tables', '🪴', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80');

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `image`) VALUES
('6', 'Luxury & Decor', 'luxury-decor', 'Console tables, vanity sets, floor lamps & plush rugs', '✨', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80');

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `image`) VALUES
('7', 'Lighting & Accents', 'lighting-accents', 'Chanderliers, Nordic floor lamps & decorative wall art', '💡', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80');


DROP TABLE IF EXISTS `collections`;
CREATE TABLE `collections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `banner_image` varchar(500) DEFAULT NULL,
  `discount_tag` varchar(50) DEFAULT 'Up to 40% OFF',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `collections` (`id`, `title`, `slug`, `subtitle`, `banner_image`, `discount_tag`) VALUES
('1', 'Nordic Minimalist Suite', 'nordic-minimalist', 'Clean lines, natural solid woods & serene neutral textures', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', 'Up to 35% OFF');

INSERT INTO `collections` (`id`, `title`, `slug`, `subtitle`, `banner_image`, `discount_tag`) VALUES
('2', 'Royal Velvet Elegance', 'royal-velvet', 'Plush velvet sofas & gold-accented contemporary luxury', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', 'Flat 25% OFF');

INSERT INTO `collections` (`id`, `title`, `slug`, `subtitle`, `banner_image`, `discount_tag`) VALUES
('3', 'Modern Ergonomic Workspace', 'modern-workspace', 'Standing desks & lumbar-support executive chairs', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80', 'Special Bundle Deal');

INSERT INTO `collections` (`id`, `title`, `slug`, `subtitle`, `banner_image`, `discount_tag`) VALUES
('4', 'Artisan Teak & Patio', 'artisan-teak', 'Handcrafted solid teak dining & outdoor relaxation pieces', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Summer Clearance');

INSERT INTO `collections` (`id`, `title`, `slug`, `subtitle`, `banner_image`, `discount_tag`) VALUES
('5', 'Urban Space Savers', 'urban-space-savers', 'Smart multi-functional beds, storage ottomans & modular desks', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80', 'Up to 40% OFF');

INSERT INTO `collections` (`id`, `title`, `slug`, `subtitle`, `banner_image`, `discount_tag`) VALUES
('6', 'Grand Dining Masterpiece', 'grand-dining', 'Solid marble top tables with plush padded velvet chairs', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80', 'Save ₹8,000 Today');

INSERT INTO `collections` (`id`, `title`, `slug`, `subtitle`, `banner_image`, `discount_tag`) VALUES
('7', 'Aesthetic Ambient Living', 'ambient-living', 'Designer floor lamps, ceramic vases & statement mirrors', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80', 'New Arrival');


DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `collection_id` int(11) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(500) NOT NULL,
  `back_image` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT 'W: 180cm x D: 90cm x H: 85cm',
  `material` varchar(100) DEFAULT 'Solid Teak Wood & Velvet',
  `rating` decimal(3,1) DEFAULT 4.5,
  `reviews_count` int(11) DEFAULT 24,
  `has_offer` tinyint(1) DEFAULT 0,
  `offer_end_time` datetime DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_trending` tinyint(1) DEFAULT 0,
  `stock_status` varchar(50) DEFAULT 'In Stock',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `collection_id` (`collection_id`),
  CONSTRAINT `products_ibfk_1`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_ibfk_2`
    FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('1','1','2','Modern Scandinavian Sofa','18999.00','24999.00',
'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
'Premium 3-seater sofa with high-density foam cushioning, stain-resistant velvet fabric, and solid oak wooden legs.',
'W: 210cm x D: 90cm x H: 85cm',
'High-grade Velvet & Solid Oak','4.9','142','1','2026-09-22 11:40:54','1','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('2','1','2','Velvet Accent Armchair','8499.00','10999.00',
'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=800&q=80',
'Elegantly contoured accent lounge chair featuring brass metallic legs and deep plush foam padding.',
'W: 80cm x D: 75cm x H: 90cm',
'Royal Blue Velvet & Brass Legs','4.7','88','1','2026-09-24 11:40:54','1','0','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('3','1','1','Minimalist Marble Coffee Table','9999.00','12999.00',
'https://images.unsplash.com/photo-1533779283484-83494495497f?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',
'Genuine Italian Carrara marble tabletop supported by a powder-coated geometric black steel frame.',
'W: 110cm x D: 60cm x H: 45cm',
'Natural Marble & Steel Frame','4.8','64','0',NULL,'0','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('4','1','5','Modular L-Shape Sectional Sofa','34999.00','42999.00',
'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
'Spacious L-shaped sectional featuring reversible chaise lounger and built-in cup holders & storage.',
'W: 280cm x D: 160cm x H: 88cm',
'Textured Linen & Pine Wood','4.6','95','1','2026-09-19 23:40:54','1','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('5','2','5','King Size Upholstered Bed Frame','22500.00','28999.00',
'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1540518614846-7ede433c517a?auto=format&fit=crop&w=800&q=80',
'Luxurious tufted headboard king bed with hydraulic under-bed lift-up storage compartment.',
'W: 195cm x D: 215cm x H: 125cm',
'Solid Sheesham Wood & Upholstered Linen','4.9','110','0',NULL,'1','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('6','2','1','Nordic Solid Oak Nightstand','4200.00','5500.00',
'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
'Sleek double-drawer bedside cabinet crafted from kiln-dried white oak with soft-close runners.',
'W: 50cm x D: 40cm x H: 55cm',
'100% Solid White Oak','4.7','49','0',NULL,'0','0','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('7','2','7','Modern Dressing Table & LED Mirror','8499.00','11999.00',
'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
'Contemporary vanity set with touch-screen dimmable LED illuminated ring mirror and velvet padded stool.',
'W: 100cm x D: 45cm x H: 135cm',
'Engineered Wood & Gold Metal','4.8','76','1','2026-09-22 11:40:54','1','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('8','3','6','Handcrafted Solid Wood 6-Seater Dining Set','24999.00','31999.00',
'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',
'Premium 6-seater solid teak dining table complete with 6 cushioned ergonomic dining chairs.',
'W: 180cm x D: 90cm x H: 76cm',
'Solid Teak Wood & Cushion Padding','4.9','134','1','2026-09-24 11:40:54','1','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('9','3','6','Luxury Italian Marble Dining Table','38999.00','47999.00',
'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
'Heavyweight natural Italian marble dining table with stainless steel gold-plated pedestal base.',
'W: 200cm x D: 100cm x H: 76cm',
'Italian Marble & Stainless Steel','4.8','58','0',NULL,'0','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('10','3','4','Ergonomic Velvet Bar Stool Set','6499.00','8999.00',
'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80',
'Set of 2 swivel height-adjustable kitchen island bar stools with footrest and back support.',
'W: 45cm x D: 45cm x H: 85-105cm',
'Velvet & Matte Black Iron','4.6','42','1','2026-09-19 23:40:54','0','0','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('11','4','3','Executive Ergonomic Standing Desk','15999.00','19999.00',
'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
'Dual-motor electric height-adjustable office desk with memory presets, cable management & wooden top.',
'W: 140cm x D: 70cm x H: 70-120cm',
'Teak Wood Top & Heavy Steel Frame','4.9','210','1','2026-09-22 11:40:54','1','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('12','4','3','High-Back Lumbar Mesh Office Chair','7999.00','10999.00',
'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
'Professional ergonomic desk chair with 3D adjustable armrests, headrest, and dynamic lumbar support.',
'W: 65cm x D: 65cm x H: 115-125cm',
'Breathable Mesh & Alloy Base','4.7','185','0',NULL,'1','0','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('13','4','1','Industrial Teak & Steel Bookshelf','6499.00','8499.00',
'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',
'5-tier open bookcase displaying natural timber shelves held together by rustic metal side pillars.',
'W: 90cm x D: 35cm x H: 180cm',
'Reclaimed Teak & Structural Steel','4.8','62','0',NULL,'0','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('14','5','4','Teak Outdoor Garden Lounge Set','28500.00','34999.00',
'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
'Weatherproof 4-piece patio lounge set including 2 armchairs, 1 sofa, coffee table and waterproof cushions.',
'W: 200cm x D: 180cm x H: 75cm',
'All-Weather Teak & Sunbrella Fabric','4.9','54','1','2026-09-24 11:40:54','1','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('15','5','4','Rattan Hanging Patio Swing Chair','11999.00','14999.00',
'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80',
'Hand-woven synthetic rattan egg swing chair with heavy-duty stand and plush thick cushion pillow.',
'W: 105cm x D: 105cm x H: 195cm',
'Weatherproof PE Rattan & Steel Stand','4.8','91','0',NULL,'1','0','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('16','6','2','Gold Accented Console Table','12499.00','15999.00',
'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1533779283484-83494495497f?auto=format&fit=crop&w=800&q=80',
'Ultra-sleek entry hall console table with faux marble surface and electroplated brushed gold legs.',
'W: 120cm x D: 35cm x H: 80cm',
'Faux Marble & Brushed Stainless Gold','4.8','47','1','2026-09-19 23:40:54','1','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('17','6','7','Boho Hand-Knotted Plush Area Rug','5999.00','7999.00',
'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
'Soft high-pile Moroccan geometric pattern area rug woven from natural organic wool fibers.',
'W: 200cm x D: 300cm',
'100% Organic Wool','4.7','68','0',NULL,'0','0','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('18','7','7','Nordic Architectural Arc Floor Lamp','4999.00','6999.00',
'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',
'Minimalist overhanging arc floor lamp with marble heavy base and warm dimmable LED globe bulb.',
'W: 40cm x D: 110cm x H: 205cm',
'Carrara Marble & Matte Black Steel','4.9','103','1','2026-09-22 11:40:54','1','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('19','7','7','Contemporary Glass Chandelier','14499.00','18999.00',
'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
'Multi-globe amber blown glass chandelier fixture suitable for living room ceilings or dining areas.',
'W: 85cm x D: 85cm x H: 70cm',
'Hand-Blown Amber Glass & Brass','4.8','39','0',NULL,'0','1','In Stock','2026-09-19 15:10:54');

INSERT INTO `products`
(`id`,`category_id`,`collection_id`,`name`,`price`,`original_price`,`image`,`back_image`,`description`,`dimensions`,`material`,`rating`,`reviews_count`,`has_offer`,`offer_end_time`,`is_featured`,`is_trending`,`stock_status`,`created_at`)
VALUES
('20','7','7','Aesthetic Ceramic Table Lamp','2999.00','3999.00',
'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',
'Textured terracotta ceramic base bedside lamp with linen drum shade and warm ambience.',
'W: 30cm x D: 30cm x H: 50cm',
'Glazed Terracotta & Fabric Shade','4.6','52','0',NULL,'0','0','In Stock','2026-09-19 15:10:54');


DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_ibfk_1`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `wishlist`;
CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_product` (`session_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlist_ibfk_1`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `wishlist`
(`id`,`session_id`,`product_id`,`created_at`)
VALUES
('1','sess_s84o4ux9n_1789810928899','5','2026-09-19 15:12:22');


DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(100) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `shipping_address` text NOT NULL,
  `payment_method` varchar(50) DEFAULT 'Credit Card',
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'Processing',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `newsletter_subscribers`;
CREATE TABLE `newsletter_subscribers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
-- Example SQL query to store a new product in the database:
-- INSERT INTO `products` 
-- (`category_id`, `collection_id`, `name`, `price`, `original_price`, `image`, `back_image`, `description`, `dimensions`, `material`, `rating`, `reviews_count`, `has_offer`, `is_featured`, `is_trending`, `stock_status`) 
-- VALUES 
-- (1, 1, 'Nordic Solid Oak Lounge Chair', 16999.00, 21999.00, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=800&q=80', 'Handcrafted solid white oak lounge chair with natural organic linen upholstery.', 'W: 78cm x D: 82cm x H: 86cm', 'Solid Oak & Natural Linen', 4.9, 15, 1, 1, 1, 'In Stock');

SET FOREIGN_KEY_CHECKS = 1;