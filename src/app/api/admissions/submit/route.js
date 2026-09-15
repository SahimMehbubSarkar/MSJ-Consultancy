import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();

    const studentName = body.student_name || body.name || '';
    const email = body.email || '';
    const phone = body.phone || '';
    const gender = body.gender || 'Not Specified';
    const targetCountry = body.target_country || body.country || 'India';
    const studyLevel = body.study_level || body.level || 'BSc Nursing';
    const preferredCourse = body.preferred_course || body.course || 'BSc Nursing';
    const targetUniversity = body.target_university || body.university || 'Affiliated Medical College & University';
    const admissionLogo = body.admission_logo || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&auto=format&fit=crop&q=80';
    const madhyamikMarks = body.madhyamik_marks || body.madhyamikMarks || 'Awaiting Verification';
    const hsMarks = body.hs_marks || body.hsMarks || 'Awaiting Verification';
    const counselorNotes = body.counselor_notes || body.notes || 'Online portal submission awaiting counselor initial review.';
    const templateHeader = body.template_header || 'MSJ Global Education • Official Admission Application';
    const templateFooter = body.template_footer || 'Certified by MSJ Academic Board • 100% Clinical Training Assistance';
    const paymentReceipt = body.payment_receipt || body.receipt || '';
    const paymentMethod = body.payment_method || (paymentReceipt ? 'UPI / QR Scan' : null);
    const paymentStatus = paymentReceipt ? 'pending' : (body.payment_status || 'unpaid');
    const paidAmount = paymentReceipt ? 0.00 : (parseFloat(body.paid_amount) || 0.00);
    const formData = body.form_data || {};
    const termsAccepted = body.terms_accepted === true;

    if (!studentName.trim() || !email.trim() || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Student name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { success: false, message: 'You must accept the Terms & Conditions to proceed.' },
        { status: 400 }
      );
    }

    // Generate guaranteed unique application number
    const year = new Date().getFullYear();
    let applicationNo = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts++;
      const timePart = Date.now().toString().slice(-6);
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const candidateAppNo = `ADM-${year}-${timePart}${randPart}`;
      
      const check = await query(`SELECT id FROM student_admission WHERE application_no = $1 LIMIT 1`, [candidateAppNo]);
      if (check.rows.length === 0) {
        applicationNo = candidateAppNo;
        isUnique = true;
      }
    }

    if (!applicationNo) {
      applicationNo = `ADM-${year}-${Date.now()}`;
    }

    const insertResult = await query(
      `
      INSERT INTO student_admission (
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
        terms_accepted,
        counselor_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
      `,
      [
        applicationNo,
        studentName,
        email,
        phone,
        gender,
        targetCountry,
        studyLevel,
        preferredCourse,
        targetUniversity,
        admissionLogo,
        madhyamikMarks,
        hsMarks,
        'pending',
        paymentStatus,
        1000.00,
        paidAmount,
        paymentMethod,
        body.transaction_id || (paymentReceipt ? `UPI-${Date.now().toString().slice(-8)}` : null),
        paymentReceipt,
        templateHeader,
        templateFooter,
        JSON.stringify(formData),
        termsAccepted,
        counselorNotes
      ]
    );

    const createdRecord = insertResult.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Your official admission application has been registered with MSJ Global Education.',
      trackingId: createdRecord.application_no,
      admission: createdRecord,
    });
  } catch (error) {
    console.error('Error submitting student admission application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit student admission application', error: error.message },
      { status: 500 }
    );
  }
}
