import React, { useState } from "react";
import { FaShoppingCart, FaHeart, FaSearch, FaMoon, FaSun, FaBars, FaTimes, FaThLarge } from "react-icons/fa";

function Navbar({ 
  cartCount, 
  wishlistCount, 
  onOpenCart, 
  onOpenWishlist, 
  searchTerm, 
  setSearchTerm,
  activeCategory,
  setActiveCategory,
  categories,
  theme,
  toggleTheme
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    const targetEl = document.getElementById("products");
    if (targetEl) {
      const headerNav = document.querySelector(".navbar-container");
      const navOffset = headerNav ? headerNav.offsetHeight : 90;
      const elementPos = targetEl.getBoundingClientRect().top + window.pageYOffset;
      const offsetPos = elementPos - navOffset - 10;
      window.scrollTo({
        top: Math.max(0, offsetPos),
        behavior: "smooth"
      });
    }
  };

  return (
    <header className="navbar-container">
      {/* Top Announcement Ticker */}
      <div className="announcement-bar">
        <span>🎉 Festival Season Sale: Get Up to 40% OFF on Nordic & Royal Collections + Free Shipping nationwide!</span>
      </div>

      <nav className="navbar">
        {/* Mobile Menu Toggle Button */}
        <button 
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Brand Logo */}
        <div className="nav-brand" onClick={() => setActiveCategory("all")}>
          <span className="brand-logo">🪑</span>
          <div className="brand-text">
            <h1>FurniShop</h1>
            <span className="brand-tagline">LUXURY & COMFORT</span>
          </div>
        </div>

        {/* Search Bar (Desktop) */}
        <form className="nav-search-wrapper desktop-search" onSubmit={handleSearchSubmit}>
          <button type="submit" className="search-submit-btn" aria-label="Search">
            <FaSearch className="search-icon" />
          </button>
          <input
            type="text"
            placeholder="Search sofas, dining tables, desks, beds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="nav-search-input"
          />
          {searchTerm && (
            <button type="button" className="clear-search-btn" onClick={() => setSearchTerm("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </form>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          <li className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>
            All Items
          </li>
          {categories.slice(0, 4).map((cat) => (
            <li
              key={cat.id}
              className={activeCategory === cat.slug ? "active" : ""}
              onClick={() => setActiveCategory(cat.slug)}
            >
              {cat.icon} {cat.name}
            </li>
          ))}
        </ul>

        {/* Navigation Action Icons */}
        <div className="nav-actions">
          {/* Theme Toggle */}
          <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme" aria-label="Toggle theme">
            {theme === "dark" ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
          </button>

          {/* Wishlist Button */}
          <button className="icon-btn wishlist-btn" onClick={onOpenWishlist} title="View Wishlist" aria-label="View wishlist">
            <FaHeart />
            {wishlistCount > 0 && <span className="badge-count badge-wishlist">{wishlistCount}</span>}
          </button>

          {/* Cart Button */}
          <button className="icon-btn cart-btn" onClick={onOpenCart} title="Open Cart" aria-label="Open cart">
            <FaShoppingCart />
            {cartCount > 0 && <span className="badge-count badge-cart">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* Mobile Dedicated Search Bar */}
      <div className="mobile-search-container">
        <form className="nav-search-wrapper mobile-search" onSubmit={handleSearchSubmit}>
          <button type="submit" className="search-submit-btn" aria-label="Search">
            <FaSearch className="search-icon" />
          </button>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="nav-search-input"
          />
          {searchTerm && (
            <button type="button" className="clear-search-btn" onClick={() => setSearchTerm("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <h2>Categories</h2>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><FaTimes /></button>
            </div>
            
            <form className="drawer-search-wrapper" onSubmit={handleSearchSubmit}>
              <button type="submit" className="search-submit-btn" aria-label="Search">
                <FaSearch className="search-icon" />
              </button>
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="nav-search-input"
              />
              {searchTerm && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchTerm("")} aria-label="Clear search">
                  ✕
                </button>
              )}
            </form>

            <ul className="mobile-category-list">
              <li
                className={activeCategory === "all" ? "active" : ""}
                onClick={() => {
                  setActiveCategory("all");
                  setMobileMenuOpen(false);
                }}
              >
                <FaThLarge /> All Collections
              </li>
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className={activeCategory === cat.slug ? "active" : ""}
                  onClick={() => {
                    setActiveCategory(cat.slug);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span>{cat.icon} {cat.name}</span>
                  <span className="cat-count">({cat.product_count})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;