import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "../common/ConfirmDeleteModal";
import LoadingSpinner from "../common/LoadingSpinner";
import Breadcrumb from "../common/Breadcrumb";
import Pagination from "../common/Pagination";
import { ordersApi, type OrderApi, type RestaurantTableApi } from "../../api/orders.api";
import { exportToCsv, generateTimestamp } from "../../utils/csvExport";
import "./Tables.css";

type TableStatus = RestaurantTableApi["status"];
type TableEditor = { table?: RestaurantTableApi };
const tableAreas = ["Ground Floor", "Second Floor", "Garden", "Rooftop", "Private Dining"];

function TablesPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<RestaurantTableApi[]>([]);
  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [selected, setSelected] = useState<RestaurantTableApi | null>(null);
  const [editing, setEditing] = useState<TableEditor | null>(null);
  const [deleting, setDeleting] = useState<RestaurantTableApi | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.max(1, Math.ceil(tables.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedTables = tables.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasMultipleAreas = new Set(tables.map((table) => table.area?.trim() || "Unassigned area")).size > 1;
  const tablesByArea = hasMultipleAreas
    ? Array.from(pagedTables.reduce((groups, table) => {
        const area = table.area?.trim() || "Unassigned area";
        groups.set(area, [...(groups.get(area) ?? []), table]);
        return groups;
      }, new Map<string, RestaurantTableApi[]>()))
    : [];

  const load = async () => {
    try {
      setLoading(true);
      const [data, orderData] = await Promise.all([ordersApi.listTables(), ordersApi.list()]);
      setTables(data);
      setOrders(orderData);
      setSelected((current) => data.find((table) => table.id === current?.id) ?? data[0] ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load tables.");
    } finally {
      setLoading(false);
    }
  };

  const getActiveOrder = (tableId: number) => orders.find(
    (order) => order.restaurantTableId === tableId && order.status !== "Completed" && order.status !== "Cancelled",
  );
  const activeOrder = selected ? getActiveOrder(selected.id) : undefined;

  useEffect(() => { void load(); }, []);

  const save = async (body: Omit<RestaurantTableApi, "id">, id?: number) => {
    try {
      id ? await ordersApi.updateTable(id, body) : await ordersApi.createTable(body);
      setEditing(null);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save table.");
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await ordersApi.deleteTable(deleting.id);
      setDeleting(null);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete table.");
    }
  };

  const handleExport = () => {
    const columns = [
      { key: 'tableNumber', label: 'Table Number' },
      { key: 'seatCapacity', label: 'Seat Capacity' },
      { key: 'area', label: 'Area' },
      { key: 'status', label: 'Status' }
    ];
    exportToCsv(tables, columns, `tables-export-${generateTimestamp()}.csv`);
  };

  const renderTableCard = (table: RestaurantTableApi) => (
    <article
      className={`restaurant-table ${table.status.toLowerCase()} ${selected?.id === table.id ? "selected" : ""}`}
      key={table.id}
      onClick={() => {
        const order = getActiveOrder(table.id);
        if (order) navigate(`/orders/${order.id}`);
        else setSelected(table);
      }}
    >
      <span className="table-icon">♜</span>
      <strong>{table.tableNumber}</strong>
      <small>{table.seatCapacity} Seats</small>
      <small className="table-area">{table.area}</small>
      <em>{table.status}</em>
      {getActiveOrder(table.id) && <small className="table-active-order">Order #{getActiveOrder(table.id)?.id}</small>}
    </article>
  );

  if (loading) {
    return (
      <section className="tables-page">
        <div className="tables-topbar">
          <div className="section-title-block"><Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Tables' }]} /></div>
          <button className="primary-button" onClick={() => setEditing({})}>＋ Add Table</button>
        </div>
        <LoadingSpinner text="Loading tables..." fullScreen />
      </section>
    );
  }

  return (
    <section className="tables-page">
      <div className="tables-topbar">
        <div className="section-title-block"><Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Tables' }]} /></div>
        <div className="tables-topbar-actions">
          <button className="secondary-button" onClick={handleExport} disabled={tables.length === 0}>
            📥 Export CSV
          </button>
          <button className="primary-button" onClick={() => setEditing({})}>＋ Add Table</button>
        </div>
      </div>
      {error && <p className="table-form-error" role="alert">{error}</p>}
      <div className="table-layout">
        {hasMultipleAreas ? (
          <div className="table-area-groups">
            {tablesByArea.map(([area, areaTables]) => (
              <section className="table-area-group" key={area} aria-label={`${area} tables`}>
                <h2>{area}</h2>
                <div className="table-grid">{areaTables.map((table) => renderTableCard(table))}</div>
              </section>
            ))}
          </div>
        ) : (
          <div className="table-grid">{pagedTables.map((table) => renderTableCard(table))}</div>
        )}
        {selected && (
          <aside className="table-detail">
            <div>
              <p className="eyebrow">Selected table</p>
              <h2>{selected.tableNumber}</h2>
              <span className={`order-status ${selected.status.toLowerCase()}`}>● {selected.status}</span>
            </div>
            <hr />
            <p className="detail-label">TABLE DETAILS</p>
            <strong>{selected.seatCapacity} Seats <span>{selected.status}</span></strong>
            <p className="table-area-detail">Area: <b>{selected.area}</b></p>
            {activeOrder
              ? <p>Active order: <b>#{activeOrder.id} · {activeOrder.status}</b>. Select this table to open the order.</p>
              : <p>{selected.status === "Occupied" ? "Occupied — no active order found" : selected.status === "Reserved" ? "This table is reserved" : "No active order"}</p>}
            <button className="primary-button" onClick={() => setEditing({ table: selected })}>Edit Table</button>
            <button className="delete-table" onClick={() => setDeleting(selected)}>Delete Table</button>
          </aside>
        )}
      </div>
      <Pagination count={tables.length} page={currentPage} pageSize={pageSize} label="tables" onChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      {editing && <TableForm editor={editing} onClose={() => setEditing(null)} onSave={save} />}
      {deleting && <ConfirmDeleteModal itemName={deleting.tableNumber} itemType="Table" onCancel={() => setDeleting(null)} onConfirm={() => void remove()} />}
    </section>
  );
}

function TableForm({ editor, onClose, onSave }: { editor: TableEditor; onClose: () => void; onSave: (body: Omit<RestaurantTableApi, "id">, id?: number) => Promise<void> }) {
  const [tableNumber, setTableNumber] = useState(editor.table?.tableNumber ?? "");
  const [seatCapacity, setSeatCapacity] = useState(String(editor.table?.seatCapacity ?? 2));
  const [area, setArea] = useState(editor.table?.area?.trim() || tableAreas[0]);
  const [status, setStatus] = useState<TableStatus>(editor.table?.status ?? "Available");
  const availableAreas = tableAreas.includes(area) ? tableAreas : [...tableAreas, area];

  return (
    <div className="table-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="table-editor" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => {
        event.preventDefault();
        const normalizedArea = area.trim();
        if (!normalizedArea) return;
        void onSave({ tableNumber: tableNumber.trim(), seatCapacity: Number(seatCapacity), area: normalizedArea, status }, editor.table?.id);
      }}>
        <div className="table-modal-title">
          <div>
            <p className="eyebrow">Floor management</p>
            <h2>{editor.table ? "Edit Table" : "Add Table"}</h2>
          </div>
          <button type="button" className="table-icon-button" onClick={onClose}>×</button>
        </div>
        <label>Table number<input required value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} /></label>
        <label>Number of seats<input required type="number" min="1" value={seatCapacity} onChange={(event) => setSeatCapacity(event.target.value)} /></label>
        <label>Area<select required value={area} onChange={(event) => setArea(event.target.value)}>{availableAreas.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as TableStatus)}>{(["Available", "Occupied", "Reserved"] as TableStatus[]).map((value) => <option key={value}>{value}</option>)}</select></label>
        <div className="table-modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit">Save Table</button>
        </div>
      </form>
    </div>
  );
}

export default TablesPage;
