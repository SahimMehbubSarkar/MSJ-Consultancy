"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Save,
  Globe,
  Trash2,
  Image as ImageIcon,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  Type,
  Tag,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Check,
} from "lucide-react";
import FloatingField from "@/components/FloatingField";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function useImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const validate = (file) => {
    const validTypes = ["image/png", "image/jpeg", "image/x-icon", "image/svg+xml", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "Invalid file type. Use PNG, JPG, ICO, SVG, or WebP.";
    }
    if (file.size > MAX_SIZE) {
      return "File too large. Maximum size is 5MB.";
    }
    return null;
  };

  const handleFile = useCallback((selectedFile) => {
    setError("");
    const err = validate(selectedFile);
    if (err) {
      setError(err);
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleSelect = (e) => {
    const f = e.target.files[0];
    if (f) handleFile(f);
  };

  const remove = () => {
    setFile(null);
    setPreview(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return {
    file,
    preview,
    setPreview,
    dragOver,
    error,
    inputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleSelect,
    remove,
  };
}

export default function SiteSettingsClient() {
  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [initialData, setInitialData] = useState(null);

  const siteIcon = useImageUpload();
  const favicon = useImageUpload();

  // Fetch settings from DB on mount
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/site", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.settings) {
        setSiteName(data.settings.siteName || "");
        setSiteTagline(data.settings.siteTagline || "");
        setContactEmail(data.settings.contactEmail || "");
        setContactPhone(data.settings.contactPhone || "");
        setAddress(data.settings.address || "");
        setTimezone(data.settings.timezone || "Asia/Dhaka");
        setMaintenanceMode(data.settings.maintenanceMode || false);
        if (data.settings.siteIconUrl) {
          siteIcon.setPreview(data.settings.siteIconUrl);
        }
        if (data.settings.faviconUrl) {
          favicon.setPreview(data.settings.faviconUrl);
        }
        setInitialData(data.settings);
      }
    } catch (err) {
      console.error("Failed to load site settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName,
          siteTagline,
          contactEmail,
          contactPhone,
          address,
          timezone,
          maintenanceMode,
          siteIconUrl: siteIcon.preview,
          faviconUrl: favicon.preview,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Site configuration saved successfully!");
      } else {
        showToast("error", data.message || "Failed to save settings");
      }
    } catch (err) {
      showToast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setSiteName(initialData.siteName || "");
      setSiteTagline(initialData.siteTagline || "");
      setContactEmail(initialData.contactEmail || "");
      setContactPhone(initialData.contactPhone || "");
      setAddress(initialData.address || "");
      setTimezone(initialData.timezone || "Asia/Dhaka");
      setMaintenanceMode(initialData.maintenanceMode || false);
      if (initialData.siteIconUrl) siteIcon.setPreview(initialData.siteIconUrl);
      if (initialData.faviconUrl) favicon.setPreview(initialData.faviconUrl);
      showToast("info", "Form reset to saved settings.");
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
              {toast.type === "info" && <RotateCcw size={20} color="#3b82f6" />}
            </div>
            <div className="msj-toast-message">{toast.message}</div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="msj-dash-page-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1>Site & Organization Settings</h1>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "20px",
                background: maintenanceMode ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                color: maintenanceMode ? "#dc2626" : "#059669",
                border: `1px solid ${maintenanceMode ? "rgba(239, 68, 68, 0.25)" : "rgba(16, 185, 129, 0.25)"}`,
              }}
            >
              {maintenanceMode ? "🟡 Maintenance Mode" : "🟢 Live & Operational"}
            </span>
          </div>
          <p>
            Configure agency branding, primary communication channels, operational timezone, and media assets in a structured 2-column layout.
          </p>
        </div>

        <div className="msj-dash-header-actions">
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--msj-text-muted)", fontSize: "0.88rem", marginBottom: "1rem" }}>
            <Loader2 size={18} className="animate-spin" />
            Loading settings from database...
          </div>
        )}

        {/* 2-COLUMN SECTION 1: Organization Identity & Contact Credentials */}
        <div className="msj-settings-2col-grid">
          {/* Column 1: Brand & Identity */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <Building2 size={18} color="var(--msj-gold)" />
                  Company & Brand Profile
                </div>
                <div className="msj-settings-card-subtitle">
                  Primary organizational name and core marketing tagline.
                </div>
              </div>
              <span className="msj-preview-chip">Col 1 • Brand</span>
            </div>

            <FloatingField
              id="site-name"
              label="Site / Organization Name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              icon={<Type size={18} />}
              required
            />

            <FloatingField
              id="site-tagline"
              label="Official Marketing Tagline"
              value={siteTagline}
              onChange={(e) => setSiteTagline(e.target.value)}
              icon={<Tag size={18} />}
            />

            <FloatingField
              as="select"
              id="timezone"
              label="Default Operating Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              icon={<Clock size={18} />}
              options={[
                { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6 - Bangladesh Standard Time)" },
                { value: "Asia/Kolkata", label: "Asia/Kolkata (GMT+5:30 - Indian Standard Time)" },
                { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4 - Gulf Standard Time)" },
                { value: "Europe/London", label: "Europe/London (GMT+0 - British Time)" },
                { value: "America/New_York", label: "America/New_York (GMT-5 - Eastern Time)" },
              ]}
            />

            {/* Maintenance Mode Toggle inside Column 1 */}
            <div className="msj-settings-toggle-row" style={{ marginTop: "0.25rem" }}>
              <div className="msj-settings-toggle-info">
                <span>Maintenance Mode</span>
                <span>Temporarily suspend public inquiry submissions for upgrades</span>
              </div>
              <div
                className={`msj-settings-toggle ${maintenanceMode ? "on" : ""}`}
                onClick={() => setMaintenanceMode((prev) => !prev)}
                role="switch"
                aria-checked={maintenanceMode}
                title="Toggle Maintenance Mode"
              />
            </div>
          </div>

          {/* Column 2: Official Contact & Location */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <MapPin size={18} color="var(--msj-navy)" />
                  Contact & Regional Presence
                </div>
                <div className="msj-settings-card-subtitle">
                  Public communication channels shown on receipts and inquiry portals.
                </div>
              </div>
              <span className="msj-preview-chip">Col 2 • Contact</span>
            </div>

            <FloatingField
              id="contact-email"
              label="Official Contact Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            <FloatingField
              id="contact-phone"
              label="Helpline / WhatsApp Phone Number"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              icon={<Phone size={18} />}
              required
            />

            <FloatingField
              as="textarea"
              id="address"
              label="Registered Office Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              icon={<MapPin size={18} />}
              rows={3}
            />

            <div className="msj-settings-info-box">
              <Globe size={18} color="var(--msj-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Global Presence Note:</strong> These contact channels are embedded in student application confirmation emails, hospital appointment vouchers, and official invoices.
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN SECTION 2: Visual Media Assets & Live Browser Tab Preview */}
        <div className="msj-settings-2col-grid">
          {/* Column 1: Site Icon / Logo Asset */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <ImageIcon size={18} color="var(--msj-gold)" />
                  Site Logo & Primary Icon
                </div>
                <div className="msj-settings-card-subtitle">
                  High-resolution brand logo displayed in portal headers and documents.
                </div>
              </div>
              <span className="msj-preview-chip">Col 1 • Media</span>
            </div>

            {siteIcon.preview ? (
              <div className="msj-favicon-preview-row">
                <div className="msj-favicon-preview-box msj-favicon-preview-box-lg">
                  <img src={siteIcon.preview} alt="Site logo preview" />
                </div>
                <div className="msj-favicon-preview-info">
                  <span className="msj-favicon-filename">{siteIcon.file?.name || "current-site-logo"}</span>
                  <span className="msj-favicon-filesize">
                    {siteIcon.file ? `${(siteIcon.file.size / 1024).toFixed(1)} KB` : "Uploaded Image"}
                  </span>
                  <span style={{ fontSize: "0.74rem", color: "#16a34a", fontWeight: 600 }}>
                    Active in portal headers
                  </span>
                </div>
                <button
                  type="button"
                  className="msj-favicon-remove-btn"
                  onClick={siteIcon.remove}
                  aria-label="Remove logo"
                  title="Remove logo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div
                className={`msj-favicon-dropzone ${siteIcon.dragOver ? "drag-over" : ""}`}
                onDrop={siteIcon.handleDrop}
                onDragOver={siteIcon.handleDragOver}
                onDragLeave={siteIcon.handleDragLeave}
                onClick={() => siteIcon.inputRef.current?.click()}
              >
                <div className="msj-favicon-dropzone-icon">
                  <ImageIcon size={28} />
                </div>
                <span className="msj-favicon-dropzone-title">Drag & drop your primary logo here</span>
                <span className="msj-favicon-dropzone-sub">or click to browse local files</span>
                <span className="msj-favicon-dropzone-hint">PNG, SVG, WebP, JPG — Recommended: 256×256px (Max 5MB)</span>
                <input
                  ref={siteIcon.inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={siteIcon.handleSelect}
                  style={{ display: "none" }}
                />
              </div>
            )}

            {siteIcon.error && (
              <span className="msj-favicon-error">{siteIcon.error}</span>
            )}
          </div>

          {/* Column 2: Favicon & Live Simulated Browser Tab */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <Star size={18} color="var(--msj-gold)" />
                  Browser Tab Favicon
                </div>
                <div className="msj-settings-card-subtitle">
                  Small icon displayed on browser tabs, bookmarks, and mobile home screens.
                </div>
              </div>
              <span className="msj-preview-chip">Col 2 • Favicon</span>
            </div>

            {favicon.preview ? (
              <div className="msj-favicon-preview-row">
                <div className="msj-favicon-preview-box">
                  <img src={favicon.preview} alt="Favicon preview" />
                </div>
                <div className="msj-favicon-preview-info">
                  <span className="msj-favicon-filename">{favicon.file?.name || "current-favicon"}</span>
                  <span className="msj-favicon-filesize">
                    {favicon.file ? `${(favicon.file.size / 1024).toFixed(1)} KB` : "Uploaded Icon"}
                  </span>
                  <span style={{ fontSize: "0.74rem", color: "#16a34a", fontWeight: 600 }}>
                    Active favicon
                  </span>
                </div>
                <button
                  type="button"
                  className="msj-favicon-remove-btn"
                  onClick={favicon.remove}
                  aria-label="Remove favicon"
                  title="Remove favicon"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div
                className={`msj-favicon-dropzone ${favicon.dragOver ? "drag-over" : ""}`}
                onDrop={favicon.handleDrop}
                onDragOver={favicon.handleDragOver}
                onDragLeave={favicon.handleDragLeave}
                onClick={() => favicon.inputRef.current?.click()}
              >
                <div className="msj-favicon-dropzone-icon">
                  <Star size={28} />
                </div>
                <span className="msj-favicon-dropzone-title">Drag & drop your favicon here</span>
                <span className="msj-favicon-dropzone-sub">or click to browse local files</span>
                <span className="msj-favicon-dropzone-hint">Recommended: 32×32 or 64×64 pixels (PNG, ICO, SVG)</span>
                <input
                  ref={favicon.inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/x-icon,image/svg+xml,image/webp"
                  onChange={favicon.handleSelect}
                  style={{ display: "none" }}
                />
              </div>
            )}

            {favicon.error && (
              <span className="msj-favicon-error">{favicon.error}</span>
            )}

            {/* Live Browser Tab Preview Mockup */}
            <div style={{ marginTop: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--msj-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Live Browser Tab Mockup
              </span>
              <div className="msj-browser-mockup">
                <div className="msj-browser-mockup-tab">
                  {favicon.preview ? (
                    <img
                      src={favicon.preview}
                      alt="tab favicon"
                      style={{ width: 14, height: 14, objectFit: "contain", flexShrink: 0 }}
                    />
                  ) : (
                    <Globe size={14} color="#d4941e" style={{ flexShrink: 0 }} />
                  )}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {siteName || "MSJ Global Education"}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: "10px", opacity: 0.6 }}>×</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN SECTION 3: Live Identity Card & Operational Summary */}
        <div className="msj-settings-2col-grid">
          {/* Card 5: Live Public Branding Card */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <Sparkles size={18} color="var(--msj-gold)" />
                  Live Branding Card Simulation
                </div>
                <div className="msj-settings-card-subtitle">
                  Real-time preview of your agency's header identity card.
                </div>
              </div>
              <span className="msj-preview-chip">Col 1 • Preview</span>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #0a1d37 0%, #152d4e 100%)",
                borderRadius: "12px",
                padding: "1.25rem",
                color: "#ffffff",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                border: "1px solid rgba(212, 148, 30, 0.3)",
                boxShadow: "0 8px 24px -4px rgba(10, 29, 55, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "10px",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 4,
                    flexShrink: 0,
                  }}
                >
                  {siteIcon.preview ? (
                    <img src={siteIcon.preview} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <Globe size={26} color="#0a1d37" />
                  )}
                </div>
                <div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                    {siteName || "MSJ Global Education Consultancy"}
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--msj-gold-light)", fontWeight: 500 }}>
                    {siteTagline || "Your Gateway to Global Higher Education & Hospital Placements"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.78rem", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "0.75rem", color: "rgba(255,255,255,0.75)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Mail size={14} color="#d4941e" />
                  <span>{contactEmail || "msjglobaleducationconsultancy@gmail.com"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Phone size={14} color="#d4941e" />
                  <span>{contactPhone || "+880 1700-000000"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={14} color="#d4941e" />
                  <span>{address || "Dhaka, Bangladesh"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Operational Rules & Health Summary */}
          <div className="msj-settings-card">
            <div className="msj-settings-card-header">
              <div>
                <div className="msj-settings-card-title">
                  <ShieldAlert size={18} color="#0284c7" />
                  Platform Health & Operational Rules
                </div>
                <div className="msj-settings-card-subtitle">
                  Status overview of database connection and security parameters.
                </div>
              </div>
              <span className="msj-preview-chip">Col 2 • System</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--msj-navy)" }}>Database Storage Mode</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#059669", background: "rgba(16, 185, 129, 0.1)", padding: "2px 8px", borderRadius: 4 }}>
                  PostgreSQL (Table: site_settings)
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--msj-navy)" }}>Active Timezone</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--msj-navy)" }}>
                  {timezone}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--msj-navy)" }}>Public Booking Status</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: maintenanceMode ? "#dc2626" : "#059669" }}>
                  {maintenanceMode ? "Offline (Maintenance)" : "Online (Accepting Inquiries)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="msj-settings-bottom-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              className="msj-period-btn"
              style={{ background: "#f1f5f9", color: "var(--msj-text-secondary)", border: "1px solid #cbd5e1" }}
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw size={15} style={{ verticalAlign: "middle", marginRight: 5 }} />
              Discard Changes
            </button>
            <span style={{ fontSize: "0.8rem", color: "var(--msj-text-muted)" }}>
              Ensure all fields are verified before saving changes.
            </span>
          </div>

          <button
            type="submit"
            className="msj-settings-save-btn"
            style={{ minWidth: 160 }}
            disabled={saving}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
    </>
  );
}
