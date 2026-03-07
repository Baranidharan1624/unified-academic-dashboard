import { useState } from "react";
import logo from "./assets/logo.png";
import "./Login.css";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (isRegister) {
      alert(`Registered Successfully as ${role} with email ${email}`);
    } else {
      alert("Login Successful");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Logo */}
        <div className="logo-circle">
  <img src={logo} alt="Logo" />
</div>

        <h2>Unified Academic Dashboard</h2>
        <p className="subtitle">
          {isRegister ? "Create your account" : "Role-Based Login System"}
        </p>

        <form onSubmit={handleSubmit}>

          {isRegister && (
            <>
              <label>Select Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            required
            minLength="6"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="toggle-text">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? " Login" : " Sign Up"}
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;