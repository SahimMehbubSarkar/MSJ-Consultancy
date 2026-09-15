import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB exact limit

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No receipt file provided.' },
        { status: 400 }
      );
    }

    // Strict 3MB validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: 'File size exceeds 3MB limit. Please upload a receipt under 3MB (সর্বোচ্চ ৩ মেগাবাইট ফাইল আপলোড করা যাবে).',
        },
        { status: 400 }
      );
    }

    // Validate type (images & PDF)
    const validMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
      'application/pdf',
    ];
    if (file.type && !validMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid file format. Please upload an image (PNG, JPG, WebP) or PDF document.',
        },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || (file.type === 'application/pdf' ? '.pdf' : '.jpg');
    const safeBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `receipt_${Date.now()}_${safeBaseName.slice(0, 30)}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/receipts/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      message: 'Receipt uploaded successfully (সর্বোচ্চ ৩MB ভ্যালিডেশন সফল).',
    });
  } catch (error) {
    console.error('Error uploading payment receipt:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload receipt: ' + (error.message || 'Server error') },
      { status: 500 }
    );
  }
}
