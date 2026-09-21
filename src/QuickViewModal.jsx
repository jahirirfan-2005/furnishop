import React, { useState } from "react";
import { FaTimes, FaStar, FaShoppingCart, FaHeart, FaCheck, FaTruck, FaShieldAlt, FaBolt, FaBoxOpen } from "react-icons/fa";
import { resolveImageUrl } from "./api";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";

function QuickViewModal({ product, onClose, handleAddToCart, handleWishlist, isWishlisted, onBuyNow }) {
  // State is initialized from props; App.jsx remounts this modal with a `key`
  // per product so a stale quantity/image never carries over.
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(() => resolveImageUrl(product?.image));

  if (!product) return null;

  const gallery = [
    { src: resolveImageUrl(product.image), alt: "Front view" },
    ...(product.back_image ? [{ src: resolveImageUrl(product.back_image), alt: "Detail view" }] : []),
    ...((product.additional_images_arr || []).map((img, i) => ({ src: resolveImageUrl(img), alt: `View ${i + 3}` })))
  ].filter((g, i, arr) => g.src && arr.findIndex((x) => x.src === g.src) === i);

  const activeImg = selectedImage || resolveImageUrl(product.image);
  const outOfStock = product.stock_status === "Out of Stock" || product.stock_quantity === 0;
  const discountPrice = product.discount_price && product.discount_price < product.price ? product.discount_price : null;
  const effectivePrice = discountPrice ?? product.price;
  const originalPrice = product.original_price && product.original_price > effectivePrice ? product.original_price : null;

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
              {discountPrice && <span className="discount-tag">-{Math.round(((product.price - discountPrice) / product.price) * 100)}%</span>}
            </div>
            <div className="thumbnail-row">
              {gallery.map((g, i) => (
                <img
                  key={i}
                  src={g.src}
                  alt={g.alt}
                  className={activeImg === g.src ? "active" : ""}
                  onClick={() => setSelectedImage(g.src)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMG;
                  }}
                />
              ))}
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
              <span className="current-price">₹{Number(effectivePrice).toLocaleString()}</span>
              {originalPrice && (
                <span className="original-price">₹{Number(originalPrice).toLocaleString()}</span>
              )}
              {originalPrice && (
                <span className="savings-badge">
                  Save ₹{Number(originalPrice - effectivePrice).toLocaleString()}
                </span>
              )}
            </div>

            <p className="description">{product.description}</p>

            {/* Spec Highlights */}
            <div className="specs-list">
              <div className="spec-item">
                <strong>Dimensions:</strong> {product.dimensions || "—"}
              </div>
              <div className="spec-item">
                <strong>Material:</strong> {product.material || "—"}
              </div>
              <div className="spec-item">
                <strong>Color:</strong> {product.color || "—"}
              </div>
              <div className="spec-item">
                <strong>Availability:</strong>{" "}
                {outOfStock ? (
                  <span className="out-of-stock"><FaTimes /> Out of Stock</span>
                ) : (
                  <span className="in-stock"><FaCheck /> {product.stock_status || "In Stock"}{product.stock_quantity ? ` (${product.stock_quantity} units)` : ""}</span>
                )}
              </div>
            </div>

            {/* Quantity Selector & Actions */}
            <div className="action-row">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(99, quantity + 1))}>+</button>
              </div>

              <button
                className="btn-primary add-cart-btn"
                disabled={outOfStock}
                onClick={() => {
                  handleAddToCart(product, quantity);
                  onClose();
                }}
              >
                <FaShoppingCart /> {outOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                className={`wishlist-toggle-btn ${isWishlisted ? "active" : ""}`}
                onClick={() => handleWishlist(product)}
                title="Add to Wishlist"
              >
                <FaHeart />
              </button>
            </div>

            {/* Buy Now - add to cart and jump straight to checkout */}
            <button
              className="btn-secondary buy-now-btn"
              disabled={outOfStock}
              onClick={() => {
                handleAddToCart(product, quantity);
                onClose();
                if (onBuyNow) onBuyNow(product);
              }}
            >
              <FaBolt /> {outOfStock ? "Currently Unavailable" : "Buy Now"}
            </button>

            {/* Additional Perks */}
            <div className="modal-perks">
              <div><FaTruck /> Express Delivery in 3-5 days</div>
              <div><FaShieldAlt /> 2-Year Manufacturer Warranty</div>
              <div><FaBoxOpen /> Easy 30-Day Returns</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
