import React, { useEffect, useMemo, useCallback, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import "../styles/Admin.css";

/* ---------- storage ---------- */
const readJSON = (k, fb) => {
  if (typeof window === "undefined") return fb;
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v ?? fb;
  } catch {
    return fb;
  }
};
const writeJSON = (k, v) =>
  typeof window !== "undefined" && localStorage.setItem(k, JSON.stringify(v));

/* ---------- order helpers (THIS is the key fix) ---------- */
const getCustomerName = (o) =>
  o?.fullName || o?.customerName || o?.customer_name || o?.name || "Unknown";

const calcTotal = (o) => {
  // If total exists and is a valid number, use it
  const t = Number(o?.total);
  if (Number.isFinite(t) && t > 0) return t;

  // Otherwise compute from items
  const items = Array.isArray(o?.items) ? o.items : [];
  const sum = items.reduce((s, i) => s + Number(i?.price || 0) * Number(i?.qty || 0), 0);
  return Number.isFinite(sum) ? sum : 0;
};

const money = (v) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};
const dateStr = (d) => {
  if (!d) return "-";
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? "-" : t.toLocaleString();
};
const itemsStr = (items) =>
  Array.isArray(items) && items.length
    ? items.map((i) => `${i?.item_name ?? "Item"} (x${Number(i?.qty ?? 1)})`).join(", ")
    : "No items";

const searchText = (o) => {
  const name = getCustomerName(o).toLowerCase();
  const items = Array.isArray(o?.items)
    ? o.items.map((i) => `${i?.item_name ?? ""} ${i?.qty ?? ""}`).join(" ").toLowerCase()
    : "";
  return `${name} ${items}`.trim();
};

