// config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

// Create MySQL pool with Aiven SSL configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,          // e.g., mostafarest-db-mostafarestaurant.b.aivencloud.com
  user: process.env.DB_USER,          // e.g., avnadmin
  password: process.env.DB_PASSWORD,  // your Aiven DB password
  database: process.env.DB_NAME,      // e.g., restaurant_db
  port: process.env.DB_PORT || 27851, // Aiven MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true          // required by Aiven
  }
});

// Test connection
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL Connected Successfully");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL Connection Error:", err.message);
  }
})();

module.exports = pool;
