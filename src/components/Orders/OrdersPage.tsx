import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmDeleteModal from "../common/ConfirmDeleteModal";
import BulkDeleteModal from "../common/BulkDeleteModal";
import LoadingSpinner from "../common/LoadingSpinner";
import Breadcrumb from "../common/Breadcrumb";
import OrderHistoryModal from "../common/OrderHistoryModal";
import ErrorAlert from "../common/ErrorAlert";
import DateRangePicker from "../common/DateRangePicker";
import { menuItemsApi, type MenuItemApi } from "../../api/menu-items.api";
import { ordersApi, type OrderApi, type RestaurantTableApi } from "../../api/orders.api";
import { useTableSort } from "../../hooks/useTableSort";
import { exportToCsv, generateTimestamp } from "../../utils/csvExport";
import { exportToPdf } from "../../utils/pdfExport";
import { useToast } from "../common/Toast";
import { useErrorHandler } from "../../utils/errorHandler";
import "./Orders.css";
import "./OrdersOverrides.css";

type OrderType = OrderApi["orderType"];

function OrdersPage() {
  const { showToast } = useToast();
  const { handleError, createErrorContext } = useErrorHandler();
  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [editing, setEditing] = useState<OrderApi | null | "new">(null);
  const [deleting, setDeleting] = useState<OrderApi | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showHistory, setShowHistory] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | OrderApi["status"]>("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | OrderType>("All");
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setOrders(await ordersApi.list());
    } catch (e) {
      const errorContext = createErrorContext('OrdersPage', 'loadOrders');
      handleError(e instanceof Error ? e : new Error('Unable to load orders.'), errorContext);
      setError(e instanceof Error ? e.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const visibleOrders = useMemo(() => orders.filter((order) => {
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesType = typeFilter === "All" || order.orderType === typeFilter;
    const matchesSearch = `${order.id} ${order.customerName} ${order.tableNumber ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesDateRange = (!dateRange.startDate || !dateRange.endDate) ||
      (new Date(order.createdAtUtc) >= new Date(dateRange.startDate) && new Date(order.createdAtUtc) <= new Date(dateRange.endDate));
    const matchesAmountRange = (!amountRange.min || !amountRange.max) ||
      (order.totalAmount >= Number(amountRange.min) && order.totalAmount <= Number(amountRange.max));

    return matchesStatus && matchesType && matchesSearch && matchesDateRange && matchesAmountRange;
  }), [orders, search, statusFilter, typeFilter, dateRange, amountRange]);
  const { sortedData, sortConfig, handleSort, getSortIcon } = useTableSort(visibleOrders);

  const statuses: Array<"All" | OrderApi["status"]> = ["All", "Pending", "Preparing", "Ready", "Completed", "Cancelled"];

  const remove = async () => {
    if (!deleting) return;
    try {
      setIsDeleting(true);
      await ordersApi.remove(deleting.id);
      setDeleting(null);
      setIsDeleting(false);
      showToast('Order deleted successfully', 'success', 2000);
      await load();
    } catch (e) {
      setIsDeleting(false);
      const errorContext = createErrorContext('OrdersPage', 'deleteOrder', { orderId: deleting.id });
      handleError(e instanceof Error ? e : new Error('Unable to delete order.'), errorContext);
      setError(e instanceof Error ? e.message : "Unable to delete order.");
    }
  };

  const pay = async (order: OrderApi) => {
    try {
      await ordersApi.completePayment(order.id);
      showToast('Payment completed successfully', 'success', 2000);
      await load();
    } catch (e) {
      const errorContext = createErrorContext('OrdersPage', 'completePayment', { orderId: order.id });
      handleError(e instanceof Error ? e : new Error('Unable to complete payment.'), errorContext);
      setError(e instanceof Error ? e.message : "Unable to complete payment.");
    }
  };

  const handleExport = () => {
    const columns = [
      { key: 'id', label: 'Order #' },
      { key: 'customerName', label: 'Customer' },
      { key: 'tableNumber', label: 'Table', formatter: (val: number | undefined) => val ? String(val) : 'N/A' },
      { key: 'orderType', label: 'Type', formatter: (val: string) => val === 'DineIn' ? 'Dine In' : val },
      { key: 'totalAmount', label: 'Total', formatter: (val: number) => `₹${val.toFixed(2)}` },
      { key: 'status', label: 'Status' },
      { key: 'createdAtUtc', label: 'Created', formatter: (val: string) => new Date(val).toLocaleDateString() }
    ];
    exportToCsv(sortedData, columns, `orders-export-${generateTimestamp()}.csv`);
    showToast('CSV exported successfully', 'success');
  };

  const handlePdfExport = () => {
    const columns = [
      { key: 'id', label: 'Order #' },
      { key: 'customerName', label: 'Customer' },
      { key: 'tableNumber', label: 'Table', formatter: (val: number | undefined) => val ? String(val) : 'N/A' },
      { key: 'orderType', label: 'Type', formatter: (val: string) => val === 'DineIn' ? 'Dine In' : val },
      { key: 'totalAmount', label: 'Total', formatter: (val: number) => `₹${val.toFixed(2)}` },
      { key: 'status', label: 'Status' },
      { key: 'createdAtUtc', label: 'Created', formatter: (val: string) => new Date(val).toLocaleDateString() }
    ];
    exportToPdf(sortedData, columns, 'Orders Report');
    showToast('PDF report generated', 'success');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedData.map(order => order.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      setBulkDeleting(true);
      await Promise.all(Array.from(selectedIds).map(id => ordersApi.remove(id)));
      setSelectedIds(new Set());
      setBulkDeleting(false);
      showToast(`${selectedIds.size} order(s) deleted successfully`, 'success');
      await load();
    } catch (e) {
      setBulkDeleting(false);
      setError(e instanceof Error ? e.message : "Unable to delete orders.");
      showToast('Failed to delete orders', 'error');
    }
  };

  if (loading) {
    return (
      <section className="orders-page">
        <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Orders' }]} />
        <div className="orders-heading">
          <div>
            <h1>Orders</h1>
            <p>Manage and track every order in real time.</p>
          </div>
          <button className="primary-button" onClick={() => setEditing("new")}>＋ Create Order</button>
        </div>
        <LoadingSpinner text="Loading orders..." fullScreen />
      </section>
    );
  }

  return (
    <section className="orders-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Orders' }]} />
      <div className="orders-heading">
        <div>
          <h1>Orders</h1>
          <p>Manage and track every order in real time.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="secondary-button" onClick={handleExport} disabled={sortedData.length === 0}>
            📥 CSV
          </button>
          <button className="secondary-button" onClick={handlePdfExport} disabled={sortedData.length === 0}>
            📄 PDF
          </button>
          {selectedIds.size > 0 && (
            <button
              className="secondary-button"
              onClick={() => setBulkDeleting(true)}
              disabled={bulkDeleting}
              style={{ background: '#fee2e2', borderColor: '#fecaca', color: '#991b1b' }}
            >
              Delete {selectedIds.size} Selected
            </button>
          )}
          <button className="primary-button" onClick={() => setEditing("new")}>＋ Create Order</button>
        </div>
      </div>
      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
      <div className="order-tabs">
        {statuses.map((status) => (
          <button key={status} className={statusFilter === status ? "active" : ""} onClick={() => setStatusFilter(status)}>
            {status} <span>({status === "All" ? orders.length : orders.filter((order) => order.status === status).length})</span>
          </button>
        ))}
      </div>
      <div className="orders-card">
        <div className="order-tools">
          <label>⌕ <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by order #, customer, table..." /></label>
          <select aria-label="Order type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "All" | OrderType)}>
            <option value="All">All Order Types</option>
            <option value="DineIn">Dine In</option>
            <option value="Takeaway">Takeaway</option>
            <option value="Delivery">Delivery</option>
          </select>
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onStartDateChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
            onEndDateChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
            label="Date Range"
          />
          <label className="amount-range">
            <span>Amount Range</span>
            <div className="amount-range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={amountRange.min}
                onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                aria-label="Minimum amount"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={amountRange.max}
                onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                aria-label="Maximum amount"
              />
            </div>
          </label>
          <button type="button" onClick={() => { setSearch(""); setStatusFilter("All"); setTypeFilter("All"); setDateRange({ startDate: '', endDate: '' }); setAmountRange({ min: '', max: '' }); }}>↻ Reset</button>
        </div>
        <div className="order-table-wrap">
          <table className="order-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={sortedData.length > 0 && selectedIds.size === sortedData.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all orders"
                  />
                </th>
                <th className="sortable" onClick={() => handleSort('id')} aria-sort={sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Order # {sortConfig.key === 'id' && getSortIcon()}
                </th>
                <th>Table</th>
                <th className="sortable" onClick={() => handleSort('customerName')} aria-sort={sortConfig.key === 'customerName' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Customer {sortConfig.key === 'customerName' && getSortIcon()}
                </th>
                <th className="sortable" onClick={() => handleSort('orderType')} aria-sort={sortConfig.key === 'orderType' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Type {sortConfig.key === 'orderType' && getSortIcon()}
                </th>
                <th className="sortable" onClick={() => handleSort('totalAmount')} aria-sort={sortConfig.key === 'totalAmount' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Total {sortConfig.key === 'totalAmount' && getSortIcon()}
                </th>
                <th className="sortable" onClick={() => handleSort('status')} aria-sort={sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Status {sortConfig.key === 'status' && getSortIcon()}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length ? sortedData.map((order) => (
                <tr key={order.id}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                      aria-label={`Select order #${order.id}`}
                    />
                  </td>
                  <td><strong>#{order.id}</strong></td>
                  <td>{order.tableNumber ?? "—"}</td>
                  <td>{order.customerName}</td>
                  <td>{order.orderType === "DineIn" ? "Dine In" : order.orderType}</td>
                  <td>₹{order.totalAmount.toFixed(2)}</td>
                  <td><span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td className="order-actions">
                    <button title="View history" onClick={() => setShowHistory(order.id)}>📜</button>
                    <button title="Edit order" onClick={() => setEditing(order)}>✎</button>
                    {order.status !== "Completed" && <button title="Complete payment" onClick={() => void pay(order)}>💳</button>}
                    <button title="Delete order" onClick={() => setDeleting(order)} disabled={isDeleting}>♲</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8}>
                    <div className="list-empty-state">
                      <span>📋</span>
                      <strong>No orders yet</strong>
                      <p>Create your first order to get started.</p>
                      <button className="primary-button" onClick={() => setEditing("new")}>Create Order</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {editing && <OrderForm order={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} onSaved={load} />}
      {deleting && <ConfirmDeleteModal itemName={`Order #${deleting.id}`} itemType="Order" onCancel={() => setDeleting(null)} onConfirm={() => void remove()} isDeleting={isDeleting} />}
      {bulkDeleting && (
        <BulkDeleteModal
          count={selectedIds.size}
          itemType="Order"
          onCancel={() => setBulkDeleting(false)}
          onConfirm={handleBulkDelete}
          isDeleting={bulkDeleting}
        />
      )}
      {showHistory && <OrderHistoryModal orderId={showHistory} onClose={() => setShowHistory(null)} />}
    </section>
  );
}

function OrderForm({ order, onClose, onSaved }: { order?: OrderApi; onClose: () => void; onSaved: () => Promise<void> }) {
  const [tables, setTables] = useState<RestaurantTableApi[]>([]);
  const [menu, setMenu] = useState<MenuItemApi[]>([]);
  const [customerName, setCustomerName] = useState(order?.customerName ?? "");
  const [orderType, setOrderType] = useState<OrderType>(order?.orderType ?? "DineIn");
  const [status, setStatus] = useState<OrderApi["status"]>(order?.status ?? "Pending");
  const [tableId, setTableId] = useState<number | undefined>(order?.restaurantTableId);
  const [items, setItems] = useState(order?.items.map((x) => ({ itemName: x.itemName, quantity: x.quantity, unitPrice: x.unitPrice })) ?? []);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([ordersApi.listTables(), menuItemsApi.list({ status: "Active" })]).then(([tableData, menuData]) => {
      setTables(tableData);
      setMenu(menuData);
    }).catch((e: unknown) => setError(e instanceof Error ? e.message : "Unable to load order form data."));
  }, []);

  const add = (item: MenuItemApi) => setItems((current) => {
    const found = current.find((x) => x.itemName === item.name);
    return found ? current.map((x) => x.itemName === item.name ? { ...x, quantity: x.quantity + 1 } : x) : [...current, { itemName: item.name, quantity: 1, unitPrice: item.price }];
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const body = { customerName, orderType, restaurantTableId: orderType === "DineIn" ? tableId : undefined, items };
      const saved = order ? await ordersApi.update(order.id, body) : await ordersApi.create(body);
      if (status !== saved.status) await ordersApi.updateStatus(saved.id, status);
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save order.");
    }
  };

  const formContent = (
    <div className="modal-backdrop">
      <form className="order-editor" onSubmit={submit}>
        <div className="modal-title">
          <h2>{order ? `Edit Order #${order.id}` : "Create Order"}</h2>
          <button type="button" className="icon-button" onClick={onClose}>×</button>
        </div>
        <div className="order-editor-top">
          <label>Customer<input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></label>
          <label>Order Type<select value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)}><option value="DineIn">Dine In</option><option value="Takeaway">Takeaway</option><option value="Delivery">Delivery</option></select></label>
          <label>Status<select value={status} onChange={(e) => setStatus(e.target.value as OrderApi["status"])}>{["Pending", "Preparing", "Ready", "Completed", "Cancelled"].map((value) => <option key={value}>{value}</option>)}</select></label>
          {orderType === "DineIn" && <label>Table<select required value={tableId ?? ""} onChange={(e) => setTableId(Number(e.target.value))}><option value="">Select table</option>{tables.filter((table) => table.status !== "Occupied" || table.id === order?.restaurantTableId).map((table) => <option key={table.id} value={table.id}>{table.tableNumber}</option>)}</select></label>}
        </div>
        <div className="item-order-workspace">
          <section>
            <h3>Menu Items</h3>
            <div className="menu-product-grid">
              {menu.map((item) => (
                <article className="menu-product" key={item.id}>
                  <img src={item.imageUrl} alt="" />
                  <strong>{item.name}</strong>
                  <span>₹{item.price}</span>
                  <button type="button" className="add-item-button" onClick={() => add(item)}>＋ Add</button>
                </article>
              ))}
            </div>
          </section>
          <aside className="current-order">
            <h3>Current Order</h3>
            {items.map((item, index) => (
              <div className="current-item" key={`${item.itemName}-${index}`}>
                <div>
                  <strong>{item.itemName}</strong>
                  <small>₹{item.unitPrice} each</small>
                  <div className="quantity-control">
                    <button type="button" onClick={() => setItems((current) => current.map((x, position) => position === index ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => setItems((current) => current.map((x, position) => position === index ? { ...x, quantity: x.quantity + 1 } : x))}>＋</button>
                  </div>
                </div>
                <b>₹{(item.unitPrice * item.quantity).toFixed(2)}</b>
                <button type="button" className="remove-item" onClick={() => setItems((current) => current.filter((_, position) => position !== index))}>×</button>
              </div>
            ))}
            <div className="order-total">
              <strong>Total: ₹{items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2)}</strong>
            </div>
          </aside>
        </div>
        {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit">{order ? "Update Order" : "Create Order"}</button>
        </div>
      </form>
    </div>
  );

  return createPortal(formContent, document.body);
}

export default OrdersPage;
