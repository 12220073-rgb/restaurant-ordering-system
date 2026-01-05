// tests/test-email.js
require("dotenv").config();
const path = require("path");

// Import sendOrderEmail from mailer.js
const { sendOrderEmail } = require(path.join(__dirname, "..", "config", "mailer"));

/**
 * Test function to send a sample order email
 */
async function testEmail() {
  try {
    console.log("🚀 Starting email test...");

    await sendOrderEmail({
      fullName: "Test Customer",
      phoneNumber: "00000000",
      notes: "This is a test email",
      orderId: "TEST-ORDER-1",
      date: new Date().toISOString(),
      items: [
        { item_name: "Burger", qty: 2, price: 5 },
        { item_name: "Cola", qty: 1, price: 2 },
      ],
      total: 12.0,
    });

    console.log("✅ Test email sent successfully!");
  } catch (err) {
    console.error("❌ Test email failed:", err.message);
  }
}

// Execute the test
testEmail();
