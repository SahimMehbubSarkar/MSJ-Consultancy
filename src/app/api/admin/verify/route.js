import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('msj_admin_token');

  if (!tokenCookie) {
    return NextResponse.json(
      { success: false, message: 'No session' },
      { status: 401, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  }

  const payload = await validateSession(tokenCookie.value);

  if (!payload) {
    const response = NextResponse.json(
      { success: false, message: 'Session expired or revoked' },
      { status: 401, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
    response.cookies.set('msj_admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json(
    {
      success: true,
      admin: {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    },
    { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  );
}
