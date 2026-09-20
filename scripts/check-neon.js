const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const fs = require('fs');
const { Pool } = require('pg');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      env[key] = val;
    }
  }
});

const pool = new Pool({
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT || '5432'),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const tables = ['admin', 'admin_sessions', 'email_settings', 'hospital_requirement', 'site_settings', 'student_admission'];
  for (const t of tables) {
    const cols = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [t]
    );
    console.log(`\n=== ${t} ===`);
    cols.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
  }
  await pool.end();
}

check().catch(console.error);
