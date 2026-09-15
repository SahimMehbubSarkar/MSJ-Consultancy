import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyToken, signToken, TOKEN_EXPIRY_SECONDS } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// GET — Retrieve admin details from PostgreSQL admin table
export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('msj_admin_token');

    if (!tokenCookie) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: No active session' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Session invalid or expired' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const res = await query(
      `SELECT id, name, email, phone, role, is_active, failed_attempts, locked_until,
              last_login_at, last_login_ip, avatar_url, bio, created_at, updated_at
       FROM admin
       WHERE id = $1
       LIMIT 1`,
      [payload.sub]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Admin record not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const admin = res.rows[0];

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          avatarUrl: admin.avatar_url,
          bio: admin.bio,
          isActive: admin.is_active,
          failedAttempts: admin.failed_attempts || 0,
          lockedUntil: admin.locked_until,
          lastLoginAt: admin.last_login_at,
          lastLoginIp: admin.last_login_ip,
          createdAt: admin.created_at,
          updatedAt: admin.updated_at,
        },
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while loading admin profile' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PUT — Update admin profile details (name, phone, bio, avatarUrl)
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('msj_admin_token');

    if (!tokenCookie) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: No active session' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Session invalid or expired' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const { name, phone, bio, avatarUrl } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Name must be at least 2 characters long.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      return NextResponse.json(
        { success: false, message: 'Valid phone number is required.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanBio = typeof bio === 'string' ? bio.trim() : null;

    // Check if phone number is used by another admin
    const phoneCheck = await query(
      `SELECT id FROM admin WHERE phone = $1 AND id != $2 LIMIT 1`,
      [cleanPhone, payload.sub]
    );

    if (phoneCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'This phone number is already associated with another administrator account.' },
        { status: 409, headers: NO_CACHE_HEADERS }
      );
    }

    // Update admin record in PostgreSQL
    const updateRes = await query(
      `UPDATE admin
       SET name = $1,
           phone = $2,
           bio = COALESCE($3, bio),
           avatar_url = CASE WHEN $4::text IS NOT NULL THEN $4 ELSE avatar_url END,
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, phone, role, avatar_url, bio, is_active, failed_attempts, locked_until,
                 last_login_at, last_login_ip, created_at, updated_at`,
      [cleanName, cleanPhone, cleanBio, avatarUrl !== undefined ? avatarUrl : null, payload.sub]
    );

    if (updateRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Administrator record not found.' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const updatedAdmin = updateRes.rows[0];

    // Refresh JWT token with updated name
    const newToken = await signToken({
      id: updatedAdmin.id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Administrator profile updated successfully.',
        admin: {
          id: updatedAdmin.id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          phone: updatedAdmin.phone,
          role: updatedAdmin.role,
          avatarUrl: updatedAdmin.avatar_url,
          bio: updatedAdmin.bio,
          isActive: updatedAdmin.is_active,
          failedAttempts: updatedAdmin.failed_attempts || 0,
          lockedUntil: updatedAdmin.locked_until,
          lastLoginAt: updatedAdmin.last_login_at,
          lastLoginIp: updatedAdmin.last_login_ip,
          createdAt: updatedAdmin.created_at,
          updatedAt: updatedAdmin.updated_at,
        },
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );

    // Update session cookie with new token
    response.cookies.set('msj_admin_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_EXPIRY_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while updating profile' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
