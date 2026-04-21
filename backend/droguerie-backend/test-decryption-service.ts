import * as dotenv from 'dotenv';
import * as path from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Order } from './src/orders/order.entity';
import { EncryptionTransformer } from './src/utils/encryption-transformer';

// Try multiple locations for .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function test() {
    console.log('--- DB Decryption Test ---');
    console.log('Key:', process.env.ENCRYPTION_KEY ? 'Present' : 'MISSING');

    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'droguerie_db',
        entities: [Order],
        synchronize: false,
    });

    try {
        await dataSource.initialize();
        console.log('Data Source initialized');

        const orderRepo = dataSource.getRepository(Order);
        const orders = await orderRepo.find({ take: 5, order: { id: 'DESC' } });

        console.log(`Found ${orders.length} orders`);
        orders.forEach(o => {
            console.log(`Order #${o.id}:`);
            console.log(`  Name: ${o.customerName}`);
            console.log(`  Phone: ${o.phone}`);
            console.log('---');
        });

        await dataSource.destroy();
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
