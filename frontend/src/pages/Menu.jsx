// src/pages/Menu.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios"; // ✅ axios baseURL should point to your backend (ideally .../api)
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function Menu() {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openItemId, setOpenItemId] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [userRole, setUserRole] = useState("customer");

  // Body padding + user role
  useEffect(() => {
    const s = document.createElement("style");
    s.innerHTML = `body { padding-top: 80px; }`;
    document.head.appendChild(s);

    setUserRole(localStorage.getItem("userRole") || "customer");

    return () => document.head.removeChild(s);
  }, []);

  // Fetch menu safely
  useEffect(() => {
    api
      .get("/items")
      .then((res) => {
        const safeItems = res.data.map((item, idx) => ({
          id: item.id || item.item_id || idx, // ✅ ensure unique id
          name: item.name || item.item_name || "Unnamed Item",
          price: parseFloat(item.price) || 0,
          category: item.category || "Uncategorized",
          category_id: item.category_id || Date.now() + idx,
          rating: (Math.random() * 2 + 3).toFixed(1),
          popular: Math.random() > 0.7,
        }));

        // Group items by category
        const grouped = safeItems.reduce((acc, item) => {
          acc[item.category] = acc[item.category] || [];
          acc[item.category].push(item);
          return acc;
        }, {});

        setMenuData(
          Object.keys(grouped).map((c) => ({
            category: {
              category_id: grouped[c][0].category_id,
              category_name: c,
            },
            items: grouped[c],
          }))
        );
      })
      .catch(() => setError("Failed to load menu items."))
      .finally(() => setLoading(false));
  }, []);

  // Scroll top button
  useEffect(() => {
    const scroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  const toggleDesc = (id) => setOpenItemId(openItemId === id ? null : id);

  // ✅ UPDATED: Submit feedback to backend (and keep localStorage optional)
  const submitFeedback = async () => {
    if (!feedback.trim()) return alert("Please write some feedback.");

    const payload = {
      name: localStorage.getItem("currentUser") || "Anonymous",
      comment: feedback.trim(),
      email: localStorage.getItem("currentUserEmail") || null, // optional
    };

    try {
      // ✅ Save to DB (backend should expose POST /api/feedback)
      // If your axios baseURL already includes "/api", this works: /feedback
      // If not, change to: await api.post("/api/feedback", payload);
      await api.post("/feedback", payload);

      // ✅ Optional: keep local copy too (doesn't affect Admin/DB)
      const entry = {
        id: Date.now(),
        name: payload.name,
        comment: payload.comment,
        date: new Date().toISOString(),
      };
      const old = JSON.parse(localStorage.getItem("feedbackList")) || [];
      localStorage.setItem("feedbackList", JSON.stringify([entry, ...old]));

      setFeedback("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("❌ Feedback submit failed:", err?.response?.data || err?.message || err);
      alert(err?.response?.data?.message || "Failed to send feedback");
    }
  };

  // ================= FILTERED MENU =================
  const filtered = menuData
    .map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) &&
          (category === "All" || i.category.toLowerCase() === category.toLowerCase())
      ),
    }))
    .filter((sec) => sec.items.length);

  const categories = ["All", ...menuData.map((s) => s.category.category_name)];

  const rndDesc = (name) =>
    [
      `Delicious ${name} made fresh daily.`,
      `A tasty choice — ${name} will delight you.`,
      `Prepared with the finest ingredients.`,
      `Our special ${name}, loved by all.`,
    ][Math.floor(Math.random() * 4)];

  return (
    <div style={{ background: "#fff5e6", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ display: "flex", gap: 35, padding: 30 }}>
        {/* LEFT */}
        <div style={{ flex: 2 }}>
          <h1>🍽️ Our Menu</h1>

          {/* Search & category */}
          <div style={{ marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={input}
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={input}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {loading && <p>⏳ Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {/* MENU */}
          {filtered.map((sec) => (
            <div key={sec.category.category_id} style={{ marginBottom: 35 }}>
              <h2>{sec.category.category_name}</h2>

              <div style={grid}>
                {sec.items.map((item) => (
                  <div key={item.id} style={{ flex: "1 1 220px" }}>
                    <button
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => toggleDesc(item.id)}
                      style={{
                        ...itemBtn,
                        background: hoveredItem === item.id ? "#fff2d9" : "#fff8f0",
                        boxShadow:
                          hoveredItem === item.id ? "0px 2px 8px rgba(0,0,0,0.2)" : "none",
                      }}
                    >
                      {item.name} – ${parseFloat(item.price).toFixed(2)}
                      <span style={rating}>{item.popular && "🔥 "}⭐{item.rating}</span>
                    </button>

                    {openItemId === item.id && (
                      <p style={{ marginTop: 8, fontStyle: "italic" }}>{rndDesc(item.name)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* FEEDBACK */}
          {userRole === "customer" && (
            <div style={fbBox}>
              <h3 style={{ color: "#b87b1c" }}>💬 Share Feedback</h3>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write something..."
                rows={4}
                style={textarea}
              />

              <button onClick={submitFeedback} style={fbBtn}>
                Submit
              </button>

              {submitted && <p style={{ marginTop: 10, color: "green" }}>✅ Feedback sent!</p>}
            </div>
          )}
        </div>

        {/* RIGHT IMAGES */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 15 }}>
          {["Salads", "Beverages1", "ShrimpsPlatter", "BurgerMain"].map((img) => (
            <img key={img} src={`/Images/${img}.jpeg`} style={imgS} />
          ))}
        </div>
      </div>

      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={scrollTop}>
          ↑
        </button>
      )}

      <Footer />
    </div>
  );
}

// ================= STYLES =================
const input = { padding: 10, borderRadius: 6, border: "1px solid #ccc" };
const grid = { display: "flex", flexWrap: "wrap", gap: 20, marginTop: 15 };
const itemBtn = {
  width: "100%",
  padding: 15,
  borderRadius: 10,
  border: "1px solid #333",
  transition: "0.25s",
  cursor: "pointer",
  fontWeight: "bold",
};
const rating = { float: "right", fontSize: "0.85em", color: "#b87b1c" };
const fbBox = { marginTop: 30, padding: 20, background: "#fff4e0", borderRadius: 10 };
const textarea = {
  width: "100%",
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
  marginTop: 10,
};
const fbBtn = {
  marginTop: 10,
  padding: 12,
  width: "100%",
  background: "#d35400",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: "bold",
};
const imgS = { width: "100%", borderRadius: 10 };
const scrollTop = {
  position: "fixed",
  right: 20,
  bottom: 30,
  width: 45,
  height: 45,
  borderRadius: "50%",
  background: "#d35400",
  color: "white",
  border: "none",
  fontSize: 22,
  cursor: "pointer",
};
