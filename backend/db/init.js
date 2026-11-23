const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function initDb() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Applying database schema from schema.sql...');
    await pool.query(schemaSql);
    console.log('Database schema initialized successfully.');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initDb();
}

module.exports = initDb;
