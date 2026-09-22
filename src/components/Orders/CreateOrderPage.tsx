import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../common/Breadcrumb";
import ErrorAlert from "../common/ErrorAlert";
import LoadingSpinner from "../common/LoadingSpinner";
import { useToast } from "../common/Toast";
import { menuItemsApi, type MenuItemApi } from "../../api/menu-items.api";
import { ordersApi, type OrderApi, type OrderItemApi, type RestaurantTableApi } from "../../api/orders.api";
import { formatCurrency } from "../../utils/currency";
import TrashIcon from "../common/TrashIcon";
import "./CreateOrderPage.css";

type CartItem = Pick<OrderItemApi, "itemName" | "quantity" | "unitPrice">;
type OrderType = OrderApi["orderType"];

function CreateOrderPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tables, setTables] = useState<RestaurantTableApi[]>([]);
  const [menu, setMenu] = useState<MenuItemApi[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("DineIn");
  const [tableId, setTableId] = useState<number | undefined>();
  const [instructions, setInstructions] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([ordersApi.listTables(), menuItemsApi.list({ status: "Active" })])
      .then(([tableData, menuData]) => { setTables(tableData); setMenu(menuData); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load order data."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(menu.map((item) => item.categoryName).filter(Boolean)))], [menu]);
  const visibleMenu = category === "All" ? menu : menu.filter((item) => item.categoryName === category);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const addItem = (item: MenuItemApi) => setItems((current) => {
    const existing = current.find((entry) => entry.itemName === item.name);
    return existing
      ? current.map((entry) => entry.itemName === item.name ? { ...entry, quantity: entry.quantity + 1 } : entry)
      : [...current, { itemName: item.name, quantity: 1, unitPrice: item.price }];
  });

  const changeQuantity = (index: number, amount: number) => setItems((current) => current.flatMap((item, position) => {
    if (position !== index) return [item];
    const quantity = item.quantity + amount;
    return quantity > 0 ? [{ ...item, quantity }] : [];
  }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (orderType === "DineIn" && !tableId) { setError("Choose a table for a dine-in order."); return; }
    if (!items.length) { setError("Add at least one menu item before creating the order."); return; }
    try {
      setSaving(true); setError("");
      await ordersApi.create({ customerName, orderType, restaurantTableId: orderType === "DineIn" ? tableId : undefined, specialInstructions: instructions.trim() || undefined, items });
      showToast("Order created successfully", "success", 2000);
      navigate("/orders");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create order.");
    } finally { setSaving(false); }
  };

  if (loading) return <section className="create-order-page"><LoadingSpinner text="Loading order form..." fullScreen /></section>;

  return (
    <section className="create-order-page">
      <Breadcrumb items={[{ label: "Home", path: "/dashboard" }, { label: "Orders", path: "/orders" }, { label: "Create Order" }]} />
      <form onSubmit={submit}>
        <header className="create-order-heading">
          <div><h1>Create Order</h1><p>Add items and review the order before placing it.</p></div>
          <button className="secondary-button" type="button" onClick={() => navigate("/orders")}>Cancel</button>
        </header>
        {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
        <div className="create-order-details">
          <fieldset className="order-type-picker"><legend>Order Type</legend>{(["DineIn", "Takeaway", "Delivery"] as OrderType[]).map((type) => <button key={type} type="button" className={orderType === type ? "selected" : ""} onClick={() => { setOrderType(type); if (type !== "DineIn") setTableId(undefined); }}>{type === "DineIn" ? "Dine In" : type}</button>)}</fieldset>
          {orderType === "DineIn" ? <label>Table<select required value={tableId ?? ""} onChange={(event) => setTableId(Number(event.target.value))}><option value="">Select table</option>{tables.filter((table) => table.status !== "Occupied").map((table) => <option key={table.id} value={table.id}>{table.tableNumber} · {table.seatCapacity} seats</option>)}</select></label> : <div className="order-type-note">{orderType === "Delivery" ? "Delivery address can be added after the order is placed." : "No table is required for takeaway orders."}</div>}
          <div className="customer-field"><label>Customer<input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Search or enter customer name..." /></label><button type="button" className="add-customer-button" onClick={() => navigate("/customers/new")}>＋ Add Customer</button></div>
        </div>
        <div className="create-order-workspace">
          <section className="order-menu-panel">
            <div className="menu-category-tabs">{categories.map((value) => <button key={value} type="button" className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{value}</button>)}</div>
            <div className="create-menu-grid">{visibleMenu.map((item) => <article key={item.id} className="create-menu-card">{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className="menu-image-placeholder">🍽</div>}<strong>{item.name}</strong><span>{formatCurrency(item.price)}</span><button type="button" onClick={() => addItem(item)}>＋ Add</button></article>)}</div>
          </section>
          <aside className="order-summary-panel">
            <div className="order-panel-heading"><div><h2>Current Order</h2><p>{items.length ? `${items.length} item${items.length === 1 ? "" : "s"} added` : "No items added yet"}</p></div></div>
            <div className="order-cart">{items.length ? items.map((item, index) => <div className="order-cart-item" key={`${item.itemName}-${index}`}><div><strong>{item.itemName}</strong><small>{formatCurrency(item.unitPrice)} each</small><div className="cart-quantity"><button type="button" aria-label={`Decrease ${item.itemName}`} onClick={() => changeQuantity(index, -1)}>−</button><span>{item.quantity}</span><button type="button" aria-label={`Increase ${item.itemName}`} onClick={() => changeQuantity(index, 1)}>＋</button></div></div><div className="cart-item-price">{formatCurrency(item.unitPrice * item.quantity)}<button type="button" aria-label={`Remove ${item.itemName}`} title={`Remove ${item.itemName}`} onClick={() => setItems((current) => current.filter((_, position) => position !== index))}><TrashIcon /></button></div></div>) : <div className="cart-empty"><span>🧾</span><p>Your selected items will appear here.</p></div>}</div>
            <label className="instructions-field">Special instructions<textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Any special requests..." rows={3} /></label>
            <div className="order-totals"><div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div><div className="order-total-line"><span>Total</span><strong>{formatCurrency(subtotal)}</strong></div></div>
            <div className="create-order-actions"><button type="button" className="secondary-button" onClick={() => navigate("/orders")}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? "Creating..." : "Place Order"}</button></div>
          </aside>
        </div>
      </form>
    </section>
  );
}

export default CreateOrderPage;
