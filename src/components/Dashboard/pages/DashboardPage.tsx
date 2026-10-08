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
import { filterOrdersByPeriod, orderDatePeriodOptions, type OrderDatePeriod } from "../../../utils/orderDatePeriod";
import "../Dashboard.css";

const statusNames = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"] as const;

function buildPeriodDays(orders: OrderApi[], period: OrderDatePeriod): DashboardApi["days"] {
  const now = new Date();
  const buckets: DashboardApi["days"] = [];
  if (period === "today" || period === "yesterday") {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (period === "yesterday" ? 1 : 0));
    for (let hour = 0; hour < 24; hour += 4) {
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour);
      buckets.push({ date: start.toISOString(), label: start.toLocaleTimeString([], { hour: "numeric" }), revenue: 0, orders: 0 });
    }
    orders.forEach((order) => {
      const hour = new Date(order.createdAtUtc).getHours();
      const bucket = buckets[Math.floor(hour / 4)];
      if (bucket) { bucket.revenue += order.totalAmount; bucket.orders += 1; }
    });
    return buckets;
  }
  if (period === "last7Days") {
    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
      buckets.push({ date: date.toISOString(), label: date.toLocaleDateString([], { weekday: "short" }), revenue: 0, orders: 0 });
    }
  } else if (period === "thisMonth") {
    for (let day = 1; day <= now.getDate(); day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      buckets.push({ date: date.toISOString(), label: String(day), revenue: 0, orders: 0 });
    }
  } else if (period === "lastMonth") {
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = (now.getMonth() + 11) % 12;
    const weeks = Math.ceil(new Date(year, month + 1, 0).getDate() / 7);
    for (let week = 0; week < weeks; week++) buckets.push({ date: new Date(year, month, week * 7 + 1).toISOString(), label: `Week ${week + 1}`, revenue: 0, orders: 0 });
  } else {
    const year = now.getFullYear() - 1;
    for (let month = 0; month < 12; month++) buckets.push({ date: new Date(year, month, 1).toISOString(), label: new Date(year, month, 1).toLocaleDateString([], { month: "short" }), revenue: 0, orders: 0 });
  }
  orders.forEach((order) => {
    const date = new Date(order.createdAtUtc);
    const index = period === "last7Days"
      ? Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000) * -1 + 6
      : period === "thisMonth" ? date.getDate() - 1
        : period === "lastMonth" ? Math.floor((date.getDate() - 1) / 7) : date.getMonth();
    const bucket = buckets[index];
    if (bucket) { bucket.revenue += order.totalAmount; bucket.orders += 1; }
  });
  return buckets;
}

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
  const periodRevenue = useMemo(() => performanceOrders.reduce((sum, order) => sum + order.totalAmount, 0), [performanceOrders]);
  const periodDays = useMemo(() => buildPeriodDays(performanceOrders, performancePeriod), [performanceOrders, performancePeriod]);
  const periodDayCount = performancePeriod === "today" || performancePeriod === "yesterday" ? 1
    : performancePeriod === "last7Days" ? 7
      : performancePeriod === "thisMonth" ? new Date().getDate()
      : performancePeriod === "lastMonth" ? new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate()
      : new Date(new Date().getFullYear() - 1, 1, 29).getMonth() === 1 ? 366 : 365;
  const periodStatusCounts = useMemo(() => Object.fromEntries(statusNames.map((status) => [status, performanceOrders.filter((order) => order.status === status).length])), [performanceOrders]);
  const statusDonut = useMemo(() => {
    const colors = ["#ffad1e", "#3480f3", "#25b982", "#12c99a", "#f55366"];
    const total = statusNames.reduce((sum, status) => sum + periodStatusCounts[status], 0);
    let cursor = 0;
    const segments = statusNames.map((status, index) => {
      const start = cursor;
      cursor += total ? periodStatusCounts[status] / total * 100 : 0;
      return `${colors[index]} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  }, [periodStatusCounts]);
  const popularItems = useMemo(() => {
    const totals = new Map<string, { name: string; quantity: number; revenue: number }>();
    performanceOrders.forEach((order) => order.items.forEach((item) => {
      const current = totals.get(item.itemName) ?? { name: item.itemName, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.lineTotal ?? item.unitPrice * item.quantity;
      totals.set(item.itemName, current);
    }));
    return [...totals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [performanceOrders]);
  const recentOrders = useMemo(() => [...performanceOrders].sort((a, b) => Date.parse(b.createdAtUtc) - Date.parse(a.createdAtUtc)).slice(0, 6), [performanceOrders]);

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

  const uniqueCustomers = new Set(performanceOrders.map((order) => order.customerName.trim()).filter((name) => name && name.toLowerCase() !== "unknown")).size;
  const metrics = data ? [
    { icon: "₹", graphic: "trend", tone: "green", label: "Total Revenue", value: formatCurrency(periodRevenue), sub: "Selected period" },
    { icon: "▤", graphic: "trend", tone: "blue", label: "Total Orders", value: performanceOrders.length, sub: "Selected period" },
    { icon: "♟", graphic: "person", tone: "orange", label: "Customers", value: uniqueCustomers, sub: "Selected period" },
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
        <label className="dashboard-period-filter">
          <span>Period</span>
          <select aria-label="Dashboard date range" value={performancePeriod} onChange={(event) => setPerformancePeriod(event.target.value as OrderDatePeriod)}>
            {orderDatePeriodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
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
                <p>Revenue and orders for the selected period</p>
              </div>
            </div>
            <RevenueOrdersChart days={periodDays} />
            <div className="sales-stats">
              <div className="stat-item stat-revenue">
                <span className="sales-stat-icon" aria-hidden="true">₹</span>
                <div className="sales-stat-copy"><span>Total Revenue</span><strong>{formatCurrency(periodRevenue)}</strong></div>
              </div>
              <div className="stat-item stat-average">
                <span className="sales-stat-icon" aria-hidden="true">▥</span>
                <div className="sales-stat-copy"><span>Average Daily</span><strong>{formatCurrency(periodRevenue / periodDayCount)}</strong></div>
              </div>
              <div className="stat-item stat-best-day">
                <span className="sales-stat-icon" aria-hidden="true">▦</span>
                <div className="sales-stat-copy"><span>Best Period</span><strong>{periodDays.reduce((best, day) => day.revenue > best.revenue ? day : best, periodDays[0]).label}</strong></div>
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
              <div className="donut-chart" style={{ background: statusDonut }}>
                <strong>{performanceOrders.length}</strong>
                <span>Total Orders</span>
              </div>
              <ul>
                {Object.entries(periodStatusCounts).map(([status, count]) => (
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
              {popularItems.length ? popularItems.map((item) => (
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

        <OrderPerformanceMetrics orders={performanceOrders} period={performancePeriod} onPeriodChange={setPerformancePeriod} showPeriodFilter={false} />

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
                  {recentOrders.map((order) => (
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
                      <td>{order.items.reduce((count, item) => count + item.quantity, 0)}</td>
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
