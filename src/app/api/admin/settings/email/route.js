import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// GET — Load email settings from DB
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

    const result = await query(
      `SELECT smtp_host, smtp_port, smtp_user, smtp_password, from_name, from_email, encryption, email_enabled FROM email_settings WHERE id = 1 LIMIT 1`
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        settings: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: '587',
          smtpUser: 'noreply@msjglobal.edu',
          smtpPassword: '',
          fromName: 'MSJ Global Education',
          fromEmail: 'noreply@msjglobal.edu',
          encryption: 'TLS',
          emailEnabled: true,
        },
      }, { status: 200, headers });
    }

    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      settings: {
        smtpHost: row.smtp_host,
        smtpPort: row.smtp_port,
        smtpUser: row.smtp_user,
        smtpPassword: row.smtp_password,
        fromName: row.from_name,
        fromEmail: row.from_email,
        encryption: row.encryption,
        emailEnabled: row.email_enabled,
      },
    }, { status: 200, headers });
  } catch (error) {
    console.error('Email settings GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load settings' },
      { status: 500, headers }
    );
  }
}

// PUT — Save email settings to DB
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

    if (!body.smtpHost || !body.smtpUser) {
      return NextResponse.json(
        { success: false, message: 'SMTP host and username are required' },
        { status: 400, headers }
      );
    }

    await query(
      `INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_user, smtp_password, from_name, from_email, encryption, email_enabled, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (id)
       DO UPDATE SET smtp_host = $1, smtp_port = $2, smtp_user = $3, smtp_password = $4, from_name = $5, from_email = $6, encryption = $7, email_enabled = $8, updated_at = NOW()`,
      [body.smtpHost, body.smtpPort, body.smtpUser, body.smtpPassword, body.fromName, body.fromEmail, body.encryption, body.emailEnabled]
    );

    return NextResponse.json({
      success: true,
      message: 'Email settings saved successfully',
    }, { status: 200, headers });
  } catch (error) {
    console.error('Email settings PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save settings' },
      { status: 500, headers }
    );
  }
}
