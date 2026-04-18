const { createConnection } = require('mysql2/promise');
require('dotenv').config();

async function cleanup() {
  try {
    const connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'droguerie_db'
    });

    // LafargeHolcim (ID: 8)
    // Sika (ID: 9)
    const brandIds = [8, 9];

    for (const id of brandIds) {
      const [products] = await connection.execute('SELECT id, name FROM products WHERE brandId = ?;', [id]);
      console.log(`Brand ID ${id} is referenced by Products:`, products.map(p => `${p.name} (ID: ${p.id})`).join(', ') || 'None');
      
      if (products.length > 0) {
        console.log(`Unlinking products from Brand ID ${id}...`);
        await connection.execute('UPDATE products SET brandId = NULL WHERE brandId = ?;', [id]);
        console.log(`Successfully unlinked.`);
      }

      console.log(`Deleting Brand ID ${id}...`);
      const [result] = await connection.execute('DELETE FROM brands WHERE id = ?;', [id]);
      console.log(`Deleted result: ${result.affectedRows} row(s) affected.`);
    }

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

cleanup();
