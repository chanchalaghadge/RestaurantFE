import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type {
  ForgotPasswordMethod,
  ForgotPasswordRequest,
} from "../../../types/auth/auth.types";
import { authApi } from "../../../api/auth.api";
import { RecoveryLayout } from "../RecoveryLayout";

function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
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
    // State updates render asynchronously; the ref also blocks rapid repeat submits.
    if (submittingRef.current) return;

    const method: ForgotPasswordMethod = identifier.includes("@") ? "email" : "phone";
    const request: ForgotPasswordRequest = {
      method,
      identifier,
    };

    if (!otpSent) {
      if (!validateIdentifier(request)) {
        return;
      }
    }

    if (otpSent && !/^\d{6}$/.test(otp.trim())) {
      setMessage("Enter the 6-digit verification code.");
      setMessageType("error");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      if (!otpSent) {
        await authApi.forgotPassword(request.identifier, request.method === "email" ? "Email" : "Phone");
        sessionStorage.setItem("restaurant-password-reset-user", request.identifier);
        setOtpSent(true);
        setMessage("If an active account matches those details, a verification code will be sent.");
        setMessageType("success");
      } else {
        await authApi.verifyOtp(identifier, otp.trim());
        setMessage("OTP verified successfully. Redirecting to reset password...");
        setMessageType("success");
        setTimeout(() => navigate("/reset-password"), 800);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : otpSent ? "Wrong OTP. Please try again." : "Unable to send OTP.");
      setMessageType("error");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <RecoveryLayout title="Forgot Password?" subtitle="Enter your email address or phone number and we’ll send you a verification code." footer={<><span>Remember your password?</span><Link to="/login">Back to Sign In</Link></>}>
        <form className="recovery-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Email or Phone Number</label>
            <div className="recovery-input-wrap"><span className="recovery-input-icon" aria-hidden="true">✉</span><input id="identifier" name="identifier" type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Enter your email address or phone" autoComplete="username" inputMode="email" /></div>
          </div>

          {otpSent && (
            <div className="form-group otp-group">
              <label htmlFor="otp">Enter OTP</label>
              <div className="recovery-input-wrap"><span className="recovery-input-icon" aria-hidden="true">♙</span><input id="otp" name="otp" type="text" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="Enter 6 digit OTP" autoComplete="one-time-code" /></div>
            </div>
          )}

          {message && (
            <div className={`recovery-message ${messageType}`} role="status">{message}</div>
          )}

          <button type="submit" className="recovery-button" disabled={submitting}>
            {submitting ? (otpSent ? "Verifying..." : "Sending OTP...") : otpSent ? "Verify OTP" : "Send OTP"}
            <span aria-hidden="true">→</span>
          </button>
        </form>
    </RecoveryLayout>
  );
}

export default ForgotPassword;
