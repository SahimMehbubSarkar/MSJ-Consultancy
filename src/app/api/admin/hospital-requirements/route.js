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
        COUNT(*)::int AS total_inquiries,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END)::int AS total_paid_count,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN paid_amount ELSE 0 END), 0)::numeric AS total_paid_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int AS rejected_count
      FROM hospital_requirement
    `);

    const stats = statsQuery.rows[0] || {
      total_inquiries: 0,
      total_paid_count: 0,
      total_paid_amount: 0,
      completed_count: 0,
      pending_count: 0,
      rejected_count: 0,
    };

    // 2. Fetch Latest Records with Filters
    let whereClauses = [];
    let params = [];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      whereClauses.push(`(
        LOWER(candidate_name) LIKE $${params.length} OR
        LOWER(email) LIKE $${params.length} OR
        phone LIKE $${params.length} OR
        LOWER(target_hospital) LIKE $${params.length} OR
        LOWER(application_no) LIKE $${params.length} OR
        LOWER(department) LIKE $${params.length}
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

    const recordsQuery = await query(`
      SELECT 
        id,
        application_no,
        candidate_name,
        email,
        phone,
        gender,
        target_state,
        qualification,
        target_hospital,
        department,
        madhyamik_marks,
        hs_marks,
        status,
        payment_status,
        application_fee,
        paid_amount,
        payment_method,
        transaction_id,
        payment_receipt,
        cv_attach,
        template_header,
        template_footer,
        form_data,
        coordinator_notes,
        created_at,
        updated_at
      FROM hospital_requirement
      ${whereString}
      ORDER BY created_at DESC
      LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
    `, params);

    // Total count for current filter
    const countParams = params.slice(0, params.length - 2);
    const totalFilteredQuery = await query(`
      SELECT COUNT(*)::int AS count FROM hospital_requirement ${whereString}
    `, countParams);

    return NextResponse.json({
      success: true,
      stats: {
        totalInquiries: stats.total_inquiries,
        totalPayments: {
          count: stats.total_paid_count,
          amount: parseFloat(stats.total_paid_amount || 0),
        },
        completedCount: stats.completed_count,
        pendingCount: stats.pending_count,
        rejectedCount: stats.rejected_count,
      },
      records: recordsQuery.rows,
      pagination: {
        limit,
        offset,
        total: totalFilteredQuery.rows[0]?.count || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching hospital requirements:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hospital requirements', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      await query(`DELETE FROM hospital_requirement`);
      return NextResponse.json({
        success: true,
        message: 'All hospital requirement inquiries cleared successfully',
      });
    }

    const body = await request.json().catch(() => ({}));
    if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
      await query(`DELETE FROM hospital_requirement WHERE id = ANY($1)`, [body.ids]);
      return NextResponse.json({
        success: true,
        message: `${body.ids.length} inquiries deleted successfully`,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid delete request parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting hospital requirements:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear hospital requirements', error: error.message },
      { status: 500 }
    );
  }
}
