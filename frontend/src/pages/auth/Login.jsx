import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/login.css";
import logo from "../../assets/images/logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password);

      if (user) {
        if (user.role === "ADMIN") {
          navigate("/admin/dashboard");
        } else if (user.role === "FACULTY") {
          navigate("/faculty/dashboard");
        } else if (user.role === "STUDENT") {
          navigate("/student/dashboard");
        }
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-container">
          <img src={logo} alt="logo" />
        </div>

        <h1>CampusOne</h1>
        <p className="subtitle">Unified Academic Dashboard</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
        
        <div className="login-hints">
          <p>Demo accounts:</p>
          <small>admin123@gmail.com / 123456</small><br />
          <small>faculty123@gmail.com / 123456</small><br />
          <small>student123@gmail.com / 123456</small>
        </div>
      </div>
    </div>
  );
}

export default Login;
