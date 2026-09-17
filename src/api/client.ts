export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "https://restaurantbe-api-apgwf4dac2gfaqaq.southindia-01.azurewebsites.net";

export type ApiResponse<T> = { success: boolean; message: string; data: T; errorCode?: string };

export class ApiError extends Error {
  public readonly status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("restaurant-access-token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  const payload = await response.json().catch(() => null) as ApiResponse<T> | T | null;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload ? String(payload.message) : `Request failed (${response.status}).`;
    throw new ApiError(message, response.status);
  }
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    const result = payload as ApiResponse<T>;
    if (!result.success) throw new ApiError(result.message || "Request failed.", response.status);
    return result.data;
  }
  return payload as T;
}

export const query = (values: Record<string, string | number | undefined | null>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") params.set(key, String(value)); });
  const text = params.toString();
  return text ? `?${text}` : "";
};
