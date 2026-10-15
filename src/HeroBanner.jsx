import React from "react";
import { FaTruck, FaShieldAlt, FaHeadset, FaUndoAlt, FaArrowRight } from "react-icons/fa";

// Premium editorial interior imagery (warm, luxury living room).
const HERO_IMAGE = "https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?auto=format&fit=crop&w=1800&q=80";

function HeroBanner({
  activeCategory = "all",
  categories = [],
  productsCount = 0,
  onSelectCollection,
  onSelectCategory
}) {
  const currentCat = activeCategory !== "all"
    ? categories.find((c) => String(c.id) === String(activeCategory) || c.slug === activeCategory)
    : null;

  const bannerImg = currentCat?.image || HERO_IMAGE;

  return (
    <div className={`hero-banner-container ${currentCat ? "category-mode" : ""}`} role="banner">
      {/* Editorial interior imagery with warm walnut overlay */}
      <div className="hero-image-layer" aria-hidden="true">
        <img
          key={bannerImg}
          src={bannerImg}
          alt={currentCat ? `${currentCat.name} Category Banner` : "Luxury Furniture Collection"}
          className="hero-backdrop-img"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
        {currentCat ? (
          <>
            <div className="hero-badge">{currentCat.icon} Curated Category Showcase</div>
            <h1 className="hero-title">
              {currentCat.name} <em className="highlight-text">Collection</em>
            </h1>
            <p className="hero-subtitle">
              {currentCat.description || `Handcrafted luxury furniture designed for refined ${currentCat.name.toLowerCase()} interiors.`}
            </p>
            <div className="hero-cta-group">
              <button
                className="btn-primary"
                onClick={() => {
                  const el = document.getElementById("products");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore {currentCat.name} ({productsCount} {productsCount === 1 ? "Piece" : "Pieces"}) <FaArrowRight className="cta-arrow" />
              </button>
              <button
                className="btn-secondary"
                onClick={() => onSelectCategory && onSelectCategory("all")}
              >
                ← View All Categories
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="hero-badge">The 2026 Collection</div>
            <h1 className="hero-title">
              Timeless Furniture for <em className="highlight-text">Considered Living</em>
            </h1>
            <p className="hero-subtitle">
              Rare solid woods, luxury velvets and Italian marble — crafted in small
              batches for living rooms, bedrooms, dining and workspace sanctuaries.
            </p>
            <div className="hero-cta-group">
              <button className="btn-primary" onClick={() => onSelectCollection("all")}>
                Explore the Collection <FaArrowRight className="cta-arrow" />
              </button>
              <button className="btn-secondary" onClick={() => onSelectCollection("nordic-minimalist")}>
                View Nordic Suite
              </button>
            </div>
          </>
        )}
      </div>

      {/* Feature Perks Bar */}
      <div className="perks-bar">
        <div className="perk-item">
          <FaTruck className="perk-icon" />
          <div>
            <h4>Complimentary Delivery</h4>
            <p>On orders above ₹10,000</p>
          </div>
        </div>
        <div className="perk-item">
          <FaShieldAlt className="perk-icon" />
          <div>
            <h4>2-Year Atelier Warranty</h4>
            <p>Full craftsmanship guarantee</p>
          </div>
        </div>
        <div className="perk-item">
          <FaHeadset className="perk-icon" />
          <div>
            <h4>White-Glove Support</h4>
            <p>Dedicated client service</p>
          </div>
        </div>
        <div className="perk-item">
          <FaUndoAlt className="perk-icon" />
          <div>
            <h4>30-Day Returns</h4>
            <p>Discreet, easy replacement</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
