import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import '../styles/Admin.css';

export default function Admin() {
  const [showCustomers, setShowCustomers] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    try {
      setCustomers(JSON.parse(localStorage.getItem('users')) || []);
      setOrders(JSON.parse(localStorage.getItem('orders')) || []);
      setFeedbackList(JSON.parse(localStorage.getItem('feedbackList')) || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  const markOrderCompleted = idx => {
    const updated = orders.map((o, i) => i === idx ? { ...o, status: 'Completed' } : o);
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const deleteOrder = idx => {
    if (!window.confirm('Delete this order?')) return;
    const updated = orders.filter((_, i) => i !== idx);
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const deleteFeedback = idx => {
    if (!window.confirm('Delete this feedback?')) return;
    const updated = feedbackList.filter((_, i) => i !== idx);
    setFeedbackList(updated);
    localStorage.setItem('feedbackList', JSON.stringify(updated));
  };

  return (
    <div className="admin-container">
      <Navbar />

      <main className="admin-content">
        <header className="admin-header">
          <h1>🌟 Admin Dashboard</h1>
          <p>Manage Customers, Orders, and Feedback efficiently.</p>
        </header>

        <section className="admin-actions">
          <button onClick={() => setShowCustomers(true)} className="btn btn-customers">
            Customers ({customers.length})
          </button>
          <button onClick={() => setShowOrders(true)} className="btn btn-orders">
            Orders ({orders.length})
          </button>
          <button onClick={() => setShowFeedback(true)} className="btn btn-feedback">
            Feedback ({feedbackList.length})
          </button>
        </section>
      </main>

      {/* Customers Modal */}
      {showCustomers && (
        <Modal title="Customers" onClose={() => setShowCustomers(false)}>
          {customers.length === 0 ? <p>No customers found.</p> :
            <ul className="list">
              {customers.map((c, idx) => (
                <li key={idx} className="list-item">
                  <strong className="highlight">{c.name}</strong> ({c.email || 'No email'})
                </li>
              ))}
            </ul>
          }
        </Modal>
      )}

      {/* Orders Modal */}
      {showOrders && (
        <Modal title="Orders" onClose={() => setShowOrders(false)} wide>
          {orders.length === 0 ? <p>No orders yet.</p> :
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'row-light' : 'row-dark'}>
                    <td>{o.customerName}</td>
                    <td>{o.items?.map(i => `${i.item_name} (x${i.qty})`).join(', ') || 'No items'}</td>
                    <td>${o.total?.toFixed(2) || '0.00'}</td>
                    <td>{o.date ? new Date(o.date).toLocaleString() : '-'}</td>
                    <td>
                      <span className={`badge ${o.status === 'Completed' ? 'completed' : 'pending'}`}>
                        {o.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      {o.status !== 'Completed' && <button onClick={() => markOrderCompleted(idx)} className="small-btn complete">Complete</button>}
                      <button onClick={() => deleteOrder(idx)} className="small-btn delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </Modal>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <Modal title="Feedback" onClose={() => setShowFeedback(false)} wide>
          {feedbackList.length === 0 ? <p>No feedback yet.</p> :
            <ul className="list">
              {feedbackList.map((f, idx) => (
                <li key={idx} className="list-item">
                  <span><strong>{f.name}</strong> ({new Date(f.date).toLocaleString()}): {f.comment}</span>
                  <button onClick={() => deleteFeedback(idx)} className="small-btn delete">Delete</button>
                </li>
              ))}
            </ul>
          }
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Modal Component ---------------- */
const Modal = ({ children, onClose, title, wide = false }) => (
  <div className="modal-overlay">
    <div className={`modal ${wide ? 'wide' : ''}`}>
      <h3 className="modal-title">{title}</h3>
      <div className="modal-body">{children}</div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-close">Close</button>
      </div>
    </div>
  </div>
);
