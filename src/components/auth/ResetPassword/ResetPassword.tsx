import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../../api/auth.api";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

    const userName = sessionStorage.getItem("restaurant-password-reset-user");
    if (!userName) { setMessage("Your reset session has expired. Start again from Forgot Password."); setMessageType("error"); return; }
    try {
      await authApi.resetPassword(userName, password);
      sessionStorage.removeItem("restaurant-password-reset-user");
      setMessage("Password reset successful. Redirecting to login...");
      setMessageType("success");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reset password.");
      setMessageType("error");
    }
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
