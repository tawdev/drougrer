const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

const ds = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'droguerie_db',
    entities: []
});

async function reset() {
    try {
        await ds.initialize();
        
        const newPassword = 'admin2026';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        await ds.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@drogueriemaroc.com']);
        
        console.log('Password successfully reset to: ' + newPassword);
        await ds.destroy();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

reset();
