// backend/config/mailer.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS  // Gmail App Password
  }
});

// Function to send order email
async function sendOrderEmail(orderData) {
  const { fullName, phoneNumber, notes, orderId, date, items, total } = orderData;

  const itemsList = items
    .map(item => `${item.item_name} x${item.qty} - $${(item.price * item.qty).toFixed(2)}`)
    .join('\n');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to yourself
    subject: `New Order: ${fullName}`,
    text: `
New Order Received!

Order ID: ${orderId}
Customer: ${fullName}
Phone: ${phoneNumber}
Notes: ${notes || 'None'}
Date: ${date}

Items:
${itemsList}

Total: $${total.toFixed(2)}

Please process this order.
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Order email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send order email:', error);
  }
}

module.exports = { sendOrderEmail };
