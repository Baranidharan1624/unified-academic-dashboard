import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const defaultPathByRole = {
    admin: "/admin/dashboard",
    faculty: "/faculty/dashboard",
    student: "/student/dashboard",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedUser = username.trim().toLowerCase();
    const validUsers = ["admin", "student", "faculty"];

    if (!validUsers.includes(normalizedUser) || password !== "123") {
      alert("Invalid username or password");
      return;
    }

    const role = normalizedUser;
    onLogin({ email: normalizedUser, role });
    navigate(defaultPathByRole[role] || "/student/dashboard", { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Logo */}
        <div className="logo-circle">
  <img src={logo} alt="Logo" />
</div>

        <h2>Unified Academic Dashboard</h2>
        <p className="subtitle">Sign in with username and password</p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username "
            required
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            Login
          </button>
        </form>

        <p className="toggle-text">Users: admin, faculty, student | Password: 123</p>

      </div>
    </div>
  );
}

export default Login;
