// src/pages/Order.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/style.css';

export default function Order() {
  const [menuData, setMenuData] = useState([]);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const url = process.env.REACT_APP_API_URL
          ? `${process.env.REACT_APP_API_URL}/api/items`
          : 'http://localhost:5000/api/items';
        const res = await axios.get(url);

        const grouped = res.data.reduce((acc, item) => {
          const catName = item.category || 'Uncategorized';
          if (!acc[catName]) acc[catName] = [];
          acc[catName].push(item);
          return acc;
        }, {});

        const menuArr = Object.keys(grouped).map((cat, idx) => ({
          category: { category_id: idx, category_name: cat },
          items: grouped[cat],
        }));

        setMenuData(menuArr);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load menu:', err);
        setError('Failed to load menu items');
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleQtyChange = (itemId, value) => {
    setQuantities(prev => ({ ...prev, [itemId]: parseInt(value) || 0 }));
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    const itemsToSend = [];
    menuData.forEach(section =>
      section.items.forEach(it => {
        const qty = parseInt(quantities[it.item_id]) || 0;
        if (qty > 0) {
          itemsToSend.push({
            item_id: it.item_id,
            item_name: it.item_name || it.name,
            qty,
            price: parseFloat(it.price)
          });
        }
      })
    );

    if (!itemsToSend.length) return alert('Please select at least one item');

    const payload = { fullName, phoneNumber, notes, items: itemsToSend, date: new Date().toISOString(), orderId: Date.now() };

    try {
      const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
      localStorage.setItem('orders', JSON.stringify([...existingOrders, payload]));

      const url = process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api/orders`
        : 'http://localhost:5000/api/orders';
      await axios.post(url, payload);

      navigate('/order-confirmation', { state: payload });
      setFullName(''); setPhoneNumber(''); setNotes(''); setQuantities({});
    } catch (err) {
      console.error('Failed to submit order:', err.response || err);
      alert(err.response?.data?.message || 'Failed to submit order');
    }
  };

  return (
    <div
      className="login-page"
      style={{ background: 'linear-gradient(135deg, #ffd8a2ff, #ffd06bff)' }}
    >
      <div className="order-card">
        <button className="back-home-btn" onClick={() => navigate('/home')}>← Back to Home</button>

        <h2 className="order-title">Place Your Order</h2>
        <p className="order-subtitle">Select your favorite items and confirm your order</p>

        {loading && <p>⏳ Loading menu items...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          <form onSubmit={submitOrder} className="order-form">
            <div className="form-group">
              <label>Full Name:</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" required />
            </div>

            <div className="form-group">
              <label>Phone Number:</label>
              <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Enter your phone number" required />
            </div>

            {menuData.map(section => (
              <fieldset key={section.category.category_id}>
                <legend>{section.category.category_name}</legend>
                {section.items.map(item => (
                  <div key={item.item_id} className="menu-item-card">
                    <input type="number" min="0" value={quantities[item.item_id] || 0} onChange={e => handleQtyChange(item.item_id, e.target.value)} />
                    <span className="menu-item-description">{item.item_name} - ${parseFloat(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </fieldset>
            ))}

            <div className="form-group">
              <label>Additional Notes:</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="3" placeholder="Any special instructions?" />
            </div>

            <button type="submit" className="submit-order-btn">Submit Order</button>
          </form>
        )}
      </div>
    </div>
  );
}
