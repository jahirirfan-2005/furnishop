import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import HeroBanner from "./HeroBanner";
import ProductList from "./ProductList";
import QuickViewModal from "./QuickViewModal";
import CartDrawer from "./CartDrawer";
import CheckoutModal from "./CheckoutModal";
import WishlistModal from "./WishlistModal";
import AddProductModal from "./AddProductModal";
import Footer from "./Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "./api";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeCollection, setActiveCollection] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [searchTerm, setSearchTerm] = useState("");

  const [theme, setTheme] = useState(localStorage.getItem("furni_theme") || "light");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Toggle Dark/Light Theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("furni_theme", newTheme);
  };

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark-theme" : "";
  }, [theme]);

  // Load initial Categories, Collections, Cart, Wishlist from PHP API
  const loadInitialData = useCallback(async () => {
    try {
      const [catRes, colRes, cartRes, wishRes] = await Promise.all([
        api.getCategories(),
        api.getCollections(),
        api.getCart(),
        api.getWishlist()
      ]);

      if (catRes.status === "success") setCategories(catRes.data || []);
      if (colRes.status === "success") setCollections(colRes.data || []);
      if (cartRes.status === "success") setCartItems(cartRes.data || []);
      if (wishRes.status === "success") setWishlistItems(wishRes.data || []);
    } catch (err) {
      console.error("Failed to fetch initial server data:", err);
    }
  }, []);

  // Fetch products based on category, collection, search, and sorting filters from PHP API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        category: activeCategory,
        collection: activeCollection,
        search: searchTerm,
        sort: sortBy
      });

      if (res.status === "success") {
        setProducts(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast.error("Unable to load products from server");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeCollection, searchTerm, sortBy]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Smooth scroll focus to products section when active search query is entered
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById("products");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // Store product handler
  const handleProductAdded = async (productData) => {
    try {
      const res = await api.createProduct(productData);
      if (res.status === "success") {
        toast.success(`🎉 "${productData.name}" successfully stored in database!`, {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "dark" ? "dark" : "colored"
        });
        await fetchProducts();
      } else {
        throw new Error(res.message || "Failed to store product");
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
      throw err;
    }
  };

  // Cart operations with PHP API
  const handleAddToCart = async (item, quantity = 1) => {
    try {
      const res = await api.addToCart(item.id, quantity);
      if (res.status === "success") {
        const cartRes = await api.getCart();
        if (cartRes.status === "success") setCartItems(cartRes.data || []);

        toast.success(`🛒 ${item.name} added to cart!`, {
          position: "top-right",
          autoClose: 2000,
          theme: theme === "dark" ? "dark" : "colored"
        });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to update cart");
    }
  };

  const handleUpdateCartQty = async (productId, quantity) => {
    try {
      const res = await api.updateCartQty(productId, quantity);
      if (res.status === "success") {
        const cartRes = await api.getCart();
        if (cartRes.status === "success") setCartItems(cartRes.data || []);
      }
    } catch (err) {
      toast.error("Failed to update cart item");
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const res = await api.removeFromCart(productId);
      if (res.status === "success") {
        const cartRes = await api.getCart();
        if (cartRes.status === "success") setCartItems(cartRes.data || []);
        toast.info("Item removed from cart");
      }
    } catch (err) {
      toast.error("Failed to remove cart item");
    }
  };

  // Wishlist toggle with PHP API
  const handleWishlist = async (item) => {
    try {
      const res = await api.toggleWishlist(item.id);
      if (res.status === "success") {
        const wishRes = await api.getWishlist();
        if (wishRes.status === "success") setWishlistItems(wishRes.data || []);

        if (res.action === "added") {
          toast.success(`❤️ ${item.name} added to wishlist!`, {
            position: "top-right",
            autoClose: 2000
          });
        } else {
          toast.info(`Removed ${item.name} from wishlist`);
        }
      }
    } catch (err) {
      toast.error("Wishlist sync failed");
    }
  };

  // Checkout order completion handler with PHP API
  const handleCheckoutSuccess = async (orderData) => {
    const res = await api.submitCheckout(orderData);
    if (res.status === "success") {
      setCartItems([]);
    }
    return res;
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`app-wrapper ${theme === "dark" ? "dark" : "light"}`}>
      {/* Navbar */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlistItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Hero Banner */}
      <HeroBanner
        collections={collections}
        onSelectCollection={(slug) => setActiveCollection(slug)}
      />

      {/* Product List & Filter Grid */}
      <ProductList
        products={products}
        loading={loading}
        categories={categories}
        collections={collections}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeCollection={activeCollection}
        setActiveCollection={setActiveCollection}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleAddToCart={handleAddToCart}
        handleWishlist={handleWishlist}
        wishlistItems={wishlistItems}
        onQuickView={(product) => setQuickViewProduct(product)}
      />

      {/* Footer */}
      <Footer
        categories={categories}
        onSelectCategory={(slug) => {
          setActiveCategory(slug);
          window.scrollTo({ top: 500, behavior: "smooth" });
        }}
      />

      {/* Modals & Slide-out Drawers */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        handleAddToCart={handleAddToCart}
        handleWishlist={handleWishlist}
        isWishlisted={quickViewProduct ? wishlistItems.some((w) => w.id === quickViewProduct.id) : false}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onToggleWishlist={handleWishlist}
        onAddToCart={handleAddToCart}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleCheckoutSuccess}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        categories={categories}
        collections={collections}
        onProductAdded={handleProductAdded}
      />

      {/* Mobile Sticky Bottom Quick Bar */}
      <div className="mobile-bottom-nav">
        <button
          className={activeCategory === "all" ? "active" : ""}
          onClick={() => {
            setActiveCategory("all");
            setActiveCollection("all");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span>🏠</span> Home
        </button>
        <button onClick={() => setIsWishlistOpen(true)}>
          <span>❤️</span> Wishlist ({wishlistItems.length})
        </button>
        <button onClick={() => setIsCartOpen(true)} className="cart-quick-btn">
          <span>🛒</span> Cart ({totalCartCount})
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={2000} theme={theme === "dark" ? "dark" : "colored"} />
    </div>
  );
}

export default App;