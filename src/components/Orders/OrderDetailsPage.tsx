import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../common/Breadcrumb";
import ErrorAlert from "../common/ErrorAlert";
import LoadingSpinner from "../common/LoadingSpinner";
import { useToast } from "../common/Toast";
import { ordersApi, type OrderApi } from "../../api/orders.api";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import "./OrderDetailsPage.css";

const statusSteps: OrderApi["status"][] = ["Pending", "Preparing", "Ready", "Completed"];

function PrintIcon() {
  return <svg className="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7zM17 12h.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function OrderDetailsPage() {
  const { id } = useParams();
  const orderId = Number(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState<OrderApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!Number.isInteger(orderId) || orderId <= 0) { setError("Invalid order number."); setLoading(false); return; }
    try { setLoading(true); setOrder(await ordersApi.get(orderId)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load this order."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [orderId]);

  const stepIndex = useMemo(() => order ? statusSteps.indexOf(order.status) : -1, [order]);
  const updateStatus = async (status: OrderApi["status"]) => {
    if (!order) return;
    try { setUpdating(true); setOrder(await ordersApi.updateStatus(order.id, status)); showToast(`Order marked as ${status}`, "success", 1800); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to update order status."); }
    finally { setUpdating(false); }
  };

  if (loading) return <section className="order-details-page"><LoadingSpinner text="Loading order details..." fullScreen /></section>;
  if (!order) return <section className="order-details-page"><ErrorAlert message={error || "Order not found."} onDismiss={() => navigate("/orders")} /><button className="secondary-button" onClick={() => navigate("/orders")}>Back to orders</button></section>;

  const completedOrCancelled = order.status === "Completed" || order.status === "Cancelled";
  const nextStatus = statusSteps[stepIndex + 1];
  return <section className="order-details-page">
    <header className="detail-topbar">
      <div><Breadcrumb items={[{ label: "Orders", path: "/orders" }, { label: `Order #${order.id}` }]} /><div className="detail-title"><button className="back-button" onClick={() => navigate("/orders")} aria-label="Back to orders">←</button><h1>Order Details</h1><span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span></div></div>
      <div className="detail-actions"><button className="secondary-button detail-print-button" onClick={() => window.print()}><PrintIcon />Print</button><button className="primary-button" disabled={completedOrCancelled} onClick={() => navigate(`/orders/${order.id}/edit`)}>✎ Edit</button></div>
    </header>
    {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
    <div className="order-detail-grid">
      <div className="detail-main">
        <article className="detail-card overview-card"><div className="order-number-icon">▣</div><div className="overview-content"><h2>Order #{order.id}</h2><div className="detail-meta-grid"><span><small>Table</small><strong>{order.tableNumber ? `Table ${order.tableNumber}` : "No table"}</strong></span><span><small>Order Type</small><strong>{order.orderType === "DineIn" ? "Dine In" : order.orderType}</strong></span><span><small>Customer</small><strong>{order.customerName || "Walk-in customer"}</strong></span></div></div><time>Created at<br /><strong>{formatDate(order.createdAtUtc)}</strong></time></article>
        <article className="detail-card"><h2>Order Items</h2><div className="detail-items"><div className="detail-items-head"><span>Item</span><span>Variant</span><span>Qty</span><span>Unit price</span><span>Total</span></div>{order.items.map((item, index) => <div className="detail-item" key={`${item.itemName}-${index}`}><strong>{item.itemName}</strong><span>{item.variant || "Standard"}</span><span>{item.quantity}</span><span>{formatCurrency(item.unitPrice)}</span><strong>{formatCurrency(item.lineTotal ?? item.quantity * item.unitPrice)}</strong></div>)}</div></article>
        {order.specialInstructions && <article className="detail-card instructions-summary"><h2>Special instructions</h2><p>{order.specialInstructions}</p></article>}
        <div className="detail-bottom"><article className="detail-card payment-card"><span>Payment Status</span><strong className="payment-paid">● Paid</strong></article><article className="detail-card totals-card"><div><span>Subtotal</span><strong>{formatCurrency(order.subtotal)}</strong></div><div><span>Tax</span><strong>{formatCurrency(order.taxAmount)}</strong></div><div className="detail-grand-total"><span>Total</span><strong>{formatCurrency(order.totalAmount)}</strong></div></article></div>
      </div>
      <aside className="detail-sidebar"><article className="detail-card timeline-card"><h2>Order Timeline</h2><ol>{statusSteps.map((status, index) => <li key={status} className={index <= stepIndex && order.status !== "Cancelled" ? "done" : ""}><i>{index < stepIndex ? "✓" : ""}</i><div><strong>{status}</strong><small>{index === stepIndex ? "Current order status" : index < stepIndex ? "Completed" : "Waiting"}</small></div></li>)}{order.status === "Cancelled" && <li className="cancelled"><i>×</i><div><strong>Cancelled</strong><small>Order was cancelled</small></div></li>}</ol></article><div className="detail-status-actions">{!completedOrCancelled && nextStatus && <button className="primary-button" disabled={updating} onClick={() => void updateStatus(nextStatus)}>{updating ? "Updating..." : `Mark as ${nextStatus}`}</button>}{!completedOrCancelled && <button className="danger-outline" disabled={updating} onClick={() => void updateStatus("Cancelled")}>Cancel Order</button>}</div></aside>
    </div>
  </section>;
}
export default OrderDetailsPage;
