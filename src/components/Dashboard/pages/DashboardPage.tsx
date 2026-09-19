import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi, type DashboardApi } from "../../../api/dashboard.api";
import LoadingSpinner from "../../common/LoadingSpinner";
import Breadcrumb from "../../common/Breadcrumb";
import { LineChart } from "../../common/AnalyticsChart";
import "../Dashboard.css";

function DashboardPage() {
  const [data, setData] = useState<DashboardApi | null>(null);
  const [error, setError] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => dashboardApi.get()
    .then(setData)
    .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load dashboard."))
    .finally(() => setLoading(false));

  useEffect(() => { void load(); }, []);

  const seed = async () => {
    try {
      setSeeding(true);
      setError("");
      await dashboardApi.seed();
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create sample data.");
    } finally {
      setSeeding(false);
    }
  };

  const now = new Date();
  const dateText = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);
  const dayText = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
  const timeText = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(now);

  if (loading) {
    return (
      <section className="dashboard-page">
        <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }]} />
        <div className="dashboard-heading">
          <div>
            <h1>Dashboard</h1>
            <p>Live restaurant sales, orders, customers, and menu performance.</p>
          </div>
        </div>
        <LoadingSpinner text="Loading dashboard..." fullScreen />
      </section>
    );
  }

  const metrics = data ? [
    { icon: "₹", tone: "green", label: "Total Revenue", value: `₹${data.totalRevenue.toFixed(2)}`, sub: `₹${data.todayRevenue.toFixed(2)} today` },
    { icon: "▤", tone: "blue", label: "Total Orders", value: data.totalOrders, sub: `${data.todayOrders} today` },
    { icon: "♟", tone: "orange", label: "Customers", value: data.totalCustomers, sub: "From backend" },
    { icon: "▣", tone: "purple", label: "Active Menu Items", value: data.activeMenuItems, sub: "From backend" },
  ] : [];

  return (
    <section className="dashboard-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }]} />
      <div className="dashboard-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Live restaurant sales, orders, customers, and menu performance.</p>
        </div>
        <div className="dashboard-date" aria-label={`Current date and time: ${dateText}, ${timeText}`}>
          <div className="dashboard-date-group">
            <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>
            <div><strong>{dateText}</strong><span>{dayText}</span></div>
          </div>
          <div className="dashboard-time-group">
            <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            <strong>{timeText}</strong>
          </div>
        </div>
      </div>

      {error && <p role="alert">{error}</p>}
      {data && data.totalOrders === 0 && <button className="primary-button dashboard-seed" onClick={() => void seed()} disabled={seeding}>{seeding ? "Creating sample data..." : "Create Sample Sales Data"}</button>}

      <div className="metrics-grid">
        {metrics.map((metric) => <article className="dashboard-metric" key={metric.label}><div className={`metric-icon ${metric.tone}`}>{metric.icon}</div><div className="metric-copy"><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.sub}</small></div></article>)}
      </div>

      {data && <>
        <div className="dashboard-middle">
          <section className="dashboard-panel sales-panel enhanced-analytics">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Sales Overview</h2>
                <p>Revenue for the last 7 days</p>
              </div>
            </div>
            <div className="enhanced-chart-container">
              <LineChart 
                data={data.days.map(day => day.revenue)}
                labels={data.days.map(day => day.label)}
                color="#2d5df6"
                height={200}
              />
            </div>
            <div className="sales-stats">
              <div className="stat-item">
                <span>Total Revenue</span>
                <strong>₹{data.totalRevenue.toFixed(2)}</strong>
              </div>
              <div className="stat-item">
                <span>Average Daily</span>
                <strong>₹{(data.totalRevenue / 7).toFixed(2)}</strong>
              </div>
              <div className="stat-item">
                <span>Best Day</span>
                <strong>{data.days.reduce((best, day) => day.revenue > best.revenue ? day : best).label}</strong>
              </div>
            </div>
          </section>
          
          <section className="dashboard-panel order-status-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Order Status</h2>
                <p>Current status totals</p>
              </div>
            </div>
            <div className="status-chart">
              <div className="donut-chart">
                <strong>{data.totalOrders}</strong>
                <span>Total Orders</span>
              </div>
              <ul>
                {Object.entries(data.statusCounts).map(([status, count]) => (
                  <li key={status}>
                    <i className={status.toLowerCase()} />
                    {status}
                    <b>{count}</b>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          
          <section className="dashboard-panel popular-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Popular Menu Items</h2>
                <p>Best sellers from orders</p>
              </div>
            </div>
            <div className="popular-list">
              {data.popular.length ? data.popular.map((item) => (
                <div className="popular-item" key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.quantity} sold</span>
                  </div>
                  <b>₹{item.revenue.toFixed(0)}</b>
                </div>
              )) : <p>No item sales yet.</p>}
            </div>
          </section>
        </div>

        <div className="dashboard-middle enhanced-metrics">
          <section className="dashboard-panel performance-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Performance Metrics</h2>
                <p>Key business indicators</p>
              </div>
            </div>
            <div className="performance-grid">
              <div className="performance-card">
                <span className="performance-icon">📊</span>
                <div>
                  <strong>₹{(data.totalRevenue / (data.totalOrders || 1)).toFixed(2)}</strong>
                  <small>Avg Order Value</small>
                </div>
              </div>
              <div className="performance-card">
                <span className="performance-icon">⚡</span>
                <div>
                  <strong>{data.todayOrders}</strong>
                  <small>Today's Orders</small>
                </div>
              </div>
              <div className="performance-card">
                <span className="performance-icon">🎯</span>
                <div>
                  <strong>{data.activeMenuItems}</strong>
                  <small>Active Items</small>
                </div>
              </div>
              <div className="performance-card">
                <span className="performance-icon">👥</span>
                <div>
                  <strong>{data.totalCustomers}</strong>
                  <small>Total Customers</small>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="dashboard-tables">
          <section className="dashboard-panel table-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Recent Orders</h2>
                <p>Latest orders from your customers</p>
              </div>
              <Link to="/orders">View All →</Link>
            </div>
            <div className="dashboard-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customerName}</td>
                      <td>{order.itemCount}</td>
                      <td>₹{order.totalAmount.toFixed(2)}</td>
                      <td><span className={`dashboard-status ${order.status.toLowerCase()}`}>{order.status}</span></td>
                      <td>{new Date(order.createdAtUtc).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </>}
    </section>
  );
}

export default DashboardPage;
