import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CheckOut.css";

// ─── Helpers ──────────────────────────────────────────────────────────
const CART_KEY = "stylecart_cart";

const getCart = () => {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
};

const getCartTotalPrice = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.price_etb * item.quantity, 0);
};

const getCartTotalItems = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};

const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};

// ─── Checkout Component ──────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");

  // ─── Theme ──────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("stylecart-theme");
    return stored ? stored === "dark" : true;
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("stylecart-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // ✅ REMOVED: Guest guard useEffect
  // Authentication is now enforced by the backend

  // ─── Cart data ──────────────────────────────────────────────────────
  const cartItems = getCart();
  const totalPrice = getCartTotalPrice();
  const totalItems = getCartTotalItems();

  // ─── Form state ─────────────────────────────────────────────────────
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "Ethiopia",
    state: "",
    city: "",
    street: "",
    apartment: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ─── Validation ─────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Please enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.country.trim()) errs.country = "Country is required";
    if (!form.state.trim()) errs.state = "State/Province is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.street.trim()) errs.street = "Street address is required";
    if (!form.postalCode.trim()) errs.postalCode = "Postal code is required";
    return errs;
  };

  // ─── Place Order ────────────────────────────────────────────────────
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstError = document.querySelector(".form-group .error");
      if (firstError) firstError.focus();
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    const items = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      priceAtOrder: item.price_etb,
    }));

    const payload = {
      items,
      totalAmount: totalPrice,
      shippingAddress: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        state: form.state,
        city: form.city,
        street: form.street,
        apartment: form.apartment,
        postalCode: form.postalCode,
      },
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // ✅ Handle 401 Unauthorized (backend enforces auth)
      if (res.status === 401) {
        // Redirect to login, preserving current path
        navigate("/login", { state: { from: window.location.pathname } });
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Order failed");
      }

      const data = await res.json();
      clearCart();
      setOrderId(data.orderId || data.id || "Order placed");
      setOrderPlaced(true);
      setTimeout(() => {
        navigate("/orders", { state: { orderId: data.orderId } });
      }, 3000);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Empty Cart Guard ──────────────────────────────────────────────
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="checkout-empty">
          <span className="empty-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Add some items before checking out.</p>
          <button className="continue-btn" onClick={() => navigate("/")}>
            Browse Products
          </button>
        </div>
      </>
    );
  }

  // ─── Success Screen ─────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="checkout-success">
          <span className="success-icon">🎉</span>
          <h2>Order Placed Successfully!</h2>
          <p className="order-id">Order #{orderId}</p>
          <p>We'll send you a confirmation email shortly.</p>
          <p className="redirect-msg">Redirecting to your orders…</p>
          <button className="continue-btn" onClick={() => navigate("/orders")}>
            View My Orders
          </button>
        </div>
      </>
    );
  }

  // ─── Main Checkout Form ─────────────────────────────────────────────
  return (
    <>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="checkout-page">
        <div className="checkout-container">
          <h1 className="checkout-title">Checkout</h1>
          <div className="checkout-grid">
            {/* Left: Form */}
            <div className="checkout-form-wrap">
              <form onSubmit={handlePlaceOrder} className="checkout-form" noValidate>
                <div className="form-section">
                  <h2>Shipping Details</h2>
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className={errors.fullName ? "error" : ""}
                      placeholder="Abebe Girma"
                      autoFocus
                    />
                    {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={errors.email ? "error" : ""}
                        placeholder="you@example.com"
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone *</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={errors.phone ? "error" : ""}
                        placeholder="+251 912 345 678"
                      />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="country">Country *</label>
                      <input
                        id="country"
                        type="text"
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        className={errors.country ? "error" : ""}
                        placeholder="Ethiopia"
                      />
                      {errors.country && <span className="form-error">{errors.country}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State / Province *</label>
                      <input
                        id="state"
                        type="text"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        className={errors.state ? "error" : ""}
                        placeholder="Addis Ababa"
                      />
                      {errors.state && <span className="form-error">{errors.state}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className={errors.city ? "error" : ""}
                      placeholder="Addis Ababa"
                    />
                    {errors.city && <span className="form-error">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="street">Street Address *</label>
                    <input
                      id="street"
                      type="text"
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      className={errors.street ? "error" : ""}
                      placeholder="123 Main St"
                    />
                    {errors.street && <span className="form-error">{errors.street}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="apartment">Apartment / Suite (optional)</label>
                      <input
                        id="apartment"
                        type="text"
                        name="apartment"
                        value={form.apartment}
                        onChange={handleChange}
                        placeholder="Apt 4B"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="postalCode">Postal Code *</label>
                      <input
                        id="postalCode"
                        type="text"
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        className={errors.postalCode ? "error" : ""}
                        placeholder="1000"
                      />
                      {errors.postalCode && <span className="form-error">{errors.postalCode}</span>}
                    </div>
                  </div>
                </div>

                {error && <div className="checkout-error">{error}</div>}

                <button type="submit" className="place-order-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" /> Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </form>
            </div>

            {/* Right: Order Summary (sticky) */}
            <div className="checkout-summary-wrap">
              <div className="checkout-summary">
                <h2>Order Summary</h2>
                <div className="summary-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="summary-item">
                      <img src={item.image} alt={item.title} className="summary-img" />
                      <div className="summary-info">
                        <p className="summary-title">{item.title}</p>
                        <p className="summary-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="summary-price">
                        ETB {(item.price_etb * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="summary-totals">
                  <div className="summary-row">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>ETB {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>ETB {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────
function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const cartCount = getCartTotalItems();

  return (
    <nav className="checkout-navbar">
      <div className="nav-inner">
        <a href="/" className="logo">
          <span className="logo-style">Style</span>
          <span className="logo-cart">Cart</span>
        </a>
        <div className="nav-actions">
          <button className="cart-btn" onClick={() => navigate("/cart")}>
            <span className="cart-icon">🛍️</span>
            <span className="logo-style">MyCart</span>
            {cartCount > 0 && (
              <span key={cartCount} className="cart-badge">
                {cartCount}
              </span>
            )}
          </button>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
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
}