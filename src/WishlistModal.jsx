import React from "react";
import { FaTimes, FaHeart, FaTrash, FaShoppingCart } from "react-icons/fa";

function WishlistModal({ isOpen, onClose, wishlistItems, onToggleWishlist, onAddToCart }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container wishlist-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="title-group">
            <FaHeart className="heart-title-icon" />
            <h2>Your Saved Wishlist ({wishlistItems.length})</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="wishlist-modal-body">
          {wishlistItems.length > 0 ? (
            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <div key={item.id} className="wishlist-card">
                  <img src={item.image} alt={item.name} />
                  <div className="wishlist-card-details">
                    <h4>{item.name}</h4>
                    <p className="price">₹{Number(item.price).toLocaleString()}</p>
                    <div className="stock">{item.stock_status || "In Stock"}</div>
                    
                    <div className="actions">
                      <button
                        className="btn-primary add-btn"
                        onClick={() => {
                          onAddToCart(item);
                        }}
                      >
                        <FaShoppingCart /> Add to Cart
                      </button>

                      <button
                        className="remove-wishlist-btn"
                        onClick={() => onToggleWishlist(item)}
                        title="Remove from Wishlist"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-wishlist-state">
              <FaHeart className="empty-heart-icon" />
              <h3>Your wishlist is empty</h3>
              <p>Click the heart icon on any product to save it to your personal wishlist for later!</p>
              <button className="btn-primary" onClick={onClose}>
                Explore Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WishlistModal;
