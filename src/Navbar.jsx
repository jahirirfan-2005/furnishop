import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaShoppingCart,
  FaHeart,
  FaSearch,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaThLarge,
  FaUserShield,
  FaSpinner,
  FaTag
} from "react-icons/fa";
import { api, resolveImageUrl } from "./api";

function Navbar({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAdminPanel,
  searchTerm,
  setSearchTerm,
  activeCategory,
  setActiveCategory,
  categories = [],
  theme,
  toggleTheme,
  onSelectProduct
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchTerm || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapperRef = useRef(null);
  const mobileSearchWrapperRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync internal input value if searchTerm is cleared from outside
  useEffect(() => {
    setInputValue(searchTerm || "");
  }, [searchTerm]);

  // Debounced search query for live suggestions while typing
  const fetchSuggestions = useCallback(async (query) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await api.getProducts({ search: trimmed, limit: 6 });
      if (res.status === "success" && Array.isArray(res.data)) {
        setSuggestions(res.data.slice(0, 6));
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setShowSuggestions(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length >= 2) {
      setIsSearching(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(val);
      }, 250);
    } else {
      setSuggestions([]);
      setIsSearching(false);
      if (val.trim() === "") {
        setSearchTerm("");
      }
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inDesktop = searchWrapperRef.current && searchWrapperRef.current.contains(event.target);
      const inMobile = mobileSearchWrapperRef.current && mobileSearchWrapperRef.current.contains(event.target);
      if (!inDesktop && !inMobile) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    const finalTerm = inputValue.trim();
    setSearchTerm(finalTerm);

    // Smooth scroll to products listing section
    setTimeout(() => {
      const targetEl = document.getElementById("products");
      if (targetEl) {
        const headerNav = document.querySelector(".navbar-container");
        const navOffset = headerNav ? headerNav.offsetHeight : 120;
        const elementPos = targetEl.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: Math.max(0, elementPos - navOffset - 10),
          behavior: "smooth"
        });
      }
    }, 50);
  };

  const handleClearSearch = () => {
    setInputValue("");
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (product) => {
    setInputValue(product.name);
    setSearchTerm(product.name);
    setShowSuggestions(false);

    if (onSelectProduct) {
      onSelectProduct(product);
    }

    setTimeout(() => {
      const targetEl = document.getElementById("products");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  const handleCategorySelect = (slug) => {
    setActiveCategory(slug);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    setTimeout(() => {
      const targetEl = document.getElementById("products");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <header className="navbar-container">
      {/* Top Promotional Sale Banner */}
      <div className="announcement-bar">
        <span>🎉 Festival Season Sale: Up to 40% OFF on Nordic & Royal Collections + Free Shipping nationwide!</span>
      </div>

      {/* Main Header Row */}
      <div className="navbar-main">
        {/* Mobile Menu Toggle Button */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Brand Logo & Tagline */}
        <div className="nav-brand" onClick={() => handleCategorySelect("all")} title="FurniShop Home">
          <span className="brand-logo" role="img" aria-label="FurniShop Logo">🪑</span>
          <div className="brand-text">
            <span className="brand-title">FurniShop</span>
            <span className="brand-tagline">LUXURY & COMFORT</span>
          </div>
        </div>

        {/* Desktop Search Bar with Live Suggestions Dropdown */}
        <div className="nav-search-outer desktop-search" ref={searchWrapperRef}>
          <form className="nav-search-wrapper" onSubmit={handleSearchSubmit} role="search">
            <button type="submit" className="search-submit-btn" aria-label="Search catalog">
              {isSearching ? <FaSpinner className="spin search-spinner-icon" /> : <FaSearch className="search-icon" />}
            </button>
            <input
              type="text"
              placeholder="Search by product name, category, brand, or SKU..."
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => {
                if (inputValue.trim().length >= 2) setShowSuggestions(true);
              }}
              className="nav-search-input"
              autoComplete="off"
              spellCheck="false"
            />
            {inputValue && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={handleClearSearch}
                aria-label="Clear search input"
              >
                ✕
              </button>
            )}
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && inputValue.trim().length >= 2 && (
            <div className="search-suggestions-dropdown" role="listbox">
              {isSearching && suggestions.length === 0 ? (
                <div className="suggestion-status-msg">
                  <FaSpinner className="spin" /> Searching product database...
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="suggestions-header">
                    <span>Products matching "{inputValue}"</span>
                    <span className="suggestions-count">{suggestions.length} items</span>
                  </div>
                  <ul className="suggestions-list">
                    {suggestions.map((item) => (
                      <li
                        key={item.id}
                        className="suggestion-item"
                        onClick={() => handleSelectSuggestion(item)}
                        role="option"
                        aria-selected="false"
                      >
                        <img
                          src={resolveImageUrl(item.image)}
                          alt={item.name}
                          className="suggestion-thumbnail"
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='%23ccc'%3E%3Crect width='48' height='48' fill='%23eee'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='20'%3E🛋️%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="suggestion-meta">
                          <span className="suggestion-name">{item.name}</span>
                          <div className="suggestion-tags">
                            {item.brand && <span className="suggestion-brand"><FaTag style={{ fontSize: "9px" }} /> {item.brand}</span>}
                            {item.category_name && <span className="suggestion-cat">{item.category_name}</span>}
                            {item.sku && <span className="suggestion-sku">SKU: {item.sku}</span>}
                          </div>
                        </div>
                        <div className="suggestion-pricing">
                          <span className="suggestion-price">₹{Number(item.price || 0).toLocaleString("en-IN")}</span>
                          {item.original_price && Number(item.original_price) > Number(item.price) && (
                            <span className="suggestion-original-price">₹{Number(item.original_price).toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="suggestions-footer" onClick={handleSearchSubmit}>
                    Press <strong>Enter</strong> to view all results for "{inputValue}" →
                  </div>
                </>
              ) : (
                <div className="suggestion-no-results">
                  <p>No products found for "<strong>{inputValue}</strong>"</p>
                  <span className="suggestion-tip">Try searching for sofa, bed, dining, desk, lamp, oak, or SKU</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right-aligned Navigation Controls */}
        <div className="nav-actions">
          {/* Admin Panel Button */}
          <button
            className="admin-nav-btn"
            onClick={onOpenAdminPanel}
            title="Open Database Admin Management"
            aria-label="Open database admin management"
          >
            <FaUserShield className="admin-icon" />
            <span className="admin-btn-label">Admin</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            className="icon-btn theme-toggle"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle visual theme"
          >
            {theme === "dark" ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
          </button>

          {/* Wishlist Button */}
          <button
            className="icon-btn wishlist-btn"
            onClick={onOpenWishlist}
            title="View Saved Wishlist"
            aria-label="View saved wishlist"
          >
            <FaHeart />
            {wishlistCount > 0 && <span className="badge-count badge-wishlist">{wishlistCount}</span>}
          </button>

          {/* Cart Button */}
          <button
            className="icon-btn cart-btn"
            onClick={onOpenCart}
            title="Open Shopping Cart"
            aria-label="Open shopping cart"
          >
            <FaShoppingCart />
            {cartCount > 0 && <span className="badge-count badge-cart">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Desktop Secondary Tier: Luxury Category Navigation Bar */}
      <nav className="navbar-category-bar desktop-category-bar" aria-label="Category navigation">
        <ul className="category-nav-list">
          <li
            className={`category-nav-item ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => handleCategorySelect("all")}
          >
            All Items
          </li>
          {categories.map((cat) => (
            <li
              key={cat.id}
              className={`category-nav-item ${
                activeCategory === cat.slug || String(activeCategory) === String(cat.id) ? "active" : ""
              }`}
              onClick={() => handleCategorySelect(cat.slug)}
            >
              <span className="cat-nav-icon">{cat.icon}</span>
              <span className="cat-nav-name">{cat.name}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Dedicated Search Bar (Visible on mobile viewports) */}
      <div className="mobile-search-container" ref={mobileSearchWrapperRef}>
        <form className="nav-search-wrapper mobile-search" onSubmit={handleSearchSubmit} role="search">
          <button type="submit" className="search-submit-btn" aria-label="Search catalog">
            {isSearching ? <FaSpinner className="spin search-spinner-icon" /> : <FaSearch className="search-icon" />}
          </button>
          <input
            type="text"
            placeholder="Search sofas, beds, desks, brands, SKUs..."
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (inputValue.trim().length >= 2) setShowSuggestions(true);
            }}
            className="nav-search-input"
            autoComplete="off"
            spellCheck="false"
          />
          {inputValue && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={handleClearSearch}
              aria-label="Clear search input"
            >
              ✕
            </button>
          )}
        </form>

        {/* Mobile Suggestions Dropdown */}
        {showSuggestions && inputValue.trim().length >= 2 && (
          <div className="search-suggestions-dropdown mobile-suggestions-dropdown" role="listbox">
            {isSearching && suggestions.length === 0 ? (
              <div className="suggestion-status-msg">
                <FaSpinner className="spin" /> Searching products...
              </div>
            ) : suggestions.length > 0 ? (
              <>
                <div className="suggestions-header">
                  <span>Results for "{inputValue}"</span>
                  <span className="suggestions-count">{suggestions.length} found</span>
                </div>
                <ul className="suggestions-list">
                  {suggestions.map((item) => (
                    <li
                      key={item.id}
                      className="suggestion-item"
                      onClick={() => handleSelectSuggestion(item)}
                      role="option"
                      aria-selected="false"
                    >
                      <img
                        src={resolveImageUrl(item.image)}
                        alt={item.name}
                        className="suggestion-thumbnail"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' fill='%23ccc'%3E%3Crect width='44' height='44' fill='%23eee'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='18'%3E🛋️%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <div className="suggestion-meta">
                        <span className="suggestion-name">{item.name}</span>
                        <div className="suggestion-tags">
                          {item.brand && <span className="suggestion-brand">{item.brand}</span>}
                          {item.category_name && <span className="suggestion-cat">{item.category_name}</span>}
                        </div>
                      </div>
                      <div className="suggestion-pricing">
                        <span className="suggestion-price">₹{Number(item.price || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="suggestions-footer" onClick={handleSearchSubmit}>
                  Tap to see all results →
                </div>
              </>
            ) : (
              <div className="suggestion-no-results">
                <p>No products found for "<strong>{inputValue}</strong>"</p>
                <span className="suggestion-tip">Try searching for sofa, table, bed, lamp, or desk</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="drawer-brand">
                <span>🪑</span>
                <h3>FurniShop</h3>
              </div>
              <button
                className="drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mobile-drawer-body">
              <span className="drawer-section-title">Shop by Category</span>
              <ul className="mobile-category-list">
                <li
                  className={`mobile-category-item ${activeCategory === "all" ? "active" : ""}`}
                  onClick={() => handleCategorySelect("all")}
                >
                  <span className="mob-cat-left">
                    <FaThLarge className="mob-cat-icon" /> All Collections
                  </span>
                  <span className="cat-count">
                    ({categories.reduce((acc, c) => acc + (c.product_count ?? c.products_count ?? 0), 0)})
                  </span>
                </li>
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className={`mobile-category-item ${
                      activeCategory === cat.slug || String(activeCategory) === String(cat.id) ? "active" : ""
                    }`}
                    onClick={() => handleCategorySelect(cat.slug)}
                  >
                    <span className="mob-cat-left">
                      <span className="mob-cat-icon">{cat.icon}</span> {cat.name}
                    </span>
                    <span className="cat-count">({cat.product_count ?? cat.products_count ?? 0})</span>
                  </li>
                ))}
              </ul>

              <div className="drawer-admin-section">
                <button
                  className="drawer-admin-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminPanel();
                  }}
                >
                  <FaUserShield /> Database Admin Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;