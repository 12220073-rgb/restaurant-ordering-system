const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 465),
  secure: String(process.env.EMAIL_SECURE || "true") === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOrderEmail(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const total = items.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0);

  const itemsHtml = items
    .map(
      (i) => `
        <tr>
          <td>${i.item_name}</td>
          <td style="text-align:center;">${i.qty}</td>
          <td style="text-align:right;">$${Number(i.price).toFixed(2)}</td>
          <td style="text-align:right;">$${(Number(i.price) * Number(i.qty)).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;">
      <h2>🧾 New Order Received</h2>
      <p><b>Name:</b> ${order.fullName || "-"}</p>
      <p><b>Phone:</b> ${order.phoneNumber || "-"}</p>
      <p><b>Date:</b> ${order.date ? new Date(order.date).toLocaleString() : "-"}</p>
      ${order.notes ? `<p><b>Notes:</b> ${order.notes}</p>` : ""}

      <h3>Order Items</h3>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;">
        <thead>
          <tr>
            <th align="left">Item</th>
            <th>Qty</th>
            <th align="right">Price</th>
            <th align="right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || `<tr><td colspan="4">No items</td></tr>`}
        </tbody>
      </table>

      <h3 style="text-align:right;">Total: $${total.toFixed(2)}</h3>
      <p style="color:#666;">Order ID: ${order.orderId || "-"}</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Mostafa Restaurant" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `New Order: ${order.fullName || "Customer"} (${order.phoneNumber || "-"})`,
    html,
  });
}

module.exports = { sendOrderEmail };
