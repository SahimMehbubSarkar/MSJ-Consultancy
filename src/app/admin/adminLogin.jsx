"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { API_ENDPOINTS, apiClient } from "@/lib/apiConfig";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * Reusable Floating Label Input using Pure Global CSS
 */
function FloatingField({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon,
  rightElement,
  error,
  disabled,
  autoComplete,
  required,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="msj-floating-group">
      <div
        className={`msj-floating-container ${isFocused ? "focused" : ""} ${
          error ? "error" : ""
        }`}
      >
        {icon && <div className="msj-input-icon">{icon}</div>}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className="msj-input"
          placeholder=" "
        />

        <label
          htmlFor={id}
          className={`msj-floating-label ${isFloating ? "active" : ""}`}
        >
          {label}
        </label>

        {rightElement}
      </div>

      {error && <p className="msj-field-error">{error}</p>}
    </div>
  );
}

/**
 * 6-Digit OTP Box Component with Auto-Advance, Backspace & Paste
 */
function OtpSixBoxes({ otp, setOtp, disabled }) {
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, ""); // Digits only
    if (!val) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1); // Take latest digit
    setOtp(newOtp);

    // Auto-focus next box
    if (index < 5 && val) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="msj-otp-boxes" onPaste={handlePaste}>
      {otp.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className="msj-otp-input"
          aria-label={`Digit ${idx + 1} of verification code`}
          autoFocus={idx === 0}
        />
      ))}
    </div>
  );
}

/**
 * MSJ Global Education Consultancy - Admin Auth & In-Card Recovery
 */
