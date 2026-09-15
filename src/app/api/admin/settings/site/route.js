import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// GET — Load site settings from DB
export async function GET() {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('msj_admin_token');

    if (!tokenCookie) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401, headers });
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Session expired' }, { status: 401, headers });
    }

    // Fetch site settings from DB
    const result = await query(
      `SELECT site_name, site_tagline, contact_email, contact_phone, address, timezone, maintenance_mode, site_icon_url, favicon_url FROM site_settings WHERE id = 1 LIMIT 1`
    );

    if (result.rows.length === 0) {
      // Return defaults if no row exists yet
      return NextResponse.json({
        success: true,
        settings: {
          siteName: 'MSJ Global Education Consultancy',
          siteTagline: 'Your Gateway to Global Education',
          contactEmail: 'msjglobaleducationconsultancy@gmail.com',
          contactPhone: '+880 1700-000000',
          address: 'Dhaka, Bangladesh',
          timezone: 'Asia/Dhaka',
          maintenanceMode: false,
          siteIconUrl: null,
          faviconUrl: null,
        },
      }, { status: 200, headers });
    }

    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      settings: {
        siteName: row.site_name,
        siteTagline: row.site_tagline,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        address: row.address,
        timezone: row.timezone,
        maintenanceMode: row.maintenance_mode,
        siteIconUrl: row.site_icon_url,
        faviconUrl: row.favicon_url,
      },
    }, { status: 200, headers });
  } catch (error) {
    console.error('Site settings GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load settings' },
      { status: 500, headers }
    );
  }
}

// PUT — Save site settings to DB
export async function PUT(request) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('msj_admin_token');

    if (!tokenCookie) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401, headers });
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Session expired' }, { status: 401, headers });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.siteName || !body.contactEmail) {
      return NextResponse.json(
        { success: false, message: 'Site name and contact email are required' },
        { status: 400, headers }
      );
    }

    // Upsert settings into DB
    await query(
      `INSERT INTO site_settings (id, site_name, site_tagline, contact_email, contact_phone, address, timezone, maintenance_mode, site_icon_url, favicon_url, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (id)
       DO UPDATE SET site_name = $1, site_tagline = $2, contact_email = $3, contact_phone = $4, address = $5, timezone = $6, maintenance_mode = $7, site_icon_url = $8, favicon_url = $9, updated_at = NOW()`,
      [body.siteName, body.siteTagline, body.contactEmail, body.contactPhone, body.address, body.timezone, body.maintenanceMode, body.siteIconUrl || null, body.faviconUrl || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Site settings saved successfully',
    }, { status: 200, headers });
  } catch (error) {
    console.error('Site settings PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save settings' },
      { status: 500, headers }
    );
  }
}
