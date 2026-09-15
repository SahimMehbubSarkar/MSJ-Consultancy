const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '12345678',
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log("SUCCESS! Connected to PostgreSQL server on port 5432!");

    // Check if msj database exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'msj'");
    if (res.rows.length === 0) {
      console.log("Database 'msj' does not exist. Creating database 'msj'...");
      await client.query("CREATE DATABASE msj");
      console.log("Database 'msj' created successfully!");
    } else {
      console.log("Database 'msj' already exists!");
    }
    await client.end();
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

testConnection();
