const { Client } = require('pg');

async function addTermsAcceptedColumns() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '12345678',
    database: process.env.DB_NAME || 'msj',
    ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('Connected to MSJ database.');

    const tables = ['student_admission', 'hospital_requirement'];

    for (const table of tables) {
      const check = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = $1 AND column_name = 'terms_accepted'
      `, [table]);

      if (check.rows.length > 0) {
        console.log(`Column 'terms_accepted' already exists in '${table}' table.`);
      } else {
        console.log(`Adding 'terms_accepted' BOOLEAN column to '${table}'...`);
        await client.query(`ALTER TABLE ${table} ADD COLUMN terms_accepted BOOLEAN DEFAULT false;`);
        console.log(`Column 'terms_accepted' added to '${table}' successfully!`);
      }
    }

    await client.end();
    console.log('Terms acceptance columns migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

addTermsAcceptedColumns();
