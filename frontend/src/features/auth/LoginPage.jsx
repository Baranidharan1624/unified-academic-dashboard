import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";
import "../../assets/css/login.css";

/**
 * LoginPage - Glassmorphism styled login page
 */
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <div className="login-hints">
          <p>Demo Accounts:</p>
          <small>admin@campusone.com / admin123</small><br />
          <small>faculty@campusone.com / faculty123</small><br />
          <small>student@campusone.com / student123</small>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

