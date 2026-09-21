import React, { useState } from "react";
import { FaPaperPlane, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "./api";

function Footer({ categories, onSelectCategory }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const res = await api.subscribeNewsletter(email);
      if (res.status === "success") {
        toast.success(res.message);
        setEmail("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="footer-container">
      {/* Newsletter Section */}
      <div className="newsletter-box">
        <div className="newsletter-text">
          <h3>Subscribe to FurniShop Insider</h3>
          <p>Get exclusive early access to festival sales, new arrivals, and design tips.</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Enter your email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            <FaPaperPlane /> Subscribe
          </button>
        </form>
      </div>

      {/* Main Footer Links */}
      <div className="footer-links-grid">
        <div className="footer-col brand-col">
          <div className="brand-logo-group">
            <span className="logo-icon">🪑</span>
            <h2>FurniShop</h2>
          </div>
          <p className="brand-desc">
            Premium handcrafted furniture designed for modern homes. Sustainable solid woods, 
            luxurious fabrics, and timeless Scandinavian craftsmanship.
          </p>
          <div className="contact-info">
            <p><FaMapMarkerAlt /> 108 Design Boulevard, Silicon Valley, CA</p>
            <p><FaPhone /> +1 (800) 555-FURNI (38764)</p>
            <p><FaEnvelope /> support@furnishop.com</p>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore Categories</h4>
          <ul>
            {categories.map((cat) => (
              <li key={cat.id} onClick={() => onSelectCategory(cat.slug)}>
                {cat.icon} {cat.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li>Track Your Order</li>
            <li>Shipping & Delivery</li>
            <li>Returns & Refund Policy</li>
            <li>Assembly Instructions</li>
            <li>2-Year Warranty Terms</li>
            <li>FAQs & Help Center</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Our Collections</h4>
          <ul>
            <li>Nordic Minimalist Suite</li>
            <li>Royal Velvet Elegance</li>
            <li>Modern Workspace</li>
            <li>Artisan Teak & Patio</li>
            <li>Urban Space Savers</li>
            <li>Grand Dining Masterpiece</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <p>© 2026 FurniShop E-Commerce Inc. All Rights Reserved.</p>
        <p>Built with PHP 8.2 + MySQL & React</p>
      </div>
    </footer>
  );
}

export default Footer;
