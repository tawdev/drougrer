const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'droguerie_db',
    });

    console.log('Connected to MySQL database!');

    try {
        const customers = [
            'Ahmed Mansouri', 'Fatima Zahra', 'Youssef El Amrani',
            'Sara Bennani', 'Omar Hassan', 'Laila Tazi',
            'Driss Alaoui', 'Zineb Filali', 'Mehdi Smires', 'Siham Kadiri'
        ];

        const statuses = ['delivered', 'delivered', 'delivered', 'pending', 'processing', 'shipped'];

        console.log('Clearing existing orders for fresh comparison data...');
        await connection.execute('DELETE FROM orders');

        console.log('Inserting 120 sample orders over 60 days...');

        for (let i = 0; i < 120; i++) {
            const date = new Date();
            // Distribute orders over 60 days
            date.setDate(date.getDate() - Math.floor(Math.random() * 60));

            const customerName = customers[Math.floor(Math.random() * customers.length)];
            const totalPrice = Math.floor(Math.random() * 800) + 150;
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const phone = '06' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
            const createdAt = date.toISOString().slice(0, 19).replace('T', ' ');

            await connection.execute(
                'INSERT INTO orders (customerName, phone, totalPrice, status, createdAt) VALUES (?, ?, ?, ?, ?)',
                [customerName, phone, totalPrice, status, createdAt]
            );
        }

        console.log('Successfully seeded 120 orders!');
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await connection.end();
    }
}

seed();
