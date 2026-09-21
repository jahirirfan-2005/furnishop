const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/backend/api";

const getSessionId = () => {
  let id = localStorage.getItem("furni_session_id");
  if (!id) {
    id = "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    localStorage.setItem("furni_session_id", id);
  }
  return id;
};

// Fallback Mock Data for Seamless Preview / Offline Mode
const MOCK_CATEGORIES = [
  { id: 1, name: "Living Room", slug: "living-room", description: "Sofas, coffee tables & recliners", icon: "🛋️", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Bedroom", slug: "bedroom", description: "Beds, nightstands & dressers", icon: "🛏️", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Dining Room", slug: "dining-room", description: "Dining tables & ergonomic chairs", icon: "🍽️", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Office & Study", slug: "office-study", description: "Desks & executive chairs", icon: "💼", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "Outdoor & Patio", slug: "outdoor-patio", description: "Teak lounges & patio sets", icon: "🪴", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
  { id: 6, name: "Luxury & Decor", slug: "luxury-decor", description: "Console tables & plush rugs", icon: "✨", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80" },
  { id: 7, name: "Lighting & Accents", slug: "lighting-accents", description: "Floor lamps & wall art", icon: "💡", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" }
];

const MOCK_COLLECTIONS = [
  { id: 1, title: "Nordic Minimalist Suite", slug: "nordic-minimalist", subtitle: "Clean lines & natural solid woods", banner_image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80", discount_tag: "Up to 35% OFF" },
  { id: 2, title: "Royal Velvet Elegance", slug: "royal-velvet", subtitle: "Plush velvet sofas & gold accents", banner_image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80", discount_tag: "Flat 25% OFF" },
  { id: 3, title: "Modern Ergonomic Workspace", slug: "modern-workspace", subtitle: "Standing desks & lumbar support", banner_image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80", discount_tag: "Special Bundle Deal" },
  { id: 4, title: "Artisan Teak & Patio", slug: "artisan-teak", subtitle: "Handcrafted solid teak furniture", banner_image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", discount_tag: "Summer Clearance" },
  { id: 5, title: "Urban Space Savers", slug: "urban-space-savers", subtitle: "Smart multi-functional furniture", banner_image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80", discount_tag: "Up to 40% OFF" },
  { id: 6, title: "Grand Dining Masterpiece", slug: "grand-dining", subtitle: "Solid marble tables & velvet chairs", banner_image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80", discount_tag: "Save ₹8,000 Today" },
  { id: 7, title: "Aesthetic Ambient Living", slug: "ambient-living", subtitle: "Designer floor lamps & ceramics", banner_image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80", discount_tag: "New Arrival" }
];

const MOCK_PRODUCTS = [
  {
    id: 1,
    category_id: 1,
    collection_id: 1,
    category_name: "Living Room",
    collection_title: "Nordic Minimalist Suite",
    name: "Nordic Minimalist Oak Armchair",
    price: 14999,
    original_price: 19999,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1580481072645-022f9a6d1276?auto=format&fit=crop&w=800&q=80",
    description: "Handcrafted white oak armchair with soft linen upholstery and ergonomic lumbar angle.",
    dimensions: "W: 75cm x D: 80cm x H: 85cm",
    material: "Solid White Oak & Organic Linen",
    rating: 4.8,
    reviews_count: 42,
    has_offer: 1,
    is_featured: 1,
    is_trending: 1,
    stock_status: "In Stock"
  },
  {
    id: 2,
    category_id: 1,
    collection_id: 2,
    category_name: "Living Room",
    collection_title: "Royal Velvet Elegance",
    name: "Royal Emerald Velvet 3-Seater Sofa",
    price: 49999,
    original_price: 64999,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
    description: "Deep tufted emerald green velvet sofa featuring brushed gold metal legs.",
    dimensions: "W: 220cm x D: 95cm x H: 88cm",
    material: "Plush Royal Velvet & Gold Brass Base",
    rating: 4.9,
    reviews_count: 88,
    has_offer: 1,
    is_featured: 1,
    is_trending: 1,
    stock_status: "In Stock"
  },
  {
    id: 3,
    category_id: 2,
    collection_id: 5,
    category_name: "Bedroom",
    collection_title: "Urban Space Savers",
    name: "Aura Hydraulic Storage Platform Bed",
    price: 38999,
    original_price: 49999,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1540518614846-7ede433c5163?auto=format&fit=crop&w=800&q=80",
    description: "Queen size hydraulic bed with padded headboard and massive under-bed storage compartment.",
    dimensions: "W: 160cm x L: 205cm x H: 110cm",
    material: "Solid Teak & Premium Microfiber",
    rating: 4.7,
    reviews_count: 36,
    has_offer: 1,
    is_featured: 1,
    is_trending: 0,
    stock_status: "In Stock"
  },
  {
    id: 4,
    category_id: 3,
    collection_id: 6,
    category_name: "Dining Room",
    collection_title: "Grand Dining Masterpiece",
    name: "Carrara Italian Marble 6-Seater Dining Set",
    price: 68999,
    original_price: 84999,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80",
    description: "Natural Carrara white marble top dining table accompanied by 6 velvet cushioned chairs.",
    dimensions: "W: 180cm x D: 90cm x H: 76cm",
    material: "Italian Marble & Solid Teak Frame",
    rating: 5.0,
    reviews_count: 54,
    has_offer: 1,
    is_featured: 1,
    is_trending: 1,
    stock_status: "In Stock"
  },
  {
    id: 5,
    category_id: 4,
    collection_id: 3,
    category_name: "Office & Study",
    collection_title: "Modern Ergonomic Workspace",
    name: "Zenith Electric Dual-Motor Standing Desk",
    price: 27999,
    original_price: 34999,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
    description: "Whisper-quiet dual motor standing desk with 4 memory height presets and cable channel.",
    dimensions: "W: 140cm x D: 70cm x H: 65-130cm",
    material: "Solid Walnut Top & Heavy Duty Steel Frame",
    rating: 4.8,
    reviews_count: 67,
    has_offer: 1,
    is_featured: 1,
    is_trending: 1,
    stock_status: "In Stock"
  },
  {
    id: 6,
    category_id: 5,
    collection_id: 4,
    category_name: "Outdoor & Patio",
    collection_title: "Artisan Teak & Patio",
    name: "Bali Handcrafted Outdoor Teak Sun Lounge",
    price: 21999,
    original_price: 28999,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&w=800&q=80",
    description: "Weather-proof solid Indonesian teak lounge with quick-dry outdoor foam cushion.",
    dimensions: "L: 200cm x W: 70cm x H: 35cm",
    material: "Grade A Indonesian Teak Wood",
    rating: 4.9,
    reviews_count: 29,
    has_offer: 0,
    is_featured: 0,
    is_trending: 1,
    stock_status: "In Stock"
  },
  {
    id: 7,
    category_id: 7,
    collection_id: 7,
    category_name: "Lighting & Accents",
    collection_title: "Aesthetic Ambient Living",
    name: "Nordic Arch Brass Floor Lamp",
    price: 8999,
    original_price: 11999,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    description: "Sleek metallic brass arch floor lamp with weighted marble base and warm LED shade.",
    dimensions: "Base: 35cm x Arch Span: 110cm x H: 210cm",
    material: "Brushed Brass & Heavy Marble Base",
    rating: 4.6,
    reviews_count: 19,
    has_offer: 1,
    is_featured: 0,
    is_trending: 1,
    stock_status: "In Stock"
  },
  {
    id: 8,
    category_id: 6,
    collection_id: 1,
    category_name: "Luxury & Decor",
    collection_title: "Nordic Minimalist Suite",
    name: "Kyoto Geometric Teak Console Table",
    price: 16999,
    original_price: 21999,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
    description: "Minimalist console table with fluted wooden slats and hidden touch-latch drawers.",
    dimensions: "W: 130cm x D: 40cm x H: 80cm",
    material: "Solid Teak & Brass Knobs",
    rating: 4.8,
    reviews_count: 31,
    has_offer: 0,
    is_featured: 1,
    is_trending: 0,
    stock_status: "In Stock"
  }
];

// Helper functions for offline localStorage persistence
const getLocalCart = () => JSON.parse(localStorage.getItem("furni_cart") || "[]");
const saveLocalCart = (cart) => localStorage.setItem("furni_cart", JSON.stringify(cart));
const getLocalWishlist = () => JSON.parse(localStorage.getItem("furni_wishlist") || "[]");
const saveLocalWishlist = (wl) => localStorage.setItem("furni_wishlist", JSON.stringify(wl));

export const api = {
  sessionId: getSessionId(),

  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/products.php?${query}`);
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      console.warn("Using offline product fallback dataset:", err);
      let products = [...MOCK_PRODUCTS];

      if (params.category && params.category !== "all") {
        products = products.filter(p => p.category_name.toLowerCase() === params.category.toLowerCase() || p.category_id == params.category);
      }
      if (params.collection && params.collection !== "all") {
        products = products.filter(p => p.collection_title.toLowerCase().includes(params.collection.toLowerCase()) || p.collection_id == params.collection);
      }
      if (params.search) {
        const q = params.search.trim().replace(/\s+/g, ' ').toLowerCase();
        if (q) {
          products = products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.material && p.material.toLowerCase().includes(q)) ||
            (p.category_name && p.category_name.toLowerCase().includes(q))
          );
        }
      }
      if (params.featured === "1") {
        products = products.filter(p => p.is_featured);
      }
      if (params.trending === "1") {
        products = products.filter(p => p.is_trending);
      }

      return { status: "success", data: products, total: products.length };
    }
  },

  async getProduct(id) {
    try {
      const res = await fetch(`${API_BASE}/products.php?id=${id}`);
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      const p = MOCK_PRODUCTS.find(item => item.id == id) || MOCK_PRODUCTS[0];
      return { status: "success", data: p };
    }
  },

  async createProduct(productData) {
    try {
      const res = await fetch(`${API_BASE}/products.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create product");
      }
      return await res.json();
    } catch (err) {
      console.warn("API Error, utilizing offline fallback for product creation:", err);
      const categoryObj = MOCK_CATEGORIES.find(c => c.id == productData.category_id) || {};
      const collectionObj = MOCK_COLLECTIONS.find(c => c.id == productData.collection_id) || {};

      const newProduct = {
        id: Date.now(),
        category_id: Number(productData.category_id),
        collection_id: productData.collection_id ? Number(productData.collection_id) : null,
        category_name: categoryObj.name || "Living Room",
        collection_title: collectionObj.title || "",
        name: productData.name,
        price: Number(productData.price),
        original_price: productData.original_price ? Number(productData.original_price) : null,
        image: productData.image,
        back_image: productData.back_image || productData.image,
        description: productData.description || "",
        dimensions: productData.dimensions || "W: 180cm x D: 90cm x H: 85cm",
        material: productData.material || "Solid Teak Wood",
        rating: productData.rating ? Number(productData.rating) : 4.5,
        reviews_count: 1,
        has_offer: productData.has_offer ? 1 : 0,
        is_featured: productData.is_featured ? 1 : 0,
        is_trending: productData.is_trending ? 1 : 0,
        stock_status: productData.stock_status || "In Stock"
      };

      MOCK_PRODUCTS.unshift(newProduct);
      return { status: "success", message: "Product stored successfully (preview mode)", data: newProduct };
    }
  },

  async deleteProduct(id) {
    try {
      const res = await fetch(`${API_BASE}/products.php?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete product");
      return await res.json();
    } catch (err) {
      const idx = MOCK_PRODUCTS.findIndex(p => p.id == id);
      if (idx > -1) MOCK_PRODUCTS.splice(idx, 1);
      return { status: "success", message: "Product deleted" };
    }
  },

  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories.php`);
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      return { status: "success", data: MOCK_CATEGORIES };
    }
  },

  async getCollections() {
    try {
      const res = await fetch(`${API_BASE}/collections.php`);
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      return { status: "success", data: MOCK_COLLECTIONS };
    }
  },

  async getCart() {
    try {
      const res = await fetch(`${API_BASE}/cart.php?session_id=${this.sessionId}`);
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      const cart = getLocalCart();
      const cartItems = cart.map(item => {
        const p = MOCK_PRODUCTS.find(prod => prod.id == item.product_id) || MOCK_PRODUCTS[0];
        return { ...p, cart_id: item.product_id, quantity: item.quantity, subtotal: p.price * item.quantity };
      });
      const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
      return { status: "success", data: cartItems, subtotal };
    }
  },

  async addToCart(productId, quantity = 1) {
    try {
      const res = await fetch(`${API_BASE}/cart.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity, session_id: this.sessionId })
      });
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      let cart = getLocalCart();
      const idx = cart.findIndex(c => c.product_id == productId);
      if (idx > -1) {
        cart[idx].quantity += quantity;
      } else {
        cart.push({ product_id: productId, quantity });
      }
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
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      let cart = getLocalCart();
      const idx = cart.findIndex(c => c.product_id == productId);
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
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      let cart = getLocalCart();
      cart = cart.filter(c => c.product_id != productId);
      saveLocalCart(cart);
      return { status: "success", message: "Item removed" };
    }
  },

  async getWishlist() {
    try {
      const res = await fetch(`${API_BASE}/wishlist.php?session_id=${this.sessionId}`);
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      const wl = getLocalWishlist();
      const items = MOCK_PRODUCTS.filter(p => wl.includes(p.id));
      return { status: "success", data: items };
    }
  },

  async toggleWishlist(productId) {
    try {
      const res = await fetch(`${API_BASE}/wishlist.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, session_id: this.sessionId })
      });
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
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

  async submitCheckout(orderData) {
    try {
      const res = await fetch(`${API_BASE}/checkout.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderData, session_id: this.sessionId })
      });
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      saveLocalCart([]);
      return {
        status: "success",
        order_number: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        message: "Order placed successfully (demo mode)"
      };
    }
  },

  async subscribeNewsletter(email) {
    try {
      const res = await fetch(`${API_BASE}/newsletter.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      return { status: "success", message: "Thank you for subscribing!" };
    }
  }
};
