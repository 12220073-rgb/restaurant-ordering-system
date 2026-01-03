// tests/test-email.js
require("dotenv").config();
const path = require("path");

// Dynamically resolve the path to mailer.js
const { sendOrderEmail } = require(path.join(__dirname, "..", "config", "mailer"));

async function test() {
  try {
    console.log("🚀 Test email started");

    await sendOrderEmail({
      fullName: "TEST CUSTOMER",
      phoneNumber: "00000000",
      notes: "Email test",
      orderId: "TEST-ORDER-1",
      date: new Date().toISOString(),
      items: [
        { item_name: "Burger", qty: 2, price: 5 },
        { item_name: "Cola", qty: 1, price: 2 },
      ],
      total: 12,
    });

    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
}

// Call the function
test();
