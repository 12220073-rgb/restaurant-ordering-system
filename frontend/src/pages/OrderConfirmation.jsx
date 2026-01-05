// src/pages/OrderConfirmation.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/style.css";

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state || null;

  if (!order) return <p>Waiting for your order...</p>;

  // Normalize fields (supports old & new payloads)
  const customerName = order.fullName || order.customer_name || "N/A";
  const customerPhone = order.phoneNumber || order.customer_phone || "N/A";
  const customerNotes = order.notes || order.customer_notes || "None";

  // Calculate total safely
  const total =
    order.items?.reduce(
      (sum, it) =>
        sum +
        (parseFloat(it.price) || 0) * (parseInt(it.qty) || 0),
      0
    ) || 0;

  const handlePrint = () => window.print();

  return (
    <div className="invoice-container">
      <div className="invoice-card">
        {/* Navigation */}
        <button className="back-home-btn" onClick={() => navigate("/")}>
          ← Back to Menu
        </button>

        {/* Header */}
        <h1>Thank You for Your Order!</h1>
        <p className="invoice-subtitle">Mostafa Restaurant</p>

        {/* Print Button */}
        <button className="print-btn" onClick={handlePrint}>
          🖨️ Print Invoice
        </button>

        {/* Customer Info */}
        <section className="invoice-section">
          <h2>Customer Information</h2>
          <p><strong>Name:</strong> {customerName}</p>
          <p><strong>Phone:</strong> {customerPhone}</p>
          <p><strong>Additional Notes:</strong> {customerNotes}</p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(order.date || Date.now()).toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </section>

        {/* Order Details */}
        <section className="invoice-section">
          <h2>Order Details</h2>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price ($)</th>
                <th>Subtotal ($)</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((it, idx) => {
                const price = parseFloat(it.price) || 0;
                const qty = parseInt(it.qty) || 0;
                return (
                  <tr key={idx}>
                    <td>{it.item_name || it.name || "Unnamed"}</td>
                    <td>{qty}</td>
                    <td className="price-cell">${price.toFixed(2)}</td>
                    <td className="subtotal-cell">
                      ${(price * qty).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="invoice-total pulse">
            Total: ${total.toFixed(2)}
          </p>
        </section>

        {/* Footer */}
        <p className="invoice-footer">
          We appreciate your business! Enjoy your meal 🍽️
        </p>
      </div>
    </div>
  );
}
