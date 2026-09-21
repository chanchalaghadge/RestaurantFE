import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "../../common/ConfirmDeleteModal";
import BulkDeleteModal from "../../common/BulkDeleteModal";
import { customersApi, type CustomerApi } from "../../../api/customers.api";
import LoadingSpinner from "../../common/LoadingSpinner";
import Breadcrumb from "../../common/Breadcrumb";
import { useTableSort } from "../../../hooks/useTableSort";
import { exportToCsv, generateTimestamp } from "../../../utils/csvExport";
import { exportToPdf } from "../../../utils/pdfExport";
import { useToast } from "../../common/Toast";
import ErrorAlert from "../../common/ErrorAlert";
import DateRangePicker from "../../common/DateRangePicker";
import { formatDate } from "../../../utils/date";
import "../Customers.css";

function CustomerListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<CustomerApi[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [tier, setTier] = useState("All Customers");
  const [deleting, setDeleting] = useState<CustomerApi | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [ordersRange, setOrdersRange] = useState({ min: '', max: '' });
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
    const matchesDateRange = (!dateRange.startDate || !dateRange.endDate) ||
      (customer.lastOrderAtUtc && new Date(customer.lastOrderAtUtc) >= new Date(dateRange.startDate) && new Date(customer.lastOrderAtUtc) <= new Date(dateRange.endDate));
    const matchesOrdersRange = (!ordersRange.min || !ordersRange.max) ||
      (customer.totalOrders >= Number(ordersRange.min) && customer.totalOrders <= Number(ordersRange.max));

    return matchesSearch && matchesStatus && matchesTier && matchesDateRange && matchesOrdersRange;
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
      { key: 'lastOrderAtUtc', label: 'Last Order', formatter: (val: string) => val ? formatDate(val) : 'N/A' }
    ];
    exportToCsv(sortedData, columns, `customers-export-${generateTimestamp()}.csv`);
    showToast('CSV exported successfully', 'success');
  };

  const handlePdfExport = () => {
    const columns = [
      { key: 'fullName', label: 'Customer Name' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'email', label: 'Email', formatter: (val: string) => val || 'N/A' },
      { key: 'status', label: 'Status' },
      { key: 'tier', label: 'Customer Tier' },
      { key: 'totalOrders', label: 'Total Orders' },
      { key: 'lastOrderAtUtc', label: 'Last Order', formatter: (val: string) => val ? formatDate(val) : 'N/A' }
    ];
    exportToPdf(sortedData, columns, 'Customer Report');
    showToast('PDF report generated', 'success');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedData.map(c => c.id)));
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
      await Promise.all(Array.from(selectedIds).map(id => customersApi.remove(id)));
      setSelectedIds(new Set());
      setBulkDeleting(false);
      showToast(`${selectedIds.size} customer(s) deleted successfully`, 'success');
      void load();
    } catch (reason) {
      setBulkDeleting(false);
      setError(reason instanceof Error ? reason.message : "Unable to delete customers.");
      showToast('Failed to delete customers', 'error');
    }
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
      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
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
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onStartDateChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
            onEndDateChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
            label="Last Order Date"
          />
          <label className="amount-range">
            <span>Total Orders</span>
            <div className="amount-range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={ordersRange.min}
                onChange={(e) => setOrdersRange(prev => ({ ...prev, min: e.target.value }))}
                aria-label="Minimum orders"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={ordersRange.max}
                onChange={(e) => setOrdersRange(prev => ({ ...prev, max: e.target.value }))}
                aria-label="Maximum orders"
              />
            </div>
          </label>
          <button type="button" onClick={() => { setSearch(""); setStatus("All Status"); setTier("All Customers"); setDateRange({ startDate: '', endDate: '' }); setOrdersRange({ min: '', max: '' }); }}>
            ↻ Reset
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
        </div>
        <div className="customers-table-wrap">
          <table className="customers-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={sortedData.length > 0 && selectedIds.size === sortedData.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all customers"
                  />
                </th>
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
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(customer.id)}
                      onChange={(e) => handleSelectOne(customer.id, e.target.checked)}
                      aria-label={`Select ${customer.fullName}`}
                    />
                  </td>
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
                  <td>{customer.lastOrderAtUtc ? formatDate(customer.lastOrderAtUtc) : "—"}</td>
                  <td className="customer-row-actions">
                    <Link className="view-link" to={`/customers/${customer.id}`}>View</Link>
                    <button className="action-icon edit" onClick={() => navigate(`/customers/${customer.id}/edit`)}>✎</button>
                    <button className="action-icon delete" onClick={() => setDeleting(customer)} disabled={isDeleting}>♲</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9}>
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
            setIsDeleting(true);
            customersApi.remove(deleting.id).then(() => {
              setDeleting(null);
              setIsDeleting(false);
              showToast('Customer deleted successfully', 'success');
              void load();
            }).catch((reason: unknown) => {
              setIsDeleting(false);
              setError(reason instanceof Error ? reason.message : "Unable to delete customer.");
              showToast('Failed to delete customer', 'error');
            });
          }}
          isDeleting={isDeleting}
        />
      )}
      {bulkDeleting && (
        <BulkDeleteModal
          count={selectedIds.size}
          itemType="Customer"
          onCancel={() => setBulkDeleting(false)}
          onConfirm={handleBulkDelete}
          isDeleting={bulkDeleting}
        />
      )}
    </section>
  );
}

export default CustomerListPage;
