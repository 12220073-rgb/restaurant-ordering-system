require("dotenv").config();
const { sendOrderEmail } = require("../config/mailer");

sendOrderEmail({
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
})
  .then(() => console.log("✅ Email sent successfully"))
  .catch((err) => console.error("❌ Email failed:", err));
