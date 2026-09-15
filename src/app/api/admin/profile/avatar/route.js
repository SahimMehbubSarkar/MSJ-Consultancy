import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs/promises';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// POST — Upload & Save Admin Avatar to public/uploads/avatars and PostgreSQL
export async function POST(request) {
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

    const formData = await request.formData();
    const file = formData.get('avatar') || formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, message: 'No image file provided for upload.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Validate mime type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file format. Please upload a PNG, JPG, WEBP, or GIF image.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Image size exceeds the 5MB maximum limit.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await fs.mkdir(uploadDir, { recursive: true });

    // Determine extension
    let ext = path.extname(file.name) || '';
    if (!ext) {
      if (file.type === 'image/jpeg') ext = '.jpg';
      else if (file.type === 'image/png') ext = '.png';
      else if (file.type === 'image/webp') ext = '.webp';
      else if (file.type === 'image/gif') ext = '.gif';
      else ext = '.png';
    }

    const filename = `avatar-${payload.sub}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/avatars/${filename}`;

    // Update avatar_url in PostgreSQL admin table
    await query(
      `UPDATE admin
       SET avatar_url = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [publicUrl, payload.sub]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Profile image uploaded and saved successfully!',
        avatarUrl: publicUrl,
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while uploading avatar image.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// DELETE — Remove Admin Avatar from PostgreSQL
export async function DELETE() {
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

    // Clear avatar_url in PostgreSQL
    await query(
      `UPDATE admin
       SET avatar_url = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [payload.sub]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Profile avatar removed successfully.',
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while removing avatar image.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
