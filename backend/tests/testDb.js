// tests/testDb.js
const db = require("../config/db");

/**
 * Test function to verify database connection and query
 */
async function testDbConnection() {
  try {
    const [rows] = await db.query("SELECT * FROM menu_items");
    console.log("✅ Database query successful. Retrieved rows:");
    console.table(rows); // nicer formatted output
    console.log("✅ Database connection is working!");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

// Run the test
testDbConnection();
