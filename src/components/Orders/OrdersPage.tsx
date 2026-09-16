import { useMemo, useState } from "react";
import ConfirmDeleteModal from "../common/ConfirmDeleteModal";
import { menuItems } from "../MenuItems/data/menu-item.data";
import "./Orders.css";

type Status = "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled";
type OrderItem = { id: string; name: string; price: number; image: string; quantity: number };
type Order = { id: string; table: string; customer: string; type: string; total: number; status: Status; items?: OrderItem[] };
type OrderDraft = Omit<Order, "id">;
type RestaurantTable = { id: number; status: "Available" | "Occupied" | "Reserved" };
const storageKey = "restaurant-orders";
const defaultTables: RestaurantTable[] = [{ id: 1, status: "Available" }, { id: 2, status: "Occupied" }, { id: 3, status: "Available" }, { id: 4, status: "Available" }, { id: 5, status: "Occupied" }, { id: 6, status: "Available" }, { id: 7, status: "Available" }, { id: 8, status: "Reserved" }];
const initialOrders: Order[] = [
  { id: "#10025", table: "T-05", customer: "Rohit Sharma", type: "Dine In", total: 1045, status: "Preparing" },
  { id: "#10024", table: "T-02", customer: "Amit Kumar", type: "Dine In", total: 650, status: "Ready" },
  { id: "#10023", table: "-", customer: "Neha Patel", type: "Takeaway", total: 420, status: "Completed" },
  { id: "#10022", table: "T-08", customer: "Rahul Singh", type: "Dine In", total: 1200, status: "Pending" },
];
const statusIcon: Record<Status, string> = { Pending: "◷", Preparing: "♨", Ready: "●", Completed: "✓", Cancelled: "×" };

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) as Order[] : initialOrders;
  });
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<"All" | Status>("All");
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [viewing, setViewing] = useState<Order | null>(null);
  const saveOrders = (next: Order[]) => { setOrders(next); localStorage.setItem(storageKey, JSON.stringify(next)); };
  const visibleOrders = useMemo(() => orders.filter((order) => (active === "All" || order.status === active) && `${order.id} ${order.customer} ${order.table}`.toLowerCase().includes(query.toLowerCase())), [orders, query, active]);
  const saveOrder = (draft: OrderDraft) => {
    const next = editing?.id ? orders.map((order) => order.id === editing.id ? { ...draft, id: order.id } : order) : [{ ...draft, id: `#${10026 + orders.length}` }, ...orders];
    saveOrders(next); setEditing(null);
  };
  const completePayment = (order: Order) => {
    saveOrders(orders.map((entry) => entry.id === order.id ? { ...entry, status: "Completed" } : entry));
    if (order.table !== "-") {
      const savedTables = localStorage.getItem("restaurant-tables");
      const tables = savedTables ? JSON.parse(savedTables) as RestaurantTable[] : defaultTables;
      const tableId = Number(order.table.replace("T-", ""));
      localStorage.setItem("restaurant-tables", JSON.stringify(tables.map((table) => table.id === tableId ? { ...table, status: "Available" } : table)));
    }
    setViewing(null);
  };
  const tabs: Array<"All" | Status> = ["All", "Pending", "Preparing", "Ready", "Completed", "Cancelled"];
  return <section className="orders-page">
    <div className="orders-heading"><div><p className="eyebrow">Restaurant operations</p><h1>Orders</h1><p>Manage and track every order in real time.</p></div><button className="primary-button" onClick={() => setEditing({ id: "", customer: "", table: "T-05", type: "Dine In", total: 0, status: "Pending", items: [] })}>＋ Create Order</button></div>
    <div className="order-tabs">{tabs.map((tab) => <button key={tab} className={active === tab ? "active" : ""} onClick={() => setActive(tab)}>{tab} <span>{tab === "All" ? orders.length : orders.filter((order) => order.status === tab).length}</span></button>)}</div>
    <div className="orders-card"><div className="order-tools"><label>⌕ <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by order #, customer, table..." /></label><button>▣ Today⌄</button><button>Order Type⌄</button></div><div className="order-table-wrap"><table className="order-table"><thead><tr><th>Order #</th><th>Table</th><th>Customer</th><th>Type</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleOrders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{order.table}</td><td>{order.customer}</td><td>{order.type}</td><td>₹{order.total.toLocaleString("en-IN")}</td><td><span className={`order-status ${order.status.toLowerCase()}`}>{statusIcon[order.status]} {order.status}</span></td><td className="order-actions"><button title="View order" onClick={() => setViewing(order)}>◉</button><button title="Edit order" onClick={() => setEditing(order)}>✎</button><button title="Delete order" className="delete-action" onClick={() => setDeleting(order)}>♲</button></td></tr>)}</tbody></table></div><p className="results">Showing {visibleOrders.length} of {orders.length} orders</p></div>
    {editing && <OrderForm order={editing} onClose={() => setEditing(null)} onSave={saveOrder} />}
    {viewing && <OrderDetails order={viewing} onClose={() => setViewing(null)} onComplete={() => completePayment(viewing)} />}
    {deleting && <ConfirmDeleteModal itemName={deleting.id} itemType="Order" onCancel={() => setDeleting(null)} onConfirm={() => { saveOrders(orders.filter((order) => order.id !== deleting.id)); setDeleting(null); }} />}
  </section>;
}

