const { createConnection } = require('mysql2/promise');
require('dotenv').config();

async function check() {
  try {
    const connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'droguerie_db'
    });

    console.log('Connected to database successfully.');
    const [rows] = await connection.execute('SHOW TABLES;');
    console.log('Tables in database:', rows.map(r => Object.values(r)[0]));
    
    try {
      const [columns] = await connection.execute('DESCRIBE brands;');
      console.log('Columns in brands table:', columns.map(c => c.Field));
    } catch (e) {
      console.log('Brands table not found or error describing it.');
    }

    await connection.end();
  } catch (err) {
    console.error('Error connecting to database:', err.message);
  }
}

check();
