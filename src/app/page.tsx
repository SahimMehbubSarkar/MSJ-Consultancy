import { query } from "@/lib/db";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const title = settings?.siteName
    ? `${settings.siteName} | Global Education & Healthcare`
    : "MSJ Global Education Consultancy & Overseas Healthcare";

  return {
    title,
    description:
      settings?.siteTagline ||
      "Official portal for international university admissions, scholarship counseling, and overseas super-speciality hospital consultations.",
    icons: {
      icon: [
        { url: "/api/site-settings/favicon", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      shortcut: "/api/site-settings/favicon",
      apple: "/api/site-settings/favicon",
    },
  };
}

async function getSiteSettings() {
  try {
    const res = await query(
      `SELECT site_name, site_tagline, contact_email, contact_phone, address, timezone, site_icon_url, favicon_url 
       FROM site_settings WHERE id = 1 LIMIT 1`
    );
    if (res && res.rows && res.rows.length > 0) {
      const row = res.rows[0];
      return {
        siteName: row.site_name,
        siteTagline: row.site_tagline,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        address: row.address,
        timezone: row.timezone,
        siteIconUrl: row.site_icon_url,
        faviconUrl: row.favicon_url,
      };
    }
  } catch (err) {
    console.warn("Could not pre-fetch site settings on server, using defaults:", err instanceof Error ? err.message : String(err));
  }
  return {
    siteName: "MSJ Global Education Consultancy",
    siteTagline: "Your Gateway to Global Education & World-Class Healthcare",
    contactEmail: "msjglobaleducationconsultancy@gmail.com",
    contactPhone: "+91 9635953116",
    address: "Kolkata, West Bengal, India",
    timezone: "Asia/Kolkata",
  };
}

export default async function HomePage() {
  const initialSettings = await getSiteSettings();

  return <HomeClient initialSettings={initialSettings} />;
}
