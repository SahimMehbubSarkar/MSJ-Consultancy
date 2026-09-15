"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Globe,
  Mail,
  Hospital,
  ClipboardList,
  User,
  KeyRound,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Inquiries",
    href: "/admin/inquiries",
    icon: ClipboardList,
    children: [
      { label: "Admission Inquiries", href: "/admin/admission-inquiries", icon: GraduationCap },
      { label: "Hospital Inquiries", href: "/admin/hospital-inquiries", icon: Hospital },
    ],
  },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Universities", href: "/admin/universities", icon: GraduationCap },
  { label: "Applications", href: "/admin/applications", icon: FileText },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { label: "Profile", href: "/admin/profile", icon: User },
      { label: "Change Password", href: "/admin/change-password", icon: KeyRound },
      { label: "Site Settings", href: "/admin/site-settings", icon: Globe },
      { label: "Email Settings", href: "/admin/email-settings", icon: Mail },
    ],
  },
];

export default function DashboardLayout({ adminName, adminEmail, adminAvatar, siteName, siteIconUrl, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [openGroups, setOpenGroups] = useState({});

  const [siteSettings, setSiteSettings] = useState({ siteName: siteName || "MSJ Global Education", siteIconUrl: siteIconUrl || null });

  useEffect(() => {
    async function loadSiteSettings() {
      try {
        const res = await fetch("/api/site-settings/public", { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.settings) {
          setSiteSettings({
            siteName: data.settings.siteName || "MSJ Global Education",
            siteIconUrl: data.settings.siteIconUrl || null,
          });
        }
      } catch (err) {
        console.warn("Could not load site settings for sidebar:", err);
      }
    }
    if (!siteName) loadSiteSettings();
  }, []);

  const brandTitle = siteSettings.siteName ? siteSettings.siteName.split(" ")[0] : "MSJ";
  const brandSubtitle = siteSettings.siteName ? siteSettings.siteName.split(" ").slice(1).join(" ") : "GLOBAL EDUCATION";

  // When pathname changes, automatically close any group whose children are not active
  useEffect(() => {
    setOpenGroups((prev) => {
      const updated = { ...prev };
      NAV_ITEMS.forEach((item) => {
        if (item.children) {
          const isChild = item.children.some(
            (c) => pathname === c.href || pathname.startsWith(c.href + "/")
          );
          if (!isChild) {
            updated[item.href] = false;
          }
        }
      });
      return updated;
    });
  }, [pathname]);

  const toggleGroup = (groupHref) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupHref]: !prev[groupHref],
    }));
  };

  useEffect(() => {
    if (searchParams.get("already_logged_in") === "true") {
      setToast({ type: "warning", message: "You are already logged in. Please logout first to access the login page." });
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("/api/admin/verify", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!res.ok) {
          router.replace("/admin/login?expired=true");
        }
      } catch {
        router.replace("/admin/login?expired=true");
      }
    };
    verifySession();

    const handlePageShow = (e) => {
      if (e.persisted) {
        verifySession();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login?logged_out=true");
  };

  return (
    <div className="msj-dash-layout">
      {/* Floating Toast */}
      {toast && (
        <div className="msj-toast-container" role="status">
          <div className="msj-toast">
            <div className="msj-toast-icon">
              {toast.type === "warning" && <AlertCircle size={20} color="#f59e0b" />}
            </div>
            <div className="msj-toast-message">{toast.message}</div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="msj-toast-close"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="msj-dash-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Fixed left) */}
      <aside className={`msj-dash-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo Block */}
        <div className="msj-dash-sidebar-header">
          <div className="msj-dash-logo">
            <div className="msj-dash-logo-circle">
              {siteSettings.siteIconUrl ? (
                <img src={siteSettings.siteIconUrl} alt={brandTitle} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 4 }} />
              ) : (
                <svg viewBox="0 0 160 160" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="80" cy="80" r="32" fill="#0a1d37" />
                  <ellipse cx="80" cy="80" rx="16" ry="32" stroke="#d4941e" strokeWidth="1" opacity="0.65" />
                  <line x1="48" y1="80" x2="112" y2="80" stroke="#d4941e" strokeWidth="1" opacity="0.65" />
                  <polygon points="80,36 122,51 80,62 38,51" fill="#0a1d37" stroke="#ffffff" strokeWidth="1.6" />
                  <path d="M54 55 V66 C54 75 106 75 106 66 V55" fill="#0a1d37" stroke="#ffffff" strokeWidth="1.2" />
                  <path d="M80 49 Q110 54 112 65" stroke="#d4941e" strokeWidth="2.2" fill="none" />
                  <circle cx="112" cy="69" r="3" fill="#d4941e" />
                </svg>
              )}
            </div>
            <div className="msj-dash-logo-text">
              <span className="msj-dash-brand">{brandTitle}</span>
              <span className="msj-dash-brand-sub">{brandSubtitle}</span>
            </div>
          </div>
          <button
            className="msj-dash-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="msj-dash-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const isChildActive = item.children?.some(
              (child) => pathname === child.href || pathname.startsWith(child.href + "/")
            );
            const isOpen = isChildActive || !!openGroups[item.href];
            const Icon = item.icon;

            if (item.children) {
              return (
                <div key={item.href} className="msj-dash-nav-group">
                  <button
                    type="button"
                    className={`msj-dash-nav-item ${isChildActive ? "active-parent" : ""}`}
                    onClick={() => toggleGroup(item.href)}
                  >
                    <Icon size={20} className="msj-dash-nav-icon" />
                    <span>{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`msj-dash-nav-arrow ${isOpen ? "rotated" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="msj-dash-nav-dropdown">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`msj-dash-nav-sub-item ${childActive ? "active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <ChildIcon size={16} className="msj-dash-nav-icon" />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`msj-dash-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} className="msj-dash-nav-icon" />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={16} className="msj-dash-nav-arrow" />}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout in Sidebar */}
        <div className="msj-dash-sidebar-footer">
          <div className="msj-dash-sidebar-user">
            <div className="msj-dash-admin-avatar">
              {adminAvatar ? (
                <img src={adminAvatar} alt={adminName || "Admin"} />
              ) : (
                adminName?.charAt(0)?.toUpperCase() || "M"
              )}
            </div>
            <div className="msj-dash-admin-details">
              <span className="msj-dash-admin-name" style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.85rem" }}>
                {adminName || "MSJ Super Admin"}
              </span>
              <span className="msj-dash-admin-role" style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem" }}>
                Administrator
              </span>
            </div>
          </div>
          <button className="msj-dash-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area (Independent scroll) */}
      <div className="msj-dash-main">
        {/* Mobile Top Bar (Strictly Hidden on Desktop) */}
        <header className="msj-dash-topbar msj-mobile-only-header">
          <button
            className="msj-dash-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          <div style={{ fontWeight: 800, color: "var(--msj-navy)", fontSize: "1rem" }}>
            {brandTitle} Admin
          </div>

          <div className="msj-dash-topbar-right">
            <div className="msj-dash-admin-avatar" style={{ width: 32, height: 32, fontSize: "0.8rem" }}>
              {adminAvatar ? (
                <img src={adminAvatar} alt={adminName || "Admin"} />
              ) : (
                adminName?.charAt(0)?.toUpperCase() || "M"
              )}
            </div>
          </div>
        </header>

        {/* Page Content with independent scroll */}
        <main className="msj-dash-content">
          {children}
        </main>
      </div>
    </div>
  );
}
