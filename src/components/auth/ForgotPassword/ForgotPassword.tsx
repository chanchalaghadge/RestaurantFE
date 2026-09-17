import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type {
  ForgotPasswordMethod,
  ForgotPasswordRequest,
} from "../../../types/auth/auth.types";
import { authApi } from "../../../api/auth.api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const validateIdentifier = (request: ForgotPasswordRequest) => {
    if (!request.identifier.trim()) {
      setMessage(
        request.method === "email"
          ? "Please enter your email address."
          : "Please enter your phone number."
      );
      setMessageType("error");
      return false;
    }

    if (request.method === "email") {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.identifier);
      if (!isValidEmail) {
        setMessage("Please enter a valid email address.");
        setMessageType("error");
        return false;
      }
    }

    if (request.method === "phone") {
      const isValidPhone = /^[0-9+\-()\s]{10,15}$/.test(request.identifier);
      if (!isValidPhone) {
        setMessage("Please enter a valid phone number.");
        setMessageType("error");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const method: ForgotPasswordMethod = identifier.includes("@") ? "email" : "phone";
    const request: ForgotPasswordRequest = {
      method,
      identifier,
    };

    if (!otpSent) {
      if (!validateIdentifier(request)) {
        return;
      }

      try {
        await authApi.forgotPassword(request.identifier, request.method === "email" ? "Email" : "Sms");
        sessionStorage.setItem("restaurant-password-reset-user", request.identifier);
        setOtpSent(true);
        setMessage(`OTP sent successfully to ${request.identifier}.`);
        setMessageType("success");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to send OTP.");
        setMessageType("error");
      }
      return;
    }

    if (!otp.trim()) {
      setMessage("Please enter the OTP.");
      setMessageType("error");
      return;
    }

    try {
      await authApi.verifyOtp(identifier, otp.trim());
      setMessage("OTP verified successfully. Redirecting to reset password...");
      setMessageType("success");
      setTimeout(() => navigate("/reset-password"), 800);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Wrong OTP. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card forgot-card">
        <div className="auth-brand">
          <span className="brand-icon">🍽️</span>
          <span className="brand-text">Restaurant</span>
        </div>

        <div className="auth-heading">
          <h1>Forgot Password?</h1>
          <p>Choose how you want to receive the OTP.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">
              Email or Phone Number
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Enter email or phone number"
              autoComplete="username"
              inputMode="email"
              className="form-control"
            />
          </div>

          {otpSent && (
            <div className="form-group otp-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter 6 digit OTP"
                className="form-control"
              />
            </div>
          )}

          {message && (
            <div className={`auth-message ${messageType}`}>{message}</div>
          )}

          <button type="submit" className="primary-button full-button">
            {otpSent ? "Verify OTP" : "Send OTP"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Remember your password?</span>
          <Link to="/login" className="text-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
