"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Mail,
  Send,
  Server,
  Hash,
  Lock,
  User,
  AtSign,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Check,
  Zap,
} from "lucide-react";
import FloatingField from "@/components/FloatingField";

export default function EmailSettingsClient() {
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [encryption, setEncryption] = useState("TLS");
  const [emailEnabled, setEmailEnabled] = useState(true);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Fetch settings from DB on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings/email", { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.settings) {
          setSmtpHost(data.settings.smtpHost || "");
          setSmtpPort(data.settings.smtpPort || "");
          setSmtpUser(data.settings.smtpUser || "");
          setSmtpPassword(data.settings.smtpPassword || "");
          setFromName(data.settings.fromName || "");
          setFromEmail(data.settings.fromEmail || "");
          setEncryption(data.settings.encryption || "TLS");
          setEmailEnabled(data.settings.emailEnabled !== false);
        }
      } catch (err) {
        console.error("Failed to load email settings:", err);
        showToast("error", "Failed to retrieve email settings from database.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPassword,
          fromName,
          fromEmail,
          encryption,
          emailEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Email configurations saved successfully to database!");
      } else {
        showToast("error", data.message || "Failed to save email settings.");
      }
    } catch (err) {
      console.error("Email settings save error:", err);
      showToast("error", "Network error while saving email settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/settings/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPassword,
          fromName,
          fromEmail,
          encryption,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Test email dispatched successfully via configured SMTP server!");
      } else {
        showToast("error", data.message || "SMTP connection test failed. Verify server and port.");
      }
    } catch (err) {
      console.error("Email test error:", err);
      showToast("error", "Network error while testing SMTP connection.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      {/* Floating Toast */}
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
            <h1>Email & SMTP Settings</h1>
            <span
              className="msj-preview-chip"
              style={{
                background: emailEnabled ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                color: emailEnabled ? "#16a34a" : "#dc2626",
                borderColor: emailEnabled ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: emailEnabled ? "#22c55e" : "#ef4444",
                  display: "inline-block",
                }}
              />
              {emailEnabled ? "SMTP Outbound Active" : "Outbound Disabled"}
            </span>
          </div>
          <p>
            Configure SMTP transport servers, authentication keys, and sender identities in a structured 2-column layout with live diagnostics.
          </p>
        </div>

        <div className="msj-dash-header-actions" style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="button"
            className="msj-btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={handleTest}
            disabled={testing || loading}
          >
            {testing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span>{testing ? "Testing..." : "Send Test Email"}</span>
          </button>

          <button
            type="button"
            className="msj-settings-save-btn"
            style={{ padding: "8px 18px", fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--msj-text-muted)",
              fontSize: "0.88rem",
              marginBottom: "1.25rem",
            }}
          >
            <Loader2 size={18} className="animate-spin" />
            Loading email configurations from database...
          </div>
        )}

        {/* 2-COLUMN SECTION 1: SMTP Transport & Security Credentials */}
        <div className="msj-settings-2col-grid">
          {/* Column 1: SMTP Transport Server */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <Server size={18} color="var(--msj-gold)" />
                  SMTP Delivery Server
                </div>
                <div className="msj-settings-card-subtitle">
                  Configure the primary mail relay host, network port, and encryption standard.
                </div>
              </div>
              <span className="msj-preview-chip">Col 1 • Transport</span>
            </div>

            <FloatingField
              id="smtp-host"
              label="SMTP Server Host (e.g. smtp.gmail.com)"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              icon={<Server size={18} />}
              required
            />

            <FloatingField
              id="smtp-port"
              label="SMTP Port (e.g. 587 or 465)"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              icon={<Hash size={18} />}
              required
            />

            <FloatingField
              as="select"
              id="encryption"
              label="Encryption Protocol"
              value={encryption}
              onChange={(e) => setEncryption(e.target.value)}
              icon={<Shield size={18} />}
              options={[
                { value: "TLS", label: "TLS / STARTTLS (Port 587 - Recommended)" },
                { value: "SSL", label: "SSL (Port 465)" },
                { value: "None", label: "None / Unencrypted (Port 25 - Insecure)" },
              ]}
            />

            {/* Master Outgoing Toggle */}
            <div className="msj-settings-toggle-row" style={{ marginTop: "0.25rem" }}>
              <div className="msj-settings-toggle-info">
                <span>Outbound Notification Service</span>
                <span>Master switch to enable or pause automated inquiry emails</span>
              </div>
              <div
                className={`msj-settings-toggle ${emailEnabled ? "on" : ""}`}
                onClick={() => setEmailEnabled((prev) => !prev)}
                role="switch"
                aria-checked={emailEnabled}
              />
            </div>
          </div>

          {/* Column 2: SMTP Authentication & Access Keys */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <Lock size={18} color="var(--msj-gold)" />
                  Authentication & Access Keys
                </div>
                <div className="msj-settings-card-subtitle">
                  MTA authentication credentials for outbound email dispatch.
                </div>
              </div>
              <span className="msj-preview-chip">Col 2 • Credentials</span>
            </div>

            <FloatingField
              id="smtp-user"
              label="SMTP Username / Account"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              icon={<User size={18} />}
              required
            />

            <FloatingField
              id="smtp-password"
              label="SMTP Password / App Password"
              type={showPassword ? "text" : "password"}
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
              icon={<Lock size={18} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="msj-input-right-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* Security Notice Box */}
            <div className="msj-settings-info-box" style={{ marginTop: "0.5rem" }}>
              <Shield size={16} color="var(--msj-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: "var(--msj-navy)", display: "block", marginBottom: 2 }}>
                  App-Specific Passwords Recommended
                </strong>
                <span>
                  For providers like Google Workspace or Microsoft 365, generate a 16-character dedicated <strong>App Password</strong> rather than using your master account password.
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0.75rem 1rem",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                fontSize: "0.78rem",
                color: "var(--msj-text-secondary)",
              }}
            >
              <Zap size={15} color="var(--msj-navy)" />
              <span>
                Protocol: <strong>{encryption}</strong> over port <strong>{smtpPort || "587"}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 2-COLUMN SECTION 2: Sender Identity & Live Outgoing Preview */}
        <div className="msj-settings-2col-grid">
          {/* Column 1: Sender Identity & Addressing */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <AtSign size={18} color="var(--msj-gold)" />
                  Sender Identity & Headers
                </div>
                <div className="msj-settings-card-subtitle">
                  Define the default "From" display name and email address on all client communications.
                </div>
              </div>
              <span className="msj-preview-chip">Col 1 • Identity</span>
            </div>

            <FloatingField
              id="from-name"
              label="Sender Display Name"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              icon={<AtSign size={18} />}
              required
            />

            <FloatingField
              id="from-email"
              label="Sender Return Address (From Email)"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            {/* SPF / Deliverability Notice */}
            <div className="msj-settings-info-box">
              <Info size={16} color="var(--msj-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: "var(--msj-navy)", display: "block", marginBottom: 2 }}>
                  Inbox Deliverability (SPF / DKIM)
                </strong>
                <span>
                  Ensure your domain DNS contains an SPF record allowing <code>{smtpHost || "your-smtp-host"}</code> to send emails on behalf of <code>{fromEmail ? fromEmail.split("@")[1] || "yourdomain.com" : "yourdomain.com"}</code>.
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Live Outgoing Email Preview & Test Dispatcher */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <Sparkles size={18} color="var(--msj-gold)" />
                  Live Outgoing Email Preview
                </div>
                <div className="msj-settings-card-subtitle">
                  Simulated preview of inquiry confirmation emails sent to applicants.
                </div>
              </div>
              <span className="msj-preview-chip">Col 2 • Live Preview</span>
            </div>

            {/* Email Client Simulated Envelope */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(10,29,55,0.04)",
                overflow: "hidden",
              }}
            >
              {/* Mail client toolbar */}
              <div
                style={{
                  background: "#f8fafc",
                  padding: "8px 14px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ fontSize: "0.72rem", color: "var(--msj-text-muted)", marginLeft: 6, fontWeight: 600 }}>
                    Inbox Message Preview
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "var(--msj-gold)",
                    background: "rgba(212,148,30,0.1)",
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  Simulated
                </span>
              </div>

              {/* Message Header */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontSize: "0.78rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: "var(--msj-text-muted)", width: 45, fontWeight: 600 }}>From:</span>
                  <span style={{ color: "var(--msj-navy)", fontWeight: 700 }}>
                    {fromName || "MSJ Global Education"}{" "}
                    <span style={{ color: "var(--msj-text-muted)", fontWeight: 400 }}>
                      &lt;{fromEmail || "noreply@msjglobal.edu"}&gt;
                    </span>
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: "var(--msj-text-muted)", width: 45, fontWeight: 600 }}>To:</span>
                  <span style={{ color: "var(--msj-text-secondary)" }}>applicant@student-portal.com</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--msj-text-muted)", width: 45, fontWeight: 600 }}>Subject:</span>
                  <span style={{ color: "var(--msj-navy)", fontWeight: 600 }}>
                    Your Inquiry with {fromName || "MSJ Global Education"} has been Received
                  </span>
                </div>
              </div>

              {/* Message Body Content */}
              <div style={{ padding: "14px 16px", fontSize: "0.8rem", color: "#334155", lineHeight: 1.6 }}>
                <p style={{ margin: "0 0 8px 0" }}>Dear Applicant,</p>
                <p style={{ margin: "0 0 8px 0" }}>
                  Thank you for contacting <strong>{fromName || "MSJ Global Education"}</strong>. We have registered your inquiry in our system and an education counselor will review your request shortly.
                </p>
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#f8fafc",
                    borderRadius: 6,
                    borderLeft: "3px solid var(--msj-gold)",
                    margin: "10px 0",
                    fontSize: "0.76rem",
                  }}
                >
                  Reference ID: <strong>MSJ-2026-INQ-8894</strong> • Status: <strong>Pending Review</strong>
                </div>
                <p style={{ margin: "8px 0 0 0", fontSize: "0.74rem", color: "var(--msj-text-muted)" }}>
                  Warm regards,<br />
                  <strong>Admissions & Advisory Committee</strong><br />
                  {fromName || "MSJ Global Education Consultancy"}
                </p>
              </div>
            </div>

            {/* Test Trigger Console */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                marginTop: "0.25rem",
              }}
            >
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--msj-navy)" }}>
                  SMTP Diagnostic Trigger
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--msj-text-muted)" }}>
                  Dispatch test packet to verify handshake & auth keys.
                </div>
              </div>
              <button
                type="button"
                className="msj-btn-secondary"
                style={{
                  fontSize: "0.78rem",
                  padding: "6px 14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onClick={handleTest}
                disabled={testing || loading}
              >
                {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{testing ? "Testing..." : "Send Test"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="msj-settings-bottom-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: emailEnabled ? "#22c55e" : "#ef4444",
                boxShadow: emailEnabled ? "0 0 0 3px rgba(34,197,94,0.2)" : "0 0 0 3px rgba(239,68,68,0.2)",
              }}
            />
            <span style={{ fontSize: "0.85rem", color: "var(--msj-text-secondary)", fontWeight: 500 }}>
              {emailEnabled ? "SMTP configurations ready for outbound dispatch" : "Outbound email service is currently paused"}
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              type="button"
              className="msj-btn-secondary"
              onClick={handleTest}
              disabled={testing || loading}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              {testing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>{testing ? "Testing..." : "Send Test Email"}</span>
            </button>
            <button
              type="submit"
              className="msj-settings-save-btn"
              disabled={saving || loading}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{saving ? "Saving Changes..." : "Save Email Settings"}</span>
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
