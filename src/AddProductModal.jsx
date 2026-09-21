import React, { useState, useRef } from "react";
import { FaTimes, FaPlusCircle, FaImage, FaTag, FaBoxes, FaLayerGroup, FaPalette, FaRupeeSign, FaTrash, FaUpload } from "react-icons/fa";
import { api, resolveImageUrl } from "./api";

const EMPTY_FORM = {
  name: "",
  category_id: "",
  collection_id: "",
  price: "",
  original_price: "",
  discount_price: "",
  stock_quantity: "25",
  image: "",
  back_image: "",
  additional_images: [],
  description: "",
  dimensions: "",
  material: "",
  color: "",
  rating: "4.5",
  stock_status: "In Stock",
  has_offer: false,
  offer_end_time: "",
  is_featured: false,
  is_trending: false,
  status: "active"
};

function AddProductModal({ isOpen, onClose, categories, collections, editingProduct, onProductSaved }) {
  // The component is remounted with a fresh `key` whenever editingProduct or
  // open-state changes (see App.jsx), so props are safe initial state here.
  const initialForm = editingProduct
    ? {
        ...EMPTY_FORM,
        ...editingProduct,
        category_id: String(editingProduct.category_id ?? ""),
        collection_id: editingProduct.collection_id ? String(editingProduct.collection_id) : "",
        price: String(editingProduct.price ?? ""),
        original_price: editingProduct.original_price != null ? String(editingProduct.original_price) : "",
        discount_price: editingProduct.discount_price != null ? String(editingProduct.discount_price) : "",
        stock_quantity: String(editingProduct.stock_quantity ?? 0),
        additional_images: editingProduct.additional_images_arr || [],
        status: editingProduct.status || "active",
        offer_end_time: editingProduct.offer_end_time ? String(editingProduct.offer_end_time).replace(" ", "T").slice(0, 16) : ""
      }
    : { ...EMPTY_FORM, category_id: categories.length > 0 ? String(categories[0].id) : "" };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const mainFileRef = useRef(null);
  const addlFileRef = useRef(null);

  const isEdit = Boolean(editingProduct);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /** Upload the main image and store the returned URL. */
  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg("");
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      if (res.status === "success") {
        setFormData((prev) => ({ ...prev, image: res.data.urls[0] }));
      } else {
        setErrorMsg(res.message || "Upload failed");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /** Upload extra gallery images (appended to the additional_images list). */
  const handleAdditionalUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setErrorMsg("");
    setUploading(true);
    try {
      const res = await api.uploadImage(files);
      if (res.status === "success") {
        setFormData((prev) => ({
          ...prev,
          additional_images: [...prev.additional_images, ...res.data.urls].slice(0, 10)
        }));
      } else {
        setErrorMsg(res.message || "Upload failed");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeAdditionalImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      additional_images: prev.additional_images.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim()) return setErrorMsg("Please enter a product name.");
    if (!formData.price || parseFloat(formData.price) <= 0) return setErrorMsg("Please enter a valid price.");
    if (!formData.image.trim()) return setErrorMsg("Please upload or enter a main product image.");
    if (!formData.category_id) return setErrorMsg("Please select a category.");

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category_id: parseInt(formData.category_id, 10),
        collection_id: formData.collection_id ? parseInt(formData.collection_id, 10) : null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        discount_price: formData.discount_price !== "" ? parseFloat(formData.discount_price) : null,
        stock_quantity: parseInt(formData.stock_quantity || "0", 10),
        image: formData.image.trim(),
        back_image: formData.back_image.trim() || formData.image.trim(),
        additional_images: formData.additional_images,
        description: formData.description,
        dimensions: formData.dimensions,
        material: formData.material,
        color: formData.color,
        rating: parseFloat(formData.rating) || 4.5,
        stock_status: formData.stock_quantity === "0" ? "Out of Stock" : formData.stock_status,
        has_offer: formData.has_offer ? 1 : 0,
        offer_end_time: formData.has_offer && formData.offer_end_time ? formData.offer_end_time.replace("T", " ") + ":00" : null,
        is_featured: formData.is_featured ? 1 : 0,
        is_trending: formData.is_trending ? 1 : 0,
        status: formData.status
      };

      const res = isEdit
        ? await api.updateProduct(editingProduct.id, payload)
        : await api.createProduct(payload);

      if (res.status === "success") {
        onProductSaved(res.data, isEdit);
        onClose();
      } else {
        setErrorMsg(res.message || "Failed to save product");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const previewImage = resolveImageUrl(formData.image) ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23eee' width='80' height='80'/%3E%3Ctext x='40' y='46' text-anchor='middle' fill='%23999' font-size='12'%3ENo image%3C/text%3E%3C/svg%3E";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container add-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-wrapper">
            {isEdit ? <FaBoxes className="modal-icon" /> : <FaPlusCircle className="modal-icon" />}
            <div>
              <h2>{isEdit ? "Edit Product in Database" : "Store New Product in Database"}</h2>
              <p className="modal-subtitle">
                {isEdit
                  ? `Updating "${editingProduct?.name}" - changes are saved to MySQL and go live instantly`
                  : "Fill in the details below to add a product into the FurniShop database"}
              </p>
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
                <select id="prod-category" name="category_id" value={formData.category_id} onChange={handleChange} required>
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
                <select id="prod-collection" name="collection_id" value={formData.collection_id} onChange={handleChange}>
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
              <div className="input-with-icon">
                <FaRupeeSign className="field-icon" />
                <input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  placeholder="14999.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Original Price */}
            <div className="form-group">
              <label htmlFor="prod-orig-price">Original / MRP Price (₹)</label>
              <div className="input-with-icon">
                <FaRupeeSign className="field-icon" />
                <input
                  id="prod-orig-price"
                  type="number"
                  step="0.01"
                  min="0"
                  name="original_price"
                  placeholder="18999.00"
                  value={formData.original_price}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Discount Price */}
            <div className="form-group">
              <label htmlFor="prod-discount-price">Discount Price (₹)</label>
              <div className="input-with-icon">
                <FaRupeeSign className="field-icon" />
                <input
                  id="prod-discount-price"
                  type="number"
                  step="0.01"
                  min="0"
                  name="discount_price"
                  placeholder="12999.00 (optional)"
                  value={formData.discount_price}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Stock Quantity */}
            <div className="form-group">
              <label htmlFor="prod-stock-qty">Stock Quantity</label>
              <div className="input-with-icon">
                <FaBoxes className="field-icon" />
                <input
                  id="prod-stock-qty"
                  type="number"
                  min="0"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Color */}
            <div className="form-group">
              <label htmlFor="prod-color">Color</label>
              <div className="input-with-icon">
                <FaPalette className="field-icon" />
                <input
                  id="prod-color"
                  type="text"
                  name="color"
                  placeholder="e.g. Emerald Green"
                  value={formData.color}
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
              <select id="prod-stock" name="stock_status" value={formData.stock_status} onChange={handleChange}>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Pre-order">Pre-Order</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {/* Rating */}
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

            {/* Main image upload */}
            <div className="form-group full-width">
              <label>Main Product Image *</label>
              <div className="image-upload-row">
                <div className="image-preview-box" onClick={() => mainFileRef.current?.click()} title="Click to upload">
                  <img src={previewImage} alt="Main product preview" />
                </div>
                <div className="image-upload-controls">
                  <button type="button" className="btn-secondary upload-btn" onClick={() => mainFileRef.current?.click()} disabled={uploading}>
                    <FaUpload /> {uploading ? "Uploading..." : "Upload Image (JPG/PNG/WEBP)"}
                  </button>
                  <input
                    ref={mainFileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={handleMainImageUpload}
                  />
                  <div className="input-with-icon">
                    <FaImage className="field-icon" />
                    <input
                      type="text"
                      name="image"
                      placeholder="...or paste an image URL"
                      value={formData.image}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Back / hover image */}
            <div className="form-group full-width">
              <label htmlFor="prod-back-image">Hover / Back Image URL</label>
              <div className="input-with-icon">
                <FaImage className="field-icon" />
                <input
                  id="prod-back-image"
                  type="text"
                  name="back_image"
                  placeholder="https://... (optional alternate view)"
                  value={formData.back_image}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Additional gallery images */}
            <div className="form-group full-width">
              <label>Additional Images (up to 10)</label>
              <div className="additional-images-box">
                {formData.additional_images.map((img, idx) => (
                  <div key={idx} className="additional-thumb">
                    <img src={resolveImageUrl(img)} alt={`Additional ${idx + 1}`} />
                    <button type="button" className="remove-thumb-btn" onClick={() => removeAdditionalImage(idx)} title="Remove image">
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button type="button" className="add-more-images-btn" onClick={() => addlFileRef.current?.click()} disabled={uploading}>
                  <FaUpload />
                  <span>{uploading ? "Uploading..." : "Add Images"}</span>
                </button>
                <input
                  ref={addlFileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleAdditionalUpload}
                />
              </div>
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

            {/* Visibility / status toggles */}
            <div className="form-checkboxes full-width">
              <label className="checkbox-label">
                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} />
                <span>Featured Product</span>
              </label>

              <label className="checkbox-label">
                <input type="checkbox" name="is_trending" checked={formData.is_trending} onChange={handleChange} />
                <span>Trending Badge</span>
              </label>

              <label className="checkbox-label">
                <input type="checkbox" name="has_offer" checked={formData.has_offer} onChange={handleChange} />
                <span>Flash Sale / Active Discount</span>
              </label>

              {formData.has_offer && (
                <label className="checkbox-label offer-end-label">
                  <span>Offer Ends:</span>
                  <input
                    type="datetime-local"
                    name="offer_end_time"
                    value={formData.offer_end_time}
                    onChange={handleChange}
                  />
                </label>
              )}

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status === "active"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked ? "active" : "inactive" }))}
                />
                <span>Active (visible on storefront)</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary store-btn" disabled={submitting || uploading}>
              {submitting
                ? isEdit ? "Updating in Database..." : "Storing in Database..."
                : isEdit ? "💾 Save Changes" : "💾 Store Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;
