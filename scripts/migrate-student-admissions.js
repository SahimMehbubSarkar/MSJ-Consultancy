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
        counselor_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_admission_status ON student_admission (status);
      CREATE INDEX IF NOT EXISTS idx_admission_payment ON student_admission (payment_status);
      CREATE INDEX IF NOT EXISTS idx_admission_created_at ON student_admission (created_at DESC);
    `);
    console.log("Table 'student_admission' and indexes created successfully!");

    // 3. Seed realistic initial records if table is empty
    const checkCount = await client.query(`SELECT COUNT(*) FROM student_admission`);
    if (parseInt(checkCount.rows[0].count) === 0) {
      console.log("Seeding initial student admissions...");

      const initialStudents = [
        {
          application_no: "ADM-2026-101",
          student_name: "Rahim Uddin",
          email: "rahim.u@gmail.com",
          phone: "+880 1711-234567",
          gender: "Male",
          target_country: "Karnataka, India",
          study_level: "BSc Nursing",
          preferred_course: "BSc Nursing (Clinical Specialization)",
          target_university: "Vydehi Institute of Nursing & Medical Sciences",
          admission_logo: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&auto=format&fit=crop&q=80",
          madhyamik_marks: "82% (574/700)",
          hs_marks: "86% (430/500)",
          status: "pending",
          payment_status: "paid",
          application_fee: 1000.00,
          paid_amount: 1000.00,
          payment_method: "bKash Online",
          transaction_id: "BKSH-92847291A",
          counselor_notes: "Original marksheet and transfer certificate verified. Eligible for direct seat quota.",
        },
        {
          application_no: "ADM-2026-102",
          student_name: "Sadia Karim",
          email: "sadia.k@outlook.com",
          phone: "+880 1822-987654",
          gender: "Female",
          target_country: "Tamil Nadu, India",
          study_level: "GNM / Nursing",
          preferred_course: "General Nursing & Midwifery",
          target_university: "Apollo College of Nursing, Chennai",
          admission_logo: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=100&auto=format&fit=crop&q=80",
          madhyamik_marks: "79% (553/700)",
          hs_marks: "81% (405/500)",
          status: "completed",
          payment_status: "paid",
          application_fee: 1000.00,
          paid_amount: 1000.00,
          payment_method: "Nagad App",
          transaction_id: "NGD-83719284K",
          counselor_notes: "Seat confirmed. Provisional admission letter issued and sent via email.",
        },
        {
          application_no: "ADM-2026-103",
          student_name: "Nusrat Jahan",
          email: "nusrat.j@gmail.com",
          phone: "+880 1933-456789",
          gender: "Female",
          target_country: "Kerala, India",
          study_level: "BSc Nursing",
          preferred_course: "BSc Critical Care Nursing",
          target_university: "Amrita College of Nursing, Kochi",
          admission_logo: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&auto=format&fit=crop&q=80",
          madhyamik_marks: "75% (525/700)",
          hs_marks: "78% (390/500)",
          status: "pending",
          payment_status: "pending",
          application_fee: 1000.00,
          paid_amount: 0.00,
          payment_method: "Bank Transfer",
          transaction_id: "EBL-PEND-9182",
          counselor_notes: "Bank deposit slip pending verification from accounts department.",
        },
        {
          application_no: "ADM-2026-104",
          student_name: "Tanvir Ahmed",
          email: "tanvir.a@yahoo.com",
          phone: "+880 1644-321098",
          gender: "Male",
          target_country: "West Bengal, India",
          study_level: "BSc Medical Lab Technology",
          preferred_course: "BSc MLT (Pathology & Bio-Chemistry)",
          target_university: "Peerless Hospital & B.K. Roy Research Centre",
          admission_logo: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=100&auto=format&fit=crop&q=80",
          madhyamik_marks: "71% (497/700)",
          hs_marks: "73% (365/500)",
          status: "completed",
          payment_status: "paid",
          application_fee: 1000.00,
          paid_amount: 1000.00,
          payment_method: "bKash Merchant",
          transaction_id: "BKSH-10293847X",
          counselor_notes: "Counseling done. Clinical training batch allocated for Spring 2026.",
        },
        {
          application_no: "ADM-2026-105",
          student_name: "Faisal Rahman",
          email: "faisal.r@gmail.com",
          phone: "+880 1755-678901",
          gender: "Male",
          target_country: "Punjab, India",
          study_level: "BSc Operation Theatre Tech",
          preferred_course: "BSc OTT & Anesthesia",
          target_university: "Christian Medical College & Hospital, Ludhiana",
          admission_logo: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=100&auto=format&fit=crop&q=80",
          madhyamik_marks: "64% (448/700)",
          hs_marks: "58% (290/500)",
          status: "rejected",
          payment_status: "unpaid",
          application_fee: 1000.00,
          paid_amount: 0.00,
          payment_method: "None",
          transaction_id: "",
          counselor_notes: "Minimum HS eligibility criteria not met (required 60%+ in Science PCB). Student informed.",
        },
        {
          application_no: "ADM-2026-106",
          student_name: "Pooja Das",
          email: "pooja.d@gmail.com",
          phone: "+880 1722-112233",
          gender: "Female",
          target_country: "Karnataka, India",
          study_level: "BSc Nursing",
          preferred_course: "BSc Nursing 4-Year Integrated",
          target_university: "Manipal College of Nursing, MAHE",
          admission_logo: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&auto=format&fit=crop&q=80",
          madhyamik_marks: "88% (616/700)",
          hs_marks: "91% (455/500)",
          status: "completed",
          payment_status: "paid",
          application_fee: 1000.00,
          paid_amount: 1000.00,
          payment_method: "GPay / UPI",
          transaction_id: "UPI-77441188001",
          counselor_notes: "Top merit scholarship awarded (25% tuition fee waiver). Enrolment finalized.",
        },
        {
          application_no: "ADM-2026-107",
          student_name: "Shakib Al Hasan",
          email: "shakib.dev@gmail.com",
          phone: "+880 1833-445566",
          gender: "Male",
          target_country: "Andhra Pradesh, India",
          study_level: "BSc Nursing",
          preferred_course: "BSc Nursing",
          target_university: "Narayana College of Nursing, Nellore",
          admission_logo: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=100&auto=format&fit=crop&q=80",
          madhyamik_marks: "80% (560/700)",
          hs_marks: "83% (415/500)",
          status: "pending",
          payment_status: "paid",
          application_fee: 1000.00,
          paid_amount: 1000.00,
          payment_method: "Rocket Pay",
          transaction_id: "RCKT-49201948",
          counselor_notes: "Under document verification.",
        }
      ];

      for (const s of initialStudents) {
        await client.query(`
          INSERT INTO student_admission (
            application_no, student_name, email, phone, gender,
            target_country, study_level, preferred_course, target_university,
            admission_logo, madhyamik_marks, hs_marks, status,
            payment_status, application_fee, paid_amount, payment_method,
            transaction_id, counselor_notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        `, [
          s.application_no, s.student_name, s.email, s.phone, s.gender,
          s.target_country, s.study_level, s.preferred_course, s.target_university,
          s.admission_logo, s.madhyamik_marks, s.hs_marks, s.status,
          s.payment_status, s.application_fee, s.paid_amount, s.payment_method,
          s.transaction_id, s.counselor_notes
        ]);
      }
      console.log(`Seeded ${initialStudents.length} realistic student admissions.`);
    } else {
      console.log(`Table 'student_admission' already contains ${checkCount.rows[0].count} records.`);
    }

    await client.end();
    console.log("Student admissions migration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

migrateStudentAdmissions();
