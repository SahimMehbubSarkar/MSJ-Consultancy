"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Trash2,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Edit2,
  Save,
  X,
  LogOut,
  KeyRound,
} from "lucide-react";

export default function ProfileClient() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile data from PostgreSQL admin table
  const [adminData, setAdminData] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("Executive Administrator & Academic Advisory Committee Lead");
  const [avatarUrl, setAvatarUrl] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profile", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.admin) {
        setAdminData(data.admin);
        setName(data.admin.name || "");
        setPhone(data.admin.phone || "");
        if (data.admin.avatarUrl) setAvatarUrl(data.admin.avatarUrl);
        if (data.admin.bio) setBio(data.admin.bio);
      } else {
        showToast("error", data.message || "Failed to load admin profile.");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      showToast("error", "Network error while connecting to database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      showToast("error", "Full name cannot be empty.");
      return;
    }
    if (!phone.trim()) {
      showToast("error", "Phone number is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, bio }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminData(data.admin);
        setIsEditing(false);
        showToast("success", "Profile updated successfully in PostgreSQL database!");
      } else {
        showToast("error", data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile save error:", err);
      showToast("error", "Network error while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Avatar image size must be under 5MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/admin/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
        setAdminData((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : prev));
        showToast("success", "Profile image saved directly to database!");
      } else {
        showToast("error", data.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      showToast("error", "Network error while uploading avatar image.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const res = await fetch("/api/admin/profile/avatar", {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setAvatarUrl(null);
        setAdminData((prev) => (prev ? { ...prev, avatarUrl: null } : prev));
        if (fileInputRef.current) fileInputRef.current.value = "";
        showToast("success", "Profile avatar removed from database.");
      } else {
        showToast("error", data.message || "Failed to remove avatar.");
      }
    } catch (err) {
      console.error("Avatar delete error:", err);
      showToast("error", "Network error while removing avatar.");
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login?logged_out=true");
    } catch {
      router.replace("/admin/login?logged_out=true");
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="msj-profile-full-container">
      {/* Toast Notification */}
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

      {/* Hidden file input for avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleAvatarUpload}
      />

      {/* 1. Header Section */}
      <div className="msj-profile-header">
        <div className="msj-profile-header-icon">
          <User size={22} strokeWidth={2.2} />
        </div>
        <div className="msj-profile-header-text">
          <h1>
            My Profile
            <span className="msj-profile-header-badge">ACCOUNT SETTINGS</span>
          </h1>
          <div className="msj-profile-header-desc">
            Manage your account credentials, bio and details
          </div>
        </div>
      </div>

      {loading ? (
        <div className="msj-profile-hero" style={{ justifyContent: "center", padding: "3rem" }}>
          <Loader2 size={28} className="animate-spin" style={{ color: "#2563eb", marginRight: 10 }} />
          <span style={{ color: "#64748b", fontWeight: 500 }}>Loading profile from PostgreSQL admin table...</span>
        </div>
      ) : (
        <>
          {/* 2. Top Hero Profile Card */}
          <div className="msj-profile-hero">
            {/* Avatar Circle with Delete & Camera Actions */}
            <div className="msj-profile-avatar-wrapper">
              <div className="msj-profile-avatar-circle">
                {uploadingAvatar ? (
                  <Loader2 size={26} className="animate-spin" style={{ color: "#2563eb" }} />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" />
                ) : (
                  name?.charAt(0)?.toUpperCase() || "A"
                )}
              </div>

              {/* Trash button at top-right */}
              {avatarUrl && (
                <button
                  type="button"
                  className="msj-avatar-del-btn"
                  onClick={handleRemoveAvatar}
                  title="Remove avatar"
                  aria-label="Remove avatar"
                >
                  <Trash2 size={12} strokeWidth={2.5} />
                </button>
              )}

              {/* Camera upload button at bottom-right */}
              <button
                type="button"
                className="msj-avatar-cam-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Change photo"
                aria-label="Change photo"
              >
                <Camera size={14} strokeWidth={2.2} />
              </button>
            </div>

            {/* Profile Info & Status Pills */}
            <div className="msj-profile-hero-info">
              <div className="msj-profile-hero-name-row">
                <span className="msj-profile-hero-name">
                  {name || "MAJESTY HARRISON"}
                </span>
                <span className="msj-profile-hero-role-badge">
                  {adminData?.role ? adminData.role.toUpperCase() : "SUPERADMIN"}
                </span>
              </div>

              <div className="msj-profile-hero-email">
                {adminData?.email || "admin@msj.edu"}
              </div>

              {/* Status Pills */}
              <div className="msj-profile-pills-row">
                <div className="msj-profile-pill msj-pill-status">
                  <span className="msj-dot-green" />
                  <span>System Status: <strong>Online</strong></span>
                </div>

                <div className="msj-profile-pill msj-pill-access">
                  <span>Access: <strong>{adminData?.role === "superadmin" ? "Superadmin" : "Full Admin"}</strong></span>
                </div>

                <div className="msj-profile-pill msj-pill-plan">
                  <span>Plan: <strong>PowerPrep: Intensive IMAT 2026 Preparation Course</strong></span>
                </div>

                <div className="msj-profile-pill msj-pill-auth">
                  <span>Auth: <strong>Active</strong></span>
                </div>
              </div>
            </div>

            {/* Edit / Cancel Toggle Button in Top Corner */}
            <div style={{ position: "absolute", top: "1.5rem", right: "1.75rem" }}>
              {isEditing ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(adminData?.name || "");
                      setPhone(adminData?.phone || "");
                    }}
                    className="msj-btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 5 }}
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="msj-settings-save-btn"
                    style={{ padding: "6px 14px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 5 }}
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="msj-btn-secondary"
                  style={{ padding: "6px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Edit2 size={14} /> Edit Details
                </button>
              )}
            </div>
          </div>

          {/* 3. Two-Column Middle Section */}
          <div className="msj-profile-2col-grid">
            {/* Left Card: Personal & Account Details */}
            <div className="msj-profile-section-card">
              {/* Full Name */}
              <div className="msj-profile-item">
                <span className="msj-profile-item-label">FULL NAME</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #2563eb",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                ) : (
                  <span className="msj-profile-item-val">{name || "MAJESTY HARRISON"}</span>
                )}
              </div>

              {/* Email Address */}
              <div className="msj-profile-item">
                <span className="msj-profile-item-label">EMAIL ADDRESS</span>
                <span className="msj-profile-item-val" style={{ wordBreak: "break-all" }}>
                  {adminData?.email || "workspaceofamir@gmail.com"}
                </span>
              </div>

              {/* Phone Number */}
              <div className="msj-profile-item">
                <span className="msj-profile-item-label">PHONE NUMBER</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #2563eb",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                ) : (
                  <span className="msj-profile-item-val">{phone || "+8801700000000"}</span>
                )}
              </div>

              {/* Database UUID / System ID */}
              <div className="msj-profile-item">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="msj-profile-item-label">SYSTEM ID / RECORD UUID</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(adminData?.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: copiedId ? "#16a34a" : "#94a3b8",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    {copiedId ? <Check size={12} /> : <Copy size={12} />}
                    {copiedId ? "Copied" : "Copy"}
                  </button>
                </div>
                <code style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, wordBreak: "break-all" }}>
                  {adminData?.id || "—"}
                </code>
              </div>
            </div>

            {/* Right Card: Bio & Access Scope */}
            <div className="msj-profile-section-card">
              {/* Bio */}
              <div className="msj-profile-item">
                <span className="msj-profile-item-label">BIO</span>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #2563eb",
                      fontSize: "0.88rem",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                ) : (
                  <span className="msj-profile-item-val secondary">
                    {bio || "No bio yet."}
                  </span>
                )}
              </div>

              {/* Role */}
              <div className="msj-profile-item">
                <span className="msj-profile-item-label">ROLE</span>
                <span className="msj-profile-item-val">
                  {adminData?.role ? `${adminData.role.toUpperCase()} ACCOUNT` : "STUDENT ACCOUNT"}
                </span>
              </div>

              {/* Membership Plan */}
              <div className="msj-profile-item">
                <span className="msj-profile-item-label">MEMBERSHIP PLAN</span>
                <span className="msj-profile-item-val">
                  POWERPREP: INTENSIVE IMAT 2026 PREPARATION COURSE
                </span>
              </div>

              {/* Session */}
              <div className="msj-profile-item">
                <span className="msj-profile-item-label">SESSION</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="msj-dot-green" />
                  <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#10b981" }}>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Change Password Card */}
          <div className="msj-profile-pwd-card">
            <div className="msj-profile-pwd-title">Change Password</div>
            <div className="msj-profile-pwd-sub">Update your account password</div>
            <Link href="/admin/change-password" className="msj-profile-pwd-btn">
              <KeyRound size={16} />
              <span>Change Password</span>
            </Link>
          </div>

          {/* 5. Sign Out Card */}
          <div className="msj-profile-signout-card">
            <div>
              <div className="msj-profile-signout-title">Sign Out</div>
              <div className="msj-profile-signout-sub">End your current session</div>
            </div>
            <button
              type="button"
              className="msj-profile-signout-btn"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
