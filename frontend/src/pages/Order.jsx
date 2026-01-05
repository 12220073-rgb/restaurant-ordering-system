// src/pages/Order.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";

export default function Order() {
  const navigate = useNavigate();

  // ✅ Single source of truth for backend base URL
  const API_BASE = useMemo(() => {
    const env = process.env.REACT_APP_API_URL?.trim();
    return env && env.length > 0 ? env.replace(/\/+$/, "") : "http://localhost:5000";
  }, []);

  // Customer info
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Order info
  const [menuData, setMenuData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/items`);

        const grouped = res.data.reduce((acc, item) => {
          const cat = item.category || "Uncategorized";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push({
            item_id: item.id,
            item_name: item.name,
            price: parseFloat(item.price),
          });
          return acc;
        }, {});

        const menuArr = Object.entries(grouped).map(([cat, items], idx) => ({
          category: { category_id: idx, category_name: cat },
          items,
        }));

        setMenuData(menuArr);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load menu:", err);
        setError("Failed to load menu items");
        setLoading(false);
      }
    };

    fetchMenu();
  }, [API_BASE]);

  const handleQtyChange = (itemId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Number.parseInt(value, 10) || 0,
    }));
  };

  const buildItems = () => {
    const items = [];
    menuData.forEach((section) =>
      section.items.forEach((it) => {
        const qty = quantities[it.item_id] || 0;
        if (qty > 0) {
          items.push({
            item_id: it.item_id,
            item_name: it.item_name,
            qty,
            price: it.price,
          });
        }
      })
    );
    return items;
  };

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !phoneNumber) {
      alert("Please fill in all fields");
      return;
    }

    const normalizedPhone = phoneNumber.trim().startsWith("+961")
      ? phoneNumber.trim()
      : `+961 ${phoneNumber.trim()}`;

    const items = buildItems();
    if (!items.length) {
      alert("Please select at least one item");
      return;
    }

    const payload = {
      fullName,
      phoneNumber: normalizedPhone,
      notes: notes?.trim() ? notes.trim() : "None",
      items,
    };

    // ✅ Try multiple common endpoints to avoid "Not Found"
    const endpointsToTry = [
      `${API_BASE}/api/orders`,         // most common
      `${API_BASE}/api/orders/create`,  // common alternative
      `${API_BASE}/api/orders/add`,     // another common alternative
    ];

    try {
      let res = null;

      for (const url of endpointsToTry) {
        try {
          res = await axios.post(url, payload);
          break; // success
        } catch (err) {
          const status = err?.response?.status;
          // If it's 404, try the next endpoint
          if (status === 404) continue;
          // If it's not 404, it's a real backend error → stop
          throw err;
        }
      }

      if (!res) {
        alert(
          "Order API endpoint not found. Please check your backend route for creating orders."
        );
        return;
      }

      const orderId = res.data?.orderId ?? res.data?.id ?? res.data?.order_id ?? null;

      navigate("/order-confirmation", {
        state: {
          ...payload,
          orderId,
          date: new Date(),
        },
      });
    } catch (err) {
      console.error("Failed to submit order:", err);

      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to submit order";

      alert(msg);
    }
  };

  return (
    <div
      className="login-page"
      style={{ background: "linear-gradient(135deg, #ffd8a2ff, #ffd06bff)" }}
    >
      <div className="order-card">
        <button className="back-home-btn" onClick={() => navigate("/")}>
          ← Back to Menu
        </button>

        <h2 className="order-title">Your Information</h2>
        <p className="order-subtitle">Enter your contact details</p>

        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <h2 className="order-title">Choose Items</h2>
          <p className="order-subtitle">Select your favorite items</p>

          {loading && <p>⏳ Loading menu items...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading &&
            !error &&
            menuData.map((section) => (
              <fieldset key={section.category.category_id}>
                <legend>{section.category.category_name}</legend>

                {section.items.map((item) => (
                  <div key={item.item_id} className="menu-item-card">
                    <input
                      type="number"
                      min="0"
                      value={quantities[item.item_id] || 0}
                      onChange={(e) =>
                        handleQtyChange(item.item_id, e.target.value)
                      }
                    />
                    <span className="menu-item-description">
                      {item.item_name} - ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </fieldset>
            ))}

          <div className="form-group">
            <label>Additional Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Any special instructions?"
            />
          </div>

          <button type="submit" className="submit-order-btn">
            Submit Order
          </button>
        </form>
      </div>
    </div>
  );
}
