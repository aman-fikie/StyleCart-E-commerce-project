import React, { useState, useEffect, useCallback } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";

// ─── Constants ───────────────────────────────────────────────────────────────
const USD_TO_ETB = 55;
const CATEGORIES = ["all", "men", "women", "accessories"];

const CAT_MAP = {
  "men's clothing": "men",
  "women's clothing": "women",
  jewelery: "accessories",
  electronics: "accessories",
};

const MEN_NAMES = [
  "Slim Fit Oxford Shirt","Classic Chino Trousers","Linen Blend Blazer",
  "Cargo Jogger Pants","Graphic Print Hoodie","Essential Crew Neck Tee",
  "Merino Wool Pullover","Relaxed Fit Denim","Stretch Polo Shirt",
  "Utility Overshirt","Tailored Suit Jacket","Ribbed Turtleneck",
  "Athletic Track Pants","Quilted Bomber Jacket","Striped Long Sleeve Tee",
  "Slim Chino Shorts","Leather Biker Jacket","Woven Dress Shirt",
  "French Terry Sweatshirt","Packable Puffer Vest","Tech Fleece Zip-Up",
  "Regular Fit Jeans","Cotton Henley Shirt","Tropical Print Shirt",
  "Corduroy 5-Pocket Pants","Double-Breasted Coat","Sherpa Lined Hoodie",
  "Canvas Work Jacket","Slim Taper Jogger","Silk Blend Dress Shirt",
];

const WOMEN_NAMES = [
  "Floral Wrap Dress","High Waist Wide-Leg Trousers","Cropped Linen Blazer",
  "Ribbed Knit Midi Dress","Oversized Denim Jacket","Pleated Chiffon Skirt",
  "Fitted Turtleneck Top","Utility Cargo Jumpsuit","Satin Slip Dress",
  "Puff Sleeve Blouse","Tailored Cigarette Pants","Broderie Anglaise Top",
  "Velvet Midi Skirt","Double Breasted Blazer","Smocked Sundress",
  "Cut-Out Bodysuit","Trench Coat","Tiered Maxi Skirt",
  "Fitted Blazer Dress","Ruched Mini Dress","Crepe Wide Leg Pants",
  "Off-Shoulder Blouse","Asymmetric Hem Dress","Longline Cardigan",
  "Printed Wrap Skirt","Structured Mini Bag","Knit Co-Ord Set",
  "Organza Peplum Top","Draped Shoulder Dress","Relaxed Linen Trousers",
];

const ACC_NAMES = [
  "Woven Leather Belt","Canvas Tote Bag","Structured Mini Backpack",
  "Gold Chain Necklace","Minimalist Watch","Sunglasses Square Frame",
  "Silk Neck Scarf","Leather Card Wallet","Beaded Bracelet Set",
  "Wide Brim Hat","Crossbody Shoulder Bag","Enamel Hoop Earrings",
  "Knit Beanie","Leather Gloves","Embroidered Bucket Hat",
  "Pearl Stud Earrings","Faux Suede Belt Bag","Tortoiseshell Sunglasses",
  "Sterling Silver Ring","Cotton Canvas Cap","Chunky Chain Bracelet",
  "Structured Clutch Bag","Aviator Sunglasses","Layered Pendant Necklace",
  "Reversible Bucket Hat","Leather Watch Strap","Velvet Scrunchie Set",
  "Straw Market Bag","Geometric Drop Earrings","Monogram Keychain",
];

// ─── Mock product generator ───────────────────────────────────────────────────
function generateMocks(names, category, startId, count = 50) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const name = names[i % names.length];
    const price = Math.floor(Math.random() * 4500 + 500);
    items.push({
      id,
      title: `${name} ${i >= names.length ? `Vol.${Math.floor(i / names.length) + 1}` : ""}`.trim(),
      price_etb: price,
      image: `https://picsum.photos/300/400?random=${id}`,
      category,
      rating: { rate: (Math.random() * 2 + 3).toFixed(1), count: Math.floor(Math.random() * 300 + 20) },
      isMock: true,
    });
  }
  return items;
}

