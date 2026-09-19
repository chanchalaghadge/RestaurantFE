import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "../../common/ConfirmDeleteModal";
import { customersApi, type CustomerApi } from "../../../api/customers.api";
import LoadingSpinner from "../../common/LoadingSpinner";
import Breadcrumb from "../../common/Breadcrumb";
import { useTableSort } from "../../../hooks/useTableSort";
import { exportToCsv, generateTimestamp } from "../../../utils/csvExport";
import { exportToPdf } from "../../../utils/pdfExport";
import "../Customers.css";

function CustomerListPage() {
  const navigate = useNavigate(); 
  const [customers, setCustomers] = useState<CustomerApi[]>([]); 
  const [search, setSearch] = useState(""); 
  const [status, setStatus] = useState("All Status"); 
  const [tier, setTier] = useState("All Customers"); 
  const [deleting, setDeleting] = useState<CustomerApi | null>(null); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
  const load = async () => { 
    try { 
      setLoading(true);
      setCustomers(await customersApi.list({ search, status: status === "All Status" ? undefined : status, tier: tier === "All Customers" ? undefined : tier })); 
    } catch (e) { 
      setError(e instanceof Error ? e.message : "Unable to load customers."); 
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { const timer = window.setTimeout(() => void load(), 250); return () => window.clearTimeout(timer); }, [search, status, tier]);
  
  const filtered = customers.filter((customer) => {
    const matchesSearch = `${customer.fullName} ${customer.phone} ${customer.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "All Status" || customer.status === status;
    const matchesTier = tier === "All Customers" || customer.tier === tier;
    return matchesSearch && matchesStatus && matchesTier;
  });
  
  const { sortedData, sortConfig, handleSort, getSortIcon } = useTableSort(filtered);

  const handleExport = () => {
    const columns = [
      { key: 'fullName', label: 'Customer Name' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'email', label: 'Email', formatter: (val: string) => val || 'N/A' },
      { key: 'status', label: 'Status' },
      { key: 'tier', label: 'Customer Tier' },
      { key: 'totalOrders', label: 'Total Orders' },
      { key: 'lastOrderAtUtc', label: 'Last Order', formatter: (val: string) => val ? new Date(val).toLocaleDateString() : 'N/A' }
    ];
    exportToCsv(sortedData, columns, `customers-export-${generateTimestamp()}.csv`);
  };

  const handlePdfExport = () => {
    const columns = [
      { key: 'fullName', label: 'Customer Name' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'email', label: 'Email', formatter: (val: string) => val || 'N/A' },
      { key: 'status', label: 'Status' },
      { key: 'tier', label: 'Customer Tier' },
      { key: 'totalOrders', label: 'Total Orders' },
      { key: 'lastOrderAtUtc', label: 'Last Order', formatter: (val: string) => val ? new Date(val).toLocaleDateString() : 'N/A' }
    ];
    exportToPdf(sortedData, columns, 'Customer Report');
  };
  
  if (loading) {
    return (
      <section className="customers-page customer-list-page">
        <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Customers' }]} />
        <div className="customer-page-header">
          <div>
            <h1>Customers</h1>
            <p>Manage your restaurant customers.</p>
          </div>
          <Link className="primary-button" to="/customers/new">＋ Add New Customer</Link>
        </div>
        <LoadingSpinner text="Loading customers..." fullScreen />
      </section>
    );
  }
  
  return (
    <section className="customers-page customer-list-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Customers' }]} />
      <div className="customer-page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your restaurant customers.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="secondary-button" onClick={handleExport} disabled={sortedData.length === 0}>
            📥 CSV
          </button>
          <button className="secondary-button" onClick={handlePdfExport} disabled={sortedData.length === 0}>
            📄 PDF
          </button>
          <Link className="primary-button" to="/customers/new">＋ Add New Customer</Link>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="customer-stats">
        <article>
          <span className="customer-stat-icon green">✦</span>
          <div>
            <small>Total Customers</small>
            <strong>{customers.length}</strong>
          </div>
        </article>
      </div>
      <div className="customer-panel">
        <div className="customer-filters">
          <label className="customer-search">
            ⌕
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone or email..." />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            <option>All Customers</option>
            <option>Regular</option>
            <option>VIP</option>
            <option>New</option>
          </select>
          <button type="button" onClick={() => { setSearch(""); setStatus("All Status"); setTier("All Customers"); }}>
            ↻ Reset
          </button>
        </div>
        <div className="customers-table-wrap">
          <table className="customers-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('fullName')} aria-sort={sortConfig.key === 'fullName' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Customer Name {sortConfig.key === 'fullName' && getSortIcon()}
                </th>
                <th className="sortable" onClick={() => handleSort('phone')} aria-sort={sortConfig.key === 'phone' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Phone Number {sortConfig.key === 'phone' && getSortIcon()}
                </th>
                <th className="sortable" onClick={() => handleSort('email')} aria-sort={sortConfig.key === 'email' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Email {sortConfig.key === 'email' && getSortIcon()}
                </th>
                <th className="sortable" onClick={() => handleSort('status')} aria-sort={sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Status {sortConfig.key === 'status' && getSortIcon()}
                </th>
                <th className="sortable" onClick={() => handleSort('tier')} aria-sort={sortConfig.key === 'tier' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Customer Tier {sortConfig.key === 'tier' && getSortIcon()}
                </th>
                <th className="sortable" onClick={() => handleSort('totalOrders')} aria-sort={sortConfig.key === 'totalOrders' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Total Orders {sortConfig.key === 'totalOrders' && getSortIcon()}
                </th>
                <th className="sortable" onClick={() => handleSort('lastOrderAtUtc')} aria-sort={sortConfig.key === 'lastOrderAtUtc' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Last Order {sortConfig.key === 'lastOrderAtUtc' && getSortIcon()}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length ? sortedData.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-avatar avatar-blue">{customer.initials}</span>
                      <div className="customer-name">
                        <strong>{customer.fullName}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{customer.phone}</td>
                  <td>{customer.email}</td>
                  <td><span className={`customer-badge ${customer.status.toLowerCase()}`}>{customer.status}</span></td>
                  <td><span className={`customer-tier ${customer.tier.toLowerCase()}`}>{customer.tier}</span></td>
                  <td>{customer.totalOrders}</td>
                  <td>{customer.lastOrderAtUtc ? new Date(customer.lastOrderAtUtc).toLocaleDateString() : "—"}</td>
                  <td className="customer-row-actions">
                    <Link className="view-link" to={`/customers/${customer.id}`}>View</Link>
                    <button className="action-icon edit" onClick={() => navigate(`/customers/${customer.id}/edit`)}>✎</button>
                    <button className="action-icon delete" onClick={() => setDeleting(customer)}>♲</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8}>
                    <div className="list-empty-state">
                      <span>♟</span>
                      <strong>No customers yet</strong>
                      <p>Add your first customer to get started.</p>
                      <Link className="primary-button" to="/customers/new">Add New Customer</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="customers-footer">
          <span>Showing {customers.length} customers</span>
        </div>
      </div>
      {deleting && (
        <ConfirmDeleteModal
          itemName={deleting.fullName}
          itemType="Customer"
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            customersApi.remove(deleting.id).then(() => {
              setDeleting(null);
              void load();
            }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to delete customer."));
          }}
        />
      )}
    </section>
  );
}

export default CustomerListPage;