import React, { useState, useEffect, useRef } from "react";
import "./Login.css";

// ─── Login / Register modal ───────────────────────────────────────────────────
// Props:
//   onClose()          — called when user dismisses the modal
//   onLoginSuccess(user) — called with { name, email, token } on success
//   darkMode           — boolean passed from parent for theme sync

export default function Login({ onClose, onLoginSuccess, darkMode }) {
  const [mode, setMode]         = useState("login");   // "login" | "register"
  const [form, setForm]         = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const overlayRef              = useRef(null);
  const firstInputRef           = useRef(null);

  // Focus first input on open
  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 80);
  }, [mode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const switchMode = (m) => {
    setMode(m);
    setForm({ name: "", email: "", password: "", confirm: "" });
    setErrors({});
    setApiError("");
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: "" }));
    setApiError("");
  };

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (mode === "register" && !form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim())                        e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))    e.email = "Enter a valid email";
    if (!form.password)                            e.password = "Password is required";
    else if (form.password.length < 6)             e.password = "At least 6 characters";
    if (mode === "register" && form.password !== form.confirm)
                                                   e.confirm = "Passwords don't match";
    return e;
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");

    try {
      const endpoint = mode === "login"
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";

      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Something went wrong. Try again.");
        return;
      }

      // Persist token
      localStorage.setItem("token", data.token);

      // Notify parent
      onLoginSuccess(data.user);

    } catch (err) {
      setApiError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      className="login-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Login" : "Create account"}
    >
      <div className={`login-modal ${darkMode ? "dark" : "light"}`}>

        {/* Close button */}
        <button className="login-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Brand mark */}
        <div className="login-brand">
          <span className="login-brand-style">Style</span>
          <span className="login-brand-cart">Cart</span>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            Create Account
          </button>
          <div className={`login-tab-indicator ${mode === "register" ? "right" : "left"}`} />
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h2>{mode === "login" ? "Welcome back" : "Join StyleCart"}</h2>
          <p>
            {mode === "login"
              ? "Sign in to access your cart and orders."
              : "Create an account to start shopping."}
          </p>
        </div>

        {/* API error */}
        {apiError && (
          <div className="login-api-error">
            <span>⚠️</span> {apiError}
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {/* Name — register only */}
          {mode === "register" && (
            <div className="login-field">
              <label htmlFor="name">Full Name</label>
              <input
                ref={firstInputRef}
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Abebe Girma"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          {/* Email */}
          <div className="login-field">
            <label htmlFor="email">Email Address</label>
            <input
              ref={mode === "login" ? firstInputRef : undefined}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="login-field">
            <div className="field-label-row">
              <label htmlFor="password">Password</label>
              {mode === "login" && (
                <button type="button" className="forgot-link">Forgot password?</button>
              )}
            </div>
            <div className="password-wrap">
              <input
                id="password"
                name="password"
                type={showPwd ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder={mode === "login" ? "Your password" : "Min. 6 characters"}
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm password — register only */}
          {mode === "register" && (
            <div className="login-field">
              <label htmlFor="confirm">Confirm Password</label>
              <div className="password-wrap">
                <input
                  id="confirm"
                  name="confirm"
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={handleChange}
                  className={errors.confirm ? "input-error" : ""}
                />
              </div>
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={`login-submit ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider"><span>or</span></div>

        {/* Social placeholders */}
        <div className="login-social">
          <button className="social-btn" type="button">
            <span>G</span> Continue with Google
          </button>
          <button className="social-btn" type="button">
            <span>f</span> Continue with Facebook
          </button>
        </div>

        {/* Switch mode */}
        <p className="login-switch">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          {" "}
          <button
            type="button"
            className="switch-link"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
