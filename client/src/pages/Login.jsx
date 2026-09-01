import { useState } from "react";
import "./Login.css";

function Login() {
  const [role, setRole] = useState("");
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

 const handleSubmit = (e) => {
  e.preventDefault();

  if (!role) {
    alert("Please select your role");
    return;
  }

  if (!formData.email || !formData.password) {
    alert("Please enter your email and password");
    return;
  }

  if (!formData.email.includes("@")) {
    alert("Please enter a valid email");
    return;
  }

  console.log({
    role,
    ...formData
  });
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
                onClick={() => setRole("sender")}
              >
                Sender
              </button>

              <button
                type="button"
                className={role === "receiver" ? "selected" : ""}
                onClick={() => setRole("receiver")}
              >
                Receiver
              </button>

              <button
                type="button"
                className={role === "driver" ? "selected" : ""}
                onClick={() => setRole("driver")}
              >
                Driver
              </button>

              <button
                type="button"
                className={role === "truck_owner" ? "selected" : ""}
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
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
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