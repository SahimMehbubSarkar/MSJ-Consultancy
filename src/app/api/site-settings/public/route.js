import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  const defaultSettings = {
    siteName: 'MSJ Global Education Consultancy',
    siteTagline: 'Your Gateway to Global Education & World-Class Healthcare',
    contactEmail: 'msjglobaleducationconsultancy@gmail.com',
    contactPhone: '+880 1700-000000',
    address: 'Dhaka, Bangladesh',
    timezone: 'Asia/Dhaka',
    maintenanceMode: false,
    siteIconUrl: null,
    faviconUrl: null,
  };

  try {
    const result = await query(
      `SELECT site_name, site_tagline, contact_email, contact_phone, address, timezone, maintenance_mode, site_icon_url, favicon_url 
       FROM site_settings WHERE id = 1 LIMIT 1`
    );

    if (result && result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      return NextResponse.json({
        success: true,
        settings: {
          siteName: row.site_name || defaultSettings.siteName,
          siteTagline: row.site_tagline || defaultSettings.siteTagline,
          contactEmail: row.contact_email || defaultSettings.contactEmail,
          contactPhone: row.contact_phone || defaultSettings.contactPhone,
          address: row.address || defaultSettings.address,
          timezone: row.timezone || defaultSettings.timezone,
          maintenanceMode: row.maintenance_mode || false,
          siteIconUrl: row.site_icon_url || null,
          faviconUrl: row.favicon_url || null,
        },
      }, { status: 200, headers });
    }

    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    }, { status: 200, headers });
  } catch (error) {
    console.error('Public site settings query failed (using defaults):', error.message);
    return NextResponse.json({
      success: true,
      settings: defaultSettings,
      fallback: true,
    }, { status: 200, headers });
  }
}
