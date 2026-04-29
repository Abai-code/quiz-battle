const { Pool } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_t6mPvnra8wiq@ep-bold-silence-anem8177.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: NEON_URL,
});

async function makeAdmin() {
  try {
    const email = 'admin@gmail.com';
    const result = await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
    
    if (result.rowCount > 0) {
      console.log(`Success: ${email} is now an ADMIN!`);
    } else {
      console.log(`Error: User with email ${email} not found.`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

makeAdmin();
