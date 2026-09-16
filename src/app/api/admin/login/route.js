import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { createSession, SESSION_MAX_AGE_SECONDS } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  // Anti-caching headers
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    const body = await request.json();
    const { identifier, password } = body;

    // 1. Basic validation
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both your Email / Phone and Password.' },
        { status: 400, headers }
      );
    }

    const cleanIdentifier = String(identifier).trim();

    // 2. Fetch admin record by email (case-insensitive) OR phone number
    const adminRes = await query(
      `SELECT id, name, email, phone, password_hash, role, is_active, failed_attempts, locked_until
       FROM admin
       WHERE LOWER(email) = LOWER($1) OR phone = $1
       LIMIT 1`,
      [cleanIdentifier]
    );

    if (adminRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Access Denied: Invalid credentials or unregistered administrator.' },
        { status: 401, headers }
      );
    }

    const admin = adminRes.rows[0];

    // 3. Check if account is active
    if (!admin.is_active) {
      return NextResponse.json(
        { success: false, message: 'Account Suspended: Contact superadmin for authorization.' },
        { status: 403, headers }
      );
    }

    // 4. Check if account is locked due to brute force
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      const minutesRemaining = Math.ceil((new Date(admin.locked_until).getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json(
        {
          success: false,
          message: `Security Lockout: Too many failed attempts. Account locked for ${minutesRemaining} more minute(s).`,
        },
        { status: 429, headers }
      );
    }

    // 5. Verify password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      const updatedAttempts = (admin.failed_attempts || 0) + 1;
      let lockQuery = `UPDATE admin SET failed_attempts = $1 WHERE id = $2`;
      let lockParams = [updatedAttempts, admin.id];

      if (updatedAttempts >= 5) {
        lockQuery = `UPDATE admin SET failed_attempts = $1, locked_until = NOW() + INTERVAL '15 minutes' WHERE id = $2`;
      }

      await query(lockQuery, lockParams);

      const attemptsRemaining = Math.max(0, 5 - updatedAttempts);
      const message = attemptsRemaining > 0
        ? `Access Denied: Incorrect password. (${attemptsRemaining} attempt(s) remaining before lockout).`
        : 'Account locked for 15 minutes due to consecutive failed attempts.';

      return NextResponse.json({ success: false, message }, { status: 401, headers });
    }

    // 6. Success: Reset failed attempts, update last login metadata
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    await query(
      `UPDATE admin
       SET failed_attempts = 0,
           locked_until = NULL,
           last_login_at = NOW(),
           last_login_ip = $1
       WHERE id = $2`,
      [clientIp, admin.id]
    );

    // 7. Create dynamic revocable database session
    const { token } = await createSession(admin.id, clientIp, userAgent);

    // 8. Return successful login response
    const response = NextResponse.json(
      {
        success: true,
        message: `Welcome, ${admin.name}! Authenticated successfully.`,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
        },
      },
      { status: 200, headers }
    );

    // Set secure HTTP-only session cookie
    response.cookies.set('msj_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS, // 48 hours
    });

    return response;
  } catch (error) {
    console.error('Admin login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error. Please verify PostgreSQL connection.' },
      { status: 500, headers }
    );
  }
}
