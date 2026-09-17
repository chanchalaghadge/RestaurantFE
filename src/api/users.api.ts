import { api } from "./client";
export type UserUpsert = { firstName: string; lastName: string; email: string; phoneNumber?: string; isActive?: boolean; password?: string };
export const usersApi = { get: (id: number) => api<unknown>(`/api/Users/${id}`), create: (body: UserUpsert) => api<unknown>("/api/Users", { method: "POST", body: JSON.stringify(body) }), update: (id: number, body: UserUpsert) => api<unknown>(`/api/Users/${id}`, { method: "PUT", body: JSON.stringify(body) }), remove: (id: number) => api<unknown>(`/api/Users/${id}`, { method: "DELETE" }) };
