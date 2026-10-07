import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dashboardApi, type DashboardApi } from "../../../api/dashboard.api";
import LoadingSpinner from "../../common/LoadingSpinner";
import Breadcrumb from "../../common/Breadcrumb";
import RevenueOrdersChart from "../components/RevenueOrdersChart";
import { useToast } from "../../common/Toast";
import { useErrorHandler } from "../../../utils/errorHandler";
import { webSocketService } from "../../../utils/websocket";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/date";
import { ordersApi, type OrderApi } from "../../../api/orders.api";
import OrderPerformanceMetrics from "../../Orders/OrderPerformanceMetrics";
import { filterOrdersByPeriod, type OrderDatePeriod } from "../../../utils/orderDatePeriod";
import "../Dashboard.css";

function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { handleError, createErrorContext } = useErrorHandler();
  const [data, setData] = useState<DashboardApi | null>(null);
  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [performancePeriod, setPerformancePeriod] = useState<OrderDatePeriod>("today");
  const [error, setError] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [loading, setLoading] = useState(true);
  const isLoadingRef = useRef(false);
  const refreshTimeoutRef = useRef<number | null>(null);

  const load = () => {
    // Prevent concurrent API calls
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    return Promise.all([dashboardApi.get(), ordersApi.list().catch(() => [])])
      .then(([dashboardData, orderData]) => { setData(dashboardData); setOrders(orderData); })
      .catch((reason: unknown) => {
        const errorContext = createErrorContext('DashboardPage', 'loadDashboard');
        handleError(reason instanceof Error ? reason : new Error('Unable to load dashboard.'), errorContext);
        setError(reason instanceof Error ? reason.message : "Unable to load dashboard.");
      })
      .finally(() => {
        isLoadingRef.current = false;
        setLoading(false);
      });
  };

  const performanceOrders = useMemo(() => filterOrdersByPeriod(orders, performancePeriod), [orders, performancePeriod]);

  // WebSocket integration for real-time updates
  useEffect(() => {
    // Connect to WebSocket
    webSocketService.connect().catch((error) => {
      const errorContext = createErrorContext('DashboardPage', 'connectWebSocket');
      handleError(error, errorContext);
    });

    // Subscribe to dashboard updates
    const unsubscribe = webSocketService.on('dashboard:updated', (dashboardData) => {
      console.log('Dashboard updated via WebSocket:', dashboardData);
      setData(dashboardData as DashboardApi);
      showToast('Dashboard updated in real-time', 'success', 2000);
    });

    // Debounced refresh for order updates
    const debouncedRefresh = () => {
      if (refreshTimeoutRef.current !== null) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = window.setTimeout(() => {
        console.log('Refreshing dashboard after order event');
        load();
      }, 2000); // Wait 2 seconds before refreshing
    };

    // Subscribe to order updates that affect dashboard
    const unsubscribeOrders = webSocketService.on('order:created', () => {
      console.log('New order created, scheduling dashboard refresh');
      debouncedRefresh();
    });

    const unsubscribeOrderStatus = webSocketService.on('order:status_changed', () => {
      console.log('Order status changed, scheduling dashboard refresh');
      debouncedRefresh();
    });

    return () => {
      unsubscribe();
      unsubscribeOrders();
      unsubscribeOrderStatus();
      if (refreshTimeoutRef.current !== null) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [createErrorContext, handleError]);

  useEffect(() => { void load(); }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current !== null) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const seed = async () => {
    try {
      setSeeding(true);
      setError("");
      await dashboardApi.seed();
      showToast('Sample data created successfully', 'success');
      // Reset loading state before calling load
      setLoading(true);
      await load();
    } catch (reason) {
      const errorContext = createErrorContext('DashboardPage', 'seedData');
      handleError(reason instanceof Error ? reason : new Error('Unable to create sample data.'), errorContext);
      setError(reason instanceof Error ? reason.message : "Unable to create sample data.");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <section className="dashboard-page">
        <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }]} />
        <div className="dashboard-heading">
          <div>
            <h1><span className="page-title-icon" aria-hidden="true">⌂</span> Dashboard</h1>
            <p>Live restaurant sales, orders, customers, and menu performance.</p>
          </div>
        </div>
        <LoadingSpinner text="Loading dashboard..." fullScreen />
      </section>
    );
  }

  const metrics = data ? [
    { icon: "₹", graphic: "trend", tone: "green", label: "Total Revenue", value: formatCurrency(data.totalRevenue), sub: `${formatCurrency(data.todayRevenue)} today` },
    { icon: "▤", graphic: "trend", tone: "blue", label: "Total Orders", value: data.totalOrders, sub: `${data.todayOrders} today` },
    { icon: "♟", graphic: "person", tone: "orange", label: "Customers", value: data.totalCustomers, sub: "From backend" },
    { icon: "▦", graphic: "cloche", tone: "purple", label: "Active Menu Items", value: data.activeMenuItems, sub: "From backend" },
  ] : [];

  return (
    <section className="dashboard-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }]} />
      <div className="dashboard-heading">
        <div>
          <h1><span className="page-title-icon" aria-hidden="true">⌂</span> Dashboard</h1>
          <p>Live restaurant sales, orders, customers, and menu performance.</p>
        </div>
      </div>

      {error && <p role="alert">{error}</p>}
      {data && data.totalOrders === 0 && <button className="primary-button dashboard-seed" onClick={() => void seed()} disabled={seeding}>{seeding ? "Creating sample data..." : "Create Sample Sales Data"}</button>}

      <div className="metrics-grid">
        {metrics.map((metric) => <article className={`dashboard-metric metric-${metric.tone}`} key={metric.label}>
          <div className={`metric-icon ${metric.tone}`} aria-hidden="true">{metric.icon}</div>
          <div className="metric-copy"><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.sub}</small></div>
          {metric.graphic === "trend" ? <svg className="metric-decoration metric-trend" viewBox="0 0 80 36" aria-hidden="true"><polyline points="2,29 14,23 25,26 37,13 48,17 59,8 77,3" /></svg> : <span className={`metric-decoration metric-symbol ${metric.graphic}`} aria-hidden="true">{metric.graphic === "person" ? "♟" : "♨"}</span>}
        </article>)}
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
            <RevenueOrdersChart days={data.days} />
            <div className="sales-stats">
              <div className="stat-item stat-revenue">
                <span className="sales-stat-icon" aria-hidden="true">₹</span>
                <div className="sales-stat-copy"><span>Total Revenue</span><strong>{formatCurrency(data.totalRevenue)}</strong></div>
              </div>
              <div className="stat-item stat-average">
                <span className="sales-stat-icon" aria-hidden="true">▥</span>
                <div className="sales-stat-copy"><span>Average Daily</span><strong>{formatCurrency(data.totalRevenue / 7)}</strong></div>
              </div>
              <div className="stat-item stat-best-day">
                <span className="sales-stat-icon" aria-hidden="true">▦</span>
                <div className="sales-stat-copy"><span>Best Day</span><strong>{data.days.reduce((best, day) => day.revenue > best.revenue ? day : best).label}</strong></div>
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
                  <b>{formatCurrency(item.revenue)}</b>
                </div>
              )) : <p>No item sales yet.</p>}
            </div>
          </section>
        </div>

        <OrderPerformanceMetrics orders={performanceOrders} period={performancePeriod} onPeriodChange={setPerformancePeriod} />

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
                    <tr
                      key={order.id}
                      className="dashboard-order-row"
                      onDoubleClick={() => {
                        const status = order.status.toLowerCase();
                        navigate(status === "completed" || status === "cancelled"
                          ? `/orders/${order.id}`
                          : `/orders/${order.id}/edit`);
                      }}
                    >
                      <td>#{order.id}</td>
                      <td>{order.customerName}</td>
                      <td>{order.itemCount}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td><span className={`dashboard-status ${order.status.toLowerCase()}`}>{order.status}</span></td>
                      <td>{formatDate(order.createdAtUtc)}</td>
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