function OrderDetails({ order, onClose, onComplete }: { order: Order; onClose: () => void; onComplete: () => void }) {
  const items = order.items ?? [];
  const subtotal = items.length ? items.reduce((sum, item) => sum + item.price * item.quantity, 0) : Math.round(order.total / 1.05);
  const tax = order.total - subtotal;
  const panel = { width: "min(880px, 100%)", padding: "22px", background: "#fff", borderRadius: "8px", boxShadow: "0 18px 44px #10233b40", color: "#17304d" };
  const card = { border: "1px solid #e2e9f1", borderRadius: "7px", padding: "15px", background: "#fff" };
  const itemRow = { display: "grid", gridTemplateColumns: "1.6fr .8fr .4fr .8fr", gap: "10px", padding: "9px 0", fontSize: "11px", borderBottom: "1px solid #edf1f5" };
  const summaryRow = { display: "flex", justifyContent: "space-between", margin: "7px 0", color: "#52657c", fontSize: "11px" };
  const events = ["Order Created", "Confirmed", "Preparing", "Ready", "Completed"];
  return <div className="modal-backdrop"><section className="order-details-modal" style={panel}><div className="modal-title"><div><p className="eyebrow">Order details</p><h2>{order.id} <em className={`order-status ${order.status.toLowerCase()}`}>{statusIcon[order.status]} {order.status}</em></h2></div><button className="icon-button" onClick={onClose}>×</button></div><div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.8fr) minmax(210px, .8fr)", gap: "18px" }}><main><section style={card}><b style={{ fontSize: "12px" }}>Order {order.id}</b><div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginTop: "14px", fontSize: "11px", color: "#52657c" }}><span><b>Table:</b> {order.table === "-" ? "Not assigned" : order.table}</span><span><b>Type:</b> {order.type}</span><span><b>Customer:</b> {order.customer}</span><span><b>Total:</b> ₹{order.total}</span></div></section><section style={{ ...card, marginTop: "14px" }}><h3 style={{ margin: "0 0 8px", fontSize: "13px" }}>Order Items</h3><div style={{ ...itemRow, color: "#718197", fontWeight: 700 }}><span>Item</span><span>Qty</span><span>Price</span><span>Total</span></div>{items.length ? items.map((item) => <div style={itemRow} key={item.id}><span>{item.name}</span><span>{item.quantity}</span><span>₹{item.price}</span><strong>₹{item.price * item.quantity}</strong></div>) : <p className="empty-order">Item details are unavailable for this older order.</p>}</section><section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "14px" }}><div style={card}><b style={{ fontSize: "12px" }}>Payment Status</b><p style={{ margin: "12px 0 0" }}><em className="order-status ready">● Paid</em></p></div><div style={card}><p style={summaryRow}>Subtotal <strong>₹{subtotal}</strong></p><p style={summaryRow}>Tax <strong>₹{tax}</strong></p><p style={{ ...summaryRow, borderTop: "1px solid #dce6f0", paddingTop: "9px", color: "#17304d", fontWeight: 800, fontSize: "13px" }}>Total <strong>₹{order.total}</strong></p></div></section></main><aside style={{ ...card, alignSelf: "stretch" }}><h3 style={{ margin: "0 0 16px", fontSize: "13px" }}>Order Timeline</h3>{events.map((event, index) => <div key={event} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: "8px", minHeight: "47px", color: index <= ["Pending", "Preparing", "Ready", "Completed"].indexOf(order.status) + 1 ? "#285fbd" : "#8b9aae", fontSize: "11px" }}><span style={{ color: "#1875ee", fontSize: "16px" }}>●</span><span><b>{event}</b><small style={{ display: "block", marginTop: "3px", color: "#8b9aae" }}>{index === 0 ? "Order received" : index <= ["Pending", "Preparing", "Ready", "Completed"].indexOf(order.status) + 1 ? "Completed" : "Waiting"}</small></span></div>)}<div style={{ marginTop: "18px", display: "grid", gap: "9px" }}><button onClick={onClose} style={{ padding: "10px", border: "1px solid #d6e1ed", borderRadius: "5px", color: "#52657c", background: "#fff", cursor: "pointer" }}>Close</button>{order.status !== "Completed" && <button className="primary-button" onClick={onComplete}>Done Payment</button>}</div></aside></div></section></div>;
}

