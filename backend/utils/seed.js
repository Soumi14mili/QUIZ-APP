require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db/pool');

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@quizapp.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const name = process.env.ADMIN_NAME || 'Quiz Master';

  try {
    console.log(`Seeding admin user: ${email}...`);
    const passwordHash = await bcrypt.hash(password, 12);

    const query = `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, 'admin')
      ON CONFLICT (email)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        password_hash = EXCLUDED.password_hash,
        role = 'admin'
      RETURNING id, full_name, email, role, created_at;
    `;

    const result = await pool.query(query, [name, email, passwordHash]);
    console.log('Admin account seeded successfully:', {
      id: result.rows[0].id,
      name: result.rows[0].full_name,
      email: result.rows[0].email,
      role: result.rows[0].role,
    });
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
