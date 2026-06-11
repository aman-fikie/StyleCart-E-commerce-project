import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";

const CART_KEY = "stylecart_cart";

const getCart = () => {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const getCartTotalPrice = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.price_etb * item.quantity, 0);
};

const getCartTotalItems = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartCount, setCartCount] = useState(getCartTotalItems());
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("stylecart-theme");
    return stored ? stored === "dark" : true;
  });

  // Theme effect
  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("stylecart-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const refreshCart = () => {
    const items = getCart();
    setCartItems(items);
    setTotalPrice(getCartTotalPrice());
    setCartCount(getCartTotalItems());
  };

  useEffect(() => {
    refreshCart();
    const handleStorage = () => refreshCart();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }
    let cart = getCart();
    const item = cart.find((i) => i.id === productId);
    if (item) item.quantity = newQty;
    saveCart(cart);
    refreshCart();
  };

  const removeItem = (productId) => {
    let cart = getCart();
    cart = cart.filter((i) => i.id !== productId);
    saveCart(cart);
    refreshCart();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate("/checkout");
  };

  // ─────────────────────────────────────────────────────────
  // Navbar (same as Home.jsx – adjust categories as needed)
  // ─────────────────────────────────────────────────────────
  const navbar = (
    <nav className="navbar">
      <div className="nav-inner">
        <a href="/" className="logo">
          <span className="logo-style">Style</span>
          <span className="logo-cart">Cart</span>
        </a>

        {/* Desktop nav links – optional, you can keep or remove */}
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/")}>Home</button>
        </div>

        <div className="nav-actions">
          {/* Search – optional, you can hide it */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" className="search-input" placeholder="Search…" disabled />
          </div>

          {/* Cart button that navigates to cart (already here) */}
          

          {/* Login button */}
          <button className="login-btn" onClick={() => navigate("/login")}>Login</button>

          {/* Theme toggle – inside navbar, at the far right */}
          <button
            className="theme-toggle"
            onClick={() => setDarkMode((d) => !d)}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </nav>
  );

  // ─────────────────────────────────────────────────────────
  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <>
        {navbar}
        <div className="cart-empty-page">
          <div className="empty-cart-content">
            <span className="empty-cart-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any style to your cart yet.</p>
            <button className="continue-shop-btn" onClick={() => navigate("/")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Cart with items
  return (
    <>
      {navbar}
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-page-title">My Cart</h1>
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                <img src={item.image} alt={item.title} className="cart-item-img" />
                <div className="cart-item-info">
                  <p className="cart-item-title">{item.title}</p>
                  <p className="cart-item-price">ETB {item.price_etb.toLocaleString()}</p>
                </div>
                <div className="cart-item-quantity">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <p className="cart-item-subtotal">
                  ETB {(item.price_etb * item.quantity).toLocaleString()}
                </p>
                <button
                  className="cart-remove-btn"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>ETB {totalPrice.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>ETB {totalPrice.toLocaleString()}</span>
            </div>
            <button className="checkout-button" onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}