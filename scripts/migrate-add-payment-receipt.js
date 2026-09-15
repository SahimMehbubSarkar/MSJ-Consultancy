const { Client } = require('pg');

async function addPaymentReceiptColumn() {
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

    console.log("Adding 'payment_receipt' column to 'student_admission' table...");
    await client.query(`
      ALTER TABLE student_admission 
      ADD COLUMN IF NOT EXISTS payment_receipt TEXT;
    `);

    console.log("Ensuring 'target_country' column is TEXT type to support multi-select states...");
    await client.query(`
      ALTER TABLE student_admission 
      ALTER COLUMN target_country TYPE TEXT;
    `);

    console.log("Migration successful! Verifying columns in student_admission...");
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_admission' AND column_name IN ('payment_receipt', 'target_country');
    `);
    console.log("Columns verified:", res.rows);

    await client.end();
  } catch (err) {
    console.error("Migration error:", err);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

addPaymentReceiptColumn();
