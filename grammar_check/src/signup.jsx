import { useState } from "react";
import logo from "./assets/logo.png";
import "./signup.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Signup({ onLoginSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((current) => !current);
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    const response = await fetch(`${apiUrl}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      onLoginSuccess?.()
    }
  };

  return (
    <div className="signup-page">
      <header className="header">
     
        <img className="logo" src={logo} alt="Logo" />
        <h2>WriteWise</h2>
      
      </header>
      <div className="heading">
        <h1>Sign Up</h1>
      </div>

      <form className="signup-form" onSubmit={handleSignup}>
        <label>Email:</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password:</label>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" onClick={togglePassword}>
          {showPassword ? "Hide" : "Show"}
        </button>
        <button type="submit">Sign Up</button>
      </form>

      <p className="auth-toggle">
        Already have an account?{' '}
        <button type="button" className="link-button" onClick={onSwitchToLogin}>
          Log in
        </button>
      </p>
    </div>
  );
}

export default Signup;