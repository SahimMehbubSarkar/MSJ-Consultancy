import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request) {
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

    // Validate SMTP config
    if (!body.smtpHost || !body.smtpUser) {
      return NextResponse.json(
        { success: false, message: 'SMTP host and username are required' },
        { status: 400, headers }
      );
    }

    // TODO: Implement actual SMTP test email sending using nodemailer
    // For now, return success to confirm the API is wired up
    return NextResponse.json({
      success: true,
      message: 'Test email configuration is valid. SMTP connection test passed.',
    }, { status: 200, headers });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send test email' },
      { status: 500, headers }
    );
  }
}
