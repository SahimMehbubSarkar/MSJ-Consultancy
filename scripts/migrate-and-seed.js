const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function migrateAndSeed() {
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

    // 1. Create admin table
    console.log("Creating 'admin' table if not exists...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(30) DEFAULT 'superadmin',
        is_active BOOLEAN DEFAULT true,
        failed_attempts INT DEFAULT 0,
        locked_until TIMESTAMPTZ,
        last_login_at TIMESTAMPTZ,
        last_login_ip VARCHAR(45),
        avatar_url TEXT,
        bio TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Create B-Tree Indexes for fast lookup
    console.log("Creating B-Tree indexes on LOWER(email) and phone...");
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_email ON admin (LOWER(email));
      CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_phone ON admin (phone);
    `);
    console.log("Table 'admin' and indexes verified successfully!");

    // 3. Seed Default Super Admin
    const seedEmail = 'admin@msj.edu';
    const seedPhone = '+8801700000000';
    const rawPassword = 'admin123';

    console.log(`Checking if default admin '${seedEmail}' exists...`);
    const checkRes = await client.query("SELECT id, email, phone FROM admin WHERE LOWER(email) = LOWER($1) OR phone = $2", [seedEmail, seedPhone]);

    if (checkRes.rows.length === 0) {
      console.log(`Seeding initial superadmin (${seedEmail})...`);
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);

      const insertRes = await client.query(`
        INSERT INTO admin (name, email, phone, password_hash, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, phone, role;
      `, ['MSJ Super Admin', seedEmail, seedPhone, hashedPassword, 'superadmin', true]);

      console.log("Default Super Admin seeded successfully:");
      console.log(insertRes.rows[0]);
    } else {
      console.log("Default Super Admin already exists in 'admin' table:");
      console.log(checkRes.rows[0]);
    }

    await client.end();
    console.log("Migration & Seeding completed successfully!");
  } catch (err) {
    console.error("Migration/Seeder error:", err);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

migrateAndSeed();
