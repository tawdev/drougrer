const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'droguerie_db',
  });

  const [categories] = await connection.execute('SELECT id, name FROM categories');
  const [brands] = await connection.execute('SELECT id, name FROM brands');

  console.log('Categories:', JSON.stringify(categories, null, 2));
  console.log('Brands:', JSON.stringify(brands, null, 2));

  await connection.end();
}

checkData().catch(console.error);