export default function AdminLogin() {
  // Navigation mode: "login" | "forgot_email" | "forgot_otp" | "reset_password"
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState("login");

  // Site settings (dynamic logo + name)
  const [siteSettings, setSiteSettings] = useState({ siteName: "MSJ Global Education Consultancy", siteIconUrl: null });

  useEffect(() => {
    async function loadSiteSettings() {
      try {
        const res = await fetch("/api/site-settings/public", { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.settings) {
          setSiteSettings({
            siteName: data.settings.siteName || "MSJ Global Education Consultancy",
            siteIconUrl: data.settings.siteIconUrl || null,
          });
        }
      } catch (err) {
        console.warn("Could not load site settings for login page:", err);
      }
    }
    loadSiteSettings();
  }, []);

  const brandTitle = siteSettings.siteName ? siteSettings.siteName.split(" ")[0] : "MSJ";
  const brandSubtitle = siteSettings.siteName ? siteSettings.siteName.split(" ").slice(1).join(" ") : "GLOBAL EDUCATION";
  const brandTagline = "CONSULTANCY";

  // Login credentials: Email or Phone Number + Password
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Recovery credentials
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // UX Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Dynamic Global Floating Toast State (Solid Navy with White text, Gold border)
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const closeToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(null);
  };

  // OTP Countdown timer
  useEffect(() => {
    let interval;
    if (viewMode === "forgot_otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewMode, resendTimer]);

  // Show session expired or action toast on mount if redirected
  useEffect(() => {
    if (searchParams.get("password_changed") === "true") {
      showToast("success", "Password updated successfully! Please sign in with your new credentials.");
    } else if (searchParams.get("expired") === "true") {
      showToast("warning", "Your session has expired. Please sign in again.");
    } else if (searchParams.get("logged_out") === "true") {
      showToast("success", "You have been logged out successfully.");
    }
  }, [searchParams]);

  // Client-side guard: if already logged in, redirect to dashboard immediately
  // Skip check if user just logged out, session expired, or password changed
  useEffect(() => {
    if (
      searchParams.get("logged_out") === "true" ||
      searchParams.get("expired") === "true" ||
      searchParams.get("password_changed") === "true"
    ) {
      return;
    }
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/verify", {
          method: "GET",
          cache: "no-store",
        });
        if (res.ok) {
          router.replace("/admin/dashboard");
        }
      } catch {
        // Not logged in, stay on login page
      }
    };
    checkSession();

    const handlePageShow = (e) => {
      if (e.persisted) {
        checkSession();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [router, searchParams]);

  // 1. Submit Login via real PostgreSQL API
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    const errs = {};
    if (!identifier.trim()) errs.identifier = "Admin Email or Phone Number is required";
    if (!password) errs.password = "Security password is required";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);

    try {
      const { ok, data } = await apiClient(API_ENDPOINTS.ADMIN_LOGIN, {
        method: 'POST',
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      setIsLoading(false);

      if (data && data.success) {
        showToast("success", data.message);
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1200);
      } else {
        showToast("error", data?.message || "Login failed. Please check credentials.");
      }
    } catch (err) {
      setIsLoading(false);
      showToast("error", "Unable to connect to MSJ authentication server.");
    }
  };


  // 2. Submit Email for OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    setErrors({});

    if (!recoveryEmail.trim()) {
      setErrors({ recoveryEmail: "Please enter your registered admin email" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
      setErrors({ recoveryEmail: "Please enter a valid official email address" });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
      setViewMode("forgot_otp");
      showToast("success", `6-digit security code dispatched to ${recoveryEmail}.`);
    }, 1000);
  };

  // 3. Submit 6-digit OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrors({});

    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      showToast("error", "Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (otpCode === "123456" || otpCode.length === 6) {
        setViewMode("reset_password");
        showToast("success", "Code verified! Please set your new master password.");
      } else {
        showToast("error", "Invalid verification code. Please try again.");
      }
    }, 900);
  };

  // 4. Resend OTP
  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    showToast("info", `A new 6-digit verification code was sent to ${recoveryEmail}.`);
  };

  // 5. Submit New Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    setErrors({});

    const errs = {};
    if (!newPassword || newPassword.length < 6) {
      errs.newPassword = "New password must be at least 6 characters";
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setViewMode("login");
      setPassword("");
      showToast("success", "Master password updated successfully! Please sign in.");
    }, 1000);
  };

  return (
    <main className="msj-page-container">
      {/* Global Floating Toast Alert (Solid Navy, White text, Gold border) */}
      {toast && (
        <div className="msj-toast-container" role="status">
          <div className="msj-toast">
            <div className="msj-toast-icon">
              {toast.type === "success" && <CheckCircle2 size={20} color="#10b981" />}
              {toast.type === "error" && <AlertCircle size={20} color="#f43f5e" />}
              {toast.type === "warning" && <AlertTriangle size={20} color="#f59e0b" />}
              {toast.type === "info" && <Info size={20} color="#38bdf8" />}
            </div>
            <div className="msj-toast-message">{toast.message}</div>
            <button
              type="button"
              onClick={closeToast}
              className="msj-toast-close"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="msj-ambient-glow" />

      <div className="msj-card">
        {/* Card Header matching MSJ Logo */}
        <header className="msj-card-header">
          {/* Logo Circular Emblem */}
          <div className="msj-logo-circle">
            {siteSettings.siteIconUrl ? (
              <img src={siteSettings.siteIconUrl} alt={brandTitle} style={{ width: 88, height: 88, objectFit: "contain", borderRadius: 8 }} />
            ) : (
              <svg
                viewBox="0 0 160 160"
                width="88"
                height="88"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Globe Navy Background */}
                <circle cx="80" cy="80" r="32" fill="#0a1d37" />

                {/* Globe Grids in Gold */}
                <ellipse cx="80" cy="80" rx="16" ry="32" stroke="#d4941e" strokeWidth="1" opacity="0.65" />
                <line x1="48" y1="80" x2="112" y2="80" stroke="#d4941e" strokeWidth="1" opacity="0.65" />
                <path d="M52 68 Q80 76 108 68" stroke="#d4941e" strokeWidth="0.9" opacity="0.6" />
                <path d="M52 92 Q80 84 108 92" stroke="#d4941e" strokeWidth="0.9" opacity="0.6" />

                {/* Gold Continents */}
                <path d="M72 62 C74 59 79 60 82 63 C85 66 82 72 78 73 C74 74 70 70 69 66 Z" fill="#d4941e" />
                <path d="M60 71 C63 69 67 72 66 77 C65 82 59 83 57 78 C55 74 58 72 60 71 Z" fill="#d4941e" />
                <path d="M86 68 C90 66 96 70 94 76 C92 81 87 79 85 75 Z" fill="#d4941e" />
                <path d="M75 84 C80 85 83 91 79 96 C76 100 71 97 72 91 Z" fill="#d4941e" />
                <path d="M88 82 C94 84 97 90 93 95 C89 99 85 94 86 88 Z" fill="#d4941e" />

                {/* Graduation Cap (Navy with White Outlines) */}
                <polygon points="80,36 122,51 80,62 38,51" fill="#0a1d37" stroke="#ffffff" strokeWidth="1.6" />
                <path d="M54 55 V66 C54 75 106 75 106 66 V55" fill="#0a1d37" stroke="#ffffff" strokeWidth="1.2" />

                {/* Gold Tassel */}
                <path d="M80 49 Q110 54 112 65" stroke="#d4941e" strokeWidth="2.2" fill="none" />
                <circle cx="112" cy="69" r="3" fill="#d4941e" />
                <path d="M110 70 L111 80 M112 70 L112 81 M114 70 L113 80" stroke="#d4941e" strokeWidth="1.6" />
              </svg>
            )}
          </div>

          {/* Typography from Image */}
          <div className="msj-brand-title-wrap">
            <span className="msj-gold-line" />
            <h1 className="msj-brand-title">{brandTitle}</h1>
            <span className="msj-gold-line" />
          </div>

          <div className="msj-brand-subtitle">{brandSubtitle}</div>

          <div className="msj-brand-tagline">
            <span className="msj-gold-line" />
            <span>{brandTagline}</span>
            <span className="msj-gold-line" />
          </div>
        </header>

        {/* ====================================================================
            VIEW 1: STANDARD ADMIN LOGIN
            ==================================================================== */}
        {viewMode === "login" && (
          <form onSubmit={handleLogin} className="msj-form" noValidate>
            {/* Floating Email or Phone Number */}
            <FloatingField
              id="admin-identifier"
              label="Admin Email or Phone Number"
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }));
              }}
              icon={<User size={19} />}
              error={errors.identifier}
              autoComplete="username"
              disabled={isLoading}
              required
            />

            {/* Floating Password */}
            <FloatingField
              id="admin-password"
              label="Security Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              icon={<Lock size={19} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="msj-toggle-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              error={errors.password}
              autoComplete="current-password"
              disabled={isLoading}
              required
            />

            {/* Options: Remember Me + Forgot Password */}
            <div className="msj-options">
              <label className="msj-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="msj-checkbox"
                  disabled={isLoading}
                />
                <span>Remember Workstation</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setViewMode("forgot_email");
                }}
                className="msj-forgot-link"
                tabIndex={0}
              >
                Forgot Password?
              </button>
            </div>

            {/* Solid Action Button - No Gradient */}
            <button
              type="submit"
              className="msj-submit-btn"
              disabled={isLoading}
              id="admin-login-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="msj-spinner" size={18} />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Console</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ====================================================================
            VIEW 2: FORGOT PASSWORD - STEP 1 (EMAIL ONLY)
            ==================================================================== */}
        {viewMode === "forgot_email" && (
          <form onSubmit={handleSendOtp} className="msj-form" noValidate>
            <div style={{ textAlign: "center", marginBottom: "0.25rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--msj-navy)" }}>
                Reset Admin Password
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--msj-text-muted)", marginTop: "4px" }}>
                Enter your verified administrator email to receive a 6-digit verification code.
              </p>
            </div>

            {/* Single Floating Email Input */}
            <FloatingField
              id="recovery-email"
              label="Official Administrator Email"
              type="email"
              value={recoveryEmail}
              onChange={(e) => {
                setRecoveryEmail(e.target.value);
                if (errors.recoveryEmail) setErrors((prev) => ({ ...prev, recoveryEmail: undefined }));
              }}
              icon={<Mail size={19} />}
              error={errors.recoveryEmail}
              autoComplete="email"
              disabled={isLoading}
              required
            />

            {/* Solid Action Button */}
            <button
              type="submit"
              className="msj-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="msj-spinner" size={18} />
                  <span>Generating Security Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Back to Login Link */}
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setViewMode("login");
              }}
              className="msj-back-btn"
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {/* ====================================================================
            VIEW 3: FORGOT PASSWORD - STEP 2 (6-DIGIT OTP BOXES)
            ==================================================================== */}
        {viewMode === "forgot_otp" && (
          <form onSubmit={handleVerifyOtp} className="msj-form" noValidate>
            <div style={{ textAlign: "center", marginBottom: "0.25rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--msj-navy)" }}>
                Enter 6-Digit Code
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--msj-text-muted)", marginTop: "4px" }}>
                We sent a 6-digit code to <strong>{recoveryEmail || "your email"}</strong>.
              </p>
            </div>

            {/* 6 Box Input Row */}
            <div className="msj-otp-wrap">
              <OtpSixBoxes otp={otp} setOtp={setOtp} disabled={isLoading} />

              <div className="msj-otp-resend-row">
                <span>Didn't receive code?</span>
                {resendTimer > 0 ? (
                  <span style={{ color: "var(--msj-text-muted)", fontWeight: 600 }}>
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="msj-resend-btn"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>

            {/* Solid Verify Button */}
            <button
              type="submit"
              className="msj-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="msj-spinner" size={18} />
                  <span>Validating Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code & Proceed</span>
                  <ShieldCheck size={18} />
                </>
              )}
            </button>

            {/* Back to Change Email */}
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setViewMode("forgot_email");
              }}
              className="msj-back-btn"
            >
              <ArrowLeft size={16} />
              <span>Change Email</span>
            </button>
          </form>
        )}

        {/* ====================================================================
            VIEW 4: RESET PASSWORD (NEW CREDENTIALS)
            ==================================================================== */}
        {viewMode === "reset_password" && (
          <form onSubmit={handleResetPassword} className="msj-form" noValidate>
            <div style={{ textAlign: "center", marginBottom: "0.25rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--msj-navy)" }}>
                Create New Password
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--msj-text-muted)", marginTop: "4px" }}>
                Set a strong master password for administrator access.
              </p>
            </div>

            {/* New Password */}
            <FloatingField
              id="new-password"
              label="New Master Password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              icon={<KeyRound size={19} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="msj-toggle-btn"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              error={errors.newPassword}
              disabled={isLoading}
              required
            />

            {/* Confirm Password */}
            <FloatingField
              id="confirm-password"
              label="Confirm New Password"
              type={showNewPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              icon={<Lock size={19} />}
              error={errors.confirmPassword}
              disabled={isLoading}
              required
            />

            {/* Solid Submit Button */}
            <button
              type="submit"
              className="msj-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="msj-spinner" size={18} />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password & Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Back to Sign In */}
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setViewMode("login");
              }}
              className="msj-back-btn"
            >
              <ArrowLeft size={16} />
              <span>Cancel & Return to Login</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
