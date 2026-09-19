import React, { useState } from "react";
import { FaTimes, FaCheckCircle, FaLock, FaCreditCard, FaTruck, FaMoneyBillWave } from "react-icons/fa";

function CheckoutModal({ isOpen, onClose, cartItems, onOrderSuccess }) {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    payment_method: "Credit Card"
  });

  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 10000 ? 0 : 499;
  const grandTotal = subtotal + shipping;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.customer_name || !formData.customer_email || !formData.shipping_address) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await onOrderSuccess({
        ...formData,
        items: cartItems
      });

      if (res && res.status === "success") {
        setOrderResult(res);
      } else {
        setErrorMsg(res?.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Connection error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {orderResult ? (
          /* Success Confirmation View */
          <div className="order-success-view">
            <FaCheckCircle className="success-icon" />
            <h2>Order Placed Successfully!</h2>
            <p className="order-num">Order Reference: <strong>{orderResult.order_number}</strong></p>
            <p className="success-message">
              Thank you <strong>{orderResult.customer_name}</strong>! Your order details have been stored in our database. 
              We've sent a confirmation email to your address.
            </p>

            <div className="order-summary-box">
              <div className="row">
                <span>Total Amount Paid:</span>
                <strong>₹{Number(orderResult.total_amount).toLocaleString()}</strong>
              </div>
              <div className="row">
                <span>Estimated Delivery:</span>
                <strong>3-5 Business Days</strong>
              </div>
            </div>

            <button className="btn-primary" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <div className="checkout-grid">
            {/* Form Column */}
            <div className="checkout-form-col">
              <h2>Checkout Shipping & Billing</h2>
              <p className="subtitle"><FaLock /> 256-bit Encrypted Secure Checkout</p>

              {errorMsg && <div className="error-alert">{errorMsg}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="customer_name"
                    placeholder="e.g. John Doe"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="customer_email"
                      placeholder="john@example.com"
                      value={formData.customer_email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="customer_phone"
                      placeholder="+91 9876543210"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Shipping Address *</label>
                  <textarea
                    name="shipping_address"
                    rows="3"
                    placeholder="Street, Apartment/Suite, City, Postal Code"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Select Payment Method</label>
                  <div className="payment-options">
                    <label className={`payment-option ${formData.payment_method === "Credit Card" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="Credit Card"
                        checked={formData.payment_method === "Credit Card"}
                        onChange={handleChange}
                      />
                      <FaCreditCard /> Credit / Debit Card
                    </label>

                    <label className={`payment-option ${formData.payment_method === "UPI" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="UPI"
                        checked={formData.payment_method === "UPI"}
                        onChange={handleChange}
                      />
                      ⚡ Instant UPI / GPay
                    </label>

                    <label className={`payment-option ${formData.payment_method === "COD" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="COD"
                        checked={formData.payment_method === "COD"}
                        onChange={handleChange}
                      />
                      <FaMoneyBillWave /> Cash on Delivery
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn-primary place-order-btn" disabled={loading}>
                  {loading ? "Processing Order..." : `Place Order (₹${grandTotal.toLocaleString()})`}
                </button>
              </form>
            </div>

            {/* Order Items Summary Column */}
            <div className="checkout-summary-col">
              <h3>Order Items ({cartItems.length})</h3>

              <div className="summary-items-scroll">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <img src={item.image} alt={item.name} />
                    <div className="info">
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity} x ₹{Number(item.price).toLocaleString()}</p>
                    </div>
                    <div className="total">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cost-breakdown">
                <div className="row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <div className="row grand-total">
                  <span>Total Payable</span>
                  <strong>₹{grandTotal.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutModal;