/* ---------- CSV ---------- */
const csv = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const download = (name, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export default function Admin() {
  const [activeModal, setActiveModal] = useState(null); // customers|orders|feedback|null
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);

  const [orderQuery, setOrderQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(8);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setCustomers(readJSON("users", []));
    setOrders(readJSON("orders", []));
    setFeedbackList(readJSON("feedbackList", []));
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.storageArea !== localStorage) return;
      if (e.key === "users") setCustomers(readJSON("users", []));
      if (e.key === "orders") setOrders(readJSON("orders", []));
      if (e.key === "feedbackList") setFeedbackList(readJSON("feedbackList", []));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => setPage(1), [orderQuery, orderStatusFilter, pageSize]);

  const closeModal = useCallback(() => setActiveModal(null), []);
  const toggleModal = useCallback(
    (name) => setActiveModal((cur) => (cur === name ? null : name)),
    []
  );

  const setOrdersAndPersist = useCallback((updater) => {
    setOrders((prev) => {
      const next = updater(prev);
      writeJSON("orders", next);
      return next;
    });
  }, []);

  const markOrderCompleted = useCallback(
    (idx) =>
      setOrdersAndPersist((prev) =>
        prev.map((o, i) => (i === idx ? { ...o, status: "Completed" } : o))
      ),
    [setOrdersAndPersist]
  );

  const deleteOrder = useCallback(
    (idx) => {
      if (!window.confirm("Delete this order?")) return;
      setOrdersAndPersist((prev) => prev.filter((_, i) => i !== idx));
    },
    [setOrdersAndPersist]
  );

  const deleteFeedback = useCallback((idx) => {
    if (!window.confirm("Delete this feedback?")) return;
    setFeedbackList((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      writeJSON("feedbackList", next);
      return next;
    });
  }, []);

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    return orders.filter((o) => {
      const status = String(o?.status ?? "Pending");
      const done = status === "Completed";
      if (orderStatusFilter === "completed" && !done) return false;
      if (orderStatusFilter === "pending" && done) return false;
      return !q || searchText(o).includes(q);
    });
  }, [orders, orderQuery, orderStatusFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredOrders.length / pageSize)),
    [filteredOrders.length, pageSize]
  );
  const safePage = Math.min(page, totalPages);
  const pagedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, safePage, pageSize]);

  const exportOrdersCsv = useCallback(
    (mode = "filtered") => {
      const rows = mode === "all" ? orders : filteredOrders;
      const header = ["Customer", "Phone", "Items", "Total", "Date", "Status"];
      const lines = [
        header.map(csv).join(","),
        ...rows.map((o) =>
          [
            getCustomerName(o),
            o?.phoneNumber ?? o?.phone ?? "-",
            itemsStr(o?.items),
            money(calcTotal(o)),
            dateStr(o?.date),
            o?.status ?? "Pending",
          ]
            .map(csv)
            .join(",")
        ),
      ];
      download(`orders-${mode}-${new Date().toISOString().slice(0, 10)}.csv`, lines.join("\n"));
    },
    [orders, filteredOrders]
  );

  const printOrders = useCallback(() => {
    const rows = filteredOrders;
    const html = `
      <html><head><title>Orders Print</title><meta charset="utf-8"/>
      <style>
        body{font-family:Arial,sans-serif;padding:16px}
        h1{margin:0 0 12px;font-size:20px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #ddd;padding:8px;vertical-align:top}
        th{background:#f5f5f5;text-align:left}
      </style></head><body>
      <h1>Orders</h1>
      <table><thead><tr><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>
        ${rows
          .map(
            (o) => `<tr>
              <td>${getCustomerName(o)}</td>
              <td>${String(o?.phoneNumber ?? o?.phone ?? "-")}</td>
              <td>${itemsStr(o?.items)}</td>
              <td>$${money(calcTotal(o))}</td>
              <td>${dateStr(o?.date)}</td>
              <td>${String(o?.status ?? "Pending")}</td>
            </tr>`
          )
          .join("")}
      </tbody></table></body></html>`;
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!w) return alert("Popup blocked. Allow popups to print.");
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
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
          <button onClick={() => toggleModal("customers")} className="btn btn-customers">
            Customers ({customers.length})
          </button>
          <button onClick={() => toggleModal("orders")} className="btn btn-orders">
            Orders ({orders.length})
          </button>
          <button onClick={() => toggleModal("feedback")} className="btn btn-feedback">
            Feedback ({feedbackList.length})
          </button>
        </section>
      </main>

      {activeModal === "orders" && (
        <Modal title="Orders" onClose={closeModal} wide>
          <div className="admin-toolbar" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <input
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="Search customer or items..."
              className="admin-input"
              style={{ padding: 8, minWidth: 220 }}
            />
            <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} style={{ padding: 8 }}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={{ padding: 8 }}>
              <option value={5}>5 / page</option>
              <option value={8}>8 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>

            <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
              <button onClick={() => exportOrdersCsv("filtered")} className="small-btn complete">Export CSV (filtered)</button>
              <button onClick={() => exportOrdersCsv("all")} className="small-btn complete">Export CSV (all)</button>
              <button onClick={printOrders} className="small-btn complete">Print</button>
            </div>
          </div>

          <p style={{ marginTop: 0 }}>
            Showing <strong>{pagedOrders.length}</strong> of <strong>{filteredOrders.length}</strong> matching orders.
          </p>

          {!filteredOrders.length ? (
            <p>No matching orders.</p>
          ) : (
            <>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedOrders.map((o, idxOnPage) => {
                    const realIdx = orders.indexOf(o);
                    const status = o?.status || "Pending";
                    const done = status === "Completed";
                    return (
                      <tr key={o?.orderId ?? `${realIdx}-${idxOnPage}`} className={idxOnPage % 2 ? "row-dark" : "row-light"}>
                        <td>{getCustomerName(o)}</td>
                        <td>{o?.phoneNumber ?? o?.phone ?? "-"}</td>
                        <td>{itemsStr(o?.items)}</td>
                        <td>${money(calcTotal(o))}</td>
                        <td>{dateStr(o?.date)}</td>
                        <td><span className={`badge ${done ? "completed" : "pending"}`}>{status}</span></td>
                        <td>
                          {!done && (
                            <button onClick={() => markOrderCompleted(realIdx)} className="small-btn complete">
                              Complete
                            </button>
                          )}
                          <button onClick={() => deleteOrder(realIdx)} className="small-btn delete">
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14, alignItems: "center" }}>
                <button className="small-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
                  Prev
                </button>
                <span>Page <strong>{safePage}</strong> / <strong>{totalPages}</strong></span>
                <button className="small-btn" onClick={() => setPage((p) => p + 1)} disabled={safePage >= totalPages}>
                  Next
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {activeModal === "customers" && (
        <Modal title="Customers" onClose={closeModal}>
          {!customers.length ? (
            <p>No customers found.</p>
          ) : (
            <ul className="list">
              {customers.map((c, idx) => (
                <li key={c?.email ?? `${c?.name ?? "customer"}-${idx}`} className="list-item">
                  <strong className="highlight">{c?.name ?? "Unknown"}</strong> ({c?.email || "No email"})
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {activeModal === "feedback" && (
        <Modal title="Feedback" onClose={closeModal} wide>
          {!feedbackList.length ? (
            <p>No feedback yet.</p>
          ) : (
            <ul className="list">
              {feedbackList.map((f, idx) => (
                <li key={f?.id ?? `${f?.name ?? "feedback"}-${idx}`} className="list-item">
                  <span>
                    <strong>{f?.name ?? "Anonymous"}</strong> ({dateStr(f?.date)}): {f?.comment ?? ""}
                  </span>
                  <button onClick={() => deleteFeedback(idx)} className="small-btn delete">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ---------- Modal ---------- */
function Modal({ children, onClose, title, wide = false }) {
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className={`modal ${wide ? "wide" : ""}`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h3 className="modal-title">{title}</h3>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-close">Close</button>
        </div>
      </div>
    </div>
  );
}
