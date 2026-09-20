import React, { useState } from "react";
import { FaTimes, FaStar, FaShoppingCart, FaHeart, FaCheck, FaTruck, FaShieldAlt } from "react-icons/fa";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";

function QuickViewModal({ product, onClose, handleAddToCart, handleWishlist, isWishlisted }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product?.image);

  if (!product) return null;

  const activeImg = selectedImage || product.image;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container quickview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="quickview-grid">
          {/* Gallery View */}
          <div className="quickview-gallery">
            <div className="main-image-wrapper">
              <img
                src={activeImg}
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMG;
                }}
              />
            </div>
            <div className="thumbnail-row">
              <img
                src={product.image}
                alt="Front view"
                className={activeImg === product.image ? "active" : ""}
                onClick={() => setSelectedImage(product.image)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMG;
                }}
              />
              {Boolean(product.back_image || product.backImage) && (
                <img
                  src={product.back_image || product.backImage}
                  alt="Detail view"
                  className={activeImg === (product.back_image || product.backImage) ? "active" : ""}
                  onClick={() => setSelectedImage(product.back_image || product.backImage)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMG;
                  }}
                />
              )}
            </div>
          </div>

          {/* Product Details Info */}
          <div className="quickview-info">
            <span className="category-tag">{product.category_name || "Luxury Furniture"}</span>
            <h2>{product.name}</h2>

            <div className="rating-row">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.floor(product.rating) ? "star-filled" : "star-empty"} />
                ))}
              </div>
              <span>{product.rating} ({product.reviews_count} customer reviews)</span>
            </div>

            <div className="price-row">
              <span className="current-price">₹{Number(product.price).toLocaleString()}</span>
              {product.original_price && (
                <span className="original-price">₹{Number(product.original_price).toLocaleString()}</span>
              )}
              {product.original_price && (
                <span className="savings-badge">
                  Save ₹{Number(product.original_price - product.price).toLocaleString()}
                </span>
              )}
            </div>

            <p className="description">{product.description}</p>

            {/* Spec Highlights */}
            <div className="specs-list">
              <div className="spec-item">
                <strong>Dimensions:</strong> {product.dimensions}
              </div>
              <div className="spec-item">
                <strong>Material:</strong> {product.material}
              </div>
              <div className="spec-item">
                <strong>Availability:</strong> <span className="in-stock"><FaCheck /> {product.stock_status}</span>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="action-row">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <button
                className="btn-primary add-cart-btn"
                onClick={() => {
                  handleAddToCart(product, quantity);
                  onClose();
                }}
              >
                <FaShoppingCart /> Add to Cart
              </button>

              <button
                className={`wishlist-toggle-btn ${isWishlisted ? "active" : ""}`}
                onClick={() => handleWishlist(product)}
                title="Add to Wishlist"
              >
                <FaHeart />
              </button>
            </div>

            {/* Additional Perks */}
            <div className="modal-perks">
              <div><FaTruck /> Express Delivery in 3-5 days</div>
              <div><FaShieldAlt /> 2-Year Manufacturer Warranty</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
