import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import * as path from 'path';

// Force load the .env from the backend directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const magicPrefix = 'enc:';
const algorithm = 'aes-256-cbc';

console.log('Testing with ENCRYPTION_KEY:', ENCRYPTION_KEY);

function decrypt(value: string) {
    if (!value || !value.startsWith(magicPrefix)) {
        console.log('Value is not encrypted (plain text)');
        return value;
    }

    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
        console.log('Valid ENCRYPTION_KEY (64 chars) is missing');
        return value;
    }

    const key = Buffer.from(ENCRYPTION_KEY, 'hex');

    try {
        const parts = value.slice(magicPrefix.length).split(':');
        if (parts.length !== 2) return value;

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.log('Decryption failed for:', value);
        return value;
    }
}

// Test values from screenshot
const testVals = [
    'enc:9d8028907bee275de7618d01e1728ac3:a97b3398ec22b0d450ae4e88a6a84c79',
    'enc:bfdf994f2457b043b34c8de4b06b6a55:3542f5938f5b7e3a0c634307f1a243e0'
];

testVals.forEach(v => {
    console.log(`Original: ${v}`);
    console.log(`Decrypted: ${decrypt(v)}`);
    console.log('---');
});
