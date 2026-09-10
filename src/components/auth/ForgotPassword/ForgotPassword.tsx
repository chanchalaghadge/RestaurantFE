import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type {
  ForgotPasswordMethod,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "../../../types/auth/auth.types";
import "./ForgotPassword.css";

const DEMO_OTP = "123456";

function ForgotPassword() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<ForgotPasswordMethod>("email");
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const request: ForgotPasswordRequest = {
      method,
      identifier,
    };

    if (!otpSent) {
      if (!validateIdentifier(request)) {
        return;
      }

      const response: ForgotPasswordResponse = {
        success: true,
        message:
          request.method === "email"
            ? `OTP sent successfully to ${request.identifier}.`
            : `OTP sent successfully to ${request.identifier}.`,
      };

      setOtpSent(true);
      setMessage(response.message);
      setMessageType("success");
      return;
    }

    if (!otp.trim()) {
      setMessage("Please enter the OTP.");
      setMessageType("error");
      return;
    }

    if (otp.trim() !== DEMO_OTP) {
      setMessage("Wrong OTP. Please enter the correct OTP.");
      setMessageType("error");
      return;
    }

    setMessage("OTP verified successfully. Redirecting to reset password...");
    setMessageType("success");

    setTimeout(() => {
      navigate("/reset-password");
    }, 800);
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

        <div className="method-switch">
          <button
            type="button"
            className={method === "email" ? "method-button active" : "method-button"}
            onClick={() => {
              setMethod("email");
              setMessage("");
              setOtpSent(false);
              setOtp("");
            }}
          >
            Email
          </button>
          <button
            type="button"
            className={method === "phone" ? "method-button active" : "method-button"}
            onClick={() => {
              setMethod("phone");
              setMessage("");
              setOtpSent(false);
              setOtp("");
            }}
          >
            Phone Number
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">
              {method === "email" ? "Email Address" : "Phone Number"}
            </label>
            <input
              id="identifier"
              name="identifier"
              type={method === "email" ? "email" : "tel"}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={
                method === "email" ? "Enter your email" : "Enter your phone number"
              }
              autoComplete={method === "email" ? "email" : "tel"}
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
