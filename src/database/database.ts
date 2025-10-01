// this module ripped from the following postgres in typescript guide: https://dev.to/yugjadvani/advanced-integration-connecting-postgresql-with-nodejs-in-a-typescript-ecosystem-3nnh
import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

// PostgreSQL connection pool configuration using environment variables
const pool = new Pool({
    user: process.env.POSTGRES_LC_USER,
    password: process.env.POSTGRES_LC_PASSWORD,
    host: process.env.POSTGRES_LC_HOST,
    port: Number(process.env.POSTGRES_LC_PORT || ""),
    database: process.env.POSTGRES_LC_DATABASE,
    ssl: true
})

/**
 * Asynchronously verifies the PostgreSQL connection.
 * Ensures that any issues are logged immediately at application startup.
 */
async function verifyConnection(): Promise<void> {
  try {
    // Attempt to acquire a client from the pool
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release(); // Release the client back to the pool
  } catch (error) {
    console.error('❌ Error connecting to the database:', error);
  }
}

// Immediately verify connection upon module load.
verifyConnection();

// Export the pool to be used across the application.
export default pool;