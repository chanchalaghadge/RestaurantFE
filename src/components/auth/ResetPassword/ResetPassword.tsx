import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ResetPasswordRequest, ResetPasswordResponse } from "../../../types/auth/auth.types";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password.trim() || !confirmPassword.trim()) {
      setMessage("Please enter both password fields.");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    const request: ResetPasswordRequest = {
      password,
      confirmPassword,
    };

    const response: ResetPasswordResponse = {
      success: true,
      message: "Password reset successful. Redirecting to login...",
    };

    setMessage(response.message);
    setMessageType("success");

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  return (
    <div className="auth-page">
      <div className="auth-card reset-card">
        <div className="auth-brand">
          <span className="brand-icon">🍽️</span>
          <span className="brand-text">Restaurant</span>
        </div>

        <div className="auth-heading">
          <h1>Reset Password</h1>
          <p>Create a new password for your account.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              className="form-control"
            />
          </div>

          {message && <div className={`auth-message ${messageType}`}>{message}</div>}

          <button type="submit" className="primary-button full-button">
            Reset Password
          </button>
        </form>

        <div className="auth-footer">
          <span>Already remember?</span>
          <Link to="/login" className="text-link">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
