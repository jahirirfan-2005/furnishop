import React from "react";
import { FaTruck, FaShieldAlt, FaHeadset, FaUndoAlt, FaArrowRight } from "react-icons/fa";

function HeroBanner({ onSelectCollection }) {
  return (
    <div className="hero-banner-container">
      <div className="hero-content">
        <div className="hero-badge">✨ NEW COLLECTION 2026</div>
        <h1 className="hero-title">
          Elevate Your Space With <span className="highlight-text">Crafted Elegance</span>
        </h1>
        <p className="hero-subtitle">
          Explore over 20+ premium furniture collections for Living Room, Bedroom, Dining & Outdoor. 
          Powered by solid woods, luxury velvets, and Italian marble.
        </p>
        <div className="hero-cta-group">
          <button className="btn-primary" onClick={() => onSelectCollection("all")}>
            Explore All Collections <FaArrowRight />
          </button>
          <button className="btn-secondary" onClick={() => onSelectCollection("nordic-minimalist")}>
            Nordic Minimalist
          </button>
        </div>
      </div>

      {/* Feature Perks Bar */}
      <div className="perks-bar">
        <div className="perk-item">
          <FaTruck className="perk-icon" />
          <div>
            <h4>Free Shipping</h4>
            <p>On orders above ₹10,000</p>
          </div>
        </div>
        <div className="perk-item">
          <FaShieldAlt className="perk-icon" />
          <div>
            <h4>2-Year Warranty</h4>
            <p>Full craftsmanship guarantee</p>
          </div>
        </div>
        <div className="perk-item">
          <FaHeadset className="perk-icon" />
          <div>
            <h4>24/7 Support</h4>
            <p>Dedicated customer service</p>
          </div>
        </div>
        <div className="perk-item">
          <FaUndoAlt className="perk-icon" />
          <div>
            <h4>30-Day Returns</h4>
            <p>Hassle-free replacement</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
