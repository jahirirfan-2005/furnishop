import React from "react";
import { FaTimes, FaTrash, FaShoppingBag, FaArrowRight, FaTruck } from "react-icons/fa";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";

function CartDrawer({ isOpen, onClose, cartItems, onUpdateQty, onRemoveItem, onProceedToCheckout }) {
  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 10000;
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="title-group">
            <FaShoppingBag />
            <h2>Your Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close cart">
            <FaTimes />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="free-shipping-meter">
          <div className="meter-text">
            <FaTruck />
            {subtotal >= FREE_SHIPPING_THRESHOLD ? (
              <span>🎉 Congratulations! You unlocked <strong>FREE Delivery</strong>!</span>
            ) : (
              <span>
                Add <strong>₹{remainingForFreeShipping.toLocaleString()}</strong> more to unlock FREE Delivery
              </span>
            )}
          </div>
          <div className="meter-bar-bg">
            <div className="meter-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="drawer-body">
          {cartItems.length > 0 ? (
            <div className="cart-item-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMG;
                    }}
                  />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <div className="cart-item-price">₹{Number(item.price).toLocaleString()}</div>
                    
                    <div className="cart-item-controls">
                      <div className="qty-picker">
                        <button onClick={() => onUpdateQty(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => onUpdateQty(item.id, item.quantity + 1)}>+</button>
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-cart-state">
              <FaShoppingBag className="empty-bag-icon" />
              <h3>Your cart is empty</h3>
              <p>Explore our latest furniture collections and discover modern pieces for your home.</p>
              <button className="btn-primary" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-row">
              <span>Subtotal</span>
              <span className="summary-subtotal">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row shipping-note">
              <span>Shipping</span>
              <span>{subtotal >= FREE_SHIPPING_THRESHOLD ? "FREE" : "₹499"}</span>
            </div>

            <button className="btn-primary checkout-btn" onClick={onProceedToCheckout}>
              Proceed to Checkout <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
