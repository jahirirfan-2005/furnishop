import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaHeart, FaStar, FaEye, FaSyncAlt } from "react-icons/fa";

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";
const BACK_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80";

function ProductCard({ item, handleAddToCart, handleWishlist, isWishlisted, onQuickView }) {
  const [flipped, setFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Real-time offer countdown timer logic
  useEffect(() => {
    if (!item.has_offer || !item.offer_end_time) return;

    const endTime = new Date(item.offer_end_time).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.floor((endTime - now) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [item.has_offer, item.offer_end_time]);

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hrs = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m`;
    }
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate discount percentage
  const discountPercent = item.original_price
    ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
    : null;

  return (
    <div className={`card ${flipped ? "flipped" : ""}`}>
      <div className="card-inner">
        {/* FRONT SIDE */}
        <div className="card-front">
          {/* Discount Badge */}
          {discountPercent && (
            <div className="discount-tag">-{discountPercent}%</div>
          )}

          {/* Offer Countdown Badge */}
          {item.has_offer && (
            <div className="offer-badge">
              {timeLeft > 0 ? (
                <span>⏳ {formatTime(timeLeft)}</span>
              ) : (
                <span className="expired">❌ Offer Ended</span>
              )}
            </div>
          )}

          {/* Wishlist Icon */}
          <button
            className={`icon-top wishlist-icon ${isWishlisted ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleWishlist(item);
            }}
            title="Add to Wishlist"
          >
            <FaHeart />
          </button>

          {/* Quick View Button */}
          <button
            className="icon-top quickview-icon"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(item);
            }}
            title="Quick View Details"
          >
            <FaEye />
          </button>

          {/* Flip Card Action Trigger */}
          <button
            className="icon-top flip-icon"
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(!flipped);
            }}
            title="Flip to view alternate photo"
          >
            <FaSyncAlt />
          </button>

          {/* Product Image */}
          <div className="card-image-wrapper" onClick={() => onQuickView(item)}>
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_FALLBACK_IMAGE;
              }}
            />
          </div>

          {/* Card Body */}
          <div className="card-body">
            <div className="category-pill">{item.category_name || "Furniture"}</div>
            <h3 onClick={() => onQuickView(item)} className="product-name">{item.name}</h3>

            <div className="rating-row">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.floor(item.rating) ? "star-filled" : "star-empty"} />
                ))}
              </div>
              <span className="rating-score">{item.rating} ({item.reviews_count})</span>
            </div>

            <div className="price-row">
              <span className="current-price">₹{Number(item.price).toLocaleString()}</span>
              {item.original_price && (
                <span className="original-price">₹{Number(item.original_price).toLocaleString()}</span>
              )}
            </div>

            <button
              className="add-to-cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
            >
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        </div>

        {/* BACK SIDE (Flip View) */}
        <div className="card-back">
          <button
            className="icon-top flip-icon"
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(!flipped);
            }}
            title="Flip back"
          >
            <FaSyncAlt />
          </button>
          <div className="card-back-image-wrapper" onClick={() => setFlipped(false)}>
            <img
              src={item.back_image || item.backImage || item.image}
              alt={`${item.name} Detail`}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = BACK_FALLBACK_IMAGE;
              }}
            />
          </div>
          <div className="card-back-details">
            <h4>{item.name} Specifications</h4>
            <p className="description">{item.description}</p>
            <div className="specs-grid">
              <div><strong>Dimensions:</strong> {item.dimensions}</div>
              <div><strong>Material:</strong> {item.material}</div>
              <div><strong>Stock:</strong> {item.stock_status}</div>
            </div>
            <button
              className="add-to-cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
            >
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;