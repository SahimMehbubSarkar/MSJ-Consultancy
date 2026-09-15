"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogOut,
  ShieldAlert,
  ArrowLeft,
  Check,
  Info,
} from "lucide-react";
import FloatingField from "@/components/FloatingField";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [redirecting, setRedirecting] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    if (type !== "success") {
      setTimeout(() => setToast(null), 4500);
    }
  };

  // Password strength calculations
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errs = {};
    if (!currentPassword) errs.current = "Current password is required.";
    if (!newPassword) errs.new = "New password is required.";
    else if (newPassword.length < 8) errs.new = "Password must be at least 8 characters long.";
    if (!confirmPassword) errs.confirm = "Please confirm your new password.";
    else if (newPassword !== confirmPassword) errs.confirm = "Passwords do not match.";
    else if (currentPassword === newPassword) errs.new = "New password must be different from current password.";

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setRedirecting(true);
        showToast(
          "success",
          "Password updated successfully! Your active session has ended. Redirecting to login page..."
        );
        setTimeout(() => {
          router.replace("/admin/login?password_changed=true");
        }, 1200);
      } else {
        showToast("error", data.message || "Failed to update password.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Change password error:", err);
      showToast("error", "Network error while connecting to security server.");
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Toast Notification */}
      {toast && (
        <div className="msj-toast-container" role="status">
          <div className="msj-toast">
            <div className="msj-toast-icon">
              {toast.type === "success" && <CheckCircle2 size={20} color="#22c55e" />}
              {toast.type === "error" && <AlertCircle size={20} color="#ef4444" />}
            </div>
            <div className="msj-toast-message">{toast.message}</div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="msj-dash-page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1>Change Security Password</h1>
            <span className="msj-preview-chip" style={{ background: "rgba(10,29,55,0.06)", color: "var(--msj-navy)" }}>
              Admin Security
            </span>
          </div>
          <p>
            Update your administrative login credentials. For enterprise security, changing your password will automatically invalidate your session and require signing in again.
          </p>
        </div>

        <div className="msj-dash-header-actions">
          <Link
            href="/admin/profile"
            className="msj-btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            <ArrowLeft size={16} />
            <span>Back to Profile</span>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 2-COLUMN SECTION: Form & Security Policy */}
        <div className="msj-settings-2col-grid">
          {/* Column 1: Password Change Form */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <KeyRound size={18} color="var(--msj-gold)" />
                  Password Credentials
                </div>
                <div className="msj-settings-card-subtitle">
                  Verify current credentials and supply a new high-entropy password.
                </div>
              </div>
              <span className="msj-preview-chip">Col 1 • Credentials</span>
            </div>

            {/* Current Password Field */}
            <FloatingField
              id="current-password"
              label="Current Password"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              icon={<Lock size={18} />}
              error={formErrors.current}
              disabled={submitting || redirecting}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="msj-input-right-btn"
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* New Password Field */}
            <FloatingField
              id="new-password"
              label="New Security Password (Min. 8 characters)"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<KeyRound size={18} />}
              error={formErrors.new}
              disabled={submitting || redirecting}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="msj-input-right-btn"
                  aria-label={showNew ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* Password Strength Meter */}
            {newPassword.length > 0 && (
              <div
                style={{
                  background: "#f8fafc",
                  padding: "0.85rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--msj-text-secondary)" }}>
                    Password Strength:
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: strengthColors[Math.max(0, strengthScore - 1)],
                    }}
                  >
                    {strengthLabels[Math.max(0, strengthScore - 1)] || "Weak"}
                  </span>
                </div>

                {/* Strength Meter Bar */}
                <div
                  style={{
                    height: 5,
                    width: "100%",
                    background: "#e2e8f0",
                    borderRadius: 3,
                    overflow: "hidden",
                    display: "flex",
                    gap: 3,
                  }}
                >
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        background:
                          strengthScore >= step
                            ? strengthColors[Math.max(0, strengthScore - 1)]
                            : "transparent",
                        transition: "background 0.2s ease",
                      }}
                    />
                  ))}
                </div>

                {/* Criteria Checklist */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.4rem",
                    marginTop: "0.75rem",
                    fontSize: "0.72rem",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: hasMinLength ? "#16a34a" : "var(--msj-text-muted)",
                      fontWeight: hasMinLength ? 600 : 400,
                    }}
                  >
                    <Check size={12} strokeWidth={hasMinLength ? 3 : 2} /> 8+ Characters
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: hasUppercase ? "#16a34a" : "var(--msj-text-muted)",
                      fontWeight: hasUppercase ? 600 : 400,
                    }}
                  >
                    <Check size={12} strokeWidth={hasUppercase ? 3 : 2} /> Uppercase Letter
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: hasNumber ? "#16a34a" : "var(--msj-text-muted)",
                      fontWeight: hasNumber ? 600 : 400,
                    }}
                  >
                    <Check size={12} strokeWidth={hasNumber ? 3 : 2} /> Numeric Digit
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: hasSpecial ? "#16a34a" : "var(--msj-text-muted)",
                      fontWeight: hasSpecial ? 600 : 400,
                    }}
                  >
                    <Check size={12} strokeWidth={hasSpecial ? 3 : 2} /> Symbol / Special
                  </span>
                </div>
              </div>
            )}

            {/* Confirm New Password Field */}
            <FloatingField
              id="confirm-password"
              label="Confirm New Password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<ShieldCheck size={18} />}
              error={formErrors.confirm}
              disabled={submitting || redirecting}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="msj-input-right-btn"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="msj-settings-save-btn"
              disabled={submitting || redirecting}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.95rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: "0.5rem",
              }}
            >
              {submitting || redirecting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogOut size={18} />
              )}
              <span>
                {redirecting
                  ? "Redirecting to Sign In..."
                  : submitting
                  ? "Updating & Invalidating Session..."
                  : "Change Password & Sign In Again"}
              </span>
            </button>
          </div>

          {/* Column 2: Enterprise Security Policy */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <ShieldAlert size={18} color="var(--msj-gold)" />
                  Security Protocols & Session Policy
                </div>
                <div className="msj-settings-card-subtitle">
                  Important details regarding credential management and automatic session revocation.
                </div>
              </div>
              <span className="msj-preview-chip">Col 2 • Security Policy</span>
            </div>

            {/* Highlighted Warning Box */}
            <div
              style={{
                padding: "1rem 1.25rem",
                background: "rgba(212,148,30,0.08)",
                border: "1px solid rgba(212,148,30,0.3)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <Info size={20} color="var(--msj-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: "0.88rem", color: "var(--msj-navy)", display: "block", marginBottom: 3 }}>
                  Mandatory Re-Authentication Flow
                </strong>
                <p style={{ fontSize: "0.8rem", color: "var(--msj-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  As soon as your password is updated, the active JWT authentication token cookie (<code>msj_admin_token</code>) is immediately cleared. You will be redirected to the admin sign-in page to log in again with your new credentials.
                </p>
              </div>
            </div>

            {/* Protocol Points */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div
                style={{
                  padding: "0.85rem 1rem",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--msj-navy)", marginBottom: 3 }}>
                  1. Bcrypt Hash Encryption
                </div>
                <div style={{ fontSize: "0.76rem", color: "var(--msj-text-muted)", lineHeight: 1.4 }}>
                  Passwords are encrypted with a 12-round salt cost factor before being committed to PostgreSQL table <code>public.admin</code>. Raw passwords are never transmitted or stored in plain text.
                </div>
              </div>

              <div
                style={{
                  padding: "0.85rem 1rem",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--msj-navy)", marginBottom: 3 }}>
                  2. Brute-Force Rate Limiting
                </div>
                <div style={{ fontSize: "0.76rem", color: "var(--msj-text-muted)", lineHeight: 1.4 }}>
                  Accounts with 5 consecutive failed login attempts are automatically placed on a 15-minute security lockout. Successful password updates automatically reset the failed attempt counter.
                </div>
              </div>

              <div
                style={{
                  padding: "0.85rem 1rem",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--msj-navy)", marginBottom: 3 }}>
                  3. Audit Log Update
                </div>
                <div style={{ fontSize: "0.76rem", color: "var(--msj-text-muted)", lineHeight: 1.4 }}>
                  The <code>updated_at</code> timestamp on your administrator account is updated immediately to log the event in audit records.
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
