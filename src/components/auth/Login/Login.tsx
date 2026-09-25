import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LoginRequest } from "../../../types/auth/auth.types";
import { authApi } from "../../../api/auth.api";
import { sanitizeInput } from "../../../utils/security";
import { useErrorHandler } from "../../../utils/errorHandler";
import { useToast } from "../../common/Toast";
import { useFieldValidation, commonRules } from "../../../utils/formValidation";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { handleError, createErrorContext } = useErrorHandler();
  const { errors, validateFieldOnChange, markFieldTouched, isFieldTouched, clearAllErrors } = useFieldValidation();
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("restaurant-remember-email") === "true");
  const [formData, setFormData] = useState<LoginRequest>({
    email: localStorage.getItem("restaurant-remember-email") === "true" ? localStorage.getItem("restaurant-remembered-email") ?? "" : "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: sanitizeInput(value) }));
    const rules = name === "email" ? commonRules.emailRequired : commonRules.password;
    validateFieldOnChange(name, value, rules, name === "email" ? "Email" : "Password");
    markFieldTouched(name);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    markFieldTouched("email");
    markFieldTouched("password");
    const emailValid = validateFieldOnChange("email", formData.email, commonRules.emailRequired, "Email");
    const passwordValid = validateFieldOnChange("password", formData.password, commonRules.password, "Password");
    if (!emailValid || !passwordValid) return;

    try {
      setSubmitting(true);
      setError("");
      const result = await authApi.login(formData.email.trim(), formData.password);
      if (rememberMe) {
        localStorage.setItem("restaurant-remember-email", "true");
        localStorage.setItem("restaurant-remembered-email", formData.email.trim());
      } else {
        localStorage.removeItem("restaurant-remember-email");
        localStorage.removeItem("restaurant-remembered-email");
      }
      localStorage.setItem("restaurant-user", JSON.stringify({ id: result.user.id, name: `${result.user.firstName} ${result.user.lastName}`.trim(), email: result.user.email }));
      showToast("Login successful", "success", 2000);
      clearAllErrors();
      navigate("/dashboard");
    } catch (requestError) {
      const errorContext = createErrorContext("Login", "submitLoginForm", { email: formData.email });
      handleError(requestError instanceof Error ? requestError : new Error("Unable to sign in."), errorContext);
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-container">
      <section className="login-story" aria-label="Foodie welcome">
        <Link className="login-story-brand" to="/">
          <span className="login-chef-icon" aria-hidden="true">♨</span>
          <span className="login-brand-copy"><strong>Food<span>ie</span></strong><small>Good Food&nbsp; • &nbsp;Great Mood</small></span>
        </Link>
        <div className="login-story-copy">
          <h1>Welcome Back!</h1>
          <p>Sign in to your account and continue<br className="desktop-break" /> your delicious journey.</p>
          <div className="login-story-features">
            <article><span>♜</span><div><strong>Delicious Food</strong><small>Fresh &amp; Tasty</small></div></article>
            <article><span>♧</span><div><strong>Fast Delivery</strong><small>At Your Doorstep</small></div></article>
            <article><span>★</span><div><strong>Great Experience</strong><small>Every Time</small></div></article>
          </div>
        </div>
        <p className="login-story-footer">Explore&nbsp; · &nbsp;Order&nbsp; · &nbsp;Enjoy</p>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-decoration login-decoration-top" aria-hidden="true">♧</div>
        <div className="login-form-wrap">
          <h2 id="login-title">Sign In</h2>
          <p className="login-subtitle">Enter your credentials to access your account</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="login-input-wrap"><span className="login-input-icon" aria-hidden="true">✉</span><input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email address" autoComplete="email" aria-invalid={errors.email ? "true" : "false"} aria-describedby={errors.email ? "email-error" : undefined} /></div>
              {errors.email && isFieldTouched("email") && <p id="email-error" className="field-error" role="alert">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap password-container">
                <span className="login-input-icon" aria-hidden="true">♙</span>
                <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="Enter your password" autoComplete="current-password" aria-invalid={errors.password ? "true" : "false"} aria-describedby={errors.password ? "password-error" : undefined} />
                <button type="button" className="password-visibility-button" onClick={() => setShowPassword((previous) => !previous)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 9.1 4.3 10 7a11.7 11.7 0 0 1-3.1 4.7M6.6 6.6C4.7 7.8 3.2 9.7 2 12c.9 2.7 4.8 7 10 7 1.1 0 2.1-.2 3-.5" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>}
                </button>
              </div>
              {errors.password && isFieldTouched("password") && <p id="password-error" className="field-error" role="alert">{errors.password}</p>}
            </div>

            <div className="login-options">
              <label className="remember-login"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me</label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
            <button type="submit" className="login-button" disabled={submitting}>{submitting ? "Signing in..." : "Sign In"}<span aria-hidden="true">→</span></button>
            {error && <p role="alert" className="login-error">{error}</p>}
          </form>
          <p className="login-signup-prompt">Don&apos;t have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
        <div className="login-decoration login-decoration-bottom" aria-hidden="true">♜</div>
      </section>
    </main>
  );
}

export default Login;
