




















const { Sequelize } = require('sequelize');
const path = require('path');

// Configuración de la base de datos
let sequelize;

if (process.env.DB_TYPE === 'sqlite') {
  // Configuración SQLite para desarrollo fácil
  const dbPath = path.resolve(__dirname, '..', '..', process.env.DB_STORAGE || './database/reportes.db');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else {
  // Configuración MySQL original
  sequelize = new Sequelize(
    process.env.DB_NAME || 'reportes_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = {
  sequelize
};