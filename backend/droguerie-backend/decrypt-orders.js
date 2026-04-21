const mysql = require('mysql2/promise');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load .env
let env = {};
try {
    const envContent = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...rest] = line.split('=');
        if (key && rest.length) {
            env[key.trim()] = rest.join('=').trim();
        }
    });
} catch (e) {
    console.error('Error loading .env:', e.message);
}

const key = env.ENCRYPTION_KEY;
const algorithm = 'aes-256-cbc';
const magicPrefix = 'enc:';

function decrypt(value) {
    if (!value || !value.startsWith(magicPrefix)) return value;
    if (!key || key.length !== 64) return value;

    try {
        const parts = value.slice(magicPrefix.length).split(':');
        if (parts.length !== 2) return value;

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption failed for:', value.substring(0, 20));
        return value;
    }
}

async function run() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: env.DB_HOST || 'localhost',
        port: parseInt(env.DB_PORT || '3306'),
        user: env.DB_USERNAME || 'root',
        password: env.DB_PASSWORD || '',
        database: env.DB_NAME || 'droguerie_db'
    });

    console.log('Fetching orders...');
    const [orders] = await connection.execute('SELECT id, customerName, phone, email, address FROM orders');
    console.log(`Processing ${orders.length} orders...`);

    let updatedCount = 0;
    for (const order of orders) {
        const dName = decrypt(order.customerName);
        const dPhone = decrypt(order.phone);
        const dEmail = decrypt(order.email);
        const dAddress = decrypt(order.address);

        // We will update EVERYTHING to be plain text or correctly formatted
        // For customerName, it will stay plain text after entity change
        // For others, we'll save them as plain text now, 
        // and the backend will re-encrypt them correctly when it runs next time 
        // PROVIDED we still have the transformer on those columns.
        
        if (dName !== order.customerName || dPhone !== order.phone || dEmail !== order.email || dAddress !== order.address) {
            await connection.execute(
                'UPDATE orders SET customerName = ?, phone = ?, email = ?, address = ? WHERE id = ?',
                [dName, dPhone, dEmail, dAddress, order.id]
            );
            updatedCount++;
        }
    }

    console.log(`Migration complete. Updated ${updatedCount} orders.`);
    await connection.end();
}

run().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
