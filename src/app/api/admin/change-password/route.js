import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('msj_admin_token');

    if (!tokenCookie) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: No active session found.' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Session invalid or expired.' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // 1. Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password, new password, and confirmation are all required.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters long.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'New password and confirmation password do not match.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: 'New password cannot be identical to your current password.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 2. Fetch admin current password_hash from DB
    const adminRes = await query(
      `SELECT id, password_hash FROM admin WHERE id = $1 LIMIT 1`,
      [payload.sub]
    );

    if (adminRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Administrator record not found.' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const admin = adminRes.rows[0];

    // 3. Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect. Please verify and try again.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 4. Hash new password with bcrypt (cost factor 12)
    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 5. Update admin record
    await query(
      `UPDATE admin
       SET password_hash = $1,
           updated_at = NOW(),
           failed_attempts = 0,
           locked_until = NULL
       WHERE id = $2`,
      [newPasswordHash, payload.sub]
    );

    // 6. Invalidate active session cookie so user MUST log in again
    const response = NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully. Your previous session has been invalidated for security. Please log in with your new password.',
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );

    response.cookies.set('msj_admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while changing password.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
