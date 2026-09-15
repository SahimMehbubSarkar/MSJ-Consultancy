const { Client } = require('pg');

async function addCvAttachColumn() {
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

    // Check if column already exists
    const check = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'hospital_requirement' AND column_name = 'cv_attach'
    `);

    if (check.rows.length > 0) {
      console.log("Column 'cv_attach' already exists in hospital_requirement table.");
      return;
    }

    console.log("Adding 'cv_attach' TEXT column to hospital_requirement table...");
    await client.query(`ALTER TABLE hospital_requirement ADD COLUMN cv_attach TEXT;`);
    console.log("Column 'cv_attach' added successfully!");
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addCvAttachColumn();
