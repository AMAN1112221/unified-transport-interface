import { useEffect, useState } from "react";
import { apiRequest, endSession, getDirectionsUrl, getStoredUser, saveUser } from "../api";
import "./SenderDashboard.css";

function SenderDashboard() {
  const [user, setUser] = useState(getStoredUser);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [formData, setFormData] = useState({
    pickup: "",
    delivery: "",
    packageType: "",
    weight: "",
    vehicle: "",
    receiverEmail: ""
  });

  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [shipmentError, setShipmentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState("");

  const fetchMyShipments = async () => {
    try {
      setLoadingShipments(true);
      setShipmentError("");
      const data = await apiRequest("shipments/my");
      setShipments(data.shipments || []);
    } catch (error) {
      setShipmentError(error.message);
    } finally {
      setLoadingShipments(false);
    }
  };

  useEffect(() => {
    fetchMyShipments();
    apiRequest("auth/profile")
      .then(({ user: profile }) => {
        setUser(profile);
        saveUser(profile);
      })
      .catch((error) => setProfileError(error.message))
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setFormError("");
    if (!formData.pickup.trim() || !formData.delivery.trim() || !formData.packageType.trim() ||
      !formData.receiverEmail.trim() || !Number.isFinite(Number(formData.weight)) ||
      Number(formData.weight) <= 0 || !formData.vehicle) {
      setFormError("Complete every shipment field with a valid weight and receiver email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("shipments", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          pickup: formData.pickup.trim(),
          delivery: formData.delivery.trim(),
          packageType: formData.packageType.trim(),
          receiverEmail: formData.receiverEmail.trim(),
          weight: Number(formData.weight)
        })
      });
      setMessage("Shipment created successfully!");
      setFormData({
        pickup: "",
        delivery: "",
        packageType: "",
        weight: "",
        vehicle: "",
        receiverEmail: ""
      });
      await fetchMyShipments();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    endSession();
  };

  const handleCancel = async (shipmentId) => {
    if (!window.confirm("Cancel this shipment?")) return;
    setCancellingId(shipmentId);
    setShipmentError("");
    setMessage("");
    try {
      await apiRequest(`shipments/${shipmentId}/cancel`, { method: "PATCH" });
      setMessage("Shipment cancelled.");
      await fetchMyShipments();
    } catch (error) {
      setShipmentError(error.message);
    } finally {
      setCancellingId("");
    }
  };

  if (loadingProfile) {
    return <main className="sender-dashboard"><p className="sender-empty-state">Loading your profile...</p></main>;
  }

  if (!user || profileError) {
    return (
      <main className="sender-dashboard sender-dashboard--notice">
        <section className="sender-notice">
          <h2>{profileError || "Please login first"}</h2>

          <button
            className="sender-button sender-button--primary"
            onClick={() => (window.location.href = "/login")}
          >
            Go to Login
          </button>
        </section>
      </main>
    );
  }


  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <main className="sender-dashboard">
      <header className="sender-dashboard__header">
        <div>
          <p className="sender-eyebrow">Unified Transport Interface</p>
          <h1>Sender Dashboard</h1>
        </div>
        <button className="sender-button sender-button--outline" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="sender-dashboard__content">
        <section className="sender-panel sender-profile">
          <div className="sender-section-heading">
            <p className="sender-eyebrow">Account</p>
            <h2>Welcome, {user.name}</h2>
          </div>
          <div className="sender-profile__details">
            <p><strong>Email</strong><span>{user.email || "Not on file"}</span></p>
            <p><strong>Phone</strong><a href={user.phone ? `tel:${user.phone}` : undefined}>{user.phone || "Not on file"}</a></p>
            <p><strong>Role</strong><span>{user.role || "sender"}</span></p>
          </div>
        </section>

        <section className="sender-panel">
          <div className="sender-section-heading">
            <p className="sender-eyebrow">New request</p>
            <h2>Create New Shipment</h2>
          </div>

          <form className="sender-form" onSubmit={handleSubmit}>
            <div className="sender-form__grid">
              <div className="sender-field">
                <label htmlFor="sender-pickup">Pickup Location</label>
                <input
                  id="sender-pickup"
                  type="text"
                  name="pickup"
                  placeholder="Enter pickup location"
                  value={formData.pickup}
                  onChange={handleChange}
                />
              </div>

              <div className="sender-field">
                <label htmlFor="sender-delivery">Delivery Location</label>
                <input
                  id="sender-delivery"
                  type="text"
                  name="delivery"
                  placeholder="Enter delivery location"
                  value={formData.delivery}
                  onChange={handleChange}
                />
              </div>

              <div className="sender-field">
                <label htmlFor="sender-package-type">Package Type</label>
                <input
                  id="sender-package-type"
                  type="text"
                  name="packageType"
                  placeholder="e.g. Electronics"
                  value={formData.packageType}
                  onChange={handleChange}
                />
              </div>

              <div className="sender-field">
                <label htmlFor="sender-weight">Weight (kg)</label>
                <input
                  id="sender-weight"
                  type="number"
                  name="weight"
                  placeholder="Enter weight"
                  value={formData.weight}
                  onChange={handleChange}
                />
              </div>

              <div className="sender-field">
                <label htmlFor="sender-vehicle">Vehicle Type</label>
                <select
                  id="sender-vehicle"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                >
                  <option value="">Select Vehicle</option>
                  <option value="Truck">Truck</option>
                  <option value="Mini Truck">Mini Truck</option>
                  <option value="Tempo">Tempo</option>
                  <option value="Container">Container</option>
                </select>
              </div>

              <div className="sender-field">
                <label htmlFor="sender-receiver-email">Receiver Account Email</label>
                <input
                  id="sender-receiver-email"
                  type="email"
                  name="receiverEmail"
                  placeholder="Enter a registered receiver email"
                  value={formData.receiverEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="sender-form__actions">
              <button className="sender-button sender-button--primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Shipment"}
              </button>
              {message && <p className="sender-success" role="status">{message}</p>}
              {formError && <p className="sender-error" role="alert">{formError}</p>}
            </div>
          </form>
        </section>

        <section className="sender-shipments">
          <div className="sender-shipments__heading">
            <div className="sender-section-heading">
              <p className="sender-eyebrow">Your activity</p>
              <h2>My Shipments</h2>
            </div>
            <button className="sender-button sender-button--outline" type="button" onClick={fetchMyShipments} disabled={loadingShipments}>
              {loadingShipments ? "Refreshing..." : "Refresh Shipments"}
            </button>
          </div>

          {loadingShipments ? (
            <p className="sender-empty-state">Loading shipments...</p>
          ) : shipmentError ? (
            <div className="sender-empty-state sender-empty-state--error" role="alert">
              <p>{shipmentError}</p>
              <button className="sender-button sender-button--outline" onClick={fetchMyShipments}>Retry</button>
            </div>
          ) : shipments.length === 0 ? (
            <p className="sender-empty-state">No shipments created yet.</p>
          ) : (
            <div className="sender-shipments__grid">
              {shipments.map((shipment, index) => (
                <article className="sender-shipment" key={shipment._id}>
                  <div className="sender-shipment__heading">
                    <h3>Shipment #{index + 1}</h3>
                    <span className="sender-shipment__status">{shipment.status}</span>
                  </div>
                  <p className="sender-shipment__id">ID: {shipment._id}</p>
                  <dl className="sender-shipment__details">
                    <div><dt>Pickup</dt><dd>{shipment.pickup}</dd></div>
                    <div><dt>Delivery</dt><dd>{shipment.delivery}</dd></div>
                    <div><dt>Package Type</dt><dd>{shipment.packageType}</dd></div>
                    <div><dt>Weight</dt><dd>{shipment.weight} kg</dd></div>
                    <div><dt>Vehicle</dt><dd>{shipment.vehicle}</dd></div>
                    <div>
                      <dt>Receiver</dt>
                      <dd>
                        {shipment.receiver?.name || "Unavailable"}
                        {shipment.receiver?.email && <><br /><span className="sender-contact-value">{shipment.receiver.email}</span></>}
                        {shipment.receiver?.phone && <><br /><a className="sender-contact-link" href={`tel:${shipment.receiver.phone}`}>{shipment.receiver.phone}</a></>}
                      </dd>
                    </div>
                    <div>
                      <dt>Assigned Driver</dt>
                      <dd>
                        {shipment.assignedDriver?.name || "Not assigned yet"}
                        {shipment.assignedDriver?.email && <><br /><span className="sender-contact-value">{shipment.assignedDriver.email}</span></>}
                        {shipment.assignedDriver?.phone && <><br /><a className="sender-contact-link" href={`tel:${shipment.assignedDriver.phone}`}>{shipment.assignedDriver.phone}</a></>}
                      </dd>
                    </div>
                    <div><dt>Truck Number</dt><dd>{shipment.truck?.registrationNumber || "Not assigned yet"}</dd></div>
                    <div><dt>Created</dt><dd>{new Date(shipment.createdAt).toLocaleString()}</dd></div>
                  </dl>
                  <a className="sender-map-link" href={getDirectionsUrl(shipment.pickup, shipment.delivery)} target="_blank" rel="noreferrer">
                    Open route map
                  </a>
                  {["Pending", "Accepted"].includes(shipment.status) && (
                    <button
                      className="sender-button sender-button--cancel"
                      type="button"
                      onClick={() => handleCancel(shipment._id)}
                      disabled={Boolean(cancellingId)}
                    >
                      {cancellingId === shipment._id ? "Cancelling..." : "Cancel Shipment"}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default SenderDashboard;