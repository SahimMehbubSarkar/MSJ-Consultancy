const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '12345678',
  database: process.env.DB_NAME || 'msj',
});

async function main() {
  try {
    console.log("Checking admin table columns...");
    await pool.query(`
      ALTER TABLE admin
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS bio TEXT;
    `);
    console.log("Successfully added avatar_url and bio columns to admin table!");

    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admin';
    `);
    console.log("Current admin columns:", res.rows.map(r => `${r.column_name} (${r.data_type})`));
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await pool.end();
  }
}

main();
