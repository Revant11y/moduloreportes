const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta a la base de datos
const dbPath = path.join(__dirname, '../database/reportes.db');
const outputPath = path.join(__dirname, '../../frontend/src/data/database-data.json');

// Función para conectar a la base de datos
function connectToDatabase() {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error conectando a la base de datos:', err.message);
            return;
        }
        console.log('✅ Conectado a la base de datos SQLite');
    });
}

// Función para obtener datos de KPIs
function getKPIData(db) {
    return new Promise((resolve, reject) => {
        // Usar fechas más amplias para capturar los datos existentes
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const dateString = sixMonthsAgo.toISOString();

        const queries = {
            totalRevenue: `SELECT SUM(amount) as total FROM sales WHERE status = 'completed'`,
            salesCount: `SELECT COUNT(*) as count FROM sales WHERE status = 'completed'`,
            activeUsers: `SELECT COUNT(*) as count FROM users`,
            totalUsers: `SELECT COUNT(*) as count FROM users`,
            completedCourses: `SELECT COUNT(DISTINCT courseId) as count FROM course_progress WHERE completed = 1`
        };

        const results = {};
        let completed = 0;
        const total = Object.keys(queries).length;

        Object.keys(queries).forEach(key => {
            // No usar parámetros para las consultas que no los necesitan
            const query = queries[key];
            const params = key === 'activeUsers' ? [] : [];
            
            db.get(query, params, (err, row) => {
                if (err) {
                    console.error(`Error en consulta ${key}:`, err);
                    reject(err);
                    return;
                }
                
                results[key] = row ? (row.total || row.count || 0) : 0;
                completed++;
                
                if (completed === total) {
                    // Calcular tasa de finalización
                    results.completionRate = results.totalUsers > 0 
                        ? ((results.completedCourses / results.totalUsers) * 100).toFixed(1)
                        : 0;
                    
                    resolve({
                        totalRevenue: results.totalRevenue || 0,
                        salesCount: results.salesCount || 0,
                        activeUsers: results.activeUsers || 0,
                        totalUsers: results.totalUsers || 0,
                        completionRate: parseFloat(results.completionRate),
                        completedCourses: results.completedCourses || 0,
                        period: '30'
                    });
                }
            });
        });
    });
}

// Función para obtener datos de ventas por día
function getSalesByDay(db) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                DATE(saleDate) as date,
                COUNT(*) as count,
                SUM(amount) as total
            FROM sales 
            WHERE status = 'completed'
            GROUP BY DATE(saleDate)
            ORDER BY date DESC
            LIMIT 30
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.map(row => ({
                date: row.date,
                count: row.count,
                total: row.total
            })));
        });
    });
}

// Función para obtener top cursos
function getTopCourses(db) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                c.title as courseTitle,
                COUNT(s.id) as salesCount,
                SUM(s.amount) as totalRevenue
            FROM sales s
            JOIN courses c ON s.courseId = c.id
            WHERE s.status = 'completed'
            GROUP BY c.id, c.title
            ORDER BY totalRevenue DESC
            LIMIT 6
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.map(row => ({
                courseTitle: row.courseTitle,
                salesCount: row.salesCount,
                totalRevenue: row.totalRevenue
            })));
        });
    });
}

// Función para obtener usuarios activos
function getActiveUsers(db, period = 30) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT id, name, email, status, lastActivity
            FROM users 
            ORDER BY lastActivity DESC
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

// Función principal
async function generateDatabaseData() {
    const db = connectToDatabase();
    
    try {
        console.log('🔄 Obteniendo datos de la base de datos...');
        
        const [kpiData, salesByDay, topCourses, activeUsers] = await Promise.all([
            getKPIData(db),
            getSalesByDay(db),
            getTopCourses(db),
            getActiveUsers(db)
        ]);

        const data = {
            timestamp: new Date().toISOString(),
            kpis: kpiData,
            charts: {
                salesByDay: salesByDay,
                topCourses: topCourses
            },
            activeUsers: {
                users: activeUsers,
                metrics: {
                    totalUsers: kpiData.totalUsers,
                    activeUsers: kpiData.activeUsers,
                    inactiveUsers: kpiData.totalUsers - kpiData.activeUsers,
                    activityRate: ((kpiData.activeUsers / kpiData.totalUsers) * 100).toFixed(1)
                }
            }
        };

        // Crear directorio si no existe
        const dataDir = path.dirname(outputPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Guardar datos en archivo JSON
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        
        console.log('✅ Datos generados exitosamente');
        console.log(`📊 Total ingresos: $${kpiData.totalRevenue?.toLocaleString()}`);
        console.log(`👥 Usuarios activos: ${kpiData.activeUsers}`);
        console.log(`📈 Ventas: ${kpiData.salesCount}`);
        console.log(`📄 Archivo guardado en: ${outputPath}`);
        
    } catch (error) {
        console.error('❌ Error generando datos:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error cerrando la base de datos:', err.message);
            } else {
                console.log('✅ Conexión a base de datos cerrada');
            }
        });
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    generateDatabaseData();
}

module.exports = { generateDatabaseData };