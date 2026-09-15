import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();

    const candidateName = body.candidate_name || body.candidateName || '';
    const email = body.email || '';
    const phone = body.phone || '';
    const gender = body.gender || 'Not Specified';
    const targetState = body.target_state || body.targetState || 'West Bengal';
    const qualification = body.qualification || 'BSc Nursing (4-Year Degree)';
    const targetHospital = body.target_hospital || body.targetHospital || 'Any Verified MSJ Network Hospital';
    const department = body.department || 'General Nursing & Patient Care';
    const madhyamikMarks = body.madhyamik_marks || body.madhyamikMarks || 'Awaiting Verification';
    const hsMarks = body.hs_marks || body.hsMarks || 'Awaiting Verification';
    const applicationFee = parseFloat(body.application_fee) || 1500.00;
    const paymentReceipt = body.payment_receipt || body.receipt || '';
    const cvAttach = body.cv_attach || body.cv || '';
    const paymentMethod = paymentReceipt ? 'UPI / QR Scan' : (body.payment_method || null);
    const paymentStatus = paymentReceipt ? 'paid' : (body.payment_status || 'unpaid');
    const paidAmount = paymentReceipt ? applicationFee : 0.00;
    const coordinatorNotes = body.coordinator_notes || body.notes || 'Online hospital requirement inquiry submitted.';
    const templateHeader = body.template_header || 'MSJ Global Education • Official Hospital Consultation & Placement Application';
    const templateFooter = body.template_footer || 'Certified by MSJ Clinical Coordination Board • 100% Verified Hospital Placement & Training Assistance';
    const formData = body.form_data || {};
    const termsAccepted = body.terms_accepted === true;

    if (!candidateName.trim() || !email.trim() || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Candidate name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { success: false, message: 'You must accept the Terms & Conditions to proceed.' },
        { status: 400 }
      );
    }

    // Generate guaranteed unique Application Number
    const year = new Date().getFullYear();
    let applicationNo = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts++;
      const timePart = Date.now().toString().slice(-6);
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const candidateAppNo = `HSP-${year}-${timePart}${randPart}`;
      
      const check = await query(`SELECT id FROM hospital_requirement WHERE application_no = $1 LIMIT 1`, [candidateAppNo]);
      if (check.rows.length === 0) {
        applicationNo = candidateAppNo;
        isUnique = true;
      }
    }

    if (!applicationNo) {
      applicationNo = `HSP-${year}-${Date.now()}`;
    }

    const insertResult = await query(
      `
      INSERT INTO hospital_requirement (
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
        terms_accepted,
        coordinator_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
      `,
      [
        applicationNo,
        candidateName,
        email,
        phone,
        gender,
        targetState,
        qualification,
        targetHospital,
        department,
        madhyamikMarks,
        hsMarks,
        'pending',
        paymentStatus,
        applicationFee,
        paidAmount,
        paymentMethod,
        body.transaction_id || (paymentReceipt ? `UPI-${Date.now().toString().slice(-8)}` : null),
        paymentReceipt,
        cvAttach,
        templateHeader,
        templateFooter,
        JSON.stringify(formData),
        termsAccepted,
        coordinatorNotes
      ]
    );

    const createdRecord = insertResult.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Your hospital requirement inquiry has been registered with MSJ Global Education.',
      trackingId: createdRecord.application_no,
      hospital: createdRecord,
    });
  } catch (error) {
    console.error('Error submitting hospital requirement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit hospital requirement', error: error.message },
      { status: 500 }
    );
  }
}
