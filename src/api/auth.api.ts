import { api } from "./client";
import type { UserApi } from "./users.api";
import { tokenStorage } from "../utils/security";

export type LoginResult = { token: string; expiresAt: string; user: UserApi };
export const authApi = {
  login: async (email: string, password: string) => {
    const result = await api<LoginResult>("/api/Auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    // Store token securely
    tokenStorage.setToken(result.token);
    return result;
  },
  logout: () => {
    tokenStorage.removeToken();
    // Optionally call logout endpoint if backend has one
  },
  forgotPassword: (userName: string, otpMethod: "Email" | "Sms") => api<unknown>("/api/Auth/forgot-password", { method: "POST", body: JSON.stringify({ userName, otpMethod }) }),
  verifyOtp: (userName: string, otp: string) => api<unknown>("/api/Auth/verify-otp", { method: "POST", body: JSON.stringify({ userName, otp }) }),
  resetPassword: (userName: string, newPassword: string) => api<unknown>("/api/Auth/reset-password", { method: "POST", body: JSON.stringify({ userName, newPassword }) }),
};
