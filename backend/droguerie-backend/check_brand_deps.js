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

    console.log('--- Brand Product Dependency Check ---');
    const [brands] = await connection.execute('SELECT id, name FROM brands;');
    
    for (const brand of brands) {
      const [products] = await connection.execute('SELECT COUNT(*) as count FROM products WHERE brandId = ?;', [brand.id]);
      console.log(`Brand: ${brand.name} (ID: ${brand.id}) - Products: ${products[0].count}`);
    }

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
