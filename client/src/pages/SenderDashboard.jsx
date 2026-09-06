import { useEffect, useState } from "react";

function SenderDashboard() {
  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [formData, setFormData] = useState({
    pickup: "",
    delivery: "",
    packageType: "",
    weight: "",
    vehicle: ""
  });

  const [message, setMessage] = useState("");

  const [shipments, setShipments] = useState([]);

  const [loadingShipments, setLoadingShipments] = useState(true);


  // ==========================================
  // GET MY SHIPMENTS
  // ==========================================

  const fetchMyShipments = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      setLoadingShipments(true);

      const response = await fetch(
        "http://localhost:5000/api/shipments/my",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch shipments"
        );
      }

      console.log("My shipments:", data);

      setShipments(data.shipments || []);

    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoadingShipments(false);
    }
  };


  // ==========================================
  // FETCH SHIPMENTS WHEN PAGE LOADS
  // ==========================================

  useEffect(() => {
    fetchMyShipments();
  }, []);


  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  // ==========================================
  // CREATE SHIPMENT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again");
      window.location.href = "/login";
      return;
    }

    if (
      !formData.pickup ||
      !formData.delivery ||
      !formData.packageType ||
      !formData.weight ||
      !formData.vehicle
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/shipments/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            pickup: formData.pickup,
            delivery: formData.delivery,
            packageType: formData.packageType,
            weight: Number(formData.weight),
            vehicle: formData.vehicle
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Failed to create shipment"
        );
        return;
      }

      console.log("Shipment created:", data);

      setMessage("Shipment created successfully!");

      // Clear form
      setFormData({
        pickup: "",
        delivery: "",
        packageType: "",
        weight: "",
        vehicle: ""
      });

      // Fetch updated shipment list
      fetchMyShipments();

    } catch (error) {
      console.error("Error:", error);
      alert("Unable to connect to server");
    }
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };


  // ==========================================
  // NO USER
  // ==========================================

  if (!user) {
    return (
      <div>
        <h2>Please login first</h2>

        <button
          onClick={() => (window.location.href = "/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }


  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <div>

      <h1>Sender Dashboard</h1>

      <button onClick={handleLogout}>
        Logout
      </button>

      <hr />


      {/* USER INFORMATION */}

      <h2>Welcome, {user.name}</h2>

      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <p>
        <strong>Phone:</strong> {user.phone}
      </p>

      <p>
        <strong>Role:</strong> {user.role}
      </p>

      <hr />


      {/* CREATE SHIPMENT */}

      <h2>Create New Shipment</h2>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Pickup Location</label>
          <br />

          <input
            type="text"
            name="pickup"
            placeholder="Enter pickup location"
            value={formData.pickup}
            onChange={handleChange}
          />
        </div>

        <br />


        <div>
          <label>Delivery Location</label>
          <br />

          <input
            type="text"
            name="delivery"
            placeholder="Enter delivery location"
            value={formData.delivery}
            onChange={handleChange}
          />
        </div>

        <br />


        <div>
          <label>Package Type</label>
          <br />

          <input
            type="text"
            name="packageType"
            placeholder="e.g. Electronics"
            value={formData.packageType}
            onChange={handleChange}
          />
        </div>

        <br />


        <div>
          <label>Weight (kg)</label>
          <br />

          <input
            type="number"
            name="weight"
            placeholder="Enter weight"
            value={formData.weight}
            onChange={handleChange}
          />
        </div>

        <br />


        <div>
          <label>Vehicle Type</label>
          <br />

          <select
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
          >
            <option value="">
              Select Vehicle
            </option>

            <option value="Truck">
              Truck
            </option>

            <option value="Mini Truck">
              Mini Truck
            </option>

            <option value="Tempo">
              Tempo
            </option>

            <option value="Container">
              Container
            </option>
          </select>
        </div>

        <br />


        <button type="submit">
          Create Shipment
        </button>

      </form>


      <br />


      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}


      <hr />


      {/* ==========================================
          MY SHIPMENTS
      ========================================== */}

      <h2>My Shipments</h2>


      {loadingShipments ? (
        <p>Loading shipments...</p>
      ) : shipments.length === 0 ? (
        <p>No shipments created yet.</p>
      ) : (

        <div>

          {shipments.map((shipment, index) => (

            <div key={shipment._id}>

              <h3>
                Shipment #{index + 1}
              </h3>

              <p>
                <strong>Pickup:</strong>{" "}
                {shipment.pickup}
              </p>

              <p>
                <strong>Delivery:</strong>{" "}
                {shipment.delivery}
              </p>

              <p>
                <strong>Package Type:</strong>{" "}
                {shipment.packageType}
              </p>

              <p>
                <strong>Weight:</strong>{" "}
                {shipment.weight} kg
              </p>

              <p>
                <strong>Vehicle:</strong>{" "}
                {shipment.vehicle}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {shipment.status}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {new Date(
                  shipment.createdAt
                ).toLocaleString()}
              </p>

              <hr />

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default SenderDashboard;