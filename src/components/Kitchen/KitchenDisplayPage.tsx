import { useCallback, useEffect, useRef, useState } from "react";
import Breadcrumb from "../common/Breadcrumb";
import { ordersApi, type KitchenTicketApi } from "../../api/orders.api";
import { formatTime } from "../../utils/date";
import { webSocketService } from "../../utils/websocket";
import "./KitchenDisplayPage.css";

const kitchenStatuses: KitchenTicketApi["status"][] = ["Pending", "Preparing", "Ready"];
const nextStatus: Partial<Record<KitchenTicketApi["status"], KitchenTicketApi["status"]>> = {
  Pending: "Preparing",
  Preparing: "Ready",
};

function KitchenDisplayPage() {
  const [tickets, setTickets] = useState<KitchenTicketApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(() => new Set());
  const requestInFlight = useRef(false);
  const refreshQueued = useRef(false);

  const loadOrders = useCallback(async () => {
    if (requestInFlight.current) {
      refreshQueued.current = true;
      return;
    }
    requestInFlight.current = true;
    try {
      setTickets(await ordersApi.listKitchenTickets());
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load kitchen orders.");
    } finally {
      requestInFlight.current = false;
      setLoading(false);
      if (refreshQueued.current) {
        refreshQueued.current = false;
        void loadOrders();
      }
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    void webSocketService.connect();
    void webSocketService.subscribeToOrders();

    const refreshTickets = () => void loadOrders();
    const unsubscribeCreated = webSocketService.on("order:created", refreshTickets);
    const unsubscribeUpdated = webSocketService.on("order:updated", refreshTickets);
    const unsubscribeDeleted = webSocketService.on("order:deleted", refreshTickets);
    const unsubscribeStatus = webSocketService.on("order:status_changed", refreshTickets);
    const unsubscribeKitchenTicket = webSocketService.on("kitchen_ticket:updated", refreshTickets);

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
      unsubscribeStatus();
      unsubscribeKitchenTicket();
    };
  }, [loadOrders]);

  const advanceTicket = async (ticket: KitchenTicketApi) => {
    const status = nextStatus[ticket.status];
    if (!status) return;
    setUpdatingIds((current) => new Set(current).add(ticket.id));
    setError("");
    try {
      const updatedTicket = await ordersApi.updateKitchenTicketStatus(ticket.id, status);
      setTickets((current) => current.map((item) => item.id === updatedTicket.id ? updatedTicket : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `Unable to move KOT #${ticket.ticketNumber}.`);
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current);
        next.delete(ticket.id);
        return next;
      });
    }
  };

  return (
    <section className="kitchen-page">
      <header className="kitchen-topbar">
        <div>
          <Breadcrumb items={[{ label: "Home", path: "/dashboard" }, { label: "Kitchen Display" }]} />
          <h1><span className="kitchen-title-icon" aria-hidden="true">🍳</span> Kitchen Display</h1>
          <p>Kitchen tickets update live as orders change.</p>
        </div>
        <span className="kitchen-live-indicator"><i /> Live updates</span>
      </header>

      {error && <p className="kitchen-error" role="alert">{error}</p>}
      {loading ? <div className="kitchen-empty">Loading orders…</div> : (
        <div className="kitchen-columns">
          {kitchenStatuses.map((status) => {
            const laneTickets = tickets
              .filter((order) => order.status === status)
              .sort((a, b) => new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime());
            return (
              <section className={`kitchen-lane ${status.toLowerCase()}`} key={status} aria-label={`${status} orders`}>
                <header className="kitchen-lane-heading">
                  <h2>{status === "Pending" ? "New" : status}</h2>
                  <span>{laneTickets.length}</span>
                </header>
                {laneTickets.length ? laneTickets.map((ticket) => (
                  <article className="kitchen-order-card" key={ticket.id}>
                    <header className="kitchen-order-heading">
                      <div>
                        <strong>{ticket.restaurantTableId ? `Table ${ticket.tableNumber ?? "—"}` : ticket.orderType}</strong>
                        <span>Order #{ticket.restaurantOrderId} · KOT #{ticket.ticketNumber}</span>
                      </div>
                      <time>{formatTime(ticket.createdAtUtc)}</time>
                    </header>
                    <div className="kitchen-order-items">
                      {ticket.items.map((item, index) => (
                        <div className="kitchen-order-item" key={`${item.id ?? item.itemName}-${index}`}>
                          <b>{item.quantity}×</b>
                          <span>{item.itemName}{item.variant ? ` · ${item.variant}` : ""}</span>
                        </div>
                      ))}
                    </div>
                    {ticket.specialInstructions && (
                      <p className="kitchen-instructions"><b>Note:</b> {ticket.specialInstructions}</p>
                    )}
                    <footer className="kitchen-order-footer">
                      {nextStatus[ticket.status] && (
                        <button
                          type="button"
                          onClick={() => void advanceTicket(ticket)}
                          disabled={updatingIds.has(ticket.id)}
                        >
                          {updatingIds.has(ticket.id) ? "Saving…" : status === "Pending" ? "Start preparing" : "Mark ready"}
                        </button>
                      )}
                      {ticket.status === "Ready" && <span className="kitchen-ready-label">Waiting for service</span>}
                    </footer>
                  </article>
                )) : <p className="kitchen-lane-empty">No {status.toLowerCase()} tickets</p>}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default KitchenDisplayPage;
