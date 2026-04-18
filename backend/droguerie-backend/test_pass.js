const bcrypt = require('bcrypt');

const password = 'secure-access-2026-c-digital';
const hash = '$2b$10$hL6Q.BKM56H0k4UUmkFwA.sH5qA2GOtF83L2V8A1oCIdKz0BFwI5e';

bcrypt.compare(password, hash).then(res => {
    console.log('Matches:', res);
});
