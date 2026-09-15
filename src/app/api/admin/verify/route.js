import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

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

  const payload = await verifyToken(tokenCookie.value);

  if (!payload) {
    const response = NextResponse.json(
      { success: false, message: 'Session expired' },
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
    { success: true, admin: { name: payload.name, email: payload.email } },
    { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  );
}
