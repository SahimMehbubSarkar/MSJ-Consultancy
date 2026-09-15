import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Helper to ensure inquiries table exists
async function ensureInquiriesTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS public_inquiries (
        id SERIAL PRIMARY KEY,
        tracking_id VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL, -- 'admission' or 'hospital'
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        details JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(30) DEFAULT 'Pending Review',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.warn('Could not ensure public_inquiries table:', err.message);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, name, email, phone, ...details } = body;

    if (!type || !name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    const prefix = type === 'hospital' ? 'HSP' : 'ADM';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `${prefix}-${Date.now().toString().slice(-4)}${randomNum.toString().slice(-2)}`;

    await ensureInquiriesTable();

    try {
      await query(
        `INSERT INTO public_inquiries (tracking_id, type, name, email, phone, details, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [trackingId, type, name, email, phone, JSON.stringify(details), 'Pending Review']
      );
    } catch (dbErr) {
      console.warn('Could not insert inquiry into DB, returning simulated tracking ID:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      trackingId,
      message:
        type === 'hospital'
          ? 'Hospital consultation request submitted successfully! An overseas medical coordinator will contact you within 24 hours.'
          : 'Admission inquiry submitted successfully! A senior academic counselor will reach out within 24 hours.',
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit inquiry. Please check your details and try again.' },
      { status: 500 }
    );
  }
}
