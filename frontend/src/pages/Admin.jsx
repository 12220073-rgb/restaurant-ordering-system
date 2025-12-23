import React, { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar/Navbar";
import "../styles/Admin.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ---------- utils ---------- */
const readJSON = (k, fallback) => {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};

const apiJSON = async (url, opts = {}) => {
  const res = await fetch(url, { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) } });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
};

const getCustomerName = o => o?.customer_name || o?.customerName || o?.fullName || o?.name || "Unknown";
const getPhone = o => o?.customer_phone || o?.phoneNumber || o?.phone || "-";
const getDate = o => o?.order_date || o?.date || null;
const calcTotal = o => Number(o?.total) || (Array.isArray(o?.items) ? o.items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty ?? i.quantity) || 0), 0) : 0);
const money = v => Number.isFinite(Number(v)) ? Number(v).toFixed(2) : "0.00";
const dateStr = d => { const t = new Date(d); return !d || isNaN(t) ? "-" : t.toLocaleString(); };
const itemsStr = items => Array.isArray(items) && items.length ? items.map(i => `${i.item_name ?? "Item"} (x${i.qty ?? i.quantity ?? 1})`).join(", ") : "No items";
const searchText = o => `${getCustomerName(o).toLowerCase()} ${(Array.isArray(o.items) ? o.items.map(i => `${i.item_name ?? ""} ${i.qty ?? i.quantity ?? ""}`).join(" ") : "")}`.toLowerCase();
const csv = v => /[",\n]/.test(v = String(v ?? "")) ? `"${v.replace(/"/g, '""')}"` : v;
const download = (name, text) => { const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" })), download: name }); document.body.appendChild(a); a.click(); a.remove(); };

/* ---------- Admin Component ---------- */
export default function Admin() {
  const [activeModal, setActiveModal] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(8);
  const [page, setPage] = useState(1);

  useEffect(() => setCustomers(readJSON("users", [])), []);
  useEffect(() => {
    const onStorage = e => e.storageArea === localStorage && e.key === "users" && setCustomers(readJSON("users", []));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => setPage(1), [orderQuery, orderStatusFilter, pageSize]);

  const toggleModal = useCallback(name => setActiveModal(cur => (cur === name ? null : name)), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true); setOrdersError("");
    try { const data = await apiJSON(`${API}/api/orders/admin`); setOrders(Array.isArray(data) ? data : []); } 
    catch (e) { setOrders([]); setOrdersError(e.message || "Failed to load orders"); } 
    finally { setOrdersLoading(false); }
  }, []);

  const fetchFeedback = useCallback(async () => {
    setFeedbackLoading(true); setFeedbackError("");
    try { const data = await apiJSON(`${API}/api/feedback/admin`); setFeedbackList(Array.isArray(data) ? data : []); } 
    catch (e) { setFeedbackList([]); setFeedbackError(e.message || "Failed to load feedback"); } 
    finally { setFeedbackLoading(false); }
  }, []);

  useEffect(() => { if (activeModal === "orders") fetchOrders(); }, [activeModal, fetchOrders]);
  useEffect(() => { if (activeModal === "feedback") fetchFeedback(); }, [activeModal, fetchFeedback]);

  const deleteOrder = useCallback(async id => { if (!window.confirm("Delete this order?")) return; try { await apiJSON(`${API}/api/orders/admin/${id}`, { method: "DELETE" }); setOrders(prev => prev.filter(o => o.id !== id)); } catch (e) { alert(e.message || "Failed to delete order"); } }, []);
  const deleteFeedback = useCallback(async id => { if (!window.confirm("Delete this feedback?")) return; try { await apiJSON(`${API}/api/feedback/admin/${id}`, { method: "DELETE" }); setFeedbackList(prev => prev.filter(f => f.id !== id)); } catch (e) { alert(e.message || "Failed to delete feedback"); } }, []);
  const markOrderCompleted = useCallback(id => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "Completed" } : o)), []);

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    return orders.filter(o => {
      const status = String(o.status ?? "Pending"), done = status === "Completed";
      if (orderStatusFilter === "completed" && !done) return false;
      if (orderStatusFilter === "pending" && done) return false;
      return !q || searchText(o).includes(q);
    });
  }, [orders, orderQuery, orderStatusFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredOrders.length / pageSize)), [filteredOrders.length, pageSize]);
  const safePage = Math.min(page, totalPages);
  const pagedOrders = useMemo(() => filteredOrders.slice((safePage - 1) * pageSize, (safePage - 1) * pageSize + pageSize), [filteredOrders, safePage, pageSize]);

  const exportOrdersCsv = useCallback(mode => {
    const rows = mode === "all" ? orders : filteredOrders;
    const header = ["ID","Customer","Phone","Items","Total","Date","Status"];
    const lines = [header.map(csv).join(","), ...rows.map(o => [o.id, getCustomerName(o), getPhone(o), itemsStr(o.items), money(calcTotal(o)), dateStr(getDate(o)), o.status ?? "Pending"].map(csv).join(","))];
    download(`orders-${mode}-${new Date().toISOString().slice(0,10)}.csv`, lines.join("\n"));
  }, [orders, filteredOrders]);

  const printOrders = useCallback(() => {
    const html = `<html><head><title>Orders</title><meta charset="utf-8"/><style>
      body{font-family:Arial,sans-serif;padding:16px} h1{margin:0 0 12px;font-size:20px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;vertical-align:top} th{background:#f5f5f5;text-align:left}
      </style></head><body><h1>Orders</h1>
      <table><thead><tr><th>ID</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>${filteredOrders.map(o => `<tr>
        <td>${o.id ?? "-"}</td><td>${getCustomerName(o)}</td><td>${getPhone(o)}</td><td>${itemsStr(o.items)}</td><td>$${money(calcTotal(o))}</td><td>${dateStr(getDate(o))}</td><td>${o.status ?? "Pending"}</td></tr>`).join("")}</tbody></table></body></html>`;
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!w) return alert("Popup blocked. Allow popups to print.");
    w.document.open(); w.document.write(html); w.document.close(); w.focus(); w.print();
  }, [filteredOrders]);

  return (
    <div className="admin-container">
      <Navbar />
      <main className="admin-content">
        <header className="admin-header">
          <h1>🌟 Admin Dashboard</h1>
          <p>Manage Customers, Orders, and Feedback efficiently.</p>
        </header>
        <section className="admin-actions">
          <button onClick={() => toggleModal("customers")} className="btn btn-customers">Customers ({customers.length})</button>
          <button onClick={() => toggleModal("orders")} className="btn btn-orders">Orders ({orders.length})</button>
          <button onClick={() => toggleModal("feedback")} className="btn btn-feedback">Feedback ({feedbackList.length})</button>
        </section>
      </main>

      {/* ---------------- Orders ---------------- */}
      {activeModal === "orders" && (
        <Modal title="Orders" onClose={closeModal} wide>
          <div className="admin-toolbar" style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:12 }}>
            <input value={orderQuery} onChange={e => setOrderQuery(e.target.value)} placeholder="Search customer or items..." className="admin-input" style={{padding:8,minWidth:220}} />
            <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} style={{padding:8}}>
              <option value="all">All</option><option value="pending">Pending</option><option value="completed">Completed</option>
            </select>
            <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} style={{padding:8}}>
              <option value={5}>5 / page</option><option value={8}>8 / page</option><option value={10}>10 / page</option><option value={20}>20 / page</option>
            </select>
            <div style={{ display:"flex", gap:8, marginLeft:"auto", flexWrap:"wrap" }}>
              <button onClick={() => exportOrdersCsv("filtered")} className="small-btn complete">Export CSV (filtered)</button>
              <button onClick={() => exportOrdersCsv("all")} className="small-btn complete">Export CSV (all)</button>
              <button onClick={printOrders} className="small-btn complete">Print</button>
              <button onClick={fetchOrders} className="small-btn">Refresh</button>
            </div>
          </div>

          {ordersLoading ? <p>Loading orders...</p> : ordersError ? <p style={{color:"crimson"}}>{ordersError}</p> :
            !filteredOrders.length ? <p>No matching orders.</p> : <>
              <p style={{marginTop:0}}>Showing <strong>{pagedOrders.length}</strong> of <strong>{filteredOrders.length}</strong> matching orders.</p>
              <table className="orders-table">
                <thead><tr><th>ID</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{pagedOrders.map((o,idx) => {
                  const done = (o.status ?? "Pending") === "Completed";
                  return <tr key={o.id ?? idx} className={idx%2?"row-dark":"row-light"}>
                    <td>{o.id ?? "-"}</td><td>{getCustomerName(o)}</td><td>{getPhone(o)}</td><td>{itemsStr(o.items)}</td><td>${money(calcTotal(o))}</td><td>{dateStr(getDate(o))}</td>
                    <td><span className={`badge ${done?"completed":"pending"}`}>{o.status ?? "Pending"}</span></td>
                    <td>{!done && <button onClick={()=>markOrderCompleted(o.id)} className="small-btn complete">Complete</button>}
                      <button onClick={()=>deleteOrder(o.id)} className="small-btn delete">Delete</button></td>
                  </tr>
                })}</tbody>
              </table>
              <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:14, alignItems:"center" }}>
                <button className="small-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={safePage<=1}>Prev</button>
                <span>Page <strong>{safePage}</strong> / <strong>{totalPages}</strong></span>
                <button className="small-btn" onClick={()=>setPage(p=>p+1)} disabled={safePage>=totalPages}>Next</button>
              </div>
            </>}
        </Modal>
      )}

      {/* ---------------- Customers ---------------- */}
      {activeModal==="customers" && <Modal title="Customers" onClose={closeModal}>
        {!customers.length ? <p>No customers found.</p> : <ul className="list">{customers.map((c,idx)=><li key={c.email??`${c.name??"customer"}-${idx}`} className="list-item"><strong className="highlight">{c.name??"Unknown"}</strong> ({c.email||"No email"})</li>)}</ul>}
      </Modal>}

      {/* ---------------- Feedback ---------------- */}
      {activeModal==="feedback" && <Modal title="Feedback" onClose={closeModal} wide>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginBottom:10}}><button onClick={fetchFeedback} className="small-btn">Refresh</button></div>
        {feedbackLoading ? <p>Loading feedback...</p> : feedbackError ? <p style={{color:"crimson"}}>{feedbackError}</p> :
          !feedbackList.length ? <p>No feedback yet.</p> : <ul className="list">{feedbackList.map(f=><li key={f.id} className="list-item"><span><strong>{f.name??"Anonymous"}</strong> ({dateStr(f.created_at)}): {f.comment??""}</span><button onClick={()=>deleteFeedback(f.id)} className="small-btn delete">Delete</button></li>)}</ul>}
      </Modal>}
    </div>
  );
}

/* ---------- Modal ---------- */
function Modal({ children, onClose, title, wide=false }) {
  useEffect(() => { const onKeyDown = e => e.key==="Escape" && onClose(); window.addEventListener("keydown", onKeyDown); return ()=>window.removeEventListener("keydown", onKeyDown); }, [onClose]);
  return <div className="modal-overlay" onMouseDown={onClose}>
    <div className={`modal ${wide?"wide":""}`} onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
      <h3 className="modal-title">{title}</h3>
      <div className="modal-body">{children}</div>
      <div className="modal-footer"><button onClick={onClose} className="btn btn-close">Close</button></div>
    </div>
  </div>;
}
