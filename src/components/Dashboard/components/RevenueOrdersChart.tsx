import { formatCurrency } from "../../../utils/currency";

type Day = { label: string; revenue: number; orders: number };

function RevenueOrdersChart({ days }: { days: Day[] }) {
  const revenueMax = Math.max(1, Math.ceil(Math.max(...days.map((day) => day.revenue), 1) / 500) * 500);
  const ordersMax = Math.max(1, Math.ceil(Math.max(...days.map((day) => day.orders), 1) / 10) * 10);
  const plotTop = 18;
  const plotBottom = 148;
  const plotHeight = plotBottom - plotTop;
  const startX = 70;
  const endX = 610;
  const step = days.length > 1 ? (endX - startX) / (days.length - 1) : 0;
  const revenueY = (value: number) => plotBottom - (value / revenueMax) * plotHeight;
  const orderY = (value: number) => plotBottom - (value / ordersMax) * plotHeight;
  const orderPath = days.map((day, index) => `${index === 0 ? "M" : "L"} ${startX + index * step} ${orderY(day.orders)}`).join(" ");

  return (
    <div className="revenue-orders-chart" role="img" aria-label="Revenue and order totals over the last seven days">
      <div className="chart-legend" aria-hidden="true"><span className="revenue-dot" />Revenue <span className="orders-dot" />Orders</div>
      <svg viewBox="0 0 650 184" preserveAspectRatio="none">
        {[0, 1, 2, 3].map((index) => {
          const value = revenueMax - (revenueMax / 3) * index;
          const y = plotTop + (plotHeight / 3) * index;
          return <g key={index}><line className="chart-grid-line" x1="40" x2="630" y1={y} y2={y} /><text className="chart-axis-label" x="4" y={y + 3}>{formatCurrency(value)}</text><text className="chart-axis-label" x="636" y={y + 3}>{Math.round(ordersMax - (ordersMax / 3) * index)}</text></g>;
        })}
        {days.map((day, index) => {
          const x = startX + index * step;
          const y = revenueY(day.revenue);
          return <g key={day.label}><rect className="revenue-bar" x={x - 17} y={y} width="34" height={plotBottom - y} rx="3" /><text className="chart-day-label" x={x} y="174">{day.label}</text></g>;
        })}
        <path className="orders-line" d={orderPath} />
        {days.map((day, index) => <circle className="orders-point" key={day.label} cx={startX + index * step} cy={orderY(day.orders)} r="3.5" />)}
      </svg>
    </div>
  );
}

export default RevenueOrdersChart;
