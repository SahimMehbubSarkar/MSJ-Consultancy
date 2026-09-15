const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: '12345678', database: 'msj' });

async function run() {
  const r = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
  console.log('TABLES:', r.rows.map(x => x.table_name).join(', '));
  
  // Check if any hospital-related table exists
  for (const row of r.rows) {
    if (row.table_name.includes('hospital') || row.table_name.includes('inquiry') || row.table_name.includes('inquir')) {
      const cols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`, [row.table_name]);
      console.log(`\nTABLE: ${row.table_name}`);
      cols.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
      
      const count = await pool.query(`SELECT COUNT(*) FROM ${row.table_name}`);
      console.log(`  ROW COUNT: ${count.rows[0].count}`);
    }
  }
  await pool.end();
}

run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
