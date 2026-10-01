import { useState } from "react";
import { apiRequest } from "../api";
import "./Signup.css";

function Signup() {
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    truckNumber: ""
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
    setSuccess("");
    if (!role) {
      setError("Please select your role");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if ((role === "sender" || role === "truck_owner") && !formData.companyName.trim()) {
      setError("Please enter your company or business name");
      return;
    }
    if (role === "driver" && !formData.truckNumber.trim()) {
      setError("Please enter your truck number");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          role,
          companyName: formData.companyName,
          truckNumber: formData.truckNumber
        })
      });
      setSuccess("Account created successfully. You can now sign in.");
      setFormData({ name: "", phone: "", email: "", password: "", confirmPassword: "", companyName: "", truckNumber: "" });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Create Your UTI Account</h1>
          <p>Join India's unified transport network</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
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
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-phone">Phone Number</label>
            <input
              id="signup-phone"
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <input
              id="signup-confirm-password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          {(role === "sender" || role === "truck_owner") && (
            <div className="form-group">
              <label htmlFor="signup-company">Company / Business Name</label>
              <input
                id="signup-company"
                type="text"
                name="companyName"
                placeholder="Enter company or business name"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {role === "driver" && (
            <div className="form-group">
              <label htmlFor="signup-truck">Truck Number</label>
              <input
                id="signup-truck"
                type="text"
                name="truckNumber"
                placeholder="Enter truck number"
                value={formData.truckNumber}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {error && <p className="auth-feedback auth-feedback--error" role="alert">{error}</p>}
          {success && <p className="auth-feedback auth-feedback--success" role="status">{success}</p>}

          <button type="submit" className="signup-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Sign In</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;