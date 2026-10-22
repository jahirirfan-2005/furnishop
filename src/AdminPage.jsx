import React, { useState, useEffect, useCallback } from "react";
import {
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
  FaStar,
  FaArrowLeft,
  FaSignOutAlt,
  FaLock,
  FaTimes
} from "react-icons/fa";
import { api, resolveImageUrl, getBackendLabel, getBackendHint } from "./api";
import { toast } from "react-toastify";
import "./AdminPage.css";

export default function AdminPage({
  onBackToStore,
  onOpenAddProduct,
  onEditProduct,
  onProductDeleted,
  refreshTrigger
}) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(api.getAdminToken()));
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("furni_admin_user_obj") || "null") || {
        username: localStorage.getItem("furni_admin_user") || "Admin",
        role: "admin"
      };
    } catch {
      return { username: "Admin", role: "admin" };
    }
  });

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Backend Health State
  const [serverStatus, setServerStatus] = useState({
    checked: false,
    online: false,
    loading: true,
    message: ""
  });

  // Verify backend health and remove misleading offline errors when server is available
  const verifyServerHealth = useCallback(async () => {
    setServerStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.checkHealth();
      if (res?.status === "success") {
        setServerStatus({
          checked: true,
          online: true,
          loading: false,
          message: "Backend & Database Online"
        });
        // Clear stale offline connection error once verified online
        setLoginError((prev) => (prev && (prev.includes("offline") || prev.includes("unreachable")) ? "" : prev));
      } else {
        setServerStatus({
          checked: true,
          online: false,
          loading: false,
          message: res?.message || getBackendHint()
        });
      }
    } catch (err) {
      setServerStatus({
        checked: true,
        online: false,
        loading: false,
        message: err.message || getBackendHint()
      });
    }
  }, []);

  // Check backend server status on mount when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      verifyServerHealth();
    }
  }, [isAuthenticated, verifyServerHealth]);

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'products'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockInputs, setStockInputs] = useState({});
  const [priceInputs, setPriceInputs] = useState({});
  const [savingStock, setSavingStock] = useState(null);

  // Check auth validity on mount
  useEffect(() => {
    let active = true;
    const verifyAuth = async () => {
      const token = api.getAdminToken();
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const res = await api.checkAdminAuth();
        if (active) {
          if (res?.status === "success" && res?.data?.user) {
            setIsAuthenticated(true);
            setAdminUser(res.data.user);
            localStorage.setItem("furni_admin_user_obj", JSON.stringify(res.data.user));
            localStorage.setItem("furni_admin_user", res.data.user.username);
          } else {
            api.setAdminToken(null);
            setIsAuthenticated(false);
          }
        }
      } catch {
        if (active) {
          api.setAdminToken(null);
          setIsAuthenticated(false);
        }
      }
    };
    verifyAuth();
    return () => {
      active = false;
    };
  }, []);

  // Fetch admin database data
  const fetchAdminData = useCallback(async () => {
    if (!api.getAdminToken()) return;
    setLoading(true);
    try {
      const [ordRes, prodRes, catRes] = await Promise.all([
        api.getOrders(),
        api.getProducts({ sort: "newest", include_inactive: "1" }),
        api.getCategories()
      ]);

      if (catRes?.status === "success") {
        setCategories(catRes.data || []);
      }
      if (ordRes?.status === "success") {
        setOrders(ordRes.data || []);
      }
      if (prodRes?.status === "success") {
        const prods = prodRes.data || [];
        setProducts(prods);
        // Prepopulate stock and price edit inputs
        const initialStock = {};
        const initialPrices = {};
        prods.forEach((p) => {
          initialStock[p.id] = p.stock_quantity;
          initialPrices[p.id] = p.price;
        });
        setStockInputs(initialStock);
        setPriceInputs(initialPrices);
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("unauthorized")) {
        toast.error("Session expired. Please log in again.");
        api.setAdminToken(null);
        setIsAuthenticated(false);
      } else {
        toast.error("Failed to load admin data from server.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when authenticated or when refreshTrigger triggers
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated, fetchAdminData, refreshTrigger]);
  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError("Please enter both username and password.");
      return;
    }
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await api.adminLogin({
        username: loginUsername.trim(),
        password: loginPassword
      });

      if (res?.status === "success" && res?.data?.token) {
        api.setAdminToken(res.data.token);
        const userObj = res.data.user || { username: loginUsername.trim(), role: "admin" };
        setAdminUser(userObj);
        localStorage.setItem("furni_admin_user_obj", JSON.stringify(userObj));
        localStorage.setItem("furni_admin_user", userObj.username);
        setIsAuthenticated(true);
        toast.success(`Welcome back, ${userObj.username}!`);
      } else {
        setLoginError(res?.message || "Invalid credentials.");
      }
    } catch (err) {
      const msg = err.message || "Authentication failed. Check your credentials.";
      setLoginError(msg);
      if (msg.includes("offline") || msg.includes("unreachable") || msg.includes("connect")) {
        setServerStatus((prev) => ({
          ...prev,
          online: false,
          message: getBackendLabel()
        }));
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.adminLogout();
    } catch {
      // Ignore network errors on logout
    }
    api.setAdminToken(null);
    localStorage.removeItem("furni_admin_user_obj");
    localStorage.removeItem("furni_admin_user");
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
    setIsAuthenticated(false);
    toast.info("Logged out from admin session.");
  };

  // Order operations
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.status === "success") {
        toast.success(`Order status updated to "${newStatus}"!`);
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to update order status.");
    }
  };

  const handleDeleteOrder = async (orderId, orderNum) => {
    if (!window.confirm(`Permanently delete order ${orderNum} from the database?`)) {
      return;
    }
    try {
      const res = await api.deleteOrder(orderId);
      if (res.status === "success") {
        toast.info(`Order ${orderNum} deleted.`);
        setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete order.");
    }
  };

  // Product operations
  const handleDeleteProduct = async (productId, prodName, prodSku) => {
    const label = prodSku ? `"${prodName}" (SKU: ${prodSku})` : `"${prodName}"`;
    if (!window.confirm(`Are you sure you want to permanently delete ${label} from the database? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.deleteProduct(productId);
      if (res.status === "success") {
        toast.info(`Product ${label} removed from database.`);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        if (onProductDeleted) onProductDeleted(productId);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete product from database.");
    }
  };

  const handleStockInputChange = (productId, val) => {
    setStockInputs((prev) => ({ ...prev, [productId]: val }));
  };

  const handlePriceInputChange = (productId, val) => {
    setPriceInputs((prev) => ({ ...prev, [productId]: val }));
  };

  const handlePriceAndStockSave = async (product) => {
    const rawVal = stockInputs[product.id] ?? product.stock_quantity;
    const qty = parseInt(rawVal, 10);
    const rawPrice = priceInputs[product.id] ?? product.price;
    const prc = parseFloat(rawPrice);

    if (Number.isNaN(qty) || qty < 0) {
      toast.warning("Please enter a valid stock quantity (0 or more).");
      return;
    }
    if (Number.isNaN(prc) || prc <= 0) {
      toast.warning("Please enter a valid price (greater than 0).");
      return;
    }

    setSavingStock(product.id);
    try {
      const res = await api.updateProduct(product.id, {
        price: prc,
        stock_quantity: qty,
        stock_status: qty === 0 ? "Out of Stock" : qty <= 5 ? "Low Stock" : "In Stock"
      });
      if (res.status === "success") {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, ...res.data } : p))
        );
        toast.success(`💾 Price (₹${prc.toLocaleString("en-IN")}) & Stock (${qty}) saved to database!`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update price/stock in database.");
    } finally {
      setSavingStock(null);
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const nextVal = product.is_featured ? 0 : 1;
      const res = await api.updateProduct(product.id, { is_featured: nextVal });
      if (res.status === "success") {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, ...res.data } : p))
        );
        toast.success(`"${product.name}" ${nextVal ? "marked as featured" : "removed from featured"}.`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to toggle featured status.");
    }
  };

  const handleToggleActive = async (product) => {
    const nextStatus = product.status === "active" ? "inactive" : "active";
    try {
      const res = await api.updateProduct(product.id, { status: nextStatus });
      if (res.status === "success") {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, ...res.data } : p))
        );
        toast.success(`"${product.name}" is now ${nextStatus === "active" ? "active (visible)" : "hidden"}.`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update product visibility.");
    }
  };

  // Filter calculations
  const filteredOrders = orders.filter((ord) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      ord.order_number?.toLowerCase().includes(q) ||
      ord.customer_name?.toLowerCase().includes(q) ||
      ord.customer_email?.toLowerCase().includes(q) ||
      (ord.items && ord.items.some((i) => i.product_name?.toLowerCase().includes(q)));
    const matchesStatus = statusFilter === "all" || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter((prod) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      prod.name?.toLowerCase().includes(q) ||
      (prod.sku && prod.sku.toLowerCase().includes(q)) ||
      (prod.brand && prod.brand.toLowerCase().includes(q)) ||
      (prod.category_name && prod.category_name.toLowerCase().includes(q)) ||
      (prod.material && prod.material.toLowerCase().includes(q));
    const matchesCategory =
      categoryFilter === "all" || String(prod.category_id) === String(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  // KPI Metrics
  const totalRevenue = orders.reduce((acc, ord) => acc + (parseFloat(ord.total_amount) || 0), 0);
  const totalItemsSold = orders.reduce((acc, ord) => {
    if (!ord.items) return acc;
    return acc + ord.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  }, 0);
  const lowStockCount = products.filter((p) => p.stock_quantity <= 5).length;

  // Render Login Card if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="login-brand-icon">🛋️</div>
          <h2>Executive Admin Portal</h2>
          <p className="subtitle">FurniShop Database & Order Management</p>

          <div className="login-server-status-wrap">
            {serverStatus.loading ? (
              <span className="server-status-pill checking">
                <span className="status-dot pulse" /> Checking backend connection...
              </span>
            ) : serverStatus.online ? (
              <span className="server-status-pill online">
                <span className="status-dot green" /> Backend Online &bull; MariaDB Connected
              </span>
            ) : (
              <div className="server-status-offline-box">
                <span className="server-status-pill offline">
                  <span className="status-dot red" /> {getBackendLabel()}
                </span>
                <button
                  type="button"
                  className="retry-health-btn"
                  onClick={verifyServerHealth}
                  title="Retry backend connection check"
                >
                  <FaSync className={serverStatus.loading ? "fa-spin" : ""} /> Retry
                </button>
              </div>
            )}
          </div>

          {loginError && <div className="login-error-alert">{loginError}</div>}

          <form onSubmit={handleLoginSubmit} className="login-form" autoComplete="off">
            <div>
              <label htmlFor="admin-username">Administrator Username</label>
              <div className="login-input-wrap">
                <FaUserShield className="field-icon" />
                <input
                  id="admin-username"
                  name="admin_username"
                  type="text"
                  placeholder="Enter administrator username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password">Secure Password</label>
              <div className="login-input-wrap">
                <FaLock className="field-icon" />
                <input
                  id="admin-password"
                  name="admin_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loginLoading}>
              {loginLoading ? "Authenticating..." : "Sign In to Admin Portal"}
            </button>
          </form>

          <button type="button" className="login-back-btn" onClick={onBackToStore}>
            <FaArrowLeft /> Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  // Render Full Admin Page when authenticated
  return (
    <div className="admin-page-wrapper">
      {/* Top Executive Navigation Bar */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <div className="admin-brand-group" onClick={onBackToStore} title="Return to Storefront">
            <span className="admin-brand-icon">🛋️</span>
            <div>
              <div className="admin-brand-title">FurniShop</div>
              <span className="admin-brand-badge">Executive Admin</span>
            </div>
          </div>
          <div className="db-live-indicator" title="Connected to MySQL database in real time">
            <span className="live-dot" />
            <span>MySQL Connected</span>
          </div>
        </div>

        <div className="admin-nav-right">
          <div className="admin-user-pill">
            <span>👤 {adminUser.username}</span>
            <span className="user-role-badge">ADMIN</span>
          </div>

          <button className="btn-storefront" onClick={onBackToStore} title="Open customer storefront">
            <FaArrowLeft /> View Storefront
          </button>

          <button className="btn-logout" onClick={handleLogout} title="Sign out from administrative session">
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main-container">
        {/* KPI Stat Cards */}
        <section className="admin-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-revenue">
              <FaMoneyBillWave />
            </div>
            <div>
              <div className="kpi-label">Total Revenue</div>
              <div className="kpi-value">₹{totalRevenue.toLocaleString("en-IN")}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-orders">
              <FaShoppingBag />
            </div>
            <div>
              <div className="kpi-label">Placed Orders</div>
              <div className="kpi-value">{orders.length}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-catalog">
              <FaBoxes />
            </div>
            <div>
              <div className="kpi-label">Active Catalog</div>
              <div className="kpi-value">{products.length} Items</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap kpi-stock">
              <FaCheckCircle />
            </div>
            <div>
              <div className="kpi-label">Items Sold / Low Stock</div>
              <div className="kpi-value">
                {totalItemsSold} <span style={{ fontSize: "14px", fontWeight: "600", color: "#f87171" }}>({lowStockCount} low)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Bar & Action Controls */}
        <div className="admin-tab-bar">
          <div className="admin-nav-tabs">
            <button
              className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <FaShoppingBag />
              <span>Customer Orders</span>
              <span className="tab-badge">{orders.length}</span>
            </button>

            <button
              className={`admin-tab-btn ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <FaBoxes />
              <span>Product Inventory</span>
              <span className="tab-badge">{products.length}</span>
            </button>
          </div>

          <div className="admin-quick-actions">
            <button className="btn-primary-action" onClick={onOpenAddProduct}>
              <FaPlus /> Store New Product
            </button>

            <button
              className="btn-refresh"
              onClick={fetchAdminData}
              title="Refresh all database records"
              disabled={loading}
            >
              <FaSync className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="admin-toolbar-row">
          <div className="admin-search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={
                activeTab === "orders"
                  ? "Search by customer, email, or order #..."
                  : "Search products by name, category, or material..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="admin-filter-group">
            {activeTab === "orders" ? (
              <select
                className="admin-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Order Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            ) : (
              <select
                className="admin-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <FaSync className="spin" style={{ fontSize: "28px", color: "#38bdf8", marginBottom: "12px" }} />
            <div>Syncing database records...</div>
          </div>
        )}

        {/* Tab 1: Orders List */}
        {!loading && activeTab === "orders" && (
          <div className="admin-orders-container">
            {filteredOrders.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background: "rgba(17, 24, 39, 0.6)",
                  borderRadius: "18px",
                  border: "1px dashed rgba(255, 255, 255, 0.12)",
                  color: "#94a3b8"
                }}
              >
                <FaShoppingBag style={{ fontSize: "44px", color: "#475569", marginBottom: "12px" }} />
                <h3 style={{ color: "#ffffff", marginBottom: "6px" }}>No Orders Found</h3>
                <p>When customers purchase furniture, their orders will appear here in real time.</p>
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const totalAmt = parseFloat(ord.total_amount) || 0;
                return (
                  <div key={ord.id} className="admin-order-card">
                    <div className="admin-order-header">
                      <div className="order-id-group">
                        <span className="order-ref">#{ord.order_number}</span>
                        <span className="order-timestamp">
                        📅 {new Date(ord.created_at || new Date().toISOString()).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                        </span>
                      </div>

                      <div className="order-controls-group">
                        <select
                          className="status-select-pill"
                          value={ord.status || "Processing"}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        >
                          <option value="Processing">⏳ Processing</option>
                          <option value="Shipped">🚚 Shipped</option>
                          <option value="Delivered">✅ Delivered</option>
                          <option value="Cancelled">❌ Cancelled</option>
                        </select>

                        <button
                          className="btn-delete-order"
                          onClick={() => handleDeleteOrder(ord.id, ord.order_number)}
                          title="Delete order from database"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="admin-order-body">
                      {/* Customer Details */}
                      <div className="customer-info-pane">
                        <h4>Customer & Shipping</h4>
                        <div className="customer-info-list">
                          <div className="cust-row">
                            <span className="icon">👤</span>
                            <strong>{ord.customer_name}</strong>
                          </div>
                          <div className="cust-row">
                            <FaEnvelope className="icon" />
                            <span>{ord.customer_email}</span>
                          </div>
                          {ord.customer_phone && (
                            <div className="cust-row">
                              <FaPhoneAlt className="icon" />
                              <span>{ord.customer_phone}</span>
                            </div>
                          )}
                          <div className="cust-row">
                            <FaMapMarkerAlt className="icon" />
                            <span>
                              {ord.shipping_address}
                              {ord.shipping_city ? `, ${ord.shipping_city}` : ""}
                              {ord.shipping_pincode ? ` - ${ord.shipping_pincode}` : ""}
                            </span>
                          </div>
                          {ord.payment_method && (
                            <div className="cust-row">
                              <span className="icon">💳</span>
                              <span>Method: {ord.payment_method.toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Purchased Products */}
                      <div className="order-items-pane">
                        <h4>Ordered Furniture Items</h4>
                        <div className="ordered-items-list">
                          {(ord.items || []).map((item, idx) => (
                            <div key={idx} className="ordered-item-card">
                              {item.product_image ? (
                                <img
                                  src={resolveImageUrl(item.product_image)}
                                  alt={item.product_name}
                                  className="ordered-item-img"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80";
                                  }}
                                />
                              ) : (
                                <div
                                  className="ordered-item-img"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "#1e293b",
                                    color: "#94a3b8"
                                  }}
                                >
                                  🛋️
                                </div>
                              )}
                              <div className="ordered-item-meta">
                                <div className="ordered-item-title">{item.product_name}</div>
                                <div className="ordered-item-qty">Qty: {item.quantity}</div>
                              </div>
                              <div className="ordered-item-price">
                                ₹{(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toLocaleString("en-IN")}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-grand-total-row">
                          <span>Grand Total Placed</span>
                          <span>₹{totalAmt.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Products Catalog Table */}
        {!loading && activeTab === "products" && (
          <div className="admin-table-container">
            {filteredProducts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#94a3b8"
                }}
              >
                <FaBoxes style={{ fontSize: "44px", color: "#475569", marginBottom: "12px" }} />
                <h3 style={{ color: "#ffffff", marginBottom: "6px" }}>No Products Matched</h3>
                <p>Try clearing your search query or category filter.</p>
              </div>
            ) : (
              <table className="luxury-admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Qty</th>
                    <th>Visibility</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const price = parseFloat(p.price || 0);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="prod-cell">
                            {p.image_url || p.image ? (
                              <img
                                src={resolveImageUrl(p.image_url || p.image)}
                                alt={p.name}
                                className="prod-cell-img"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80";
                                }}
                              />
                            ) : (
                              <div
                                className="prod-cell-img"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "#1e293b",
                                  fontSize: "20px"
                                }}
                              >
                                🛋️
                              </div>
                            )}
                            <div className="prod-cell-info">
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                <span className="prod-cell-name">{p.name}</span>
                                {p.sku && <span className="admin-sku-tag">{p.sku}</span>}
                              </div>
                              <span className="prod-cell-cat">
                                {p.brand ? <strong>{p.brand} • </strong> : ""}{p.material || "Wood / Fabric"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>{p.category_name || "Catalog"}</td>

                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ color: "#b08d4f", fontWeight: 700, fontSize: "14px" }}>₹</span>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              className="price-input"
                              value={priceInputs[p.id] ?? p.price}
                              onChange={(e) => handlePriceInputChange(p.id, e.target.value)}
                              title="Edit price in INR"
                            />
                          </div>
                        </td>

                        <td>
                          <div className="stock-editor-cell">
                            <input
                              type="number"
                              min="0"
                              className="stock-input"
                              value={stockInputs[p.id] ?? p.stock_quantity}
                              onChange={(e) => handleStockInputChange(p.id, e.target.value)}
                              title="Edit stock quantity"
                            />
                            <button
                              type="button"
                              className="stock-save-btn"
                              onClick={() => handlePriceAndStockSave(p)}
                              disabled={savingStock === p.id}
                              title="Save Price & Stock changes to database"
                            >
                              {savingStock === p.id ? "..." : "Save"}
                            </button>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={`table-icon-btn ${p.status === "active" ? "" : "danger"}`}
                            onClick={() => handleToggleActive(p)}
                            title={p.status === "active" ? "Product is active. Click to hide." : "Product is hidden. Click to activate."}
                          >
                            {p.status === "active" ? <FaEye style={{ color: "#34d399" }} /> : <FaEyeSlash style={{ color: "#f87171" }} />}
                          </button>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={`table-icon-btn ${p.is_featured ? "active-star" : ""}`}
                            onClick={() => handleToggleFeatured(p)}
                            title={p.is_featured ? "Remove featured status" : "Mark as featured"}
                          >
                            <FaStar />
                          </button>
                        </td>

                        <td>
                          <div className="action-btn-group">
                            <button
                              type="button"
                              className="table-icon-btn"
                              onClick={() => onEditProduct(p)}
                              title="Edit product details"
                            >
                              <FaPen />
                            </button>

                            <button
                              type="button"
                              className="table-icon-btn danger"
                              onClick={() => handleDeleteProduct(p.id, p.name, p.sku)}
                              title="Delete product permanently from database"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
