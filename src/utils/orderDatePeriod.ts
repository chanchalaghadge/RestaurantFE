export type OrderDatePeriod = "today" | "yesterday" | "last7Days" | "thisMonth" | "lastMonth" | "lastYear";

export const orderDatePeriodOptions: Array<{ value: OrderDatePeriod; label: string }> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7Days", label: "Last 7 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "lastYear", label: "Last Year" },
];

export function filterOrdersByPeriod<T extends { createdAtUtc: string }>(orders: T[], period: OrderDatePeriod, now = new Date()): T[] {
  let start: Date;
  let end = new Date(now);
  if (period === "today") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "yesterday") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, -1);
  } else if (period === "last7Days") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  } else if (period === "thisMonth") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "lastMonth") {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else {
    start = new Date(now.getFullYear() - 1, 0, 1);
    end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  }
  return orders.filter((order) => {
    const createdAt = new Date(order.createdAtUtc);
    return createdAt >= start && createdAt <= end;
  });
}
