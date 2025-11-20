// src/pages/Menu.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function Menu() {
  const [menuData, setMenuData] = useState([]);
  const [state, setState] = useState({
    loading: true,
    error: null,
    openItemId: null,
    hoveredItem: null,
    search: "",
    category: "All",
    feedback: "",
    submitted: false,
    showTop: false,
    userRole: "customer",
  });

  const set = (k, v) => setState(s => ({ ...s, [k]: v }));

  // Body padding + user role
  useEffect(() => {
    const s = document.createElement("style");
    s.innerHTML = `body { padding-top: 80px; }`;
    document.head.appendChild(s);

    set("userRole", localStorage.getItem("userRole") || "customer");
    return () => document.head.removeChild(s);
  }, []);

  // Fetch menu
  useEffect(() => {
    api
      .get("/items")
      .then((res) => {
        const grouped = res.data.reduce((acc, item) => {
          const c = item.category || "Uncategorized";
          acc[c] = acc[c] || [];
          acc[c].push({
            ...item,
            rating: (Math.random() * 2 + 3).toFixed(1),
            popular: Math.random() > 0.7,
          });
          return acc;
        }, {});

        setMenuData(
          Object.keys(grouped).map((c, i) => ({
            category: { category_id: i, category_name: c },
            items: grouped[c],
          }))
        );
      })
      .catch(() => set("error", "Failed to load menu items."))
      .finally(() => set("loading", false));
  }, []);

  // Scroll top button
  useEffect(() => {
    const scroll = () => set("showTop", window.scrollY > 300);
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  const toggleDesc = (id) => set("openItemId", state.openItemId === id ? null : id);

  const submitFeedback = () => {
    if (!state.feedback.trim()) return alert("Please write some feedback.");

    const entry = {
      id: Date.now(),
      name: localStorage.getItem("currentUser") || "Anonymous",
      comment: state.feedback.trim(),
      date: new Date().toISOString(),
    };

    const old = JSON.parse(localStorage.getItem("feedbackList")) || [];
    localStorage.setItem("feedbackList", JSON.stringify([entry, ...old]));

    set("feedback", "");
    set("submitted", true);
    setTimeout(() => set("submitted", false), 3000);
  };

  // Filtering
  const filtered = menuData
    .map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (i) =>
          i.item_name.toLowerCase().includes(state.search.toLowerCase()) &&
          (state.category === "All" ||
            sec.category.category_name === state.category)
      ),
    }))
    .filter((s) => s.items.length);

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
              value={state.search}
              onChange={(e) => set("search", e.target.value)}
              style={input}
            />

            <select
              value={state.category}
              onChange={(e) => set("category", e.target.value)}
              style={input}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {state.loading && <p>⏳ Loading...</p>}
          {state.error && <p style={{ color: "red" }}>{state.error}</p>}

          {/* MENU */}
          {filtered.map((sec) => (
            <div key={sec.category.category_id} style={{ marginBottom: 35 }}>
              <h2>{sec.category.category_name}</h2>

              <div style={grid}>
                {sec.items.map((item) => (
                  <div key={item.item_id} style={{ flex: "1 1 220px" }}>
                    <button
                      onMouseEnter={() => set("hoveredItem", item.item_id)}
                      onMouseLeave={() => set("hoveredItem", null)}
                      onClick={() => toggleDesc(item.item_id)}
                      style={{
                        ...itemBtn,
                        background:
                          state.hoveredItem === item.item_id ? "#fff2d9" : "#fff8f0",
                        boxShadow:
                          state.hoveredItem === item.item_id
                            ? "0px 2px 8px rgba(0,0,0,0.2)"
                            : "none",
                      }}
                    >
                      {item.item_name} – ${parseFloat(item.price).toFixed(2)}
                      <span style={rating}>
                        {item.popular && "🔥 "}⭐{item.rating}
                      </span>
                    </button>

                    {state.openItemId === item.item_id && (
                      <p style={{ marginTop: 8, fontStyle: "italic" }}>
                        {rndDesc(item.item_name)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* FEEDBACK */}
          {state.userRole === "customer" && (
            <div style={fbBox}>
              <h3 style={{ color: "#b87b1c" }}>💬 Share Feedback</h3>

              <textarea
                value={state.feedback}
                onChange={(e) => set("feedback", e.target.value)}
                placeholder="Write something..."
                rows={4}
                style={textarea}
              />

              <button onClick={submitFeedback} style={fbBtn}>
                Submit
              </button>

              {state.submitted && <p style={{ marginTop: 10, color: "green" }}>✅ Feedback sent!</p>}
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

      {state.showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={scrollTop}
        >
          ↑
        </button>
      )}

      <Footer />
    </div>
  );
}

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
const textarea = { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginTop: 10 };
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
