const { Client } = require('pg');

async function migrateStudentAdmissions() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '12345678',
    database: process.env.DB_NAME || 'msj',
  });

  try {
    await client.connect();
    console.log("Connected to MSJ database.");

    // 1. Drop public_inquiries table as requested
    console.log("Dropping generic 'public_inquiries' table if exists...");
    await client.query(`DROP TABLE IF EXISTS public_inquiries CASCADE;`);
    console.log("Dropped 'public_inquiries' successfully.");

    // 2. Create dedicated student_admission table
    console.log("Creating 'student_admission' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_admission (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_no VARCHAR(50) UNIQUE NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        gender VARCHAR(20),
        target_country TEXT,
        study_level VARCHAR(100),
        preferred_course VARCHAR(200),
        target_university VARCHAR(200),
        admission_logo TEXT,
        madhyamik_marks VARCHAR(50),
        hs_marks VARCHAR(50),
        status VARCHAR(30) DEFAULT 'pending',
        payment_status VARCHAR(30) DEFAULT 'unpaid',
        application_fee NUMERIC(10,2) DEFAULT 1000.00,
        paid_amount NUMERIC(10,2) DEFAULT 0.00,
        payment_method VARCHAR(50),
        transaction_id VARCHAR(100),
        payment_receipt TEXT,
        template_header VARCHAR(255) DEFAULT 'MSJ Global Education • Official Admission Application',
        template_footer VARCHAR(255) DEFAULT 'Certified by MSJ Academic Board • 100% Clinical Training Assistance',
        form_data JSONB DEFAULT '{}',
        terms_accepted BOOLEAN DEFAULT false,
        counselor_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_admission_status ON student_admission (status);
      CREATE INDEX IF NOT EXISTS idx_admission_payment ON student_admission (payment_status);
      CREATE INDEX IF NOT EXISTS idx_admission_created_at ON student_admission (created_at DESC);
    `);
    console.log("Table 'student_admission' and indexes created successfully!");

    await client.end();
    console.log("Student admissions migration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

migrateStudentAdmissions();
