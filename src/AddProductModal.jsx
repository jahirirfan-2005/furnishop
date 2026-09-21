import React, { useState } from "react";
import { FaTimes, FaPlusCircle, FaImage, FaTag, FaBoxes, FaLayerGroup } from "react-icons/fa";

function AddProductModal({ isOpen, onClose, categories, collections, onProductAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    category_id: categories.length > 0 ? categories[0].id : 1,
    collection_id: "",
    price: "",
    original_price: "",
    image: "",
    back_image: "",
    description: "",
    dimensions: "W: 180cm x D: 90cm x H: 85cm",
    material: "Solid Teak Wood & Velvet",
    rating: "4.8",
    stock_status: "In Stock",
    has_offer: false,
    is_featured: true,
    is_trending: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Please enter a product name.");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setErrorMsg("Please enter a valid price.");
      return;
    }
    if (!formData.image.trim()) {
      setErrorMsg("Please enter a primary image URL.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category_id: parseInt(formData.category_id, 10),
        collection_id: formData.collection_id ? parseInt(formData.collection_id, 10) : null,
        rating: parseFloat(formData.rating) || 4.5
      };

      await onProductAdded(payload);
      onClose();
      // Reset form
      setFormData({
        name: "",
        category_id: categories.length > 0 ? categories[0].id : 1,
        collection_id: "",
        price: "",
        original_price: "",
        image: "",
        back_image: "",
        description: "",
        dimensions: "W: 180cm x D: 90cm x H: 85cm",
        material: "Solid Teak Wood & Velvet",
        rating: "4.8",
        stock_status: "In Stock",
        has_offer: false,
        is_featured: true,
        is_trending: false
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to store product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container add-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-wrapper">
            <FaPlusCircle className="modal-icon" />
            <div>
              <h2>Store New Product in Database</h2>
              <p className="modal-subtitle">Fill in the details below to add a product into FurniShop database</p>
            </div>
          </div>
          <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>

        {errorMsg && <div className="form-error-alert">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-grid">
            {/* Product Name */}
            <div className="form-group full-width">
              <label htmlFor="prod-name">Product Name *</label>
              <div className="input-with-icon">
                <FaTag className="field-icon" />
                <input
                  id="prod-name"
                  type="text"
                  name="name"
                  placeholder="e.g. Modern Scandinavian Oak Chair"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="prod-category">Category *</label>
              <div className="input-with-icon">
                <FaBoxes className="field-icon" />
                <select
                  id="prod-category"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Collection */}
            <div className="form-group">
              <label htmlFor="prod-collection">Collection (Optional)</label>
              <div className="input-with-icon">
                <FaLayerGroup className="field-icon" />
                <select
                  id="prod-collection"
                  name="collection_id"
                  value={formData.collection_id}
                  onChange={handleChange}
                >
                  <option value="">-- No Specific Collection --</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="prod-price">Sale Price (₹) *</label>
              <input
                id="prod-price"
                type="number"
                step="0.01"
                name="price"
                placeholder="14999.00"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            {/* Original Price */}
            <div className="form-group">
              <label htmlFor="prod-orig-price">Original Price (₹)</label>
              <input
                id="prod-orig-price"
                type="number"
                step="0.01"
                name="original_price"
                placeholder="18999.00"
                value={formData.original_price}
                onChange={handleChange}
              />
            </div>

            {/* Main Image URL */}
            <div className="form-group full-width">
              <label htmlFor="prod-image">Front Image URL *</label>
              <div className="input-with-icon">
                <FaImage className="field-icon" />
                <input
                  id="prod-image"
                  type="url"
                  name="image"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Secondary Back Image URL */}
            <div className="form-group full-width">
              <label htmlFor="prod-back-image">Hover / Back Image URL</label>
              <div className="input-with-icon">
                <FaImage className="field-icon" />
                <input
                  id="prod-back-image"
                  type="url"
                  name="back_image"
                  placeholder="https://images.unsplash.com/photo-... (optional hover view)"
                  value={formData.back_image}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Material */}
            <div className="form-group">
              <label htmlFor="prod-material">Material & Craftsmanship</label>
              <input
                id="prod-material"
                type="text"
                name="material"
                placeholder="e.g. Solid White Oak & Velvet"
                value={formData.material}
                onChange={handleChange}
              />
            </div>

            {/* Dimensions */}
            <div className="form-group">
              <label htmlFor="prod-dimensions">Dimensions</label>
              <input
                id="prod-dimensions"
                type="text"
                name="dimensions"
                placeholder="e.g. W: 210cm x D: 90cm x H: 85cm"
                value={formData.dimensions}
                onChange={handleChange}
              />
            </div>

            {/* Stock Status */}
            <div className="form-group">
              <label htmlFor="prod-stock">Stock Availability</label>
              <select
                id="prod-stock"
                name="stock_status"
                value={formData.stock_status}
                onChange={handleChange}
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Pre-order">Pre-Order</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {/* Initial Rating */}
            <div className="form-group">
              <label htmlFor="prod-rating">Rating (1.0 to 5.0)</label>
              <input
                id="prod-rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label htmlFor="prod-desc">Product Description</label>
              <textarea
                id="prod-desc"
                name="description"
                rows="3"
                placeholder="Describe product highlights, foam density, upholstery texture, frame warranty..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Checkboxes */}
            <div className="form-checkboxes full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                />
                <span>Featured Product</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_trending"
                  checked={formData.is_trending}
                  onChange={handleChange}
                />
                <span>Trending Badge</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="has_offer"
                  checked={formData.has_offer}
                  onChange={handleChange}
                />
                <span>Flash Sale / Active Discount</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary store-btn" disabled={submitting}>
              {submitting ? "Storing in Database..." : "💾 Store Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;
