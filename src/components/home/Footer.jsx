"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Lock,
  ArrowRight,
  ShieldCheck,
  Globe2,
  ExternalLink,
} from "lucide-react";

export default function Footer({ settings }) {
  const siteName = settings?.siteName || "MSJ Global Education Consultancy";
  const siteTagline = settings?.siteTagline || "Your Gateway to Global Education & World-Class Healthcare";
  const contactEmail = settings?.contactEmail || "msjglobaleducationconsultancy@gmail.com";
  const contactPhone = settings?.contactPhone || "+91 9635953116";
  const address = settings?.address || "Kolkata, West Bengal, India";
  const timezone = settings?.timezone || "Asia/Kolkata";
  const siteIconUrl = settings?.siteIconUrl || null;

  return (
    <footer className="msj-home-footer" id="contact">
      <div className="msj-footer-inner">
        <div className="msj-footer-grid">
          {/* Column 1: Brand & Mission */}
          <div className="msj-footer-col">
            <div className="msj-footer-brand-title">
              {/* MSJ Mini Emblem */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#0a1d37",
                  border: "1.5px solid #d4941e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 10px rgba(212, 148, 30, 0.25)",
                  overflow: "hidden",
                }}
              >
                {siteIconUrl ? (
                  <img src={siteIconUrl} alt={siteName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <svg
                    viewBox="0 0 160 160"
                    width="26"
                    height="26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="80" cy="80" r="32" fill="#0a1d37" />
                    <ellipse cx="80" cy="80" rx="16" ry="32" stroke="#d4941e" strokeWidth="1.2" />
                    <polygon points="80,36 122,51 80,62 38,51" fill="#0a1d37" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="112" cy="69" r="3" fill="#d4941e" />
                  </svg>
                )}
              </div>
              <span>{siteName}</span>
            </div>

            <div className="msj-footer-brand-tagline">{siteTagline}</div>

            <p className="msj-footer-bio">
              Dedicated to bridging global opportunities for Bangladeshi students seeking prestigious
              international degrees and facilitating world-class medical treatments across top-tier
              overseas hospitals.
            </p>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#f3ba42" }}>
              <ShieldCheck size={16} />
              <span>Government Registered &amp; Embassy Certified</span>
            </div>
          </div>

          {/* Column 2: Higher Education Navigation */}
          <div className="msj-footer-col">
            <div className="msj-footer-heading">Higher Education</div>
            <ul className="msj-footer-links">
              <li>
                <Link href="#forms-section">USA University Admissions</Link>
              </li>
              <li>
                <Link href="#forms-section">UK Master&apos;s &amp; Bachelors</Link>
              </li>
              <li>
                <Link href="#forms-section">Canada Student Visa Support</Link>
              </li>
              <li>
                <Link href="#forms-section">Australia Group of Eight</Link>
              </li>
              <li>
                <Link href="#forms-section">Merit Scholarship Mentorship</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Overseas Healthcare Navigation */}
          <div className="msj-footer-col">
            <div className="msj-footer-heading">Overseas Healthcare</div>
            <ul className="msj-footer-links">
              <li>
                <Link href="#forms-section">Apollo Hospitals (India)</Link>
              </li>
              <li>
                <Link href="#forms-section">Bumrungrad International (Thailand)</Link>
              </li>
              <li>
                <Link href="#forms-section">Mount Elizabeth (Singapore)</Link>
              </li>
              <li>
                <Link href="#forms-section">Cardiac &amp; Oncology Consultation</Link>
              </li>
              <li>
                <Link href="#forms-section">Medical Visa Fast-Tracking</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Dynamic Site Settings Info */}
          <div className="msj-footer-col">
            <div className="msj-footer-heading">Official Contact Info</div>
            <div className="msj-footer-contact-items">
              {/* Phone from site_settings */}
              <div className="msj-footer-contact-item">
                <div className="msj-contact-icon-bubble">
                  <Phone size={16} />
                </div>
                <div className="msj-contact-text-meta">
                  <span className="msj-contact-meta-label">Help Desk &amp; WhatsApp</span>
                  <span className="msj-contact-meta-value">
                    <a href={`tel:${contactPhone}`}>{contactPhone}</a>
                  </span>
                </div>
              </div>

              {/* Email from site_settings */}
              <div className="msj-footer-contact-item">
                <div className="msj-contact-icon-bubble">
                  <Mail size={16} />
                </div>
                <div className="msj-contact-text-meta">
                  <span className="msj-contact-meta-label">Inquiry Email</span>
                  <span className="msj-contact-meta-value">
                    <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                  </span>
                </div>
              </div>

              {/* Address from site_settings */}
              <div className="msj-footer-contact-item">
                <div className="msj-contact-icon-bubble">
                  <MapPin size={16} />
                </div>
                <div className="msj-contact-text-meta">
                  <span className="msj-contact-meta-label">Headquarters</span>
                  <span className="msj-contact-meta-value">{address}</span>
                </div>
              </div>

              {/* Timezone / Hours from site_settings */}
              <div className="msj-footer-contact-item">
                <div className="msj-contact-icon-bubble">
                  <Clock size={16} />
                </div>
                <div className="msj-contact-text-meta">
                  <span className="msj-contact-meta-label">Operating Timezone</span>
                  <span className="msj-contact-meta-value">
                    {timezone} (09:00 AM – 06:30 PM)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="msj-footer-bottom">
          <div className="msj-footer-copyright">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved. Powered by MSJ
            Enterprise Platform.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/admin/login" className="msj-footer-admin-link">
              <Lock size={13} />
              <span>Administrative Console Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
