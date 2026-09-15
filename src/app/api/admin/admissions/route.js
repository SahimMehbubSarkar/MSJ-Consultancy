import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('payment_status') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 1. Compute 3 Summary Metric Cards
    const statsQuery = await query(`
      SELECT 
        COUNT(*)::int AS total_students,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END)::int AS total_paid_count,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN paid_amount ELSE 0 END), 0)::numeric AS total_paid_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS inquiries_done,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int AS rejected_count
      FROM student_admission
    `);

    const stats = statsQuery.rows[0] || {
      total_students: 0,
      total_paid_count: 0,
      total_paid_amount: 0,
      inquiries_done: 0,
      pending_count: 0,
      rejected_count: 0,
    };

    // 2. Fetch Latest Admissions with Filters
    let whereClauses = [];
    let params = [];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      whereClauses.push(`(
        LOWER(student_name) LIKE $${params.length} OR
        LOWER(email) LIKE $${params.length} OR
        phone LIKE $${params.length} OR
        LOWER(target_university) LIKE $${params.length} OR
        LOWER(application_no) LIKE $${params.length} OR
        LOWER(preferred_course) LIKE $${params.length}
      )`);
    }

    if (status && status !== 'all') {
      params.push(status);
      whereClauses.push(`status = $${params.length}`);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      params.push(paymentStatus);
      whereClauses.push(`payment_status = $${params.length}`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    params.push(limit);
    const limitParamIndex = params.length;
    params.push(offset);
    const offsetParamIndex = params.length;

    const admissionsQuery = await query(`
      SELECT 
        id,
        application_no,
        student_name,
        email,
        phone,
        gender,
        target_country,
        study_level,
        preferred_course,
        target_university,
        admission_logo,
        madhyamik_marks,
        hs_marks,
        status,
        payment_status,
        application_fee,
        paid_amount,
        payment_method,
        transaction_id,
        payment_receipt,
        template_header,
        template_footer,
        form_data,
        counselor_notes,
        created_at,
        updated_at
      FROM student_admission
      ${whereString}
      ORDER BY created_at DESC
      LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
    `, params);

    // Total count for current filter
    const countParams = params.slice(0, params.length - 2);
    const totalFilteredQuery = await query(`
      SELECT COUNT(*)::int AS count FROM student_admission ${whereString}
    `, countParams);

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: stats.total_students,
        totalPayments: {
          count: stats.total_paid_count,
          amount: parseFloat(stats.total_paid_amount),
        },
        inquiriesDone: stats.inquiries_done,
        pendingCount: stats.pending_count,
        rejectedCount: stats.rejected_count,
      },
      admissions: admissionsQuery.rows,
      pagination: {
        limit,
        offset,
        total: totalFilteredQuery.rows[0]?.count || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching student admissions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student admissions', error: error.message },
      { status: 500 }
    );
  }
}
