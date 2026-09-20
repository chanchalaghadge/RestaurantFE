import { useEffect, useState } from "react";
import ConfirmDeleteModal from "../common/ConfirmDeleteModal";
import LoadingSpinner from "../common/LoadingSpinner";
import Breadcrumb from "../common/Breadcrumb";
import { ordersApi, type RestaurantTableApi } from "../../api/orders.api";
import { exportToCsv, generateTimestamp } from "../../utils/csvExport";
import "./Tables.css";

type TableStatus = RestaurantTableApi["status"];
type TableEditor = { table?: RestaurantTableApi };

function TablesPage() {
  const [tables, setTables] = useState<RestaurantTableApi[]>([]);
  const [selected, setSelected] = useState<RestaurantTableApi | null>(null);
  const [editing, setEditing] = useState<TableEditor | null>(null);
  const [deleting, setDeleting] = useState<RestaurantTableApi | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.listTables();
      setTables(data);
      setSelected((current) => data.find((table) => table.id === current?.id) ?? data[0] ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load tables.");
    } finally {
      setLoading(false);
    }
  };

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
      { key: 'status', label: 'Status' }
    ];
    exportToCsv(tables, columns, `tables-export-${generateTimestamp()}.csv`);
  };

  if (loading) {
    return (
      <section className="tables-page">
        <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Tables' }]} />
        <div className="tables-heading">
          <div>
            <p className="eyebrow">Floor management</p>
            <h1>Tables</h1>
            <p>See table availability and current orders at a glance.</p>
          </div>
          <button className="primary-button" onClick={() => setEditing({})}>＋ Add Table</button>
        </div>
        <LoadingSpinner text="Loading tables..." fullScreen />
      </section>
    );
  }

  return (
    <section className="tables-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Tables' }]} />
      <div className="tables-heading">
        <div>
          <p className="eyebrow">Floor management</p>
          <h1>Tables</h1>
          <p>See table availability and current orders at a glance.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="secondary-button" onClick={handleExport} disabled={tables.length === 0}>
            📥 Export CSV
          </button>
          <button className="primary-button" onClick={() => setEditing({})}>＋ Add Table</button>
        </div>
      </div>
      {error && <p className="table-form-error" role="alert">{error}</p>}
      <div className="table-layout">
        <div className="table-grid">
          {tables.map((table) => (
            <article
              className={`restaurant-table ${table.status.toLowerCase()} ${selected?.id === table.id ? "selected" : ""}`}
              key={table.id}
              onClick={() => setSelected(table)}
            >
              <span className="table-icon">♜</span>
              <strong>{table.tableNumber}</strong>
              <small>{table.seatCapacity} Seats</small>
              <em>{table.status}</em>
            </article>
          ))}
        </div>
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
            <p>{selected.status === "Occupied" ? "Currently occupied" : "No active order"}</p>
            <button className="primary-button" onClick={() => setEditing({ table: selected })}>Edit Table</button>
            <button className="delete-table" onClick={() => setDeleting(selected)}>Delete Table</button>
          </aside>
        )}
      </div>
      {editing && <TableForm editor={editing} onClose={() => setEditing(null)} onSave={save} />}
      {deleting && <ConfirmDeleteModal itemName={deleting.tableNumber} itemType="Table" onCancel={() => setDeleting(null)} onConfirm={() => void remove()} />}
    </section>
  );
}

function TableForm({ editor, onClose, onSave }: { editor: TableEditor; onClose: () => void; onSave: (body: Omit<RestaurantTableApi, "id">, id?: number) => Promise<void> }) {
  const [tableNumber, setTableNumber] = useState(editor.table?.tableNumber ?? "");
  const [seatCapacity, setSeatCapacity] = useState(String(editor.table?.seatCapacity ?? 2));
  const [status, setStatus] = useState<TableStatus>(editor.table?.status ?? "Available");

  return (
    <div className="table-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="table-editor" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => {
        event.preventDefault();
        void onSave({ tableNumber: tableNumber.trim(), seatCapacity: Number(seatCapacity), status }, editor.table?.id);
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
