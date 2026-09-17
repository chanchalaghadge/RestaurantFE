import { API_BASE_URL } from "./client";

export async function uploadMenuItemImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const token = localStorage.getItem("restaurant-access-token");
  const response = await fetch(`${API_BASE_URL}/api/uploads/menu-items`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: form });
  const result = await response.json().catch(() => null) as { success?: boolean; message?: string; data?: { imageUrl?: string } } | null;
  if (!response.ok || !result?.success || !result.data?.imageUrl) throw new Error(result?.message ?? "Unable to upload image.");
  return result.data.imageUrl.startsWith("http") ? result.data.imageUrl : `${API_BASE_URL}${result.data.imageUrl}`;
}
