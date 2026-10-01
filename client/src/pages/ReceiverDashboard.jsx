import { useEffect, useState } from "react";
import { apiRequest, endSession, getDirectionsUrl, getStoredUser, saveUser } from "../api";
import "./ReceiverDashboard.css";

const shipmentProgress = ["Pending", "Accepted", "Picked Up", "In Transit", "Delivered"];

function ReceiverDashboard() {
  const [user, setUser] = useState(getStoredUser);
  const [shipments, setShipments] = useState([]);
  const [profileForm, setProfileForm] = useState({ phone: "", deliveryAddress: "", city: "", postalCode: "" });
  const [loading, setLoading] = useState(true);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [error, setError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadProfile = async () => {
    const data = await apiRequest("auth/profile");
    setUser(data.user);
    saveUser(data.user);
    setProfileForm({
      phone: data.user.phone || "",
      deliveryAddress: data.user.deliveryAddress || "",
      city: data.user.city || "",
      postalCode: data.user.postalCode || ""
    });
  };

  const loadShipments = async () => {
    setLoadingShipments(true);
    try {
      const data = await apiRequest("shipments/receiver");
      setShipments(data.shipments || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingShipments(false);
    }
  };

  useEffect(() => {
    Promise.all([loadProfile(), loadShipments()])
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileChange = (event) => {
    setProfileForm({ ...profileForm, [event.target.name]: event.target.value });
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setProfileMessage("");
    setError("");
    try {
      const data = await apiRequest("auth/profile", {
        method: "PATCH",
        body: JSON.stringify(profileForm)
      });
      setUser(data.user);
      saveUser(data.user);
      setProfileMessage("Contact details updated.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    endSession();
  };

  if (loading) {
    return <main className="receiver-dashboard"><p className="receiver-state">Loading your dashboard...</p></main>;
  }

  return (
    <main className="receiver-dashboard">
      <header className="receiver-header">
        <div>
          <p className="receiver-eyebrow">Unified Transport Interface</p>
          <h1>Receiver Dashboard</h1>
        </div>
        <button className="receiver-button receiver-button--outline" onClick={handleLogout}>Logout</button>
      </header>

      <div className="receiver-content">
        <section className="receiver-panel">
          <div className="receiver-section-title">
            <p className="receiver-eyebrow">Your account</p>
            <h2>Welcome, {user?.name}</h2>
            <p>{user?.email} <span aria-hidden="true">|</span> {user?.role}</p>
          </div>
          <form className="receiver-form" onSubmit={handleProfileSubmit}>
            <div className="receiver-form-grid">
              <label>Phone<input name="phone" type="tel" value={profileForm.phone} onChange={handleProfileChange} required /></label>
              <label>Delivery Address<input name="deliveryAddress" value={profileForm.deliveryAddress} onChange={handleProfileChange} placeholder="Optional delivery address" /></label>
              <label>City<input name="city" value={profileForm.city} onChange={handleProfileChange} /></label>
              <label>Postal Code<input name="postalCode" value={profileForm.postalCode} onChange={handleProfileChange} /></label>
            </div>
            <div className="receiver-actions">
              <button className="receiver-button receiver-button--primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Contact Details"}
              </button>
              {profileMessage && <p className="receiver-success" role="status">{profileMessage}</p>}
            </div>
          </form>
        </section>

        <section className="receiver-shipments">
          <div className="receiver-section-title">
            <p className="receiver-eyebrow">Deliveries addressed to you</p>
            <h2>Incoming Shipments</h2>
          </div>
          {error && <p className="receiver-error" role="alert">{error}</p>}
          {loadingShipments ? (
            <p className="receiver-state">Loading shipments...</p>
          ) : error ? (
            <button className="receiver-button receiver-button--outline" onClick={loadShipments}>Retry loading shipments</button>
          ) : shipments.length === 0 ? (
            <p className="receiver-state">No shipments are currently associated with this account.</p>
          ) : (
            <div className="receiver-shipment-list">
              {shipments.map((shipment) => {
                const currentStep = shipmentProgress.indexOf(shipment.status);
                const isCancelled = shipment.status === "Cancelled";
                return (
                  <article className="receiver-shipment" key={shipment._id}>
                    <div className="receiver-shipment-header">
                      <div>
                        <p className="receiver-eyebrow">Shipment {shipment._id}</p>
                        <h3>{shipment.pickup} to {shipment.delivery}</h3>
                      </div>
                      <span className={`receiver-status${isCancelled ? " receiver-status--cancelled" : ""}`}>{shipment.status}</span>
                    </div>
                    {isCancelled ? (
                      <p className="receiver-cancelled">This shipment was cancelled.</p>
                    ) : (
                      <ol className="receiver-timeline" aria-label={`Shipment progress: ${shipment.status}`}>
                        {shipmentProgress.map((step, index) => (
                          <li className={index < currentStep ? "is-complete" : index === currentStep ? "is-current" : ""} key={step}>
                            <span className="receiver-timeline-dot" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    <dl className="receiver-shipment-details">
                      <div><dt>Package</dt><dd>{shipment.packageType}</dd></div>
                      <div><dt>Weight</dt><dd>{shipment.weight} kg</dd></div>
                      <div><dt>Vehicle</dt><dd>{shipment.vehicle}</dd></div>
                      <div><dt>Sender</dt><dd>{shipment.sender?.name || "Unavailable"}{shipment.sender?.phone ? ` | ${shipment.sender.phone}` : ""}{shipment.sender?.email ? <><br /><span className="receiver-contact-value">{shipment.sender.email}</span></> : null}</dd></div>
                      <div><dt>Driver</dt><dd>{shipment.assignedDriver?.name || "Not assigned"}{shipment.assignedDriver?.phone ? ` | ${shipment.assignedDriver.phone}` : ""}{shipment.assignedDriver?.email ? <><br /><span className="receiver-contact-value">{shipment.assignedDriver.email}</span></> : null}</dd></div>
                      <div><dt>Truck</dt><dd>{shipment.truck ? `${shipment.truck.registrationNumber} | ${shipment.truck.vehicleType}` : "Not assigned"}</dd></div>
                      <div><dt>Created</dt><dd>{new Date(shipment.createdAt).toLocaleString()}</dd></div>
                    </dl>
                    <a className="receiver-map-link" href={getDirectionsUrl(shipment.pickup, shipment.delivery)} target="_blank" rel="noreferrer">Open route map</a>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ReceiverDashboard;