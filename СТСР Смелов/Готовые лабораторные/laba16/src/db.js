const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || '172.16.193.223',
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER || 'student',
  password: process.env.DB_PASSWORD || 'fitfit',
  database: process.env.DB_NAME || 'XYZ',
  options: {
    encrypt: String(process.env.DB_ENCRYPT).toLowerCase() === 'true',
    trustServerCertificate:
      String(process.env.DB_TRUST_SERVER_CERTIFICATE || 'true').toLowerCase() === 'true'
  }
};

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config).connect();
  }

  return poolPromise;
}

function request(pool) {
  return pool.request();
}

module.exports = {
  sql,
  getPool,
  request
};
