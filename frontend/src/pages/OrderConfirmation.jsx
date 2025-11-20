// src/pages/OrderConfirmation.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/style.css';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state || null);
  const [previousOrders, setPreviousOrders] = useState([]);

  useEffect(() => {
    if (!order) return;

    const phone = order.phoneNumber;
    const url = process.env.REACT_APP_API_URL
      ? `${process.env.REACT_APP_API_URL}/api/orders?phone=${phone}`
      : `http://localhost:5000/api/orders?phone=${phone}`;

    axios.get(url)
      .then(res => {
        setPreviousOrders(
          res.data.filter(o => o.orderId !== order.orderId)
                  .map(o => ({ ...o, total: parseFloat(o.total) }))
        );
      })
      .catch(err => console.error('Failed to fetch previous orders', err));
  }, [order]);

  if (!order) return <p>Waiting for your order...</p>;

  const total = order.items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const handlePrint = () => window.print();

  return (
    <div className="invoice-container">
      <div className="invoice-card">

        {/* Navigation */}
        <button className="back-home-btn" onClick={() => navigate('/home')}>← Back to Home</button>

        {/* Header */}
        <h1>Thank You for Your Order!</h1>
        <p className="invoice-subtitle">Mostafa Restaurant</p>

        {/* Print Button */}
        <button className="print-btn" onClick={handlePrint}>🖨️ Print Invoice</button>

        {/* Customer Info */}
        <section className="invoice-section">
          <h2>Customer Information</h2>
          <p><strong>Name:</strong> {order.fullName}</p>
          <p><strong>Phone:</strong> {order.phoneNumber}</p>
          {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
        </section>

        {/* Order Details */}
        <section className="invoice-section">
          <h2>Order Details</h2>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Item</th><th>Qty</th><th>Price ($)</th><th>Subtotal ($)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.item_name}</td>
                  <td>{it.qty}</td>
                  <td className="price-cell">${it.price.toFixed(2)}</td>
                  <td className="subtotal-cell">${(it.price * it.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="invoice-total pulse">Total: ${total.toFixed(2)}</p>
        </section>

        {/* Previous Orders */}
        <section className="invoice-section">
          <h2>Previous Orders</h2>
          {previousOrders.length > 0 ? (
            <ul>
              {previousOrders.map((o, i) => (
                <li key={i}><strong>{o.fullName || o.customer_name}</strong>: ${o.total.toFixed(2)}</li>
              ))}
            </ul>
          ) : <p>No previous orders.</p>}
        </section>

        {/* Footer */}
        <p className="invoice-footer">We appreciate your business! Enjoy your meal 🍽️</p>
      </div>
    </div>
  );
}
