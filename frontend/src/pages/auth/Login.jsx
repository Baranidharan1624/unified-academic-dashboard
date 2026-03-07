import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/login.css";
import logo from "../../assets/images/logo.png";
import { login } from "../../services/authService";

function Login() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e)=>{
    e.preventDefault();

    const user = login(email,password);

    if(user){
      if(user.role === "admin"){
        navigate("/admin/dashboard");
      }
    }else{
      alert("Invalid email or password");
    }
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="logo-container">
          <img src={logo} alt="logo" />
        </div>

        <h1>Unified Academic Dashboard</h1>
        <p className="subtitle">Role-Based Login System</p>

        <form onSubmit={handleSubmit}>

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button type="submit">Login</button>

        </form>
      </div>

    </div>
  )
}

export default Login;