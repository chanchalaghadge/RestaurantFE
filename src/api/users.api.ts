import { api } from "./client";
export type UserApi = { id: number; firstName: string; lastName: string; email: string; phoneNumber?: string; isActive: boolean; createdDate: string; modifiedDate?: string };
export type UserCreate = { firstName: string; lastName: string; email: string; phoneNumber?: string; password: string };
export type UserUpdate = { firstName?: string; lastName?: string; email?: string; phoneNumber?: string };
export const usersApi = {
  list: () => api<UserApi[]>("/api/Users"),
  get: (id: number) => api<UserApi>(`/api/Users/${id}`),
  create: (body: UserCreate) => api<UserApi>("/api/Users", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: UserUpdate) => api<UserApi>(`/api/Users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => api<boolean>(`/api/Users/${id}`, { method: "DELETE" }),
};
