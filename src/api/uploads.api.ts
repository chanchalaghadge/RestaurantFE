import { API_BASE_URL } from "./client";

async function uploadImage(file: File, target: "menu-items" | "categories"): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const token = localStorage.getItem("restaurant-access-token");
  const response = await fetch(`${API_BASE_URL}/api/uploads/${target}`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: form });
  const result = await response.json().catch(() => null) as { success?: boolean; message?: string; data?: { imageUrl?: string } } | null;
  if (!response.ok || !result?.success || !result.data?.imageUrl) throw new Error(result?.message ?? "Unable to upload image.");
  return result.data.imageUrl.startsWith("http") ? result.data.imageUrl : `${API_BASE_URL}${result.data.imageUrl}`;
}

export const uploadMenuItemImage = (file: File) => uploadImage(file, "menu-items");
export const uploadCategoryImage = (file: File) => uploadImage(file, "categories");
