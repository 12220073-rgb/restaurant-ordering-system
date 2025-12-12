require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let sslOptions = false;

if (process.env.NODE_ENV === 'production') {
  const caCert = fs.readFileSync(path.join(__dirname, 'aiven-ca.crt'));
  sslOptions = { ca: caCert };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslOptions
});

module.exports = pool;
