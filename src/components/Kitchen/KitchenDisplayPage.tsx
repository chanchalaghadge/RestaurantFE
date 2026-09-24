import { useCallback, useEffect, useRef, useState } from "react";
import Breadcrumb from "../common/Breadcrumb";
import { ordersApi, type OrderApi } from "../../api/orders.api";
import { formatCurrency } from "../../utils/currency";
import { formatTime } from "../../utils/date";
import "./KitchenDisplayPage.css";

const kitchenStatuses: OrderApi["status"][] = ["Pending", "Preparing", "Ready"];
const nextStatus: Partial<Record<OrderApi["status"], OrderApi["status"]>> = {
  Pending: "Preparing",
  Preparing: "Ready",
};

function KitchenDisplayPage() {
  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(() => new Set());
  const requestInFlight = useRef(false);

  const loadOrders = useCallback(async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    try {
      const data = await ordersApi.list();
      setOrders(data.filter((order) => kitchenStatuses.includes(order.status)));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load kitchen orders.");
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadOrders();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [loadOrders]);

  const advanceOrder = async (order: OrderApi) => {
    const status = nextStatus[order.status];
    if (!status) return;
    setUpdatingIds((current) => new Set(current).add(order.id));
    setError("");
    try {
      const updatedOrder = await ordersApi.updateStatus(order.id, status);
      setOrders((current) => current.map((item) => item.id === updatedOrder.id ? updatedOrder : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `Unable to move order #${order.id}.`);
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current);
        next.delete(order.id);
        return next;
      });
    }
  };

  return (
    <section className="kitchen-page">
      <header className="kitchen-topbar">
        <div>
          <Breadcrumb items={[{ label: "Home", path: "/dashboard" }, { label: "Kitchen Display" }]} />
          <h1>Kitchen Display</h1>
          <p>Active orders refresh automatically every 5 seconds.</p>
        </div>
        <span className="kitchen-live-indicator"><i /> Auto refresh · 5 sec</span>
      </header>

      {error && <p className="kitchen-error" role="alert">{error}</p>}
      {loading ? <div className="kitchen-empty">Loading orders…</div> : (
        <div className="kitchen-columns">
          {kitchenStatuses.map((status) => {
            const laneOrders = orders
              .filter((order) => order.status === status)
              .sort((a, b) => new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime());
            return (
              <section className={`kitchen-lane ${status.toLowerCase()}`} key={status} aria-label={`${status} orders`}>
                <header className="kitchen-lane-heading">
                  <h2>{status === "Pending" ? "New" : status}</h2>
                  <span>{laneOrders.length}</span>
                </header>
                {laneOrders.length ? laneOrders.map((order) => (
                  <article className="kitchen-order-card" key={order.id}>
                    <header className="kitchen-order-heading">
                      <div>
                        <strong>{order.restaurantTableId ? `Table ${order.tableNumber ?? "—"}` : order.orderType}</strong>
                        <span>Order #{order.id}</span>
                      </div>
                      <time>{formatTime(order.createdAtUtc)}</time>
                    </header>
                    <div className="kitchen-order-items">
                      {order.items.map((item, index) => (
                        <div className="kitchen-order-item" key={`${item.id ?? item.itemName}-${index}`}>
                          <b>{item.quantity}×</b>
                          <span>{item.itemName}{item.variant ? ` · ${item.variant}` : ""}</span>
                        </div>
                      ))}
                    </div>
                    {order.specialInstructions && (
                      <p className="kitchen-instructions"><b>Note:</b> {order.specialInstructions}</p>
                    )}
                    <footer className="kitchen-order-footer">
                      <strong>{formatCurrency(order.totalAmount)}</strong>
                      {nextStatus[order.status] && (
                        <button
                          type="button"
                          onClick={() => void advanceOrder(order)}
                          disabled={updatingIds.has(order.id)}
                        >
                          {updatingIds.has(order.id) ? "Saving…" : status === "Pending" ? "Start preparing" : "Mark ready"}
                        </button>
                      )}
                      {order.status === "Ready" && <span className="kitchen-ready-label">Waiting for service</span>}
                    </footer>
                  </article>
                )) : <p className="kitchen-lane-empty">No {status.toLowerCase()} orders</p>}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default KitchenDisplayPage;
