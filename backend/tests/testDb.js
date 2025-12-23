const db = require('../config/db');

async function test() {
  try {
    const [rows] = await db.query('SELECT * FROM menu_items');
    console.log(rows);
    console.log('Database connection successful!');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

test();
