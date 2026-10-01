import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, saveUser } from "../api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!role) {
      setError("Please select your role");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiRequest("auth/login", {
        method: "POST",
        body: JSON.stringify({ ...formData, role })
      });
      localStorage.setItem("token", data.token);
      saveUser(data.user);
      const paths = {
        sender: "/sender-dashboard",
        receiver: "/receiver-dashboard",
        driver: "/driver-dashboard",
        truck_owner: "/truck-owner-dashboard"
      };
      navigate(paths[data.user.role] || "/login", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back to UTI</h1>
          <p>Sign in to India's unified transport network</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="role-section">
            <h3>Choose Your Role</h3>

            <div className="role-options">
              <button
                type="button"
                className={role === "sender" ? "selected" : ""}
                aria-pressed={role === "sender"}
                onClick={() => setRole("sender")}
              >
                Sender
              </button>

              <button
                type="button"
                className={role === "receiver" ? "selected" : ""}
                aria-pressed={role === "receiver"}
                onClick={() => setRole("receiver")}
              >
                Receiver
              </button>

              <button
                type="button"
                className={role === "driver" ? "selected" : ""}
                aria-pressed={role === "driver"}
                onClick={() => setRole("driver")}
              >
                Driver
              </button>

              <button
                type="button"
                className={role === "truck_owner" ? "selected" : ""}
                aria-pressed={role === "truck_owner"}
                onClick={() => setRole("truck_owner")}
              >
                Truck Owner
              </button>
            </div>

            {role && (
              <p className="selected-role">
                You are{" "}
                <strong>
                  {role === "sender" && "Sender"}
                  {role === "receiver" && "Receiver"}
                  {role === "driver" && "Driver"}
                  {role === "truck_owner" && "Truck Owner"}
                </strong>
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="auth-feedback auth-feedback--error" role="alert">{error}</p>}

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;