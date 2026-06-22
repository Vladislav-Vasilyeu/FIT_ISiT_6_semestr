const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'VVV',
  process.env.DB_USER || 'sa',
  process.env.DB_PASSWORD || 'Vlad060606',
  {
    host: process.env.DB_HOST || 'Server',
    port: Number(process.env.DB_PORT || 1433),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false,
      freezeTableName: true
    },
    logging: false
  }
);

module.exports = { sequelize };
