"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Menu, X, Shield, GraduationCap, HeartPulse } from "lucide-react";

export default function Navbar({ siteName = "MSJ Global Education Consultancy", siteIconUrl = null }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const brandTitle = siteName ? siteName.split(" ")[0] : "MSJ";
  const brandSubtitle = siteName ? siteName.split(" ").slice(1).join(" ") : "GLOBAL CONSULTANCY";

  return (
    <nav className="msj-home-navbar">
      <div className="msj-nav-inner">
        {/* Brand Logo with matching Login SVG */}
        <Link href="/" className="msj-nav-brand">
          <div className="msj-logo-circle" style={{ width: 44, height: 44, padding: 0 }}>
            {siteIconUrl ? (
              <img src={siteIconUrl} alt={brandTitle} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 4 }} />
            ) : (
              <svg
                viewBox="0 0 160 160"
                width="44"
                height="44"
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

                {/* Graduation Cap */}
                <polygon points="80,36 122,51 80,62 38,51" fill="#0a1d37" stroke="#ffffff" strokeWidth="1.6" />
                <path d="M54 55 V66 C54 75 106 75 106 66 V55" fill="#0a1d37" stroke="#ffffff" strokeWidth="1.2" />

                {/* Gold Tassel */}
                <path d="M80 49 Q110 54 112 65" stroke="#d4941e" strokeWidth="2.2" fill="none" />
                <circle cx="112" cy="69" r="3" fill="#d4941e" />
                <path d="M110 70 L111 80 M112 70 L112 81 M114 70 L113 80" stroke="#d4941e" strokeWidth="1.6" />
              </svg>
            )}
          </div>

          <div className="msj-nav-brand-text">
            <span className="msj-nav-brand-title">{brandTitle}</span>
            <span className="msj-nav-brand-subtitle">{brandSubtitle}</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="msj-nav-links">
          <Link href="#hero" className="msj-nav-link">Home</Link>
          <Link href="#partners" className="msj-nav-link">Top States</Link>
          <Link href="#forms-section" className="msj-nav-link">Admissions &amp; Hospital</Link>
          <Link href="#contact" className="msj-nav-link">Contact Us</Link>
        </div>

        {/* Actions */}
        <div className="msj-nav-actions">
          <Link href="/admin/login" className="msj-btn-nav-cta" id="nav-admin-login-btn">
            <Lock size={15} />
            <span>Admin Portal</span>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          className="msj-mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="msj-mobile-drawer open">
          <Link href="#hero" className="msj-nav-link" onClick={() => setMobileOpen(false)}>
            Home
          </Link>
          <Link href="#partners" className="msj-nav-link" onClick={() => setMobileOpen(false)}>
            Top States &amp; Networks
          </Link>
          <Link href="#forms-section" className="msj-nav-link" onClick={() => setMobileOpen(false)}>
            Admissions &amp; Hospital Forms
          </Link>
          <Link href="#contact" className="msj-nav-link" onClick={() => setMobileOpen(false)}>
            Site Contact Info
          </Link>
          <div style={{ paddingTop: "0.5rem" }}>
            <Link
              href="/admin/login"
              className="msj-btn-nav-cta"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setMobileOpen(false)}
            >
              <Lock size={15} />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
