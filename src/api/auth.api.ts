import { api } from "./client";
import type { UserApi } from "./users.api";

export type LoginResult = { token: string; expiresAt: string; user: UserApi };
export const authApi = {
  login: (email: string, password: string) => api<LoginResult>("/api/Auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  forgotPassword: (userName: string, otpMethod: "Email" | "Sms") => api<unknown>("/api/Auth/forgot-password", { method: "POST", body: JSON.stringify({ userName, otpMethod }) }),
  verifyOtp: (userName: string, otp: string) => api<unknown>("/api/Auth/verify-otp", { method: "POST", body: JSON.stringify({ userName, otp }) }),
  resetPassword: (userName: string, newPassword: string) => api<unknown>("/api/Auth/reset-password", { method: "POST", body: JSON.stringify({ userName, newPassword }) }),
};
