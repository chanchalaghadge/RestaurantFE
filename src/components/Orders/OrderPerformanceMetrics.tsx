import type { OrderApi } from "../../api/orders.api";
import { formatCurrency } from "../../utils/currency";
import { orderDatePeriodOptions, type OrderDatePeriod } from "../../utils/orderDatePeriod";
import "./OrderPerformanceMetrics.css";

function OrderPerformanceMetrics({ orders, period, onPeriodChange, showPeriodFilter = true }: {
  orders: OrderApi[];
  period: OrderDatePeriod;
  onPeriodChange: (period: OrderDatePeriod) => void;
  showPeriodFilter?: boolean;
}) {
  const groups = [
    { key: "all", title: "Total Orders", icon: "📊", orders },
    { key: "DineIn", title: "Dine In", icon: "🍽️", orders: orders.filter((order) => order.orderType === "DineIn") },
    { key: "Takeaway", title: "Takeaway", icon: "🥡", orders: orders.filter((order) => order.orderType === "Takeaway") },
    { key: "Delivery", title: "Delivery", icon: "🛵", orders: orders.filter((order) => order.orderType === "Delivery") },
  ];

  return <section className="order-performance-panel" aria-label="Order performance metrics">
    <div className="order-performance-heading"><div><h2>Performance Metrics</h2><p>Order count and sales for the selected period</p></div>
      {showPeriodFilter && <label>Period<select value={period} onChange={(event) => onPeriodChange(event.target.value as OrderDatePeriod)} aria-label="Performance metric period">
        {orderDatePeriodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select></label>}
    </div>
    <div className="order-performance-grid">{groups.map((group) => {
      const sales = group.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      return <article className="order-performance-card" key={group.key}>
        <span aria-hidden="true">{group.icon}</span>
        <div><small>{group.title}</small><strong>{group.orders.length} <em>orders</em></strong><b>{formatCurrency(sales)} <small>sales</small></b></div>
      </article>;
    })}</div>
  </section>;
}

export default OrderPerformanceMetrics;
