import { toast } from "react-toastify";

// One central API configuration.
// - Set VITE_API_BASE_URL (furniture/.env.local) when the PHP API lives on a
//   different origin (local dev: http://127.0.0.1:8001/backend/api).
// - With no env var, the app calls the SAME ORIGIN /backend/api - correct on
//   any PHP host, and on static hosting (Vercel) requests fail fast and the
//   built-in catalog snapshot takes over so products and images always show.
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.origin}/backend/api`;
const API_ORIGIN = new URL(API_BASE, window.location.origin).origin;

// Static snapshot of the MySQL catalog, exported by backend/export_fallback.php.
// Used ONLY when the PHP API is unreachable (e.g. the static Vercel deployment)
// so visitors always see products and images. MySQL stays the source of truth.
import PRODUCTS_FALLBACK from "./products_fallback.json";

/**
 * Mirror of the PHP API's filtering/sorting (api/products.php) so the static
 * fallback behaves identically to the live database-backed endpoint.
 */
const filterFallbackProducts = (params = {}) => {
  const {
    category,
    collection,
    search,
    sort,
    featured,
    trending,
    offers,
    in_stock_only,
    min_price,
    max_price,
  } = params;

  let list = PRODUCTS_FALLBACK.filter((p) => p.status !== "inactive");

  if (category && category !== "all") {
    if (/^\d+$/.test(String(category))) {
      list = list.filter((p) => p.category_id === Number(category));
    } else {
      list = list.filter(
        (p) => p.category_slug === category || p.category_name === category
      );
    }
  }
  if (collection && collection !== "all") {
    list = list.filter(
      (p) =>
        p.collection_slug === collection ||
        String(p.collection_id) === String(collection)
    );
  }
  if (search && String(search).trim() !== "") {
    const q = String(search).trim().toLowerCase();
    list = list.filter((p) =>
      [p.name, p.description, p.material, p.color, p.category_name, p.slug]
        .some((v) => v && String(v).toLowerCase().includes(q))
    );
  }
  if (featured)    list = list.filter((p) => p.is_featured === 1);
  if (trending)    list = list.filter((p) => p.is_trending === 1);
  if (offers)      list = list.filter((p) => p.has_offer === 1);
  if (in_stock_only) list = list.filter((p) => p.in_stock);
  if (min_price !== undefined && min_price !== "" && !isNaN(Number(min_price))) {
    list = list.filter((p) => Number(p.price) >= Number(min_price));
  }
  if (max_price !== undefined && max_price !== "" && !isNaN(Number(max_price))) {
    list = list.filter((p) => Number(p.price) <= Number(max_price));
  }

  const byNum = (a, b, key) => Number(a[key] ?? 0) - Number(b[key] ?? 0);
  const sorted = [...list];
  switch (sort) {
    case "price_low":  sorted.sort((a, b) => byNum(a, b, "price")); break;
    case "price_high": sorted.sort((a, b) => byNum(b, a, "price")); break;
    case "rating":
      sorted.sort((a, b) => byNum(b, a, "rating") || byNum(b, a, "reviews_count"));
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")) ||
          byNum(b, a, "id")
      );
      break;
    case "offers":
      sorted.sort((a, b) => byNum(b, a, "has_offer") || byNum(a, b, "price"));
      break;
    case "name":
      sorted.sort((a, b) => String(a.name).localeCompare(String(b.name)));
      break;
    case "featured":
    default:
      sorted.sort((a, b) => byNum(b, a, "is_featured") || byNum(a, b, "id"));
      break;
  }
  return sorted;
};

// Toast-guidance is shown at most once per page load.
let fallbackNoticeShown = false;
const fallbackResponse = (message) => ({
  status: "success",
  success: true,
  fallback: true,
  message,
  data: [],
});

/**
 * Resolve a product image reference to a full URL.
 * - Full URLs (http/https) are returned unchanged.
 * - Root-relative upload paths ("/backend/uploads/products/x.jpg") are
 *   prefixed with the API origin.
 * - Bare upload filenames are resolved against the uploads folder.
 */
export const resolveImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  if (path.startsWith("uploads/")) return `${API_ORIGIN}/backend/${path}`;
  return path;
};

const getSessionId = () => {
  let id = localStorage.getItem("furni_session_id");
  if (!id) {
    id = "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    localStorage.setItem("furni_session_id", id);
  }
  return id;
};

// Small offline fallbacks for CATEGORIES / COLLECTIONS chrome only.
// Products are NEVER hardcoded here - they come from MySQL via the PHP API.
const FALLBACK_CATEGORIES = [
  { id: 1, name: "Living Room", slug: "living-room", description: "Sofas, coffee tables & recliners", icon: "🛋️", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Bedroom", slug: "bedroom", description: "Beds, nightstands & dressers", icon: "🛏️", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Dining Room", slug: "dining-room", description: "Dining tables & ergonomic chairs", icon: "🍽️", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Office & Study", slug: "office-study", description: "Desks & executive chairs", icon: "💼", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "Outdoor & Patio", slug: "outdoor-patio", description: "Teak lounges & patio sets", icon: "🪴", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
  { id: 6, name: "Luxury & Decor", slug: "luxury-decor", description: "Console tables & plush rugs", icon: "✨", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80" },
  { id: 7, name: "Lighting & Accents", slug: "lighting-accents", description: "Floor lamps & wall art", icon: "💡", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" }
];

const FALLBACK_COLLECTIONS = [
  { id: 1, title: "Nordic Minimalist Suite", slug: "nordic-minimalist", subtitle: "Clean lines & natural solid woods", banner_image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80", discount_tag: "Up to 35% OFF" },
  { id: 2, title: "Royal Velvet Elegance", slug: "royal-velvet", subtitle: "Plush velvet sofas & gold accents", banner_image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80", discount_tag: "Flat 25% OFF" },
  { id: 3, title: "Modern Ergonomic Workspace", slug: "modern-workspace", subtitle: "Standing desks & lumbar support", banner_image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80", discount_tag: "Special Bundle Deal" },
  { id: 4, title: "Artisan Teak & Patio", slug: "artisan-teak", subtitle: "Handcrafted solid teak furniture", banner_image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", discount_tag: "Summer Clearance" },
  { id: 5, title: "Urban Space Savers", slug: "urban-space-savers", subtitle: "Smart multi-functional furniture", banner_image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80", discount_tag: "Up to 40% OFF" },
  { id: 6, title: "Grand Dining Masterpiece", slug: "grand-dining", subtitle: "Solid marble tables & velvet chairs", banner_image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80", discount_tag: "Save ₹8,000 Today" },
  { id: 7, title: "Aesthetic Ambient Living", slug: "ambient-living", subtitle: "Designer floor lamps & ceramics", banner_image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80", discount_tag: "New Arrival" }
];

// Helper functions for offline localStorage persistence (cart/wishlist state only)
const getLocalCart = () => JSON.parse(localStorage.getItem("furni_cart") || "[]");
const saveLocalCart = (cart) => localStorage.setItem("furni_cart", JSON.stringify(cart));
const getLocalWishlist = () => JSON.parse(localStorage.getItem("furni_wishlist") || "[]");
const saveLocalWishlist = (wl) => localStorage.setItem("furni_wishlist", JSON.stringify(wl));

const handleResponse = async (res, fallbackMessage) => {
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || fallbackMessage || `Request failed (${res.status})`);
  }
  return res.json();
};

export const api = {
  sessionId: getSessionId(),

  /* ============================ PRODUCTS (MySQL) ============================ */

  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/products.php?${query}`);
      const data = await handleResponse(res, "Failed to load products");
      // Guard: any unexpected response shape falls back to the snapshot.
      if (!data || data.status !== "success" || !Array.isArray(data.data)) {
        throw new Error("Unexpected products response");
      }
      return data;
    } catch {
      // PHP API unreachable (e.g. static hosting) - serve the catalog snapshot.
      console.warn("Product API unreachable - serving static catalog snapshot");
      const data = filterFallbackProducts(params);
      const resp = fallbackResponse("Showing the offline catalog (product API not reachable)");
      resp.data = data;
      resp.count = data.length;
      if (!fallbackNoticeShown && typeof window !== "undefined") {
        fallbackNoticeShown = true;
        // Small delay so the ToastContainer has definitely mounted.
        setTimeout(() => toast.info(resp.message, { autoClose: 6000 }), 800);
      }
      return resp;
    }
  },

  async getProduct(id) {
    try {
      const res = await fetch(`${API_BASE}/products.php?id=${encodeURIComponent(id)}`);
      const data = await handleResponse(res, "Failed to load product");
      if (!data || data.status !== "success" || !data.data || typeof data.data !== "object") {
        throw new Error("Unexpected product response");
      }
      return data;
    } catch {
      console.warn("Product detail API unreachable - using snapshot");
      const product = PRODUCTS_FALLBACK.find((p) => String(p.id) === String(id));
      if (!product) {
        return { status: "error", success: false, message: "Product not found", data: null };
      }
      return { status: "success", success: true, fallback: true, message: "Product fetched", data: product };
    }
  },

  async getProductBySlug(slug) {
    try {
      const res = await fetch(`${API_BASE}/products.php?slug=${encodeURIComponent(slug)}`);
      const data = await handleResponse(res, "Failed to load product");
      if (!data || data.status !== "success" || !data.data || typeof data.data !== "object") {
        throw new Error("Unexpected product response");
      }
      return data;
    } catch {
      console.warn("Product slug API unreachable - using snapshot");
      const product = PRODUCTS_FALLBACK.find((p) => p.slug === slug);
      if (!product) {
        return { status: "error", success: false, message: "Product not found", data: null };
      }
      return { status: "success", success: true, fallback: true, message: "Product fetched", data: product };
    }
  },

  async createProduct(productData) {
    let res;
    try {
      res = await fetch(`${API_BASE}/products.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
    } catch {
      throw new Error("Products cannot be saved: this site is in read-only mode (no PHP/MySQL backend attached)");
    }
    return await handleResponse(res, "Failed to store product");
  },

  async updateProduct(id, productData) {
    let res;
    try {
      res = await fetch(`${API_BASE}/products.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...productData })
      });
    } catch {
      throw new Error("Products cannot be updated: this site is in read-only mode (no PHP/MySQL backend attached)");
    }
    return await handleResponse(res, "Failed to update product");
  },

  async deleteProduct(id) {
    let res;
    try {
      res = await fetch(`${API_BASE}/products.php?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
    } catch {
      throw new Error("Products cannot be deleted: this site is in read-only mode (no PHP/MySQL backend attached)");
    }
    return await handleResponse(res, "Failed to delete product");
  },

  /**
   * Upload one or more product images. Accepts File objects or an array of them.
   * Returns { status, data: { urls, paths } }.
   */
  async uploadImage(files) {
    const list = Array.isArray(files) ? files : [files];
    const formData = new FormData();
    list.forEach((file) => formData.append("image[]", file));

    const res = await fetch(`${API_BASE}/upload.php`, {
      method: "POST",
      body: formData
    });
    return await handleResponse(res, "Image upload failed");
  },

  /* ========================== CATEGORIES / COLLECTIONS ====================== */

  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories.php`);
      return await handleResponse(res, "Network error");
    } catch {
      return { status: "success", data: FALLBACK_CATEGORIES };
    }
  },

  async getCollections() {
    try {
      const res = await fetch(`${API_BASE}/collections.php`);
      return await handleResponse(res, "Network error");
    } catch {
      return { status: "success", data: FALLBACK_COLLECTIONS };
    }
  },

  /* ================================== CART ================================= */

  async getCart() {
    try {
      const res = await fetch(`${API_BASE}/cart.php?session_id=${this.sessionId}`);
      return await handleResponse(res, "Network error");
    } catch {
      // Offline/static hosting - hydrate cart items from the catalog snapshot
      // so the drawer can show name, image and price exactly like the API does.
      const cart = getLocalCart();
      const data = cart
        .map((c) => {
          const product = PRODUCTS_FALLBACK.find(
            (p) => String(p.id) === String(c.product_id)
          );
          return product ? { ...product, quantity: c.quantity, offline: true } : null;
        })
        .filter(Boolean);
      const subtotal = data.reduce((acc, item) => acc + item.price * item.quantity, 0);
      return { status: "success", data, subtotal };
    }
  },

  async addToCart(productId, quantity = 1) {
    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity, session_id: this.sessionId })
      });
      return await handleResponse(res, "Network error");
    } catch {
      let cart = getLocalCart();
      const idx = cart.findIndex((c) => c.product_id == productId);
      if (idx > -1) cart[idx].quantity += quantity;
      else cart.push({ product_id: productId, quantity });
      saveLocalCart(cart);
      return { status: "success", message: "Item added to cart (offline mode)" };
    }
  },

  async updateCartQty(productId, quantity) {
    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity, session_id: this.sessionId })
      });
      return await handleResponse(res, "Network error");
    } catch {
      let cart = getLocalCart();
      const idx = cart.findIndex((c) => c.product_id == productId);
      if (idx > -1) {
        if (quantity <= 0) cart.splice(idx, 1);
        else cart[idx].quantity = quantity;
      }
      saveLocalCart(cart);
      return { status: "success", message: "Cart updated" };
    }
  },

  async removeFromCart(productId) {
    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, session_id: this.sessionId })
      });
      return await handleResponse(res, "Network error");
    } catch {
      let cart = getLocalCart().filter((c) => c.product_id != productId);
      saveLocalCart(cart);
      return { status: "success", message: "Item removed" };
    }
  },

  /* ================================ WISHLIST =============================== */

  async getWishlist() {
    try {
      const res = await fetch(`${API_BASE}/wishlist.php?session_id=${this.sessionId}`);
      return await handleResponse(res, "Network error");
    } catch {
      // Offline/static hosting - hydrate wishlist items from the catalog snapshot.
      const wl = getLocalWishlist();
      return {
        status: "success",
        data: wl
          .map((id) => PRODUCTS_FALLBACK.find((p) => String(p.id) === String(id)))
          .filter(Boolean),
      };
    }
  },

  async toggleWishlist(productId) {
    try {
      const res = await fetch(`${API_BASE}/wishlist.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, session_id: this.sessionId })
      });
      return await handleResponse(res, "Network error");
    } catch {
      let wl = getLocalWishlist();
      const idx = wl.indexOf(productId);
      let action = "added";
      if (idx > -1) {
        wl.splice(idx, 1);
        action = "removed";
      } else {
        wl.push(productId);
      }
      saveLocalWishlist(wl);
      return { status: "success", action, message: `Wishlist ${action}` };
    }
  },

  /* ============================ CHECKOUT / ORDERS =========================== */

  async submitCheckout(orderData) {
    try {
      const res = await fetch(`${API_BASE}/checkout.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderData, session_id: this.sessionId })
      });
      const data = await handleResponse(res, "Checkout failed");

      // Mirror the order locally so the admin panel can show it offline too.
      let localOrders = JSON.parse(localStorage.getItem("furni_local_orders") || "[]");
      localOrders.unshift({
        id: Date.now(),
        order_number: data.order_number,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method || "Credit Card",
        total_amount: orderData.items ? orderData.items.reduce((acc, i) => acc + (i.price * i.quantity), 0) : 0,
        status: "Processing",
        created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
        items: (orderData.items || []).map((i) => ({
          id: i.id,
          product_id: i.id,
          product_name: i.name,
          product_image: i.image,
          quantity: i.quantity,
          price: i.price
        }))
      });
      localStorage.setItem("furni_local_orders", JSON.stringify(localOrders));

      return data;
    } catch (err) {
      // Static hosting (or server down): keep the order in the browser so the
      // customer keeps a record, and surface a clear message.
      const local = {
        id: Date.now(),
        order_number: "LOCAL-" + Date.now().toString(36).toUpperCase(),
        customer_name: orderData.customer_name,
        total_amount: (orderData.items || []).reduce((acc, i) => acc + i.price * i.quantity, 0),
        status: "Stored on device",
        created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
        items: (orderData.items || []).map((i) => ({ id: i.id, product_id: i.id, product_name: i.name, product_image: i.image, quantity: i.quantity, price: i.price })),
      };
      const localOrders = JSON.parse(localStorage.getItem("furni_local_orders") || "[]");
      localStorage.setItem("furni_local_orders", JSON.stringify([local, ...localOrders]));

      return {
        status: "error",
        success: false,
        message:
          err.message === "Failed to fetch"
            ? "Order saved on this device only - the store backend is not connected (static hosting). Use a PHP host for live orders."
            : err.message || "Checkout failed",
        order: local,
      };
    }
  },

  async getOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders.php`);
      return await handleResponse(res, "Network error");
    } catch {
      let localOrders = JSON.parse(localStorage.getItem("furni_local_orders") || "[]");
      return { status: "success", count: localOrders.length, data: localOrders };
    }
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/orders.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status })
    });
    return await handleResponse(res, "Failed to update order status");
  },

  async deleteOrder(orderId) {
    const res = await fetch(`${API_BASE}/orders.php?id=${encodeURIComponent(orderId)}`, {
      method: "DELETE"
    });
    return await handleResponse(res, "Failed to delete order");
  },

  /* ================================ NEWSLETTER ============================= */

  async subscribeNewsletter(email) {
    try {
      const res = await fetch(`${API_BASE}/newsletter.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      return await handleResponse(res, "Network error");
    } catch {
      return { status: "error", success: false, message: "Subscription service unavailable" };
    }
  }
};
