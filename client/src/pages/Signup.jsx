import { useState } from "react";
import "./Signup.css";

function Signup() {
  const [role, setRole] = useState("");
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

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!role) {
    alert("Please select your role");
    return;
  }

  if (
    !formData.name ||
    !formData.phone ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword
  ) {
    alert("Please fill all required fields");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  if (
    (role === "sender" || role === "truck_owner") &&
    !formData.companyName
  ) {
    alert("Please enter your company or business name");
    return;
  }

  if (role === "driver" && !formData.truckNumber) {
    alert("Please enter your truck number");
    return;
  }

  console.log({
    role,
    ...formData
  });
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
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {(role === "sender" || role === "truck_owner") && (
            <div className="form-group">
              <label>Company / Business Name</label>
              <input
                type="text"
                name="companyName"
                placeholder="Enter company or business name"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
          )}

          {role === "driver" && (
            <div className="form-group">
              <label>Truck Number</label>
              <input
                type="text"
                name="truckNumber"
                placeholder="Enter truck number"
                value={formData.truckNumber}
                onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" className="signup-button">
            Create Account
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