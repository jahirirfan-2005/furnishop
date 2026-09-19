const API_BASE = "http://127.0.0.1:8000/backend/api";

const getSessionId = () => {
  let id = localStorage.getItem("furni_session_id");
  if (!id) {
    id = "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    localStorage.setItem("furni_session_id", id);
  }
  return id;
};

export const api = {
  sessionId: getSessionId(),

  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products.php?${query}`);
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products.php?id=${id}`);
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/categories.php`);
    return res.json();
  },

  async getCollections() {
    const res = await fetch(`${API_BASE}/collections.php`);
    return res.json();
  },

  async getCart() {
    const res = await fetch(`${API_BASE}/cart.php?session_id=${this.sessionId}`);
    return res.json();
  },

  async addToCart(productId, quantity = 1) {
    const res = await fetch(`${API_BASE}/cart.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity, session_id: this.sessionId })
    });
    return res.json();
  },

  async updateCartQty(productId, quantity) {
    const res = await fetch(`${API_BASE}/cart.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity, session_id: this.sessionId })
    });
    return res.json();
  },

  async removeFromCart(productId) {
    const res = await fetch(`${API_BASE}/cart.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, session_id: this.sessionId })
    });
    return res.json();
  },

  async getWishlist() {
    const res = await fetch(`${API_BASE}/wishlist.php?session_id=${this.sessionId}`);
    return res.json();
  },

  async toggleWishlist(productId) {
    const res = await fetch(`${API_BASE}/wishlist.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, session_id: this.sessionId })
    });
    return res.json();
  },

  async submitCheckout(orderData) {
    const res = await fetch(`${API_BASE}/checkout.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...orderData, session_id: this.sessionId })
    });
    return res.json();
  },

  async subscribeNewsletter(email) {
    const res = await fetch(`${API_BASE}/newsletter.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    return res.json();
  }
};
