import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6)          score++;
  if (password.length >= 10)         score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Weak",   color: "#e74c3c" },
    { label: "Weak",   color: "#e74c3c" },
    { label: "Fair",   color: "#f39c12" },
    { label: "Good",   color: "#3498db" },
    { label: "Strong", color: "#2ecc71" },
  ];
  const { label, color } = levels[Math.min(score, 4)];
  return (
    <div className="pwd-strength">
      <div className="pwd-bars">
        {[1,2,3,4].map((n) => (
          <div key={n} className="pwd-bar"
            style={{ background: n <= score ? color : undefined }} />
        ))}
      </div>
      <span className="pwd-label" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();

  // Read theme from localStorage — stays in sync with Home
  const [darkMode, setDarkMode] = useState(
    () => (localStorage.getItem("stylecart-theme") || "dark") === "dark"
  );

  // "login" or "register"
  const [mode, setMode] = useState("login");

  // Form fields
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", remember: false, agree: false,
  });
  const [errors,  setErrors]  = useState({});
  const [apiErr,  setApiErr]  = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [success, setSuccess] = useState(false);

  const firstRef = useRef(null);

  // Apply theme to <body>
  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("stylecart-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Focus first field whenever mode switches
  useEffect(() => {
    setTimeout(() => firstRef.current?.focus(), 80);
    setErrors({});
    setApiErr("");
    setForm({ name: "", email: "", password: "", confirm: "", remember: false, agree: false });
  }, [mode]);

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [e.target.name]: val }));
    setErrors((err) => ({ ...err, [e.target.name]: "" }));
    setApiErr("");
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (mode === "register" && !form.name.trim())
      e.name = "Full name is required";
    if (!form.email.trim())
      e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password)
      e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "At least 6 characters required";
    if (mode === "register") {
      if (form.password !== form.confirm)
        e.confirm = "Passwords do not match";
      if (!form.agree)
        e.agree = "You must accept the terms to continue";
    }
    return e;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiErr("");

    try {
      const url  = mode === "login"
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";

      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name,  email: form.email, password: form.password };

      const res  = await fetch(url, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiErr(data.error || "Something went wrong. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("stylecart-user", JSON.stringify(data.user));

      setSuccess(true);
      setTimeout(() => navigate("/"), 1600);

    } catch {
      setApiErr("Cannot reach server. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="lp-root">
        <div className="lp-success-screen">
          <div className="lp-success-icon">🎉</div>
          <h2>{mode === "login" ? "Welcome back!" : "Account created!"}</h2>
          <p>Taking you to StyleCart…</p>
          <div className="lp-success-bar" />
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="lp-root">

      {/* ── Top bar ── */}
      <header className="lp-topbar">
        <button className="lp-back" onClick={() => navigate("/")} aria-label="Back to store">
          ← Back to store
        </button>
        <a className="lp-logo" href="/">
          <span>Style</span><span className="lp-logo-accent">Cart</span>
        </a>
        {/* Theme toggle — top right, matches Home */}
        <button
          className="lp-theme-toggle"
          onClick={() => setDarkMode((d) => !d)}
          title="Toggle theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </header>

      {/* ── Card ── */}
      <main className="lp-main">
        <div className="lp-card">

          {/* Decorative blobs */}
          <div className="lp-blob lp-blob-1" />
          <div className="lp-blob lp-blob-2" />

          {/* Brand icon */}
          <div className="lp-brand">
            <div className="lp-brand-badge">SC</div>
            <div>
              <p className="lp-brand-name">
                <span>Style</span><span className="lp-logo-accent">Cart</span>
              </p>
              <p className="lp-brand-sub">Fashion Redefined</p>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="lp-tabs">
            <button
              className={`lp-tab ${mode === "login" ? "lp-tab-active" : ""}`}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              className={`lp-tab ${mode === "register" ? "lp-tab-active" : ""}`}
              onClick={() => setMode("register")}
            >
              Create Account
            </button>
            <div className={`lp-tab-slider ${mode === "register" ? "lp-tab-right" : ""}`} />
          </div>

          {/* Heading */}
          <div className="lp-heading">
            {mode === "login" ? (
              <>
                <h1>Welcome back</h1>
                <p>Sign in to your StyleCart account.</p>
              </>
            ) : (
              <>
                <h1>Create account</h1>
                <p>Join StyleCart — it's free and takes 30 seconds.</p>
              </>
            )}
          </div>

          {/* Perks — register only */}
          {mode === "register" && (
            <div className="lp-perks">
              {["Free shipping on first order", "Exclusive member discounts", "Track your orders in real time"].map((p) => (
                <div key={p} className="lp-perk">
                  <span className="lp-perk-check">✓</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          )}

          {/* API error */}
          {apiErr && (
            <div className="lp-api-err">
              <span>⚠️</span> {apiErr}
            </div>
          )}

          {/* Form */}
          <form className="lp-form" onSubmit={handleSubmit} noValidate>

            {/* Name — register only */}
            {mode === "register" && (
              <div className="lp-field">
                <label htmlFor="name">Full Name</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">👤</span>
                  <input
                    ref={firstRef}
                    id="name" name="name" type="text"
                    autoComplete="name"
                    placeholder="Abebe Girma"
                    value={form.name}
                    onChange={handleChange}
                    className={errors.name ? "lp-err" : ""}
                  />
                </div>
                {errors.name && <span className="lp-field-err">⚠ {errors.name}</span>}
              </div>
            )}

            {/* Email */}
            <div className="lp-field">
              <label htmlFor="email">Email Address</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">✉</span>
                <input
                  ref={mode === "login" ? firstRef : undefined}
                  id="email" name="email" type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? "lp-err" : ""}
                />
              </div>
              {errors.email && <span className="lp-field-err">⚠ {errors.email}</span>}
            </div>

            {/* Password */}
            <div className="lp-field">
              <div className="lp-label-row">
                <label htmlFor="password">Password</label>
                {mode === "login" && (
                  <button type="button" className="lp-forgot">Forgot password?</button>
                )}
              </div>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">🔒</span>
                <input
                  id="password" name="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder={mode === "login" ? "Your password" : "Min. 6 characters"}
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? "lp-err" : ""}
                />
                <button type="button" className="lp-eye" onClick={() => setShowPwd(s => !s)}>
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <span className="lp-field-err">⚠ {errors.password}</span>}
              {mode === "register" && <PasswordStrength password={form.password} />}
            </div>

            {/* Confirm — register only */}
            {mode === "register" && (
              <div className="lp-field">
                <label htmlFor="confirm">Confirm Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">🔒</span>
                  <input
                    id="confirm" name="confirm"
                    type={showCfm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={handleChange}
                    className={errors.confirm ? "lp-err" : ""}
                  />
                  <button type="button" className="lp-eye" onClick={() => setShowCfm(s => !s)}>
                    {showCfm ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.confirm && <span className="lp-field-err">⚠ {errors.confirm}</span>}
              </div>
            )}

            {/* Remember me — login only */}
            {mode === "login" && (
              <label className="lp-check-row">
                <input type="checkbox" name="remember"
                  checked={form.remember} onChange={handleChange} />
                <span className="lp-checkmark" />
                Keep me signed in
              </label>
            )}

            {/* Terms — register only */}
            {mode === "register" && (
              <div className="lp-field">
                <label className="lp-check-row">
                  <input type="checkbox" name="agree"
                    checked={form.agree} onChange={handleChange} />
                  <span className="lp-checkmark" />
                  I agree to the{" "}
                  <button type="button" className="lp-forgot">Terms & Privacy Policy</button>
                </label>
                {errors.agree && <span className="lp-field-err">⚠ {errors.agree}</span>}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="lp-submit" disabled={loading}>
              {loading
                ? <span className="lp-spinner" />
                : <>{mode === "login" ? "Sign In" : "Create Free Account"} <span className="lp-arrow">→</span></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="lp-divider"><span>or continue with</span></div>

          {/* Social */}
          <div className="lp-social">
            <button type="button" className="lp-social-btn">
              <svg width="16" height="16" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              Google
            </button>
            <button type="button" className="lp-social-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Switch mode */}
          <p className="lp-switch">
            {mode === "login"
              ? <>Don't have an account? <button type="button" className="lp-switch-btn" onClick={() => setMode("register")}>Create one free →</button></>
              : <>Already have an account? <button type="button" className="lp-switch-btn" onClick={() => setMode("login")}>Sign in →</button></>
            }
          </p>

        </div>

        {/* Side quote — visible on wide screens */}
        <div className="lp-side">
          <div className="lp-side-inner">
            <div className="lp-side-blobs">
              <div className="lp-side-blob lp-side-blob-1" />
              <div className="lp-side-blob lp-side-blob-2" />
            </div>
            <div className="lp-side-content">
              <p className="lp-side-tag">✦ New Season 2025</p>
              <h2 className="lp-side-title">Fashion<br /><em>Redefined</em></h2>
              <p className="lp-side-desc">
                Join thousands of StyleCart members and discover the latest trends in men's, women's and accessories fashion — all priced in ETB.
              </p>
              <div className="lp-side-stats">
                {[["160+", "Products"], ["50+", "Brands"], ["Free", "Shipping"]].map(([n, l]) => (
                  <div key={l} className="lp-stat">
                    <span className="lp-stat-num">{n}</span>
                    <span className="lp-stat-label">{l}</span>
                  </div>
                ))}
              </div>
              <blockquote className="lp-quote">
                "Style is a way to say who you are without having to speak."
                <cite>— Rachel Zoe</cite>
              </blockquote>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
