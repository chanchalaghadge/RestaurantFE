import { cacheLocally, getCached } from "../utils/dataCache";
import { tokenStorage, securityHeaders, csrfProtection } from "../utils/security";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "https://restaurantbe-api-apgwf4dac2gfaqaq.southindia-01.azurewebsites.net";

// Add configuration validation
if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.DEV) {
  console.warn("⚠️ VITE_API_BASE_URL not set. Using default API URL.");
  console.warn("Create a .env file with: VITE_API_BASE_URL=your_api_url");
}

// Initialize CSP violation handler in production
if (import.meta.env.PROD) {
  import('../utils/security').then(({ setupCSPViolationHandler }) => {
    setupCSPViolationHandler();
  });
}

export type ApiResponse<T> = { success: boolean; message: string; data: T; errorCode?: string };

export class ApiError extends Error {
  public readonly status: number;
  public readonly errorCode?: string;
  constructor(message: string, status: number, errorCode?: string) { 
    super(message); 
    this.status = status; 
    this.errorCode = errorCode;
    this.name = 'ApiError';
  }
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

function isRetryable(status: number): boolean {
  return RETRYABLE_STATUS_CODES.includes(status);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function notifyServiceUnavailable(error: ApiError) {
  if (error.status === 0 || error.status >= 500) {
    window.dispatchEvent(new Event("service-unavailable"));
  }
}

export async function api<T>(path: string, init: RequestInit = {}, retryCount: number = 0): Promise<T> {
  const token = tokenStorage.getToken();
  
  // Check if token is expired before making request
  if (token && tokenStorage.isTokenExpired()) {
    tokenStorage.removeToken();
    window.location.href = '/login';
    throw new ApiError("Session expired. Please login again.", 401);
  }
  
  try {
    const headers = {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...securityHeaders.getHeaders(),
      ...csrfProtection.addToHeaders({}),
      ...init.headers
    };
    
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
    
    const payload = await response.json().catch(() => null) as ApiResponse<T> | T | null;
    
    if (!response.ok) {
      const message = payload && typeof payload === "object" && "message" in payload ? String(payload.message) : `Request failed (${response.status}).`;
      const errorCode = payload && typeof payload === "object" && "errorCode" in payload ? String(payload.errorCode) : undefined;
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY;
        
        if (retryCount < MAX_RETRIES) {
          console.warn(`Rate limited. Retrying after ${waitTime}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await delay(waitTime);
          return api<T>(path, init, retryCount + 1);
        }
      }
      
      // Retry on server errors
      if (isRetryable(response.status) && retryCount < MAX_RETRIES) {
        console.warn(`Request failed with status ${response.status}. Retrying... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
        return api<T>(path, init, retryCount + 1);
      }
      
      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        tokenStorage.removeToken();
        window.location.href = '/login';
        throw new ApiError("Session expired. Please login again.", response.status, errorCode);
      }
      
      throw new ApiError(message, response.status, errorCode);
    }
    
    if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
      const result = payload as ApiResponse<T>;
      if (!result.success) throw new ApiError(result.message || "Request failed.", response.status, result.errorCode);
      return result.data;
    }
    
    return payload as T;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`Network error. Retrying... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await delay(RETRY_DELAY * (retryCount + 1));
        return api<T>(path, init, retryCount + 1);
      }
      throw new ApiError("Network error. Please check your connection.", 0);
    }
    
    // Re-throw API errors
    if (error instanceof ApiError) {
      notifyServiceUnavailable(error);
      throw error;
    }
    
    // Handle unexpected errors
    throw new ApiError("An unexpected error occurred.", 0);
  }
}

/**
 * Cached API call - automatically caches GET requests
 */
export async function cachedApi<T>(path: string, init: RequestInit = {}, ttl: number = 5 * 60 * 1000): Promise<T> {
  // Only cache GET requests
  if (init.method && init.method.toUpperCase() !== 'GET') {
    return api<T>(path, init);
  }

  const cacheKey = `${path}-${JSON.stringify(init)}`;
  
  // Try to get from localStorage cache first
  const cached = getCached<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch data
  const data = await api<T>(path, init);
  
  // Cache the result
  cacheLocally(cacheKey, data, ttl);
  
  return data;
}

export const query = (values: Record<string, string | number | undefined | null>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") params.set(key, String(value)); });
  const text = params.toString();
  return text ? `?${text}` : "";
};
