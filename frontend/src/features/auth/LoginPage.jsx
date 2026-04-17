import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";
import "../../assets/css/login.css";

const LOGOUT_REASON_KEY = "logoutReason";

/**
 * LoginPage - Glassmorphism styled login page
 */
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const reason = localStorage.getItem(LOGOUT_REASON_KEY);
    if (reason) {
      setError(reason);
      localStorage.removeItem(LOGOUT_REASON_KEY);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user) {
        // Redirect based on role
        switch (user.role) {
          case "ADMIN":
            navigate("/admin/dashboard");
            break;
          case "FACULTY":
            navigate("/faculty/dashboard");
            break;
          case "STUDENT":
            navigate("/student/dashboard");
            break;
          default:
            navigate("/");
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-container">
          <img src={logo} alt="CampusOne Logo" />
        </div>

        <h1>CampusOne</h1>
        <p className="subtitle">Unified Academic Dashboard</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <span>👁️</span>
              ) : (
                <span>👁️‍🗨️</span>
              )}
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "10px", fontSize: "12px", color: "#94a3b8" }}>
          Default admin login: admin.ops@campusone.edu / 123
        </p>
        
      </div>
    </div>
  );
}

export default LoginPage;

