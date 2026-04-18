const bcrypt = require('bcrypt');

const passwords = ['admin123', 'admin@2026', 'droguerie2026', 'admin', 'password'];
const hash = '$2b$10$hL6Q.BKM56H0k4UUmkFwA.sH5qA2GOtF83L2V8A1oCIdKz0BFwI5e';

async function check() {
    for (const p of passwords) {
        const match = await bcrypt.compare(p, hash);
        if (match) {
            console.log('Match found:', p);
            return;
        }
    }
    console.log('No match found.');
}

check();
