import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

    alert("Invalid credentials. Use admin@restaurant.com / admin123 for testing.");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Restaurant</h1>
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
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
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;