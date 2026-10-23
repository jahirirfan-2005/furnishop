-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: furnishop
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_tokens`
--

DROP TABLE IF EXISTS `admin_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_tokens` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_token_hash` (`token_hash`),
  KEY `idx_expires` (`expires_at`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `admin_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_tokens`
--

LOCK TABLES `admin_tokens` WRITE;
/*!40000 ALTER TABLE `admin_tokens` DISABLE KEYS */;
INSERT INTO `admin_tokens` VALUES (2,1,'bee936106d1ae187c48472c094503828086cc2d5d8444275870abb704f0b5542','2026-10-14 15:41:19','2026-10-13 13:41:19'),(3,1,'6714094ff90d15c970dcae61fd31703d6c56b0a8644097834b325abb94fec41f','2026-10-14 15:42:27','2026-10-13 13:42:27'),(4,1,'73ee34a6286c1a2d40bdfe8c0a235af0f153a61a9fa05113f8a1785f18ba9a15','2026-10-14 16:46:22','2026-10-13 14:46:22'),(5,1,'d7c8bb3a553b7956ca0e008861fb893299242ed7d882d93a7db3117636fb0062','2026-10-14 17:04:38','2026-10-13 15:04:38'),(6,1,'66b272340b99b3e5ba4d199f55b3162cb39c3ed6fd147d7e2635176e8941626b','2026-10-14 17:45:00','2026-10-13 15:45:00'),(7,1,'bd8d84c82b36b91a5542ca33304e522942019c6e94333726d9890886145326c0','2026-10-14 19:10:11','2026-10-13 17:10:11'),(8,1,'754adb4c69ccf31f38985b835451f2daeee25a80a49b3d88027e8847a0b8cde7','2026-10-15 20:28:10','2026-10-14 18:28:10'),(9,1,'efc78b27392a9dd3f347c62499edcc574795177fc7a9ce9033934f9cbea7d69b','2026-10-15 21:02:33','2026-10-14 19:02:33'),(10,3,'f35f1c1810238e3f41ecc611a1388d361bde58049f4a4bd1cc86b06aace3507a','2026-10-23 11:26:50','2026-10-22 09:26:50'),(11,3,'0339d410ae1313b33f2a111509e570a9c00735d7b7ec5cad52ad802b717191d7','2026-10-23 11:27:15','2026-10-22 09:27:15'),(12,3,'76ccaa26f8d2a6483dec10e71df9264651766edadb3ab13dc84235db43470075','2026-10-23 11:28:19','2026-10-22 09:28:19'),(13,1,'02786f2cb76be5b621edc22c07b464c6539c87f5db52f9885b7054407c0d824e','2026-10-23 11:28:19','2026-10-22 09:28:19'),(14,3,'8c978cf182759a8b2ae0d49736705960e63fe45aff4928be5769dee08c4398ce','2026-10-23 11:29:05','2026-10-22 09:29:05'),(15,3,'327b6e503fb40b4fc70df22ed5d6da7cc2b650ca7aa48297c952f4165272e126','2026-10-23 11:33:37','2026-10-22 09:33:37'),(16,3,'863005018ba8bfb96355377663302d92a6605829a14650cd9d96cadcb92ce3ba','2026-10-23 11:37:16','2026-10-22 09:37:16'),(17,3,'0a23cc232b26e7fc964fcbede178dbc2a3c6728bc8af4bd1490327f60a9d7823','2026-10-23 11:45:14','2026-10-22 09:45:14'),(18,3,'e342f844d6db2e4dc8ccbc5d672edd0742f733be5ac4cf79f35c51db6cf5e03e','2026-10-23 12:04:19','2026-10-22 10:04:19'),(19,3,'031ed64e47af1eecc30e7bf164e164edac7e866cd7417e1768b1817bd6118406','2026-10-23 12:04:38','2026-10-22 10:04:38'),(20,3,'b2ca51af9d13247276b440722f32ea00a3725a3255d5e4bcfce4478b7f27f516','2026-10-22 13:12:01','2026-10-22 10:12:01'),(21,3,'f827f4a90fdd68961f328a263ce69742d8fbdaab74f63b059bb95622d33bd933','2026-10-23 12:12:31','2026-10-22 10:12:31'),(22,3,'b3bf8b8053fb90c11981ebaf7a99964be703d72b1af0c74bbd07f8307a4b117a','2026-10-23 12:13:43','2026-10-22 10:13:43'),(23,3,'b277ee95a5290ad6305e79ff4971a305540c8a5b87d873fada5b37d49b86ae88','2026-10-23 12:15:33','2026-10-22 10:15:33'),(24,3,'a6fe7727b7f382f647f8b22b4cb8425467218cde777f2d40964ae01b52486c32','2026-10-23 12:17:19','2026-10-22 10:17:19'),(25,3,'bea989f02842fbe97e82ff1797603ad3d4aaad5ef5c2912c15fda64bfc482a5f','2026-10-23 12:20:22','2026-10-22 10:20:22'),(26,3,'1663f6073c6e50bd69487f6865379294caee946bb54a0831d087e13ea104c4c6','2026-10-23 12:27:39','2026-10-22 10:27:39'),(27,3,'8d5bf27594b23fdeb3af2b83d223a2abae16663ab10cd7c0a088a9e1f0e33474','2026-10-23 12:33:55','2026-10-22 10:33:55'),(28,3,'4c19a19018872b11c2be4fb52dc34e85e0d18b12ac2bae7206e80bbe226dcd63','2026-10-23 13:00:03','2026-10-22 11:00:03'),(29,3,'d5d1a8a8c44e4db44ea05a1dbc030864d4cf7f63469d96e1f34efd2577b5bbba','2026-10-23 13:35:46','2026-10-22 11:35:46'),(30,3,'fb45642cc1a3e797b05dd678640aed01f51ac9802b5738d80bf47043882e1105','2026-10-23 15:11:12','2026-10-22 13:11:12'),(32,3,'feda885d4357b47b7df7674d2dc1b065a9c05805f9a06193f4d6fc1948529ded','2026-10-23 15:16:14','2026-10-22 13:16:14');
/*!40000 ALTER TABLE `admin_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'secadmin','secadmin@furnishop.com','$2y$12$1I/qsR.cqzR2ZjX5Nil5HeHpMdwABE0rx1gy.rcCnqNm/SZcTof02','admin','2026-10-13 10:56:12','2026-10-22 09:28:19'),(3,'admin','admin@furnishop.com','$2y$12$osLO38ho6PHPWAttX9dWNerTv0kKTZ9iMoEdTD1b6V6xb7MIjtrLG','admin','2026-10-22 09:25:41','2026-10-22 13:16:14');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cart_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` varchar(80) NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_session_product` (`session_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (2,'test-sess-1',2,2,'2026-09-21 15:35:06'),(4,'sess_cx0akp6jf_1791897592821',26,1,'2026-10-15 06:39:32');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `icon` varchar(16) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Living Room','living-room','Sofas, coffee tables, TV units & recliners for comfortable living','🛋️','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'),(2,'Bedroom','bedroom','Beds, nightstands, dressers & wardrobes for serene sleep spaces','🛏️','https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80'),(3,'Dining Room','dining-room','Dining tables, ergonomic chairs & sideboards for gathering','🍽️','https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80'),(4,'Office & Study','office-study','Desks, executive chairs & bookshelves for high productivity','💼','https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'),(5,'Outdoor & Patio','outdoor-patio','Weatherproof teak lounges, rattan swings & bistro tables','🪴','https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'),(6,'Luxury & Decor','luxury-decor','Console tables, vanity sets, floor lamps & plush rugs','✨','https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'),(7,'Lighting & Accents','lighting-accents','Chanderliers, Nordic floor lamps & decorative wall art','💡','https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=80');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collections`
--

DROP TABLE IF EXISTS `collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `collections` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `banner_image` varchar(500) DEFAULT NULL,
  `discount_tag` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collections`
--

LOCK TABLES `collections` WRITE;
/*!40000 ALTER TABLE `collections` DISABLE KEYS */;
INSERT INTO `collections` VALUES (1,'Nordic Minimalist Suite','nordic-minimalist','Clean lines, natural solid woods & serene neutral textures','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80','Up to 35% OFF'),(2,'Royal Velvet Elegance','royal-velvet','Plush velvet sofas & gold-accented contemporary luxury','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80','Flat 25% OFF'),(3,'Modern Ergonomic Workspace','modern-workspace','Standing desks & lumbar-support executive chairs','https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80','Special Bundle Deal'),(4,'Artisan Teak & Patio','artisan-teak','Handcrafted solid teak dining & outdoor relaxation pieces','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80','Summer Clearance'),(5,'Urban Space Savers','urban-space-savers','Smart multi-functional beds, storage ottomans & modular desks','https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80','Up to 40% OFF'),(6,'Grand Dining Masterpiece','grand-dining','Solid marble top tables with plush padded velvet chairs','https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80','Save ₹8,000 Today'),(7,'Aesthetic Ambient Living','ambient-living','Designer floor lamps, ceramic vases & statement mirrors','https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80','New Arrival');
/*!40000 ALTER TABLE `collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login_attempts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `username` varchar(100) NOT NULL,
  `attempt_time` int(10) unsigned NOT NULL,
  `success` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_ip_time` (`ip_address`,`attempt_time`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
INSERT INTO `login_attempts` VALUES (1,'127.0.0.1','nonexistent',1791888971,0),(2,'127.0.0.1','secadmin',1791888972,1),(3,'127.0.0.1','secadmin',1791898879,1),(4,'127.0.0.1','secadmin',1791898947,1),(5,'127.0.0.1','secadmin',1791899153,0),(6,'127.0.0.1','secadmin',1791899191,0),(7,'127.0.0.1','secadmin',1791902782,1),(8,'127.0.0.1','secadmin',1791903878,1),(9,'127.0.0.1','secadmin',1791906300,1),(10,'127.0.0.1','secadmin',1791911411,1),(11,'127.0.0.1','secadmin',1792002490,1),(12,'127.0.0.1','secadmin',1792004553,1),(13,'127.0.0.1','admin',1792661210,1),(14,'127.0.0.1','admin',1792661235,1),(15,'127.0.0.1','admin',1792661299,1),(16,'127.0.0.1','secadmin',1792661299,1),(17,'127.0.0.1','admin',1792661345,1),(18,'127.0.0.1','admin',1792661617,1),(19,'127.0.0.1','admin',1792661836,1),(20,'127.0.0.1','admin',1792662314,1),(21,'127.0.0.1','admin',1792663459,1),(22,'127.0.0.1','admin',1792663478,1),(23,'127.0.0.1','admin',1792663951,1),(24,'127.0.0.1','admin',1792664023,1),(25,'127.0.0.1','admin',1792664092,0),(26,'127.0.0.1','admin',1792664133,1),(27,'127.0.0.1','admin',1792664239,1),(28,'127.0.0.1','admin',1792664422,1),(29,'127.0.0.1','admin',1792664859,1),(30,'127.0.0.1','secadmin',1792665196,0),(31,'127.0.0.1','admin',1792665235,1),(32,'127.0.0.1','admin',1792666803,1),(33,'127.0.0.1','secadmin',1792668912,0),(34,'127.0.0.1','admin',1792668946,1),(35,'127.0.0.1','wronguser',1792674672,0),(36,'127.0.0.1','admin',1792674672,1),(37,'127.0.0.1','admin',1792674844,1),(38,'127.0.0.1','admin',1792674974,1);
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `newsletter_subscribers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
INSERT INTO `newsletter_subscribers` VALUES (1,'jahirirfan645@gmail.com','2026-10-22 13:15:06');
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image` varchar(500) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (2,2,1,'Nordic Minimalist Oak Armchair','https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',2,14999.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_number` varchar(30) NOT NULL,
  `customer_name` varchar(120) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `customer_phone` varchar(30) DEFAULT NULL,
  `shipping_address` text NOT NULL,
  `payment_method` varchar(50) DEFAULT 'Credit Card',
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Processing',
  `payment_status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `shipping_city` varchar(100) DEFAULT NULL,
  `shipping_pincode` varchar(20) DEFAULT NULL,
  `idempotency_key` varchar(128) DEFAULT NULL,
  `session_id` varchar(80) DEFAULT NULL,
  `subtotal_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  UNIQUE KEY `uq_orders_idempotency` (`idempotency_key`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_payment_status` (`payment_status`),
  KEY `idx_orders_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (2,'FURNI-78ED992E','E2E Tester','e2e@test.com','9999999999','123 Test Lane, QA City, 560001','Credit Card',29998.00,'Processing','pending','2026-09-21 16:09:05',0.00,0.00,NULL,NULL,NULL,NULL,29998.00);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(10) unsigned NOT NULL,
  `brand` varchar(100) NOT NULL DEFAULT 'FurniCraft',
  `collection_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 25,
  `image` varchar(500) NOT NULL,
  `back_image` varchar(500) DEFAULT NULL,
  `additional_images` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `dimensions` varchar(120) DEFAULT NULL,
  `material` varchar(150) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `rating` decimal(3,1) NOT NULL DEFAULT 4.5,
  `reviews_count` int(11) NOT NULL DEFAULT 0,
  `has_offer` tinyint(1) NOT NULL DEFAULT 0,
  `offer_end_time` datetime DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_trending` tinyint(1) NOT NULL DEFAULT 0,
  `stock_status` varchar(50) NOT NULL DEFAULT 'In Stock',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_slug` (`slug`),
  UNIQUE KEY `uq_products_sku` (`sku`),
  KEY `category_id` (`category_id`),
  KEY `collection_id` (`collection_id`),
  KEY `idx_products_slug` (`slug`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_featured` (`is_featured`),
  KEY `idx_products_trending` (`is_trending`),
  KEY `idx_products_price` (`price`),
  KEY `idx_products_created` (`created_at`),
  KEY `idx_products_rating_reviews` (`rating`,`reviews_count`),
  KEY `idx_products_brand` (`brand`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Nordic Living',1,'Nordic Minimalist Oak Armchair','FURNI-LIV-0001','nordic-minimalist-oak-armchair',14999.00,19999.00,14999.00,25,'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80',NULL,'Handcrafted white oak armchair with soft linen upholstery and ergonomic lumbar angle.','W: 75cm x D: 80cm x H: 85cm','Solid White Oak & Organic Linen',NULL,4.8,42,1,NULL,1,1,'In Stock','active','2026-09-21 14:18:52','2026-10-22 10:02:37'),(2,1,'Nordic Living',2,'Royal Emerald Velvet 3-Seater Sofa','FURNI-LIV-0002','royal-emerald-velvet-3-seater-sofa',49999.00,64999.00,49999.00,25,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',NULL,'Deep tufted emerald green velvet sofa featuring brushed gold metal legs.','W: 220cm x D: 95cm x H: 88cm','Plush Royal Velvet & Gold Brass Base',NULL,4.9,88,1,NULL,1,1,'In Stock','active','2026-09-21 14:18:52','2026-10-22 10:02:37'),(3,2,'Royal Sleep',5,'Aura Hydraulic Storage Platform Bed','FURNI-BED-0003','aura-hydraulic-storage-platform-bed',38999.00,49999.00,38999.00,25,'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',NULL,'Queen size hydraulic bed with padded headboard and massive under-bed storage compartment.','W: 160cm x L: 205cm x H: 110cm','Solid Teak & Premium Microfiber',NULL,4.7,36,1,NULL,1,0,'In Stock','active','2026-09-21 14:18:52','2026-10-22 10:02:37'),(4,3,'Artisan Table',6,'Carrara Italian Marble 6-Seater Dining Set','FURNI-DIN-0004','carrara-italian-marble-6-seater-dining-set',68999.00,84999.00,68999.00,25,'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',NULL,'Natural Carrara white marble top dining table accompanied by 6 velvet cushioned chairs.','W: 180cm x D: 90cm x H: 76cm','Italian Marble & Solid Teak Frame',NULL,5.0,54,1,NULL,1,1,'In Stock','active','2026-09-21 14:18:52','2026-10-22 10:02:37'),(5,4,'ErgoCraft',3,'Zenith Electric Dual-Motor Standing Desk','FURNI-OFF-0005','zenith-electric-dual-motor-standing-desk',27999.00,34999.00,27999.00,25,'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',NULL,'Whisper-quiet dual motor standing desk with 4 memory height presets and cable channel.','W: 140cm x D: 70cm x H: 65-130cm','Solid Walnut Top & Heavy Duty Steel Frame',NULL,4.8,67,1,NULL,1,1,'In Stock','active','2026-09-21 14:18:52','2026-10-22 10:02:37'),(6,5,'Teak & Patio',4,'Bali Handcrafted Outdoor Teak Sun Lounge','FURNI-OUT-0006','bali-handcrafted-outdoor-teak-sun-lounge',21999.00,28999.00,21999.00,25,'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&w=800&q=80',NULL,'Weather-proof solid Indonesian teak lounge with quick-dry outdoor foam cushion.','L: 200cm x W: 70cm x H: 35cm','Grade A Indonesian Teak Wood',NULL,4.9,29,0,NULL,0,1,'In Stock','active','2026-09-21 14:18:52','2026-10-22 10:02:37'),(7,7,'Lumière Accents',7,'Nordic Arch Brass Floor Lamp','FURNI-LGT-0007','nordic-arch-brass-floor-lamp',8999.00,11999.00,8999.00,25,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',NULL,'Sleek metallic brass arch floor lamp with weighted marble base and warm LED shade.','Base: 35cm x Arch Span: 110cm x H: 210cm','Brushed Brass & Heavy Marble Base',NULL,4.6,19,1,NULL,0,1,'In Stock','active','2026-09-21 14:18:52','2026-10-22 10:02:37'),(8,6,'Atelier Luxury',1,'Kyoto Geometric Teak Console Table','FURNI-LUX-0008','kyoto-geometric-teak-console-table',16999.00,21999.00,16999.00,25,'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',NULL,'Minimalist console table with fluted wooden slats and hidden touch-latch drawers.','W: 130cm x D: 40cm x H: 80cm','Solid Teak & Brass Knobs',NULL,4.8,31,0,NULL,1,0,'In Stock','active','2026-09-21 14:18:52','2026-10-22 10:02:37'),(10,1,'Nordic Living',2,'Modern Scandinavian Sofa','FURNI-LIV-0010','modern-scandinavian-sofa',18999.00,24999.00,18999.00,20,'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?auto=format&fit=crop&w=800&q=80',NULL,'Premium 3-seater sofa with high-density foam cushioning, stain-resistant velvet fabric, and solid oak wooden legs.','W: 210cm x D: 90cm x H: 85cm','High-grade Velvet & Solid Oak','Charcoal Grey',4.9,142,1,'2026-09-24 17:32:27',1,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(11,1,'Nordic Living',2,'Velvet Accent Armchair','FURNI-LIV-0011','velvet-accent-armchair',8499.00,10999.00,8499.00,30,'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=800&q=80',NULL,'Elegantly contoured accent lounge chair featuring brass metallic legs and deep plush foam padding.','W: 80cm x D: 75cm x H: 90cm','Royal Blue Velvet & Brass Legs','Royal Blue',4.7,88,1,'2026-09-26 17:32:27',1,0,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(12,1,'Nordic Living',1,'Minimalist Marble Coffee Table','FURNI-LIV-0012','minimalist-marble-coffee-table',9999.00,12999.00,9999.00,25,'https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',NULL,'Genuine Italian Carrara marble tabletop supported by a powder-coated geometric black steel frame.','W: 110cm x D: 60cm x H: 45cm','Natural Marble & Steel Frame','White Marble',4.8,64,0,NULL,0,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(13,1,'Nordic Living',5,'Modular L-Shape Sectional Sofa','FURNI-LIV-0013','modular-l-shape-sectional-sofa',34999.00,42999.00,34999.00,10,'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',NULL,'Spacious L-shaped sectional featuring reversible chaise lounger and built-in cup holders & storage.','W: 280cm x D: 160cm x H: 88cm','Textured Linen & Pine Wood','Beige Linen',4.6,95,1,'2026-09-23 17:32:27',1,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(14,2,'Royal Sleep',5,'King Size Upholstered Bed Frame','FURNI-BED-0014','king-size-upholstered-bed-frame',22500.00,28999.00,22500.00,12,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',NULL,'Luxurious tufted headboard king bed with hydraulic under-bed lift-up storage compartment.','W: 195cm x D: 215cm x H: 125cm','Solid Sheesham Wood & Upholstered Linen','Ivory Cream',4.9,110,0,NULL,1,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(15,2,'Royal Sleep',1,'Nordic Solid Oak Nightstand','FURNI-BED-0015','nordic-solid-oak-nightstand',4200.00,5500.00,4200.00,40,'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',NULL,'Sleek double-drawer bedside cabinet crafted from kiln-dried white oak with soft-close runners.','W: 50cm x D: 40cm x H: 55cm','100% Solid White Oak','Natural Oak',4.7,49,0,NULL,0,0,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(16,2,'Royal Sleep',7,'Modern Dressing Table & LED Mirror','FURNI-BED-0016','modern-dressing-table-led-mirror',8499.00,11999.00,8499.00,18,'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',NULL,'Contemporary vanity set with touch-screen dimmable LED illuminated ring mirror and velvet padded stool.','W: 100cm x D: 45cm x H: 135cm','Engineered Wood & Gold Metal','White & Gold',4.8,76,1,'2026-09-25 17:32:27',1,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(17,3,'Artisan Table',6,'Handcrafted Solid Wood 6-Seater Dining Set','FURNI-DIN-0017','handcrafted-solid-wood-6-seater-dining-set',24999.00,31999.00,24999.00,9,'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80',NULL,'Premium 6-seater solid teak dining table complete with 6 cushioned ergonomic dining chairs.','W: 180cm x D: 90cm x H: 76cm','Solid Teak Wood & Cushion Padding','Warm Teak',4.9,134,1,'2026-09-27 17:32:27',1,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(18,3,'Artisan Table',6,'Luxury Italian Marble Dining Table','FURNI-DIN-0018','luxury-italian-marble-dining-table',38999.00,47999.00,38999.00,7,'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',NULL,'Heavyweight natural Italian marble dining table with stainless steel gold-plated pedestal base.','W: 200cm x D: 100cm x H: 76cm','Italian Marble & Stainless Steel','White Marble & Gold',4.8,58,0,NULL,0,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(19,3,'Artisan Table',4,'Ergonomic Velvet Bar Stool Set','FURNI-DIN-0019','ergonomic-velvet-bar-stool-set',6499.00,8999.00,6499.00,35,'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80',NULL,'Set of 2 swivel height-adjustable kitchen island bar stools with footrest and back support.','W: 45cm x D: 45cm x H: 85-105cm','Velvet & Matte Black Iron','Forest Green',4.6,42,1,'2026-09-22 11:32:27',0,0,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(20,4,'ErgoCraft',3,'Executive Ergonomic Standing Desk','FURNI-OFF-0020','executive-ergonomic-standing-desk',15999.00,19999.00,15999.00,22,'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',NULL,'Dual-motor electric height-adjustable office desk with memory presets, cable management & wooden top.','W: 140cm x D: 70cm x H: 70-120cm','Teak Wood Top & Heavy Steel Frame','Teak & Black',4.9,210,1,'2026-09-24 17:32:27',1,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(21,4,'ErgoCraft',3,'High-Back Lumbar Mesh Office Chair','FURNI-OFF-0021','high-back-lumbar-mesh-office-chair',7999.00,10999.00,7999.00,45,'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',NULL,'Professional ergonomic desk chair with 3D adjustable armrests, headrest, and dynamic lumbar support.','W: 65cm x D: 65cm x H: 115-125cm','Breathable Mesh & Alloy Base','Graphite Black',4.7,185,0,NULL,1,0,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(22,4,'ErgoCraft',1,'Industrial Teak & Steel Bookshelf','FURNI-OFF-0022','industrial-teak-steel-bookshelf',6499.00,8499.00,6499.00,16,'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80',NULL,'5-tier open bookcase displaying natural timber shelves held together by rustic metal side pillars.','W: 90cm x D: 35cm x H: 180cm','Reclaimed Teak & Structural Steel','Rustic Teak',4.8,62,0,NULL,0,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(23,5,'Teak & Patio',4,'Teak Outdoor Garden Lounge Set','FURNI-OUT-0023','teak-outdoor-garden-lounge-set',28500.00,34999.00,28500.00,11,'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&w=800&q=80',NULL,'Weatherproof 4-piece patio lounge set including 2 armchairs, 1 sofa, coffee table and waterproof cushions.','W: 200cm x D: 180cm x H: 75cm','All-Weather Teak & Sunbrella Fabric','Natural Teak',4.9,54,1,'2026-09-26 17:32:27',1,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(24,5,'Teak & Patio',4,'Rattan Hanging Patio Swing Chair','FURNI-OUT-0024','rattan-hanging-patio-swing-chair',11999.00,14999.00,11999.00,20,'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',NULL,'Hand-woven synthetic rattan egg swing chair with heavy-duty stand and plush thick cushion pillow.','W: 105cm x D: 105cm x H: 195cm','Weatherproof PE Rattan & Steel Stand','Honey Rattan',4.8,91,0,NULL,1,0,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(25,6,'Atelier Luxury',2,'Gold Accented Console Table','FURNI-LUX-0025','gold-accented-console-table',12499.00,15999.00,12499.00,14,'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',NULL,'Ultra-sleek entry hall console table with faux marble surface and electroplated brushed gold legs.','W: 120cm x D: 35cm x H: 80cm','Faux Marble & Brushed Stainless Gold','White & Gold',4.8,47,1,'2026-09-23 17:32:27',1,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(26,6,'Atelier Luxury',7,'Boho Hand-Knotted Plush Area Rug','FURNI-LUX-0026','boho-hand-knotted-plush-area-rug',5999.00,7999.00,5999.00,28,'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=800&q=80',NULL,'Soft high-pile Moroccan geometric pattern area rug woven from natural organic wool fibers.','W: 200cm x D: 300cm','100% Organic Wool','Multi-Color Boho',4.7,68,0,NULL,0,0,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(27,7,'Lumière Accents',7,'Nordic Architectural Arc Floor Lamp','FURNI-LGT-0027','nordic-architectural-arc-floor-lamp',4999.00,6999.00,4999.00,26,'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80',NULL,'Minimalist overhanging arc floor lamp with marble heavy base and warm dimmable LED globe bulb.','W: 40cm x D: 110cm x H: 205cm','Carrara Marble & Matte Black Steel','Black & Marble',4.9,103,1,'2026-09-24 17:32:27',1,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(28,7,'Lumière Accents',7,'Contemporary Glass Chandelier','FURNI-LGT-0028','contemporary-glass-chandelier',14499.00,18999.00,14499.00,10,'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80',NULL,'Multi-globe amber blown glass chandelier fixture suitable for living room ceilings or dining areas.','W: 85cm x D: 85cm x H: 70cm','Hand-Blown Amber Glass & Brass','Amber Glass',4.8,39,0,NULL,0,1,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(29,7,'Lumière Accents',7,'Aesthetic Ceramic Table Lamp','FURNI-LGT-0029','aesthetic-ceramic-table-lamp',2999.00,3999.00,2999.00,77,'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',NULL,'Textured terracotta ceramic base bedside lamp with linen drum shade and warm ambience.','W: 30cm x D: 30cm x H: 50cm','Glazed Terracotta & Fabric Shade','Terracotta',4.6,52,0,NULL,0,0,'In Stock','active','2026-09-21 15:32:27','2026-10-22 10:02:37'),(75,1,'Nordic Living',NULL,'Velvet Imperial Chaise','FURNI-LIV-9683','velvet-imperial-chaise',4999.00,6499.00,NULL,25,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80','[]','',NULL,NULL,NULL,4.8,0,0,NULL,0,0,'In Stock','active','2026-10-22 10:26:11','2026-10-22 10:26:11'),(77,1,'FurniCraft',2,'Morden sofa','sofa07','morden-sofa',65000.00,74999.86,NULL,25,'/backend/uploads/products/product-1792669098-9c3bb256878a4e41.jpg','/backend/uploads/products/product-1792669098-9c3bb256878a4e41.jpg','[]','',NULL,NULL,NULL,4.8,0,0,NULL,0,0,'In Stock','active','2026-10-22 11:38:41','2026-10-22 13:17:00');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist_items`
--

DROP TABLE IF EXISTS `wishlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wishlist_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` varchar(80) NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wl_session_product` (`session_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlist_items_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist_items`
--

LOCK TABLES `wishlist_items` WRITE;
/*!40000 ALTER TABLE `wishlist_items` DISABLE KEYS */;
INSERT INTO `wishlist_items` VALUES (2,'test-sess-1',5,'2026-09-21 15:35:06'),(3,'sess_cx0akp6jf_1791897592821',26,'2026-10-15 06:51:13');
/*!40000 ALTER TABLE `wishlist_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'furnishop'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-23 19:28:26
