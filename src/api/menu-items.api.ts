import { api, query } from "./client";
export type MenuOption = { id?: number; name: string; priceAdjustment: number };
export type MenuOptionGroup = { id?: number; name: string; isRequired: boolean; options: MenuOption[] };
export type MenuItemApi = { id: number; code: string; name: string; categoryId: number; categoryName: string; description: string; price: number; preparationTimeMinutes: number; calories?: number; ingredients?: string; status: "Active" | "Inactive"; dietaryType: "Veg" | "Non-Veg"; imageUrl?: string; tags?: string; optionGroups: MenuOptionGroup[] };
export type MenuItemUpsert = Omit<MenuItemApi, "id" | "categoryName">;
export type MenuItemSummary = { totalItems: number; activeItems: number; categoryCount: number; variationCount: number };
export const menuItemsApi = {
  list: (filters: { search?: string; categoryId?: number; status?: string } = {}) => api<MenuItemApi[]>(`/api/menu-items${query(filters)}`), summary: () => api<MenuItemSummary>("/api/menu-items/summary"), get: (id: number) => api<MenuItemApi>(`/api/menu-items/${id}`),
  create: (body: MenuItemUpsert) => api<MenuItemApi>("/api/menu-items", { method: "POST", body: JSON.stringify(body) }), update: (id: number, body: MenuItemUpsert) => api<MenuItemApi>(`/api/menu-items/${id}`, { method: "PUT", body: JSON.stringify(body) }), remove: (id: number) => api<boolean>(`/api/menu-items/${id}`, { method: "DELETE" }),
};
