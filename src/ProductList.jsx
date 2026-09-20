import React from "react";
import ProductCard from "./ProductCard";
import { FaFilter, FaSortAmountDown, FaSearch, FaBoxOpen } from "react-icons/fa";

function ProductList({
  products,
  loading,
  categories,
  collections,
  activeCategory,
  setActiveCategory,
  activeCollection,
  setActiveCollection,
  sortBy,
  setSortBy,
  searchTerm,
  setSearchTerm,
  handleAddToCart,
  handleWishlist,
  wishlistItems,
  onQuickView
}) {
  // Check if product is in wishlist
  const isWishlisted = (id) => wishlistItems.some((w) => w.id === id);

  return (
    <section className="products-section" id="products">
      {/* Collection Tabs Header */}
      <div className="collection-tabs-container">
        <h2 className="section-title">Explore Featured Collections</h2>
        <div className="collection-tabs-scroll">
          <button
            className={`collection-tab ${activeCollection === "all" ? "active" : ""}`}
            onClick={() => setActiveCollection("all")}
          >
            All Collections
          </button>
          {collections.map((col) => (
            <button
              key={col.id}
              className={`collection-tab ${activeCollection === col.slug ? "active" : ""}`}
              onClick={() => setActiveCollection(col.slug)}
            >
              <span className="tab-title">{col.title}</span>
              <span className="tab-tag">{col.discount_tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Sort Controls Bar */}
      <div className="filter-bar">
        {/* Category Pills */}
        <div className="category-pills">
          <button
            className={`pill ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`pill ${activeCategory === cat.slug ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.slug)}
            >
              {cat.icon} {cat.name} ({cat.product_count})
            </button>
          ))}
        </div>

        {/* Sort Select Dropdown */}
        <div className="sort-wrapper">
          <FaSortAmountDown className="sort-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="offers">Flash Sale Offers</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Search Feedback Summary */}
      {searchTerm && (
        <div className="search-summary-bar">
          <span>
            Search results for <strong>"{searchTerm}"</strong> ({products.length} {products.length === 1 ? "product" : "products"} found)
          </span>
          <button onClick={() => setSearchTerm("")}>Clear Search</button>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="skeleton-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-img"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              handleAddToCart={handleAddToCart}
              handleWishlist={handleWishlist}
              isWishlisted={isWishlisted(item.id)}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <FaBoxOpen className="empty-icon" />
          <h3>No products found for '{searchTerm}'.</h3>
          <p>Try searching for a different keyword or clear your search to view all items.</p>
          <button
            className="btn-primary"
            onClick={() => {
              setActiveCategory("all");
              setActiveCollection("all");
              setSearchTerm("");
            }}
          >
            Clear Search & Display All Products
          </button>
        </div>
      )}
    </section>
  );
}

export default ProductList;
