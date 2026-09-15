import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const TEMPLATE_PATH = path.join(process.cwd(), 'src', 'data', 'hospital-template.json');
const DEFAULT_TEMPLATE = {
  top_banner_title: 'OFFICIAL HOSPITAL CLINICAL TRAINING & PLACEMENT DOSSIER •',
  top_banner_tag: 'Direct Hospital Registry',
  template_header: 'MSJ Global Education • Official Hospital Consultation & Placement Application',
  template_footer: 'Certified by MSJ Clinical Coordination Board • 100% Verified Hospital Placement & Training Assistance',
  hospital_logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80',
  logo_align: 'left',
  logo_offset: 0,
  subtitle: 'Direct hospital recruitment guidance, clinical rotation verification, and department seat allocation.',
  payment_qr: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=msjglobal@icici%26pn=MSJ%20Hospital%20Services%26am=1500.00%26cu=INR%26tn=Hospital%20Processing%20Fee',
  payment_instructions: 'Scan via any UPI App (GPay, PhonePe, Paytm, BHIM) to pay Hospital Processing Fee. Keep Transaction Reference / UTR for instant verification.',
  application_fee: '1500',
  fields: [],
};

export async function GET() {
  try {
    const raw = fs.existsSync(TEMPLATE_PATH) ? fs.readFileSync(TEMPLATE_PATH, 'utf-8') : '{}';
    const stored = JSON.parse(raw);
    return NextResponse.json({ success: true, template: { ...DEFAULT_TEMPLATE, ...stored } });
  } catch (error) {
    console.error('Error loading hospital template:', error);
    return NextResponse.json({ success: true, template: DEFAULT_TEMPLATE });
  }
}
