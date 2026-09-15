import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(
      `SELECT * FROM hospital_requirement WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Hospital requirement record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      record: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching hospital requirement record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch record', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      'status',
      'payment_status',
      'paid_amount',
      'payment_method',
      'transaction_id',
      'coordinator_notes',
      'template_header',
      'template_footer',
      'target_hospital',
      'department',
      'madhyamik_marks',
      'hs_marks',
      'cv_attach',
    ];

    const updates = [];
    const values = [];

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        values.push(body[key]);
        updates.push(`${key} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields provided to update' },
        { status: 400 }
      );
    }

    values.push(id);
    const idParamIndex = values.length;

    const updateQuery = `
      UPDATE hospital_requirement 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${idParamIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Record not found to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hospital requirement record updated successfully',
      record: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating hospital requirement record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update record', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(
      `DELETE FROM hospital_requirement WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Record not found to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hospital requirement record deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Error deleting hospital requirement record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete record', error: error.message },
      { status: 500 }
    );
  }
}
