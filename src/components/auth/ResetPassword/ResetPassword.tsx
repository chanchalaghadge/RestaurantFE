import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../../api/auth.api";
import { RecoveryLayout } from "../RecoveryLayout";

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const visibilityIcon = (shown: boolean) => shown
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 9.1 4.3 10 7a11.7 11.7 0 0 1-3.1 4.7M6.6 6.6C4.7 7.8 3.2 9.7 2 12c.9 2.7 4.8 7 10 7 1.1 0 2.1-.2 3-.5" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>;

  return (
    <RecoveryLayout title="Reset Password" subtitle="Create a new password for your account." footer={<><span>Already remember?</span><Link to="/login">Back to Sign In</Link></>}>
        <form className="recovery-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <div className="recovery-input-wrap recovery-password"><span className="recovery-input-icon" aria-hidden="true">♙</span><input id="password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter new password" autoComplete="new-password" /><button type="button" className="recovery-visibility" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>{visibilityIcon(showPassword)}</button></div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="recovery-input-wrap recovery-password"><span className="recovery-input-icon" aria-hidden="true">♙</span><input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" autoComplete="new-password" /><button type="button" className="recovery-visibility" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>{visibilityIcon(showConfirmPassword)}</button></div>
          </div>

          {message && <div className={`recovery-message ${messageType}`} role="status">{message}</div>}

          <button type="submit" className="recovery-button">
            Reset Password <span aria-hidden="true">→</span>
          </button>
        </form>
    </RecoveryLayout>
  );
}

export default ResetPassword;
