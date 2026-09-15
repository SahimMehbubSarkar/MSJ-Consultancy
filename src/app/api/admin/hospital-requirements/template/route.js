import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const TEMPLATE_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'hospital-template.json');

export async function GET() {
  try {
    if (fs.existsSync(TEMPLATE_FILE_PATH)) {
      const data = fs.readFileSync(TEMPLATE_FILE_PATH, 'utf-8');
      return NextResponse.json({
        success: true,
        template: JSON.parse(data),
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Hospital template configuration file not found',
    }, { status: 404 });
  } catch (error) {
    console.error('Error reading hospital template config:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to read hospital template config',
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const dir = path.dirname(TEMPLATE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(TEMPLATE_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Hospital form template configuration updated successfully',
      template: body,
    });
  } catch (error) {
    console.error('Error saving hospital template config:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to save hospital template config',
      error: error.message,
    }, { status: 500 });
  }
}
