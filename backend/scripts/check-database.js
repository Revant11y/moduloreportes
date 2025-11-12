const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/reportes.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error:', err.message);
        return;
    }
    console.log('✅ Conectado a la base de datos');
});

// Obtener esquema de tablas
db.serialize(() => {
    console.log('\n📋 ESQUEMA DE TABLAS:\n');
    
    db.get("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            console.error(err);
            return;
        }
    });
    
    const tables = ['users', 'sales', 'courses', 'producers', 'course_progress'];
    
    tables.forEach(tableName => {
        db.all(`PRAGMA table_info(${tableName})`, [], (err, rows) => {
            if (err) {
                console.error(`Error en tabla ${tableName}:`, err);
                return;
            }
            
            console.log(`\n🗂️  Tabla: ${tableName}`);
            console.log('Columnas:');
            rows.forEach(col => {
                console.log(`  - ${col.name} (${col.type})`);
            });
        });
    });
    
    // Contar registros
    setTimeout(() => {
        console.log('\n📊 CONTEO DE REGISTROS:\n');
        
        tables.forEach(tableName => {
            db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, row) => {
                if (err) {
                    console.error(`Error contando ${tableName}:`, err);
                    return;
                }
                console.log(`${tableName}: ${row.count} registros`);
            });
        });
        
        // Mostrar algunas ventas de ejemplo
        setTimeout(() => {
            console.log('\n💰 EJEMPLO DE VENTAS:');
            db.all('SELECT * FROM sales LIMIT 3', [], (err, rows) => {
                if (err) {
                    console.error('Error:', err);
                    return;
                }
                console.log(rows);
                db.close();
            });
        }, 500);
        
    }, 1000);
});