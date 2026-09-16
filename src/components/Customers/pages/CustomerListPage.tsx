import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { customers as initialCustomers } from "../data/customer.data";
import "../Customers.css";

function CustomerListPage() {
  const navigate = useNavigate();
  const [customerList, setCustomerList] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [tier, setTier] = useState("All Customers");
  const [customerToDelete, setCustomerToDelete] = useState<typeof initialCustomers[number] | null>(null);

  const visibleCustomers = useMemo(
    () =>
      customerList.filter(
        (customer) =>
          `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(search.toLowerCase()) &&
          (status === "All Status" || customer.status === status) &&
          (tier === "All Customers" || customer.tier === tier),
      ),
    [customerList, search, status, tier],
  );

  const handleDelete = (customerId: string) => {
    const selectedCustomer = customerList.find((customer) => customer.id === customerId) ?? null;
    setCustomerToDelete(selectedCustomer);
  };

  const confirmDelete = () => {
    if (!customerToDelete) return;
    setCustomerList((current) => current.filter((customer) => customer.id !== customerToDelete.id));
    setCustomerToDelete(null);
  };

  return (
    <>
      <section className="customers-page">
        <div className="customer-page-header">
          <div>
            <div className="customer-breadcrumb">
              <Link to="/dashboard">Home</Link>
              <span>/</span>
              <strong>Customers</strong>
            </div>
            <h1>Customers</h1>
            <p>Manage your restaurant customers. View, edit, and manage customer details.</p>
          </div>
          <Link className="primary-button" to="/customers/new">
            <span>+</span> Add New Customer
          </Link>
        </div>

        <div className="customer-stats">
          <article>
            <span className="customer-stat-icon green">✦</span>
            <div>
              <small>Total Customers</small>
              <strong>{customerList.length}</strong>
              <em>↗ 12% this month</em>
            </div>
          </article>
          <article>
            <span className="customer-stat-icon blue">＋</span>
            <div>
              <small>New Customers</small>
              <strong>56</strong>
              <em>↗ 18% this month</em>
            </div>
          </article>
          <article>
            <span className="customer-stat-icon orange">↻</span>
            <div>
              <small>Returning Customers</small>
              <strong>192</strong>
              <em>↗ 9% this month</em>
            </div>
          </article>
          <article className="top-customer">
            <span className="customer-stat-icon purple">★</span>
            <div>
              <small>Top Customer</small>
              <strong>Rohit Sharma</strong>
              <em>12 orders</em>
            </div>
            <b>R</b>
          </article>
        </div>

        <div className="customer-panel">
          <div className="customer-filters">
            <label className="customer-search">
              ⌕
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, phone or email..." />
            </label>

            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <select value={tier} onChange={(event) => setTier(event.target.value)}>
              <option>All Customers</option>
              <option>Regular</option>
              <option>VIP</option>
              <option>New</option>
            </select>

            <select>
              <option>Sort By</option>
              <option>Name</option>
              <option>Total Orders</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("All Status");
                setTier("All Customers");
              }}
            >
              ↻ Reset
            </button>
          </div>

          <div className="customers-table-wrap">
            <table className="customers-table">
              <thead>
                <tr>
                  <th><input type="checkbox" aria-label="Select all customers" /></th>
                  <th>Customer Name</th>
                  <th>Phone Number</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Customer Tier</th>
                  <th>Total Orders</th>
                  <th>Last Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td><input type="checkbox" aria-label={`Select ${customer.name}`} /></td>
                    <td>
                      <div className="customer-cell">
                        <span className={`customer-avatar avatar-${customer.avatarTone}`}>{customer.initials}</span>
                        <div className="customer-name">
                          <strong>{customer.name}</strong>
                          <small>{customer.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{customer.phone}</td>
                    <td>{customer.email}</td>
                    <td>
                      <span className={`customer-badge ${customer.status.toLowerCase()}`}>{customer.status}</span>
                    </td>
                    <td>
                      <span className={`customer-tier ${customer.tier.toLowerCase()}`}>{customer.tier}</span>
                    </td>
                    <td>{customer.totalOrders}</td>
                    <td>{customer.lastOrder}</td>
                    <td>
                      <div className="customer-row-actions">
                        <Link to={`/customers/${customer.id}`} className="view-link" aria-label={`View ${customer.name}`} title="View customer">
                          <span aria-hidden="true">👁</span>
                        </Link>
                        <button type="button" className="action-icon edit" onClick={() => navigate(`/customers/${customer.id}/edit`)} aria-label={`Edit ${customer.name}`}>
                          ✎
                        </button>
                        <button type="button" className="action-icon delete" onClick={() => handleDelete(customer.id)} aria-label={`Delete ${customer.name}`}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="customers-footer">
            <span>Showing {visibleCustomers.length} of {customerList.length} customers</span>
            <div className="pagination">
              <button type="button" className="page-button active">1</button>
              <button type="button" className="page-button">2</button>
              <button type="button" className="page-button">3</button>
            </div>
          </div>
        </div>
      </section>

      {customerToDelete && (
        <div className="customer-delete-modal-backdrop" onClick={() => setCustomerToDelete(null)}>
          <div className="customer-delete-modal" onClick={(event) => event.stopPropagation()}>
            <div className="customer-delete-header">
              <h3>Delete Customer</h3>
              <button type="button" className="icon-close" onClick={() => setCustomerToDelete(null)}>
                ×
              </button>
            </div>
            <div className="customer-delete-body">
              <p>Are you sure you want to delete <strong>{customerToDelete.name}</strong>?</p>
              <p className="customer-delete-note">This action cannot be undone. All customer data including order history will be permanently removed.</p>
            </div>
            <div className="customer-delete-actions">
              <button type="button" className="secondary-button" onClick={() => setCustomerToDelete(null)}>
                Cancel
              </button>
              <button type="button" className="danger-button" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CustomerListPage;
