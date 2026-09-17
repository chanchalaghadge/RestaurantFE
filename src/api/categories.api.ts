import { api } from "./client";
export type CategoryApi = { id: number; name: string; description?: string; imageUrl?: string };
export type CategoryUpsert = Omit<CategoryApi, "id">;
export const categoriesApi = {
  list: () => api<CategoryApi[]>("/api/Category"), get: (id: number) => api<CategoryApi>(`/api/Category/${id}`),
  create: (body: CategoryUpsert) => api<CategoryApi>("/api/Category", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: CategoryUpsert) => api<boolean>(`/api/Category/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => api<boolean>(`/api/Category/${id}`, { method: "DELETE" }),
};
