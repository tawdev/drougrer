const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Simple .env parser to avoid dependency on dotenv for this quick test
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    } catch (e) {
        console.log('Error loading .env:', e.message);
    }
}

loadEnv();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const magicPrefix = 'enc:';
const algorithm = 'aes-256-cbc';

console.log('Testing with ENCRYPTION_KEY:', ENCRYPTION_KEY ? (ENCRYPTION_KEY.substring(0, 8) + '...') : 'null');

function decrypt(value) {
    if (!value || !value.startsWith(magicPrefix)) {
        return 'Not encrypted';
    }

    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
        return 'Invalid Key';
    }

    const key = Buffer.from(ENCRYPTION_KEY, 'hex');

    try {
        const parts = value.slice(magicPrefix.length).split(':');
        if (parts.length !== 2) return 'Invalid Format';

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        return 'Decryption FAILED';
    }
}

const testVals = [
    'enc:9d8028907bee275de7618d01e1728ac3:a97b3398ec22b0d450ae4e88a6a84c79',
    'enc:bfdf994f2457b043b34c8de4b06b6a55:3542f5938f5b7e3a0c634307f1a243e0'
];

testVals.forEach(v => {
    console.log(`Input: ${v}`);
    console.log(`Result: ${decrypt(v)}`);
    console.log('---');
});
