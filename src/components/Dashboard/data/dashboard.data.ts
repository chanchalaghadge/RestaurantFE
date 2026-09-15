import type { DashboardOrder, Metric, Reservation } from "../../../types/dashboard/dashboard.types";

export const metrics: Metric[] = [
  { label: "Total Orders", value: "48", change: "+12%", icon: "▱", tone: "green" },
  { label: "Total Revenue", value: "$1,248", change: "+18%", icon: "$", tone: "blue" },
  { label: "Total Customers", value: "36", change: "+9%", icon: "♧", tone: "orange" },
  { label: "Average Order Value", value: "$26.00", change: "+7%", icon: "♜", tone: "purple" },
];
export const orders: DashboardOrder[] = [
  { id: "#10048", customer: "John Smith", items: "2 items", total: "$32.00", status: "Preparing", time: "10:12 AM" }, { id: "#10047", customer: "Emily Davis", items: "3 items", total: "$45.50", status: "Ready", time: "09:58 AM" }, { id: "#10046", customer: "Michael Brown", items: "1 item", total: "$18.00", status: "Delivered", time: "09:42 AM" }, { id: "#10045", customer: "Sarah Wilson", items: "2 items", total: "$36.75", status: "Preparing", time: "09:31 AM" }, { id: "#10044", customer: "David Lee", items: "4 items", total: "$62.90", status: "New", time: "09:20 AM" },
];
export const reservations: Reservation[] = [
  { name: "Emma Wilson", party: 2, date: "Apr 26, 2025 · 12:00 PM", status: "Confirmed" }, { name: "James Carter", party: 4, date: "Apr 26, 2025 · 01:30 PM", status: "Confirmed" }, { name: "Olivia Martinez", party: 3, date: "Apr 26, 2025 · 03:00 PM", status: "Pending" }, { name: "Daniel Taylor", party: 5, date: "Apr 26, 2025 · 06:30 PM", status: "Confirmed" }, { name: "Sophia Clark", party: 2, date: "Apr 26, 2025 · 08:00 PM", status: "Confirmed" },
];
export const popularItems = [
  { name: "Margherita Pizza", orders: "24 orders", change: "18%", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=100&h=100&fit=crop" }, { name: "Caesar Salad", orders: "18 orders", change: "14%", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop" }, { name: "Grilled Chicken Burger", orders: "16 orders", change: "12%", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop" }, { name: "Pasta Alfredo", orders: "14 orders", change: "11%", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=100&h=100&fit=crop" }, { name: "Chocolate Lava Cake", orders: "10 orders", change: "8%", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=100&h=100&fit=crop" },
];