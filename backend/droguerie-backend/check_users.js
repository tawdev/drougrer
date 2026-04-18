const { DataSource } = require('typeorm');
const ds = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'droguerie_db',
    entities: []
});

async function check() {
    try {
        await ds.initialize();
        const results = await ds.query('SELECT email, password FROM users');
        console.log(JSON.stringify(results, null, 2));
        await ds.destroy();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

check();
