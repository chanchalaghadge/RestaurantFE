import { api } from "./client";
import type { UserApi } from "./users.api";
import { clearLocalCache } from "../utils/dataCache";

export type LoginResult = { token?: string; expiresAt: string; user: UserApi };
export type ClientSignupRequest = { restaurantName: string; branchName?: string; ownerFirstName: string; ownerLastName: string; email: string; password: string; phoneNumber?: string };
export const authApi = {
  login: async (email: string, password: string) => {
    const result = await api<LoginResult>("/api/Auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    clearLocalCache();
    localStorage.removeItem("restaurant-access-token");
    return result;
  },
  registerClient: async (body: ClientSignupRequest) => {
    return api<LoginResult>("/api/auth/signup", { method: "POST", body: JSON.stringify(body) });
  },
  logout: async () => {
    localStorage.removeItem("restaurant-access-token");
    clearLocalCache();
    await api<void>("/api/Auth/logout", { method: "POST" }).catch(() => undefined);
  },
  forgotPassword: (userName: string, otpMethod: "Email" | "Phone") => api<unknown>("/api/Auth/forgot-password", { method: "POST", body: JSON.stringify({ userName, otpMethod }) }),
  verifyOtp: (userName: string, otp: string) => api<unknown>("/api/Auth/verify-otp", { method: "POST", body: JSON.stringify({ userName, otp }) }),
  resetPassword: (userName: string, newPassword: string) => api<unknown>("/api/Auth/reset-password", { method: "POST", body: JSON.stringify({ userName, newPassword }) }),
};
