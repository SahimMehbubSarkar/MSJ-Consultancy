"use client";

import React from "react";
import { MapPin, Building2, CheckCircle2 } from "lucide-react";

// Top Destination States for Nursing, Medical & Higher Education Admissions
const TOP_STATES = [
  {
    id: "karnataka",
    code: "KA",
    name: "Karnataka",
    cities: "Bengaluru • Mangalore • Mysore",
    colleges: "150+ Colleges",
    accent: "#0a1d37",
    bg: "rgba(10, 29, 55, 0.08)",
    badgeColor: "#d4941e",
  },
  {
    id: "tamil-nadu",
    code: "TN",
    name: "Tamil Nadu",
    cities: "Chennai • Coimbatore • Vellore",
    colleges: "95+ Colleges",
    accent: "#7c2d12",
    bg: "rgba(124, 45, 18, 0.08)",
    badgeColor: "#ea580c",
  },
  {
    id: "kerala",
    code: "KL",
    name: "Kerala",
    cities: "Kochi • Trivandrum • Kozhikode",
    colleges: "70+ Colleges",
    accent: "#065f46",
    bg: "rgba(6, 95, 70, 0.08)",
    badgeColor: "#059669",
  },
  {
    id: "delhi-ncr",
    code: "DL",
    name: "Delhi NCR",
    cities: "New Delhi • Noida • Gurugram",
    colleges: "85+ Campuses",
    accent: "#0f172a",
    bg: "rgba(15, 23, 42, 0.08)",
    badgeColor: "#3b82f6",
  },
  {
    id: "maharashtra",
    code: "MH",
    name: "Maharashtra",
    cities: "Mumbai • Pune • Nagpur",
    colleges: "110+ Colleges",
    accent: "#1e3a8a",
    bg: "rgba(30, 58, 138, 0.08)",
    badgeColor: "#2563eb",
  },
  {
    id: "west-bengal",
    code: "WB",
    name: "West Bengal",
    cities: "Kolkata • Durgapur • Siliguri",
    colleges: "65+ Institutes",
    accent: "#1e293b",
    bg: "rgba(30, 41, 59, 0.08)",
    badgeColor: "#d4941e",
  },
  {
    id: "telangana",
    code: "TS",
    name: "Telangana",
    cities: "Hyderabad • Warangal",
    colleges: "60+ Campuses",
    accent: "#0e7490",
    bg: "rgba(14, 116, 144, 0.08)",
    badgeColor: "#0891b2",
  },
  {
    id: "andhra-pradesh",
    code: "AP",
    name: "Andhra Pradesh",
    cities: "Visakhapatnam • Vijayawada",
    colleges: "55+ Colleges",
    accent: "#115e59",
    bg: "rgba(17, 94, 89, 0.08)",
    badgeColor: "#0d9488",
  },
  {
    id: "punjab",
    code: "PB",
    name: "Punjab",
    cities: "Chandigarh • Mohali • Ludhiana",
    colleges: "45+ Campuses",
    accent: "#854d0e",
    bg: "rgba(133, 77, 14, 0.08)",
    badgeColor: "#ca8a04",
  },
  {
    id: "gujarat",
    code: "GJ",
    name: "Gujarat",
    cities: "Ahmedabad • Vadodara • Surat",
    colleges: "50+ Colleges",
    accent: "#9a3412",
    bg: "rgba(154, 52, 18, 0.08)",
    badgeColor: "#c2410c",
  },
  {
    id: "odisha",
    code: "OD",
    name: "Odisha",
    cities: "Bhubaneswar • Cuttack",
    colleges: "40+ Institutes",
    accent: "#1e1b4b",
    bg: "rgba(30, 27, 75, 0.08)",
    badgeColor: "#4f46e5",
  },
  {
    id: "rajasthan",
    code: "RJ",
    name: "Rajasthan",
    cities: "Jaipur • Jodhpur • Udaipur",
    colleges: "50+ Colleges",
    accent: "#831843",
    bg: "rgba(131, 24, 67, 0.08)",
    badgeColor: "#be185d",
  },
];

export default function PartnersMarquee() {
  // Duplicate for seamless 100% infinite CSS marquee loop
  const marqueeStates = [...TOP_STATES, ...TOP_STATES];

  return (
    <section className="msj-partners-strip-section" id="partners">
      <div className="msj-partners-strip-inner">
        {/* Sleek, Prestigious Institutional Header */}
        <div className="msj-strip-header">
          <span className="msj-strip-gold-line" />
          <div className="msj-strip-title-block">
            <div className="msj-strip-label">
              <Building2 size={16} color="#d4941e" />
              <span>TOP ADMISSION &amp; INSTITUTIONAL NETWORKS ACROSS STATES</span>
            </div>
            <p className="msj-strip-subtext">
              Direct University Tie-Ups • Clinical Hospital Training • Verified Seat Guidance
            </p>
          </div>
          <span className="msj-strip-gold-line" />
        </div>

        {/* Rich Infinite Scrolling States Marquee */}
        <div className="msj-logo-marquee-wrap">
          {/* Left and Right Fade Scrims */}
          <div className="msj-marquee-fade left" />
          <div className="msj-marquee-fade right" />

          <div className="msj-logo-marquee-track">
            {marqueeStates.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="msj-state-card">
                {/* State Code Emblem */}
                <div
                  className="msj-state-code-box"
                  style={{
                    background: item.bg,
                    borderColor: item.accent + "33",
                    color: item.accent,
                  }}
                >
                  <span className="msj-state-code-text">{item.code}</span>
                  <span className="msj-state-code-sub">STATE</span>
                </div>

                {/* State Information */}
                <div className="msj-state-details">
                  <div className="msj-state-name-line">
                    <span className="msj-state-title">{item.name}</span>
                    <span
                      className="msj-state-count-badge"
                      style={{
                        color: item.badgeColor,
                        background: item.bg,
                        borderColor: item.badgeColor + "40",
                      }}
                    >
                      <CheckCircle2 size={11} style={{ marginRight: 3 }} />
                      {item.colleges}
                    </span>
                  </div>

                  <div className="msj-state-cities-line">
                    <MapPin size={12} className="msj-state-pin-icon" />
                    <span>{item.cities}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
