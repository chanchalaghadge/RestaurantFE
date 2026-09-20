import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../../common/Breadcrumb";
import { customers } from "../data/customer.data";
import "../Customers.css";

const recentOrders = [
  { id: "#100201", date: "Sep 10, 2025", amount: "$640", status: "Completed" },
  { id: "#100200", date: "Sep 04, 2025", amount: "$330", status: "Completed" },
  { id: "#100199", date: "Aug 28, 2025", amount: "$560", status: "Completed" },
  { id: "#100198", date: "Aug 20, 2025", amount: "$420", status: "Completed" },
  { id: "#100197", date: "Aug 12, 2025", amount: "$330", status: "Completed" },
];

function CustomerViewPage() {
  const { id } = useParams();
  const customer = customers.find((item) => item.id === id) ?? customers[0];

  return (
    <section className="customers-page customer-detail-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Customers', path: '/customers' }, { label: customer.name }]} />
      <div className="customer-heading-row">
        <div>
          <h1>Customer Details</h1>
          <p>View complete information about the customer.</p>
        </div>

        <div className="detail-actions">
          <Link className="secondary-button" to="/customers">← Back to Customers</Link>
          <Link className="primary-button" to={`/customers/${customer.id}/edit`}>
            Edit
          </Link>
        </div>
      </div>

      <div className="customer-detail-shell">
        <div className="customer-profile-summary-panel">
          <div className="customer-profile-summary">
            <div className={`customer-avatar large avatar-${customer.avatarTone}`}>{customer.initials}</div>
            <div className="customer-profile-text">
              <div className="customer-status-row">
                <span className={`customer-badge ${customer.status.toLowerCase()}`}>{customer.status}</span>
                <span className={`customer-tier ${customer.tier.toLowerCase()}`}>{customer.tier}</span>
              </div>
              <h2>{customer.name}</h2>
              <p>{customer.email}</p>
              <div className="customer-meta-list">
                <span>{customer.phone}</span>
                <span>{customer.lastOrder}</span>
              </div>
            </div>
          </div>

          <div className="customer-profile-grid">
            <div>
              <small>Phone</small>
              <strong>{customer.phone}</strong>
            </div>
            <div>
              <small>Customer Tier</small>
              <strong>{customer.tier}</strong>
            </div>
            <div>
              <small>Total Orders</small>
              <strong>{customer.totalOrders}</strong>
            </div>
            <div>
              <small>Last Order</small>
              <strong>{customer.lastOrder}</strong>
            </div>
          </div>
        </div>

        <div className="customer-detail-summary">
          <div className="summary-card">
            <span>12</span>
            <small>Total Orders</small>
          </div>
          <div className="summary-card">
            <span>₹ 1,850</span>
            <small>Lifetime Spend</small>
          </div>
          <div className="summary-card">
            <span>4.8</span>
            <small>Ratings</small>
          </div>
        </div>

        <div className="customer-detail-bottom">
          <div className="detail-panel">
            <div className="detail-panel-header">
              <h3>Recent Orders</h3>
              <button type="button">View All</button>
            </div>
            <table className="customer-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.date}</td>
                    <td>{order.amount}</td>
                    <td><span className="order-status completed">{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="detail-panel">
            <div className="detail-panel-header">
              <h3>Customer Preferences</h3>
            </div>
            <div className="preference-list">
              <div>
                <label>Favorite Items</label>
                <p>Pizza, Pasta, Cold Coffee</p>
              </div>
              <div>
                <label>Dietary Preferences</label>
                <p>Veg</p>
              </div>
              <div>
                <label>Special Notes</label>
                <p>Less spicy, extra cheese</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CustomerViewPage;
