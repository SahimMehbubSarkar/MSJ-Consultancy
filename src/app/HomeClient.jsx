"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import PartnersMarquee from "@/components/home/PartnersMarquee";
import MetricsMarquee from "@/components/home/MetricsMarquee";
import FormModal from "@/components/home/FormModal";
import Footer from "@/components/home/Footer";
import "./homepage.css";

export default function HomeClient({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || null);
  const [activeForm, setActiveForm] = useState(null); // 'hospital' | 'admission' | null

  useEffect(() => {
    // Fetch live site settings from public endpoint if not present or to refresh
    async function loadPublicSettings() {
      try {
        const res = await fetch("/api/site-settings/public", { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.warn("Could not load public site settings:", err);
      }
    }
    loadPublicSettings();
  }, []);

  // Dynamically update browser tab favicon if configured
  useEffect(() => {
    if (settings?.faviconUrl || settings?.siteIconUrl) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = "/api/site-settings/favicon";
    }
  }, [settings?.faviconUrl, settings?.siteIconUrl]);

  return (
    <div className="msj-home-root">
      {/* Ambient background glows matching login portal */}
      <div className="msj-home-ambient-1" />
      <div className="msj-home-ambient-2" />

      {/* Top Navbar */}
      <Navbar siteName={settings?.siteName} siteIconUrl={settings?.siteIconUrl} />

      {/* Hero Section */}
      <HeroSection onOpenForm={(type) => setActiveForm(type)} />

      {/* Our Partners Infinite Marquee */}
      <PartnersMarquee />

      {/* Full-Screen Smooth Metrics Strip */}
      <MetricsMarquee />

      {/* Form Modal opened from hero cards */}
      <FormModal formType={activeForm} onClose={() => setActiveForm(null)} />

      {/* Footer with dynamic site settings */}
      <Footer settings={settings} />
    </div>
  );
}
