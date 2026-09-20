/**
 * MSJ Schema Sync — idempotent migration script.
 *
 * Ensures every table/column/index/seed row the app needs exists.
 * Safe to run repeatedly: CREATE TABLE IF NOT EXISTS + per-column
 * information_schema checks + ADD COLUMN IF NOT EXISTS. Never drops
 * or alters existing data.
 *
 * Usage:  node scripts/sync-schema.js
 * (reads .env automatically — no --env-file flag needed)
 */

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load .env manually (same approach as check-neon.js) so the script
// works with plain `node scripts/sync-schema.js` on any machine.
const envPath = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > -1) {
        env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
      }
    }
  });
}

/**
 * Expected schema. Order matters (FK dependencies).
 * Each column: [name, DDL definition used in CREATE TABLE and ALTER TABLE ADD COLUMN].
 */
const SCHEMA = [
  {
    table: 'admin',
    columns: [
      ['id', 'UUID PRIMARY KEY DEFAULT gen_random_uuid()'],
      ['name', 'VARCHAR(100) NOT NULL'],
      ['email', 'VARCHAR(150) UNIQUE NOT NULL'],
      ['phone', 'VARCHAR(20) UNIQUE NOT NULL'],
      ['password_hash', 'VARCHAR(255) NOT NULL'],
      ['role', "VARCHAR(30) DEFAULT 'superadmin'"],
      ['is_active', 'BOOLEAN DEFAULT true'],
      ['failed_attempts', 'INT DEFAULT 0'],
      ['locked_until', 'TIMESTAMPTZ'],
      ['last_login_at', 'TIMESTAMPTZ'],
      ['last_login_ip', 'VARCHAR(45)'],
      ['avatar_url', 'TEXT'],
      ['bio', 'TEXT'],
      ['created_at', 'TIMESTAMPTZ DEFAULT NOW()'],
      ['updated_at', 'TIMESTAMPTZ DEFAULT NOW()'],
    ],
    extra: [
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_email ON admin (LOWER(email))',
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_phone ON admin (phone)',
    ],
  },
  {
    table: 'admin_sessions',
    columns: [
      ['id', 'UUID PRIMARY KEY DEFAULT gen_random_uuid()'],
      ['admin_id', 'UUID NOT NULL REFERENCES admin(id) ON DELETE CASCADE'],
      ['session_token', 'VARCHAR(128) NOT NULL UNIQUE'],
      ['expires_at', 'TIMESTAMPTZ NOT NULL'],
      ['last_active_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
      ['is_revoked', 'BOOLEAN NOT NULL DEFAULT FALSE'],
      ['ip_address', 'VARCHAR(45)'],
      ['user_agent', 'TEXT'],
      ['created_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
    ],
    extra: [
      'CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token)',
      'CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id)',
      'CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at)',
    ],
  },
  {
    table: 'site_settings',
    columns: [
      ['id', 'INT PRIMARY KEY DEFAULT 1'],
      ['site_name', "VARCHAR(255) NOT NULL DEFAULT 'MSJ Global Education Consultancy'"],
      ['site_tagline', "VARCHAR(255) NOT NULL DEFAULT 'Your Gateway to Global Education'"],
      ['contact_email', "VARCHAR(255) NOT NULL DEFAULT 'msjglobaleducationconsultancy@gmail.com'"],
      ['contact_phone', "VARCHAR(50) NOT NULL DEFAULT '+91 9635953116'"],
      ['address', "TEXT NOT NULL DEFAULT 'Kolkata, West Bengal, India'"],
      ['timezone', "VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata'"],
      ['maintenance_mode', 'BOOLEAN NOT NULL DEFAULT false'],
      ['site_icon_url', 'TEXT'],
      ['favicon_url', 'TEXT'],
      ['updated_at', 'TIMESTAMPTZ DEFAULT NOW()'],
    ],
    extra: ['INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING'],
  },
  {
    table: 'email_settings',
    columns: [
      ['id', 'INT PRIMARY KEY DEFAULT 1'],
      ['smtp_host', "VARCHAR(255) NOT NULL DEFAULT 'smtp.gmail.com'"],
      ['smtp_port', "VARCHAR(10) NOT NULL DEFAULT '587'"],
      ['smtp_user', "VARCHAR(255) NOT NULL DEFAULT 'noreply@msjglobal.edu'"],
      ['smtp_password', "VARCHAR(255) NOT NULL DEFAULT ''"],
      ['from_name', "VARCHAR(255) NOT NULL DEFAULT 'MSJ Global Education'"],
      ['from_email', "VARCHAR(255) NOT NULL DEFAULT 'noreply@msjglobal.edu'"],
      ['encryption', "VARCHAR(10) NOT NULL DEFAULT 'TLS'"],
      ['email_enabled', 'BOOLEAN NOT NULL DEFAULT true'],
      ['updated_at', 'TIMESTAMPTZ DEFAULT NOW()'],
    ],
    extra: ['INSERT INTO email_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING'],
  },
  {
    table: 'student_admission',
    columns: [
      ['id', 'UUID PRIMARY KEY DEFAULT gen_random_uuid()'],
      ['application_no', 'VARCHAR(50) UNIQUE NOT NULL'],
      ['student_name', 'VARCHAR(150) NOT NULL'],
      ['email', 'VARCHAR(150) NOT NULL'],
      ['phone', 'VARCHAR(50) NOT NULL'],
      ['gender', 'VARCHAR(20)'],
      ['target_country', 'TEXT'],
      ['study_level', 'VARCHAR(100)'],
      ['preferred_course', 'VARCHAR(200)'],
      ['target_university', 'VARCHAR(200)'],
      ['admission_logo', 'TEXT'],
      ['madhyamik_marks', 'VARCHAR(50)'],
      ['hs_marks', 'VARCHAR(50)'],
      ['status', "VARCHAR(30) DEFAULT 'pending'"],
      ['payment_status', "VARCHAR(30) DEFAULT 'unpaid'"],
      ['application_fee', 'NUMERIC(10,2) DEFAULT 1000.00'],
      ['paid_amount', 'NUMERIC(10,2) DEFAULT 0.00'],
      ['payment_method', 'VARCHAR(50)'],
      ['transaction_id', 'VARCHAR(100)'],
      ['payment_receipt', 'TEXT'],
      ['template_header', "VARCHAR(255) DEFAULT 'MSJ Global Education • Official Admission Application'"],
      ['template_footer', "VARCHAR(255) DEFAULT 'Certified by MSJ Academic Board • 100% Clinical Training Assistance'"],
      ['form_data', "JSONB DEFAULT '{}'"],
      ['terms_accepted', 'BOOLEAN DEFAULT false'],
      ['counselor_notes', 'TEXT'],
      ['created_at', 'TIMESTAMPTZ DEFAULT NOW()'],
      ['updated_at', 'TIMESTAMPTZ DEFAULT NOW()'],
    ],
    extra: [
      'CREATE INDEX IF NOT EXISTS idx_admission_status ON student_admission (status)',
      'CREATE INDEX IF NOT EXISTS idx_admission_payment ON student_admission (payment_status)',
      'CREATE INDEX IF NOT EXISTS idx_admission_created_at ON student_admission (created_at DESC)',
    ],
  },
  {
    table: 'hospital_requirement',
    columns: [
      ['id', 'UUID PRIMARY KEY DEFAULT gen_random_uuid()'],
      ['application_no', 'VARCHAR(50) UNIQUE NOT NULL'],
      ['candidate_name', 'VARCHAR(150) NOT NULL'],
      ['email', 'VARCHAR(150) NOT NULL'],
      ['phone', 'VARCHAR(50) NOT NULL'],
      ['gender', 'VARCHAR(20)'],
      ['target_state', 'VARCHAR(100)'],
      ['qualification', 'VARCHAR(150)'],
      ['target_hospital', 'VARCHAR(200)'],
      ['department', 'VARCHAR(150)'],
      ['madhyamik_marks', 'VARCHAR(50)'],
      ['hs_marks', 'VARCHAR(50)'],
      ['status', "VARCHAR(30) DEFAULT 'pending'"],
      ['payment_status', "VARCHAR(30) DEFAULT 'unpaid'"],
      ['application_fee', 'NUMERIC(10,2) DEFAULT 1500.00'],
      ['paid_amount', 'NUMERIC(10,2) DEFAULT 0.00'],
      ['payment_method', 'VARCHAR(50)'],
      ['transaction_id', 'VARCHAR(100)'],
      ['payment_receipt', 'TEXT'],
      ['cv_attach', 'TEXT'],
      ['template_header', "VARCHAR(255) DEFAULT 'MSJ Global Education • Official Hospital Consultation & Placement Application'"],
      ['template_footer', "VARCHAR(255) DEFAULT 'Certified by MSJ Clinical Coordination Board • 100% Verified Hospital Placement & Training Assistance'"],
      ['form_data', "JSONB DEFAULT '{}'"],
      ['terms_accepted', 'BOOLEAN DEFAULT false'],
      ['coordinator_notes', 'TEXT'],
      ['created_at', 'TIMESTAMPTZ DEFAULT NOW()'],
      ['updated_at', 'TIMESTAMPTZ DEFAULT NOW()'],
    ],
    extra: [
      'CREATE INDEX IF NOT EXISTS idx_hospital_status ON hospital_requirement (status)',
      'CREATE INDEX IF NOT EXISTS idx_hospital_payment ON hospital_requirement (payment_status)',
      'CREATE INDEX IF NOT EXISTS idx_hospital_created_at ON hospital_requirement (created_at DESC)',
    ],
  },
  {
    table: 'public_inquiries',
    columns: [
      ['id', 'SERIAL PRIMARY KEY'],
      ['tracking_id', 'VARCHAR(50) UNIQUE NOT NULL'],
      ['type', 'VARCHAR(20) NOT NULL'],
      ['name', 'VARCHAR(150) NOT NULL'],
      ['email', 'VARCHAR(150) NOT NULL'],
      ['phone', 'VARCHAR(50) NOT NULL'],
      ['details', "JSONB NOT NULL DEFAULT '{}'"],
      ['status', "VARCHAR(30) DEFAULT 'Pending Review'"],
      ['created_at', 'TIMESTAMPTZ DEFAULT NOW()'],
    ],
  },
];

async function sync() {
  const client = new Client({
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT || '5432'),
    user: env.DB_USER || 'postgres',
    password: env.DB_PASSWORD || '12345678',
    database: env.DB_NAME || 'msj',
    ssl: env.DB_HOST ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 30000,
  });

  const failures = [];

  try {
    await client.connect();
    console.log(`Connected to ${env.DB_HOST || 'localhost'}/${env.DB_NAME || 'msj'}\n`);

    for (const { table, columns, extra = [] } of SCHEMA) {
      console.log(`=== ${table} ===`);

      // 1. Ensure table exists (full definition used on fresh DBs)
      const colDefs = columns.map(([name, ddl]) => `  ${name} ${ddl}`).join(',\n');
      await client.query(`CREATE TABLE IF NOT EXISTS ${table} (\n${colDefs}\n)`);

      // 2. Ensure every expected column exists (patch existing tables)
      for (const [name, ddl] of columns) {
        const check = await client.query(
          `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
          [table, name]
        );
        if (check.rows.length > 0) continue;

        if (ddl.includes('PRIMARY KEY')) {
          console.log(`  !! '${name}' missing but is a PRIMARY KEY — add manually`);
          failures.push(`${table}.${name} (primary key missing)`);
          continue;
        }

        try {
          await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${name} ${ddl}`);
          console.log(`  + added column '${name}'`);
        } catch (err) {
          console.log(`  !! failed adding '${name}': ${err.message}`);
          failures.push(`${table}.${name} (${err.message})`);
        }
      }

      // 3. Indexes and seed rows
      for (const stmt of extra) {
        try {
          await client.query(stmt);
        } catch (err) {
          console.log(`  !! index/seed failed: ${err.message}`);
          failures.push(`${table} extra (${err.message})`);
        }
      }

      const count = await client.query(
        `SELECT COUNT(*)::int AS n FROM information_schema.columns WHERE table_name = $1`,
        [table]
      );
      console.log(`  ok — ${count.rows[0].n}/${columns.length} columns present\n`);
    }
  } catch (err) {
    console.error('Schema sync failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }

  if (failures.length > 0) {
    console.log('Finished with failures:');
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exitCode = 1;
  } else {
    console.log('Schema sync complete — all tables, columns, indexes verified.');
  }
}

sync();
