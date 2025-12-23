// Load environment variables from .env file
require('dotenv').config();

// Import MySQL (promise-based)
const mysql = require('mysql2/promise');

// Create and export a MySQL connection pool
module.exports = mysql.createPool({
  host: process.env.DB_HOST,        // Database host (e.g. localhost)
  user: process.env.DB_USER,        // Database username
  password: process.env.DB_PASSWORD,// Database password
  database: process.env.DB_NAME,    // Database name
  port: process.env.DB_PORT || 3306 // MySQL port (default: 3306)
});
