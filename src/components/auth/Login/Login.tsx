import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LoginRequest } from "../../../types/auth/auth.types";
import "./Login.css";

const TEST_EMAIL = "rohit@rohit.com";
const TEST_PASSWORD = "123";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginRequest>({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please enter email and password.");
      return;
    }

    if (
      formData.email.trim().toLowerCase() === TEST_EMAIL &&
      formData.password === TEST_PASSWORD
    ) {
      navigate("/dashboard");
      return;
    }

    alert("Invalid credentials. Use rohit@rohit.com / 123 for testing.");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-icon">🍽️</span>
          <h1>Restaurant</h1>
        </div>

        <h2>Login</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="password-container">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="show-password-button"
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="login-options">
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;