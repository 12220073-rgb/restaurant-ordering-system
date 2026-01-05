const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOrderEmail({ fullName, phoneNumber, notes, orderId, items, total }) {
  // ✅ Safety (does NOT change the design/layout)
  const safeItems = Array.isArray(items) ? items : [];
  const safeTotal = Number(total) || 0;

  const now = new Date();
  const formattedDate =
    now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) +
    " at " +
    now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const rows = safeItems
    .map((i, idx) => {
      const priceNum = Number(i?.price) || 0;
      const qtyNum = Number(i?.qty) || 0;
      const itemName = i?.item_name ?? "";

      return `
    <tr style="background-color:${idx % 2 ? "#fff4f0" : "#fdf6f0"}">
      <td style="padding:10px;border:1px solid #e0e0e0;">${itemName}</td>
      <td style="padding:10px;border:1px solid #e0e0e0;text-align:center;">${qtyNum}</td>
      <td style="padding:10px;border:1px solid #e0e0e0;text-align:right;">$${priceNum.toFixed(2)}</td>
      <td style="padding:10px;border:1px solid #e0e0e0;text-align:right;">$${(qtyNum * priceNum).toFixed(2)}</td>
    </tr>`;
    })
    .join("");

  const html = `
  <div style="font-family:Verdana,sans-serif;color:#333;max-width:650px;margin:auto;border:1px solid #ddd;border-radius:10px;box-shadow:0 4px 10px rgba(0,0,0,0.1);overflow:hidden;">
    
    <div style="background:linear-gradient(90deg,#ff6f61,#ffb347);color:white;padding:25px;text-align:center;">
      <h2 style="margin:0;font-size:24px;">📩 New Order Received!</h2>
      <p style="margin:5px 0 0 0;font-size:14px;">Order #${orderId} – ${formattedDate}</p>
    </div>

    <div style="padding:20px;background-color:#fff7f2;">
      <h3 style="margin-bottom:10px;color:#ff6f61;">Customer Information</h3>
      <p><b>Name:</b> ${fullName}</p>
      <p><b>Phone:</b> ${phoneNumber}</p>
      <p><b>Notes:</b> ${notes || "None"}</p>
    </div>

    <div style="padding:20px;background-color:#fff4f0;">
      <h3 style="margin-bottom:10px;color:#ff6f61;">Order Details</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background-color:#ffb347;color:white;">
            <th style="padding:12px;border:1px solid #e0e0e0;text-align:left;">Item</th>
            <th style="padding:12px;border:1px solid #e0e0e0;text-align:center;">Qty</th>
            <th style="padding:12px;border:1px solid #e0e0e0;text-align:right;">Price</th>
            <th style="padding:12px;border:1px solid #e0e0e0;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background-color:#ff6f61;color:white;font-weight:bold;">
            <td colspan="3" style="padding:12px;border:1px solid #e0e0e0;text-align:right;">Grand Total</td>
            <td style="padding:12px;border:1px solid #e0e0e0;text-align:right;">$${safeTotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:20px;color:#555;font-style:italic;">Please process this order promptly.</p>
    </div>

    <div style="background-color:#ffebd6;padding:15px;text-align:center;font-size:13px;color:#555;">
      Mostafa Restaurant – Thank you for your business!
    </div>
  </div>`;

  try {
    await transporter.sendMail({
      from: `"Mostafa Restaurant" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Order – ${fullName}`,
      html,
    });
    console.log(`✅ Order email sent successfully for order #${orderId}`);
  } catch (err) {
    console.error(`❌ Failed to send order email for order #${orderId}:`, err.message);
  }
}

module.exports = { sendOrderEmail };
