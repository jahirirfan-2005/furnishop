import React from "react";
import { FaTruck, FaShieldAlt, FaHeadset, FaUndoAlt, FaArrowRight } from "react-icons/fa";

// Premium editorial interior imagery (warm, luxury living room).
const HERO_IMAGE = "https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?auto=format&fit=crop&w=1800&q=80";

function HeroBanner({ onSelectCollection }) {
  return (
    <div className="hero-banner-container" role="banner">
      {/* Editorial interior imagery with warm walnut overlay */}
      <div className="hero-image-layer" aria-hidden="true">
        <img
          src={HERO_IMAGE}
          alt=""
          className="hero-backdrop-img"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
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