// ─── Toast component ─────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="toast-icon">🛒</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Star rating ─────────────────────────────────────────────────────────────
function Stars({ rate }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rate) ? "star filled" : "star"}>★</span>
      ))}
      <span className="rate-num">{rate}</span>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="product-card">
      <div className="card-image-wrap">
        {!imgLoaded && <div className="img-skeleton" />}
        <img
          src={product.image}
          alt={product.title}
          className={`card-image ${imgLoaded ? "loaded" : ""}`}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { e.target.src = `https://picsum.photos/300/400?random=${product.id + 999}`; }}
        />
        <div className="card-badge">{product.category}</div>
      </div>
      <div className="card-body">
        <p className="card-title">{product.title}</p>
        <Stars rate={product.rating?.rate || 4} />
        <div className="card-footer">
          <span className="card-price">
            ETB {product.price_etb?.toLocaleString() ?? Math.round(product.price * USD_TO_ETB).toLocaleString()}
          </span>
          <button
            className={`add-btn ${added ? "added" : ""}`}
            onClick={handleAdd}
          >
            {added ? "✓ Added" : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="product-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="product-card skeleton-card">
          <div className="img-skeleton tall" />
          <div className="card-body">
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
            <div className="skeleton-line xshort" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Home component ──────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("stylecart-theme");
    return stored ? stored === "dark" : true;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Theme persistence ──
  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("stylecart-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // ── Fetch + generate products ──
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://fakestoreapi.com/products");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        // Map real products
        const real = data.map((p) => ({
          ...p,
          price_etb: Math.round(p.price * USD_TO_ETB),
          category: CAT_MAP[p.category] || "accessories",
        }));

        // Generate mocks (50+ per category)
        const mockMen   = generateMocks(MEN_NAMES,   "men",         1000, 50);
        const mockWomen = generateMocks(WOMEN_NAMES, "women",       2000, 50);
        const mockAcc   = generateMocks(ACC_NAMES,   "accessories", 3000, 50);

        const all = [...real, ...mockMen, ...mockWomen, ...mockAcc];
        setProducts(all);
        setFiltered(all);
      } catch (err) {
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Filter by category + search ──
  useEffect(() => {
    let result = products;
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [activeCategory, products, searchQuery]);
  // ==================== CART HELPERS (localStorage) ====================
const CART_KEY = 'stylecart_cart';

const getCart = () => {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const addToCart = (product, quantity = 1) => {
  let cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === product.id);
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price_etb: product.price_etb,
      image: product.image,
      quantity: quantity,
    });
  }
  saveCart(cart);
  return getCartTotalItems();
};

const getCartTotalItems = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};
// ======================================================================

  // ── Add to cart ──
 const handleAddToCart = useCallback((product) => {
  const newTotal = addToCart(product, 1);
  setCartCount(newTotal);

  const id = Date.now();
  const short = product.title.length > 30 ? product.title.slice(0, 30) + "…" : product.title;
  setToasts((prev) => [...prev, { id, message: `${short} added to cart` }]);
  setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
}, []);

  // ── Category counts ──
  const counts = {
    all: products.length,
    men: products.filter((p) => p.category === "men").length,
    women: products.filter((p) => p.category === "women").length,
    accessories: products.filter((p) => p.category === "accessories").length,
  };
  

  return (
    <div className="app">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-inner">
          {/* Logo */}
          <a href="/" className="logo">
            <span className="logo-style">Style</span>
            <span className="logo-cart">Cart</span>
          </a>

          {/* Desktop nav links */}
          <div className="nav-links">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`nav-link ${activeCategory === cat ? "active" : ""}`}
                onClick={() => { setActiveCategory(cat); setMobileMenuOpen(false); }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span className="nav-count">{counts[cat]}</span>
              </button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="nav-actions">
            {/* Search */}
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Cart */}
            <div className="cart-wrap">
              <button className="cart-btn" onClick={() => navigate("/cart")}>
  <span className="cart-icon">🛒</span>
  <span className="logo-style">MyCart</span>
  {cartCount > 0 && (
    <span key={cartCount} className="cart-badge">
      {cartCount}
    </span>
  )}
</button>

            </div>
        
            

            {/* Login */}
            <button className="login-btn" onClick={() => navigate("/login")}>Login</button>

            {/* Theme toggle — topmost right */}
            <button
              className="theme-toggle"
              onClick={() => setDarkMode((d) => !d)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMobileMenuOpen((o) => !o)}>
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`mobile-link ${activeCategory === cat ? "active" : ""}`}
                onClick={() => { setActiveCategory(cat); setMobileMenuOpen(false); }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span className="nav-count">{counts[cat]}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero banner ── */}
      <header className="hero">
        <div className="hero-content">
          <p className="hero-sub">New Season — 2025 Collection</p>
          <h1 className="hero-title">
            Style<span className="hero-accent">Cart</span>
          </h1>
          <p className="hero-desc">
            Explore {products.length}+ curated styles for men, women & accessories — all priced in ETB.
          </p>
          <div className="hero-cta-group">
            <button className="hero-cta" onClick={() => setActiveCategory("all")}>
              Shop Now
            </button>
            
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-blob" />
          <img
            src="https://i.pinimg.com/736x/21/df/38/21df38e3dd6ed15c36ec489f6d365723.jpg"
            alt="Fashion hero"
            className="hero-img"
          />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="main">
        {/* Category pills */}
        <div className="filter-bar">
          <div className="filter-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`pill ${activeCategory === cat ? "pill-active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "all" && "✦ "}
                {cat === "men" && "👔 "}
                {cat === "women" && "👗 "}
                {cat === "accessories" && "👜 "}
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span className="pill-count">{counts[cat]}</span>
              </button>
            ))}
          </div>
          <p className="results-count">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "all" ? ` in ${activeCategory}` : ""}
            {searchQuery ? ` matching "${searchQuery}"` : ""}
          </p>
        </div>

        {/* Grid */}
        {loading && <SkeletonGrid />}

        {error && (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p>No products found. Try a different search or category.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="product-grid">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-logo">StyleCart</p>
          <p className="footer-copy">© 2025 StyleCart. All prices in Ethiopian Birr (ETB).</p>
        </div>
      </footer>

      {/* ── Toasts ── */}
      <Toast toasts={toasts} />
    </div>
  );
}
