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

async function migrate() {
    try {
        await ds.initialize();
        console.log('Database connected.');
        
        const results = await ds.query('SELECT id, logoUrl FROM settings');
        
        for (const row of results) {
            if (row.logoUrl && row.logoUrl.startsWith('http')) {
                // Extract the /uploads/... part
                const match = row.logoUrl.match(/\/uploads\/.+/);
                if (match) {
                    const relativeUrl = match[0];
                    console.log(`Migrating row ${row.id}: ${row.logoUrl} -> ${relativeUrl}`);
                    await ds.query('UPDATE settings SET logoUrl = ? WHERE id = ?', [relativeUrl, row.id]);
                }
            }
        }
        
        console.log('Migration completed successfully.');
        await ds.destroy();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
