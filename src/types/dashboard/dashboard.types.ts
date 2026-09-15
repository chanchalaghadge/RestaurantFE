export type Metric = { label: string; value: string; change: string; icon: string; tone: "green" | "blue" | "orange" | "purple" };
export type DashboardOrder = { id: string; customer: string; items: string; total: string; status: "Preparing" | "Ready" | "Delivered" | "New"; time: string };
export type Reservation = { name: string; party: number; date: string; status: "Confirmed" | "Pending" };