function OrderForm({ order, onClose, onSave }: { order: Order; onClose: () => void; onSave: (draft: OrderDraft) => void }) {
  const [customer, setCustomer] = useState(order.customer);
  const [table, setTable] = useState(order.table === "-" ? "T-05" : order.table);
  const [type, setType] = useState(order.type);
  const [status, setStatus] = useState<Status>(order.status);
  const [items, setItems] = useState<OrderItem[]>(order.items ?? []);
  const [category, setCategory] = useState("All");
  const savedTables = localStorage.getItem("restaurant-tables");
  const restaurantTables = savedTables ? JSON.parse(savedTables) as RestaurantTable[] : defaultTables;
  const tableOptions = restaurantTables.filter((entry) => entry.status !== "Occupied" || entry.id === Number(table.replace("T-", ""))).map((entry) => `T-${String(entry.id).padStart(2, "0")}`);
  const selectedTable = tableOptions.includes(table) ? table : tableOptions[0] ?? "";
  const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category)))];
  const filteredItems = category === "All" ? menuItems : menuItems.filter((item) => item.category === category);
  const updateQuantity = (item: OrderItem, amount: number) => setItems((current) => {
    const currentItem = current.find((entry) => entry.id === item.id);
    if (!currentItem && amount > 0) return [...current, { ...item, quantity: amount }];
    return current.flatMap((entry) => entry.id !== item.id ? [entry] : entry.quantity + amount <= 0 ? [] : [{ ...entry, quantity: entry.quantity + amount }]);
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * .05);
  return <div className="modal-backdrop"><form className="order-editor" onSubmit={(event) => { event.preventDefault(); onSave({ customer: customer || "Walk-in Guest", table: type === "Dine In" ? selectedTable : "-", type, total: subtotal + tax, status, items }); }}>
    <div className="modal-title"><div><p className="eyebrow">{order.id ? "Update sale" : "New sale"}</p><h2>{order.id ? `Edit Order ${order.id}` : "Create Order"}</h2></div><button type="button" className="icon-button" onClick={onClose}>×</button></div>
    <div className="order-editor-top"><div className="order-type-picker">{["Dine In", "Takeaway", "Delivery"].map((value) => <button type="button" key={value} className={type === value ? "selected" : ""} onClick={() => setType(value)}>{value}</button>)}</div><label>Customer<input required value={customer} onChange={(event) => setCustomer(event.target.value)} /></label>{type === "Dine In" && <label>Table<select required value={selectedTable} onChange={(event) => setTable(event.target.value)} disabled={tableOptions.length === 0}>{tableOptions.length ? tableOptions.map((value) => <option key={value}>{value}</option>) : <option value="">No tables available</option>}</select></label>}<label>Status<select value={status} onChange={(event) => setStatus(event.target.value as Status)}>{(["Pending", "Preparing", "Ready", "Completed", "Cancelled"] as Status[]).map((value) => <option key={value}>{value}</option>)}</select></label></div>
    <div className="item-order-workspace"><section><div className="menu-catalog-heading"><h3>Menu Items</h3><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((value) => <option key={value}>{value}</option>)}</select></label></div><div className="menu-product-grid">{filteredItems.map((menuItem) => { const selected = items.find((item) => item.id === menuItem.id); const item: OrderItem = { id: menuItem.id, name: menuItem.name, price: menuItem.price, image: menuItem.image, quantity: 0 }; return <article className="menu-product" key={menuItem.id}><img src={menuItem.image} alt="" /><strong>{menuItem.name}</strong><span>₹{menuItem.price}</span>{selected ? <div className="quantity-control"><button type="button" onClick={() => updateQuantity(item, -1)}>−</button><b>{selected.quantity}</b><button type="button" onClick={() => updateQuantity(item, 1)}>＋</button></div> : <button type="button" className="add-item-button" onClick={() => updateQuantity(item, 1)}>＋ Add</button>}</article>; })}</div></section><aside className="current-order"><h3>Current Order</h3>{items.length === 0 ? <p className="empty-order">Add items from the menu.</p> : items.map((item) => <div className="current-item" key={item.id}><img src={item.image} alt="" /><div><strong>{item.name}</strong><small>₹{item.price} each</small><div className="quantity-control"><button type="button" onClick={() => updateQuantity(item, -1)}>−</button><b>{item.quantity}</b><button type="button" onClick={() => updateQuantity(item, 1)}>＋</button></div></div><button type="button" className="remove-item" onClick={() => updateQuantity(item, -item.quantity)}>♲</button></div>)}<div className="order-totals"><p>Subtotal <strong>₹{subtotal}</strong></p><p>Tax (5%) <strong>₹{tax}</strong></p><p className="grand-total">Total <strong>₹{subtotal + tax}</strong></p></div></aside></div>
    <div className="modal-actions"><button type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{order.id ? "Update Order" : "Place Order"}</button></div>
  </form></div>;
}
export default OrdersPage;
