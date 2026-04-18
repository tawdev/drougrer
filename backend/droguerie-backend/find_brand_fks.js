const { createConnection } = require('mysql2/promise');
require('dotenv').config();

async function check() {
  try {
    const connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'information_schema'
    });

    console.log('--- Foreign Keys referencing table BRANDS ---');
    const [rows] = await connection.execute(`
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        CONSTRAINT_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME
      FROM 
        KEY_COLUMN_USAGE 
      WHERE 
        REFERENCED_TABLE_NAME = 'brands' 
        AND REFERENCED_TABLE_SCHEMA = 'droguerie_db';
    `);

    if (rows.length === 0) {
      console.log('No foreign keys found.');
    } else {
      for (const row of rows) {
        console.log(`Table: ${row.TABLE_NAME}, Column: ${row.COLUMN_NAME}, Constraint: ${row.CONSTRAINT_NAME}`);
      }
    }

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
