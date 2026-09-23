import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../common/Breadcrumb";
import ErrorAlert from "../common/ErrorAlert";
import LoadingSpinner from "../common/LoadingSpinner";
import { useToast } from "../common/Toast";
import { menuItemsApi, type MenuItemApi } from "../../api/menu-items.api";
import { ordersApi, type OrderApi, type RestaurantTableApi } from "../../api/orders.api";
import { formatCurrency } from "../../utils/currency";
import "./EditOrderPage.css";

type EditableItem = { itemName: string; variant?: string; quantity: number; unitPrice: number };

function TrashIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M9 7l1-3h4l1 3m-9 0 1 13h10l1-13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function EditOrderPage() {
  const { id } = useParams();
  const orderId = Number(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState<OrderApi | null>(null);
  const [tables, setTables] = useState<RestaurantTableApi[]>([]);
  const [menu, setMenu] = useState<MenuItemApi[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [tableId, setTableId] = useState<number | undefined>();
  const [instructions, setInstructions] = useState("");
  const [items, setItems] = useState<EditableItem[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { void Promise.all([ordersApi.get(orderId), ordersApi.listTables(), menuItemsApi.list({ status: "Active" })])
    .then(([orderData, tableData, menuData]) => { setOrder(orderData); setTables(tableData); setMenu(menuData); setCustomerName(orderData.customerName); setTableId(orderData.restaurantTableId); setInstructions(orderData.specialInstructions ?? ""); setItems(orderData.items.map((item) => ({ itemName: item.itemName, variant: item.variant, quantity: item.quantity, unitPrice: item.unitPrice }))); })
    .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load this order."))
    .finally(() => setLoading(false)); }, [orderId]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items]);
  const tax = useMemo(() => Math.round(subtotal * 5) / 100, [subtotal]);
  const changeQuantity = (index: number, delta: number) => setItems((current) => current.flatMap((item, position) => position !== index ? [item] : item.quantity + delta > 0 ? [{ ...item, quantity: item.quantity + delta }] : []));
  const addItem = (menuItem: MenuItemApi) => setItems((current) => { const found = current.find((item) => item.itemName === menuItem.name); return found ? current.map((item) => item.itemName === menuItem.name ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { itemName: menuItem.name, quantity: 1, unitPrice: menuItem.price }]; });
  const save = async (event: React.FormEvent) => { event.preventDefault(); if (!order || !items.length) { setError("Add at least one order item before updating."); return; } if (order.orderType === "DineIn" && !tableId) { setError("Select a table for this dine-in order."); return; } try { setSaving(true); setError(""); await ordersApi.update(order.id, { customerName, orderType: order.orderType, restaurantTableId: order.orderType === "DineIn" ? tableId : undefined, specialInstructions: instructions.trim() || undefined, items }); showToast("Order updated successfully", "success", 1800); navigate(`/orders/${order.id}`); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to update the order."); } finally { setSaving(false); } };

  if (loading) return <section className="edit-order-page"><LoadingSpinner text="Loading order editor..." fullScreen /></section>;
  if (!order) return <section className="edit-order-page"><ErrorAlert message={error || "Order not found."} onDismiss={() => navigate("/orders")} /></section>;
  return <section className="edit-order-page"><form onSubmit={save}>
    <header className="edit-order-header"><div><Breadcrumb items={[{ label: "Orders", path: "/orders" }, { label: `Order #${order.id}`, path: `/orders/${order.id}` }, { label: "Edit" }]} /><h1><button type="button" onClick={() => navigate(`/orders/${order.id}`)} aria-label="Back to order">←</button> Edit Order #{order.id}</h1></div><div><button type="button" className="secondary-button" onClick={() => navigate(`/orders/${order.id}`)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Updating..." : "Update Order"}</button></div></header>
    {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
    <div className="edit-order-controls"><label>Table<select value={tableId ?? ""} onChange={(event) => setTableId(Number(event.target.value))} disabled={order.orderType !== "DineIn"}><option value="">{order.orderType === "DineIn" ? "Select table" : "No table required"}</option>{tables.filter((table) => table.status !== "Occupied" || table.id === order.restaurantTableId).map((table) => <option key={table.id} value={table.id}>{table.tableNumber}</option>)}</select></label><label className="edit-customer">Customer<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Customer name" /></label><button type="button" className="edit-add-customer" onClick={() => navigate("/customers/new")}>＋</button></div>
    <div className="edit-order-layout"><div className="edit-items-area"><h2>Order Items</h2><div className="edit-item-list">{items.map((item, index) => <article key={`${item.itemName}-${index}`} className="edit-item"><div className="edit-item-image">{menu.find((entry) => entry.name === item.itemName)?.imageUrl ? <img src={menu.find((entry) => entry.name === item.itemName)?.imageUrl} alt="" /> : "🍽"}</div><div className="edit-item-name"><strong>{item.itemName}</strong><small>{item.variant || "Standard"}</small></div><div className="edit-quantity"><button type="button" onClick={() => changeQuantity(index, -1)}>−</button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(index, 1)}>＋</button></div><strong>{formatCurrency(item.unitPrice * item.quantity)}</strong><button type="button" className="edit-remove" aria-label={`Remove ${item.itemName}`} title={`Remove ${item.itemName}`} onClick={() => setItems((current) => current.filter((_, position) => position !== index))}><TrashIcon /></button></article>)}</div><button type="button" className="add-more-items" onClick={() => setShowMenu((value) => !value)}>＋ {showMenu ? "Hide menu" : "Add More Items"}</button>{showMenu && <div className="edit-menu-grid">{menu.map((item) => <button type="button" key={item.id} onClick={() => addItem(item)}>{item.imageUrl && <img src={item.imageUrl} alt="" />}<span>{item.name}</span><strong>{formatCurrency(item.price)}</strong></button>)}</div>}<label className="edit-instructions">Special Instructions<textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Any special requests..." rows={3} /></label></div><aside className="edit-summary"><h2>Order Summary</h2><div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div><div><span>Discount</span><strong>{formatCurrency(0)}</strong></div><div><span>Tax</span><strong>{formatCurrency(tax)}</strong></div><div className="edit-summary-total"><span>Total</span><strong>{formatCurrency(subtotal + tax)}</strong></div></aside></div>
  </form></section>;
}
export default EditOrderPage;
