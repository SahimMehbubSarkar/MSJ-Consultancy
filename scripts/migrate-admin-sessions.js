const { Client } = require('pg');

async function createAdminSessionsTable() {
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
    console.log("Connected to MSJ database.");

    console.log("Creating 'admin_sessions' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID NOT NULL REFERENCES admin(id) ON DELETE CASCADE,
        session_token VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
    `);

    console.log("Migration successful! Verifying admin_sessions table...");
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admin_sessions'
      ORDER BY ordinal_position;
    `);
    console.log("Columns verified:", res.rows);

    await client.end();
  } catch (err) {
    console.error("Migration error:", err);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

createAdminSessionsTable();
