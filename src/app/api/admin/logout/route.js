import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revokeSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('msj_admin_token');

    // Immediately revoke session in database so it can never be reused
    if (tokenCookie && tokenCookie.value) {
      await revokeSession(tokenCookie.value);
    }
  } catch (err) {
    console.warn('Logout revocation warning:', err);
  }

  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully. Session revoked.' },
    { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  );

  // Clear the session cookie from browser
  response.cookies.set('msj_admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
