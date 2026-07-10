import { useState } from "react";
import logo from "./assets/logo.png";
import "./signup.css";

function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((s) => !s);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) onLoginSuccess?.();
    } catch (err) {
      alert("Login failed. Try again later.");
    }
  };

  return (
    <div className="signup-page">
      <header className="header">
        <img className="logo" src={logo} alt="Logo" />
        <h2>WriteWise</h2>
      </header>

      <div className="heading">
        <h1>Log In</h1>
      </div>

      <form className="signup-form" onSubmit={handleLogin}>
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

        <button type="submit">Log In</button>

      </form>

      <p className="auth-toggle">
        Don't have an account?{' '}
        <button type="button" className="link-button" onClick={onSwitchToSignup}>
          Sign up
        </button>
      </p>
    </div>
  );
}

export default Login;
