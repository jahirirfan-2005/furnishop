import React, { useState, useEffect, useCallback } from "react";
import { 
  FaTimes, 
  FaUserShield, 
  FaShoppingBag, 
  FaBoxes, 
  FaTrash, 
  FaCheckCircle, 
  FaClock, 
  FaShippingFast, 
  FaBan, 
  FaMoneyBillWave,
  FaSearch,
  FaSync,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaPlus,
  FaPen,
  FaEye,
  FaEyeSlash,
  FaStar
} from "react-icons/fa";
import { api } from "./api";
import { toast } from "react-toastify";

function AdminPanelModal({ isOpen, onClose, onOpenAddProduct, onEditProduct, onProductDeleted }) {
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'products'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [savingStock, setSavingStock] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, catRes] = await Promise.all([
        api.getOrders(),
        // Admin sees every product, including deactivated ones.
        api.getProducts({ sort: "newest", include_inactive: "1" }),
        api.getCategories()
      ]);
      if (catRes.status === "success") setCategories(catRes.data || []);

      if (ordRes.status === "success") {
        setOrders(ordRes.data || []);
      }
      if (prodRes.status === "success") {
        setProducts(prodRes.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    // Deferred so the spinner state change doesn't cascade inside the effect.
    queueMicrotask(() => {
      if (!cancelled) fetchAdminData();
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, fetchAdminData]);

  if (!isOpen) return null;

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.status === "success") {
        toast.success(`Order status updated to "${newStatus}" in database!`, {
          position: "top-right",
          autoClose: 2000
        });
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
        );
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId, orderNum) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderNum} from database?`)) {
      return;
    }
    try {
      const res = await api.deleteOrder(orderId);
      if (res.status === "success") {
        toast.info(`Order ${orderNum} deleted from database`);
        setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
      }
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const handleDeleteProduct = async (productId, prodName) => {
    if (!window.confirm(`Are you sure you want to remove "${prodName}" from the database?`)) {
      return;
    }
    try {
      const res = await api.deleteProduct(productId);
      if (res.status === "success") {
        toast.info(`Product "${prodName}" removed from database`);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        if (onProductDeleted) onProductDeleted(productId);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  /** Inline stock quantity update - saves straight to MySQL. */
  const handleStockSave = async (product, newQty) => {
    const qty = parseInt(newQty, 10);
    if (Number.isNaN(qty) || qty < 0 || qty === product.stock_quantity) return;
    setSavingStock(product.id);
    try {
      const res = await api.updateProduct(product.id, {
        stock_quantity: qty,
        stock_status: qty === 0 ? "Out of Stock" : qty <= 5 ? "Low Stock" : "In Stock"
      });
      if (res.status === "success") {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...res.data } : p)));
        toast.success(`Stock for "${product.name}" updated to ${qty} in database`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update stock");
    } finally {
      setSavingStock(null);
    }
  };

  /** Toggle the featured flag. */
  const handleToggleFeatured = async (product) => {
    try {
      const res = await api.updateProduct(product.id, { is_featured: product.is_featured ? 0 : 1 });
      if (res.status === "success") {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...res.data } : p)));
        toast.success(`"${product.name}" ${product.is_featured ? "removed from" : "marked as"} featured`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update featured flag");
    }
  };

  /** Activate / deactivate a product on the storefront. */
  const handleToggleActive = async (product) => {
    const next = product.status === "active" ? "inactive" : "active";
    try {
      const res = await api.updateProduct(product.id, { status: next });
      if (res.status === "success") {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...res.data } : p)));
        toast.success(`"${product.name}" is now ${next === "active" ? "live on the storefront" : "hidden from the storefront"}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update product status");
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.items && ord.items.some((i) => i.product_name && i.product_name.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === "all" || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered products (search + category filter)
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.category_name && prod.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prod.material && prod.material.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      categoryFilter === "all" || String(prod.category_id) === String(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  // Overall Stats
  const totalRevenue = orders.reduce((acc, ord) => acc + (parseFloat(ord.total_amount) || 0), 0);
  const totalProductsSelected = orders.reduce((acc, ord) => {
    if (!ord.items) return acc;
    return acc + ord.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  }, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return <span className="status-badge delivered"><FaCheckCircle /> Delivered</span>;
      case "Shipped":
        return <span className="status-badge shipped"><FaShippingFast /> Shipped</span>;
      case "Cancelled":
        return <span className="status-badge cancelled"><FaBan /> Cancelled</span>;
      case "Processing":
      default:
        return <span className="status-badge processing"><FaClock /> Processing</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container admin-panel-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header admin-header">
          <div className="admin-header-title">
            <FaUserShield className="admin-icon" />
            <div>
              <h2>FurniShop Database Admin Panel</h2>
              <p className="admin-subtitle">Manage user-selected products, placed orders, and catalog items in real-time</p>
            </div>
          </div>
          <div className="admin-header-actions">
            <button className="icon-btn refresh-btn" onClick={fetchAdminData} title="Refresh Database Records">
              <FaSync className={loading ? "spin" : ""} />
            </button>
            <button className="close-modal-btn" onClick={onClose} aria-label="Close Admin Panel">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Analytics Overview Cards */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-icon revenue-bg"><FaMoneyBillWave /></div>
            <div>
              <span className="stat-label">Total Revenue</span>
              <h3 className="stat-val">₹{totalRevenue.toLocaleString("en-IN")}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders-bg"><FaShoppingBag /></div>
            <div>
              <span className="stat-label">Total User Orders</span>
              <h3 className="stat-val">{orders.length}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon items-bg"><FaCheckCircle /></div>
            <div>
              <span className="stat-label">User Selected Products</span>
              <h3 className="stat-val">{totalProductsSelected} items</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon prods-bg"><FaBoxes /></div>
            <div>
              <span className="stat-label">Database Products</span>
              <h3 className="stat-val">{products.length} catalog items</h3>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs & Filters */}
        <div className="admin-toolbar">
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <FaShoppingBag /> User Orders & Selected Products ({orders.length})
            </button>
            <button
              className={`admin-tab ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <FaBoxes /> Database Products ({products.length})
            </button>
          </div>

          <div className="admin-controls">
            <div className="admin-search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder={activeTab === "orders" ? "Search customer, order # or product..." : "Search products in database..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <button onClick={() => setSearchTerm("")}>✕</button>}
            </div>

            {activeTab === "orders" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">All Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            )}

            {activeTab === "products" && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "products" && (
              <button className="btn-primary add-prod-btn" onClick={onOpenAddProduct}>
                <FaPlus /> Store New Product
              </button>
            )}
          </div>
        </div>

        {/* Tab Content 1: Orders & Selected Products */}
        {activeTab === "orders" && (
          <div className="admin-tab-body">
            {loading ? (
              <div className="admin-loading">
                <FaSync className="spin large-spinner" />
                <p>Fetching user selected products and database orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="admin-empty-state">
                <FaShoppingBag className="empty-icon" />
                <h3>No Orders Found in Database</h3>
                <p>When users add products to cart and complete checkout, their selected products will appear here.</p>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((ord) => (
                  <div key={ord.id} className="order-card-container">
                    {/* Order Card Header */}
                    <div className="order-card-header">
                      <div className="order-title-box">
                        <span className="order-num">{ord.order_number}</span>
                        <span className="order-date">{ord.created_at}</span>
                      </div>
                      <div className="order-status-box">
                        {getStatusBadge(ord.status)}
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="status-dropdown"
                        >
                          <option value="Processing">Set: Processing</option>
                          <option value="Shipped">Set: Shipped</option>
                          <option value="Delivered">Set: Delivered</option>
                          <option value="Cancelled">Set: Cancelled</option>
                        </select>
                        <button
                          className="delete-order-btn"
                          onClick={() => handleDeleteOrder(ord.id, ord.order_number)}
                          title="Delete Order from Database"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Customer Info & Selected Products Grid */}
                    <div className="order-card-body">
                      {/* Customer Info Details */}
                      <div className="customer-details">
                        <h4>Customer & Shipping Details</h4>
                        <div className="detail-item">
                          <FaUserShield className="detail-icon" />
                          <span><strong>{ord.customer_name}</strong></span>
                        </div>
                        <div className="detail-item">
                          <FaEnvelope className="detail-icon" />
                          <span>{ord.customer_email}</span>
                        </div>
                        <div className="detail-item">
                          <FaPhoneAlt className="detail-icon" />
                          <span>{ord.customer_phone || "Not provided"}</span>
                        </div>
                        <div className="detail-item">
                          <FaMapMarkerAlt className="detail-icon" />
                          <span>{ord.shipping_address}</span>
                        </div>
                        <div className="detail-item payment">
                          <span>Payment Method: <strong>{ord.payment_method}</strong></span>
                        </div>
                      </div>

                      {/* Selected Products List */}
                      <div className="selected-products-section">
                        <h4>Selected Products Stored in Database ({ord.items ? ord.items.length : 0})</h4>
                        <div className="selected-items-grid">
                          {ord.items && ord.items.length > 0 ? (
                            ord.items.map((item, idx) => (
                              <div key={idx} className="selected-product-row">
                                <img
                                  src={item.product_image || item.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80"}
                                  alt={item.product_name}
                                  className="selected-prod-img"
                                />
                                <div className="selected-prod-info">
                                  <span className="prod-title">{item.product_name || `Product #${item.product_id}`}</span>
                                  <div className="prod-meta">
                                    <span className="unit-price">₹{(parseFloat(item.price) || 0).toLocaleString("en-IN")}</span>
                                    <span className="qty-tag">× {item.quantity}</span>
                                  </div>
                                </div>
                                <div className="prod-subtotal">
                                  ₹{((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)).toLocaleString("en-IN")}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="no-items-text">No item data recorded</p>
                          )}
                        </div>
                        <div className="order-total-bar">
                          <span>Total Amount Paid:</span>
                          <strong className="total-val">₹{(parseFloat(ord.total_amount) || 0).toLocaleString("en-IN")}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Products Database */}
        {activeTab === "products" && (
          <div className="admin-tab-body">
            {filteredProducts.length === 0 ? (
              <div className="admin-empty-state">
                <FaBoxes className="empty-icon" />
                <h3>No Products Found</h3>
                <p>No catalog products matched your search keyword.</p>
              </div>
            ) : (
              <div className="admin-products-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Qty</th>
                      <th>Rating</th>
                      <th>Featured</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className={prod.status === "inactive" ? "inactive-row" : ""}>
                        <td>
                          <img src={prod.image} alt={prod.name} className="table-thumb" />
                        </td>
                        <td>
                          <strong>{prod.name}</strong>
                          <div className="small-dims">{prod.dimensions}</div>
                        </td>
                        <td>
                          <span className="cat-pill">{prod.category_name || "Catalog Item"}</span>
                        </td>
                        <td>
                          <strong className="table-price">₹{parseFloat(prod.price).toLocaleString("en-IN")}</strong>
                          {prod.original_price && (
                            <div className="small-orig-price">₹{parseFloat(prod.original_price).toLocaleString("en-IN")}</div>
                          )}
                        </td>
                        <td>
                          <div className="stock-edit-cell">
                            <input
                              type="number"
                              min="0"
                              defaultValue={prod.stock_quantity ?? 0}
                              key={`stock-${prod.id}-${prod.stock_quantity}`}
                              className="stock-input"
                              disabled={savingStock === prod.id}
                              onBlur={(e) => handleStockSave(prod, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.target.blur();
                              }}
                              title="Type a new quantity and press Enter to save"
                            />
                            <span className={`stock-badge ${prod.stock_quantity === 0 ? "out" : ""}`}>
                              {prod.stock_status || "In Stock"}
                            </span>
                          </div>
                        </td>
                        <td>⭐ {prod.rating} ({prod.reviews_count || 0})</td>
                        <td>
                          <button
                            className={`table-toggle-btn ${prod.is_featured ? "featured-on" : ""}`}
                            onClick={() => handleToggleFeatured(prod)}
                            title={prod.is_featured ? "Remove from featured" : "Mark as featured"}
                          >
                            <FaStar />
                          </button>
                        </td>
                        <td>
                          <button
                            className={`table-toggle-btn ${prod.status === "active" ? "active-on" : "inactive-off"}`}
                            onClick={() => handleToggleActive(prod)}
                            title={prod.status === "active" ? "Deactivate (hide from storefront)" : "Activate (show on storefront)"}
                          >
                            {prod.status === "active" ? <FaEye /> : <FaEyeSlash />}
                            <span>{prod.status === "active" ? "Active" : "Inactive"}</span>
                          </button>
                        </td>
                        <td>
                          <div className="table-actions-cell">
                            <button
                              className="table-edit-btn"
                              onClick={() => onEditProduct && onEditProduct(prod)}
                              title="Edit product in database"
                            >
                              <FaPen /> Edit
                            </button>
                            <button
                              className="table-del-btn"
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              title="Delete product from database"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanelModal;
