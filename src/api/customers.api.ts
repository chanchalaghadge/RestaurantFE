import { api, query } from "./client";
export type CustomerApi = { id: number; fullName: string; phone: string; email?: string; status: "Active" | "Inactive"; tier: "Regular" | "VIP" | "New"; gender?: "Male" | "Female" | "Other"; address?: string; dateOfBirth?: string; notes?: string; totalOrders: number; lastOrderAtUtc?: string; initials: string };
export type CustomerUpsert = Omit<CustomerApi, "id" | "totalOrders" | "lastOrderAtUtc" | "initials">;
export const customersApi = {
  list: (filters: { search?: string; status?: string; tier?: string } = {}) => api<CustomerApi[]>(`/api/customers${query(filters)}`), get: (id: number) => api<CustomerApi>(`/api/customers/${id}`),
  create: (body: CustomerUpsert) => api<CustomerApi>("/api/customers", { method: "POST", body: JSON.stringify(body) }), update: (id: number, body: CustomerUpsert) => api<CustomerApi>(`/api/customers/${id}`, { method: "PUT", body: JSON.stringify(body) }), remove: (id: number) => api<boolean>(`/api/customers/${id}`, { method: "DELETE" }),
};
