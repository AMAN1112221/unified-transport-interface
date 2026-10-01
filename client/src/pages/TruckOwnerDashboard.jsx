import { useEffect, useState } from "react";
import { apiRequest, endSession, getDirectionsUrl, getStoredUser, saveUser } from "../api";
import "./TruckOwnerDashboard.css";

function TruckOwnerDashboard() {
  const [user, setUser] = useState(getStoredUser);
  const [trucks, setTrucks] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [availableShipments, setAvailableShipments] = useState([]);
  const [tripHistory, setTripHistory] = useState([]);
  const [truckNumberFilter, setTruckNumberFilter] = useState("");
  const [truckForm, setTruckForm] = useState({ registrationNumber: "", vehicleType: "", capacity: "" });
  const [truckSelections, setTruckSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [workingId, setWorkingId] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const refreshDashboard = async () => {
    setError("");
    try {
      const [profileData, truckData, shipmentData, historyData] = await Promise.all([
        apiRequest("auth/profile"),
        apiRequest("trucks"),
        apiRequest("shipments/owner/shipments"),
        apiRequest("trucks/trips/history")
      ]);
      setUser(profileData.user);
      saveUser(profileData.user);
      setTrucks(truckData.trucks || []);
      setShipments(shipmentData.shipments || []);
      setAvailableShipments(shipmentData.availableShipments || []);
      setTripHistory(historyData.shipments || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleTruckChange = (event) => {
    setTruckForm({ ...truckForm, [event.target.name]: event.target.value });
  };

  const handleRegisterTruck = async (event) => {
    event.preventDefault();
    setIsRegistering(true);
    setError("");
    setMessage("");
    try {
      await apiRequest("trucks", {
        method: "POST",
        body: JSON.stringify({ ...truckForm, capacity: Number(truckForm.capacity) })
      });
      setTruckForm({ registrationNumber: "", vehicleType: "", capacity: "" });
      setMessage("Truck registered.");
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAvailability = async (truck) => {
    setWorkingId(truck._id);
    setError("");
    setMessage("");
    try {
      await apiRequest(`trucks/${truck._id}`, {
        method: "PATCH",
        body: JSON.stringify({ available: !truck.available })
      });
      setMessage("Truck availability updated.");
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorkingId("");
    }
  };

  const handleAssignTruck = async (shipmentId) => {
    const truckId = truckSelections[shipmentId];
    if (!truckId) {
      setError("Select an available truck before assigning.");
      return;
    }
    setWorkingId(shipmentId);
    setError("");
    setMessage("");
    try {
      await apiRequest(`shipments/owner/shipments/${shipmentId}/truck`, {
        method: "PATCH",
        body: JSON.stringify({ truckId })
      });
      setMessage("Truck assigned to shipment.");
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorkingId("");
    }
  };

  const handleLogout = () => {
    endSession();
  };

  const activeTrips = shipments.filter((shipment) => ["Accepted", "Picked Up", "In Transit"].includes(shipment.status)).length;
  const completedTrips = shipments.filter((shipment) => shipment.status === "Delivered").length;
  const availableTrucks = trucks.filter((truck) => truck.available && !truck.activeShipment);
  const compatibleTrucks = (shipment) => availableTrucks.filter((truck) => truck.vehicleType === shipment.vehicle && truck.capacity >= shipment.weight);
  const filteredShipments = shipments.filter((shipment) =>
    !truckNumberFilter || shipment.truck?.registrationNumber?.toLowerCase().includes(truckNumberFilter.trim().toLowerCase())
  );

  if (loading) {
    return <main className="owner-dashboard"><p className="owner-state">Loading your dashboard...</p></main>;
  }

  return (
    <main className="owner-dashboard">
      <header className="owner-header">
        <div>
          <p className="owner-eyebrow">Unified Transport Interface</p>
          <h1>Truck Owner Dashboard</h1>
        </div>
        <button className="owner-button owner-button--outline" onClick={handleLogout}>Logout</button>
      </header>

      <div className="owner-content">
        <section className="owner-panel owner-profile">
          <div>
            <p className="owner-eyebrow">Owner profile</p>
            <h2>Welcome, {user?.name}</h2>
          </div>
          <dl className="owner-profile-details">
            <div><dt>Email</dt><dd>{user?.email}</dd></div>
            <div><dt>Phone</dt><dd>{user?.phone}</dd></div>
            <div><dt>Company</dt><dd>{user?.companyName || "Not provided"}</dd></div>
          </dl>
        </section>

        {(error || message) && <p className={error ? "owner-feedback owner-feedback--error" : "owner-feedback"} role={error ? "alert" : "status"}>{error || message}</p>}

        <section className="owner-summary" aria-label="Trip summary">
          <div><strong>{trucks.length}</strong><span>Registered trucks</span></div>
          <div><strong>{activeTrips}</strong><span>Active trips</span></div>
          <div><strong>{completedTrips}</strong><span>Completed trips</span></div>
        </section>

        <section className="owner-panel">
          <div className="owner-section-title"><p className="owner-eyebrow">Fleet</p><h2>Register a Truck</h2></div>
          <form className="owner-truck-form" onSubmit={handleRegisterTruck}>
            <label>Registration Number<input name="registrationNumber" value={truckForm.registrationNumber} onChange={handleTruckChange} required /></label>
            <label>Vehicle Type
              <select name="vehicleType" value={truckForm.vehicleType} onChange={handleTruckChange} required>
                <option value="">Select vehicle</option><option>Truck</option><option>Mini Truck</option><option>Tempo</option><option>Container</option>
              </select>
            </label>
            <label>Capacity (kg)<input name="capacity" type="number" min="1" step="0.1" value={truckForm.capacity} onChange={handleTruckChange} required /></label>
            <button className="owner-button owner-button--primary" disabled={isRegistering}>{isRegistering ? "Registering..." : "Register Truck"}</button>
          </form>
          {trucks.length === 0 ? (
            <p className="owner-state">No trucks registered yet.</p>
          ) : (
            <div className="owner-truck-list">
              {trucks.map((truck) => (
                <article className="owner-truck" key={truck._id}>
                  <div><h3>{truck.registrationNumber}</h3><p>{truck.vehicleType} | {truck.capacity} kg capacity</p></div>
                  <div className="owner-truck-actions">
                    <span className={truck.available ? "owner-availability" : "owner-availability owner-availability--busy"}>
                      {truck.activeShipment ? "Assigned" : truck.available ? "Available" : "Unavailable"}
                    </span>
                    {!truck.activeShipment && (
                      <button className="owner-button owner-button--outline" onClick={() => handleAvailability(truck)} disabled={Boolean(workingId)}>
                        {workingId === truck._id ? "Updating..." : truck.available ? "Set Unavailable" : "Set Available"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="owner-section">
          <div className="owner-section-title">
            <p className="owner-eyebrow">Accepted by a driver</p>
            <h2>Shipments Waiting for a Truck</h2>
          </div>
          {availableShipments.length === 0 ? (
            <p className="owner-state">No accepted shipments are waiting for truck assignment.</p>
          ) : (
            <div className="owner-shipment-list">
              {availableShipments.map((shipment) => {
                const compatible = compatibleTrucks(shipment);
                return (
                  <article className="owner-shipment" key={shipment._id}>
                    <div className="owner-shipment-header">
                      <div><p className="owner-eyebrow">{shipment._id}</p><h3>{shipment.pickup} to {shipment.delivery}</h3></div>
                      <span className="owner-status">{shipment.status}</span>
                    </div>
                    <dl className="owner-details">
                      <div><dt>Package</dt><dd>{shipment.packageType}</dd></div>
                      <div><dt>Weight</dt><dd>{shipment.weight} kg</dd></div>
                      <div><dt>Vehicle</dt><dd>{shipment.vehicle}</dd></div>
                      <div><dt>Sender</dt><dd>{shipment.sender?.name || "Unavailable"}{shipment.sender?.phone ? ` | ${shipment.sender.phone}` : ""}{shipment.sender?.email ? <><br /><span className="owner-contact-value">{shipment.sender.email}</span></> : null}</dd></div>
                      <div><dt>Receiver</dt><dd>{shipment.receiver?.name || "Unavailable"}{shipment.receiver?.phone ? ` | ${shipment.receiver.phone}` : ""}{shipment.receiver?.email ? <><br /><span className="owner-contact-value">{shipment.receiver.email}</span></> : null}</dd></div>
                      <div><dt>Driver</dt><dd>{shipment.assignedDriver?.name || "Not assigned"}{shipment.assignedDriver?.phone ? ` | ${shipment.assignedDriver.phone}` : ""}{shipment.assignedDriver?.email ? <><br /><span className="owner-contact-value">{shipment.assignedDriver.email}</span></> : null}</dd></div>
                    </dl>
                    <a className="owner-map-link" href={getDirectionsUrl(shipment.pickup, shipment.delivery)} target="_blank" rel="noreferrer">Open route map</a>
                    {compatible.length === 0 ? (
                      <p className="owner-feedback owner-feedback--error">No available truck matches this vehicle type and weight.</p>
                    ) : (
                      <div className="owner-assign-controls">
                        <label htmlFor={`owner-queue-truck-${shipment._id}`}>Assign compatible truck</label>
                        <select
                          id={`owner-queue-truck-${shipment._id}`}
                          value={truckSelections[shipment._id] || ""}
                          onChange={(event) => setTruckSelections({ ...truckSelections, [shipment._id]: event.target.value })}
                        >
                          <option value="">Select truck</option>
                          {compatible.map((truck) => <option value={truck._id} key={truck._id}>{truck.registrationNumber} | {truck.vehicleType} | {truck.capacity} kg</option>)}
                        </select>
                        <button className="owner-button owner-button--primary" onClick={() => handleAssignTruck(shipment._id)} disabled={Boolean(workingId)}>
                          {workingId === shipment._id ? "Assigning..." : "Assign Truck"}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="owner-section">
          <div className="owner-section-title"><p className="owner-eyebrow">Assignments</p><h2>Shipments on Your Fleet</h2></div>
          <label className="owner-search">Filter by truck registration<input value={truckNumberFilter} onChange={(event) => setTruckNumberFilter(event.target.value)} placeholder="Search truck number" /></label>
          {shipments.length === 0 ? (
            <p className="owner-state">No shipments are assigned to your trucks.</p>
          ) : filteredShipments.length === 0 ? (
            <p className="owner-state">No assigned shipments match that truck number.</p>
          ) : (
            <div className="owner-shipment-list">
              {filteredShipments.map((shipment) => (
                <article className="owner-shipment" key={shipment._id}>
                  <div className="owner-shipment-header">
                    <div><p className="owner-eyebrow">{shipment._id}</p><h3>{shipment.pickup} to {shipment.delivery}</h3></div>
                    <span className="owner-status">{shipment.status}</span>
                  </div>
                  <dl className="owner-details">
                    <div><dt>Package</dt><dd>{shipment.packageType}</dd></div>
                    <div><dt>Weight</dt><dd>{shipment.weight} kg</dd></div>
                    <div><dt>Vehicle</dt><dd>{shipment.vehicle}</dd></div>
                    <div><dt>Truck Number</dt><dd>{shipment.truck?.registrationNumber || "Not assigned"}</dd></div>
                    <div><dt>Truck Capacity</dt><dd>{shipment.truck?.capacity ? `${shipment.truck.capacity} kg` : "Not available"}</dd></div>
                    <div><dt>Sender</dt><dd>{shipment.sender?.name || "Unavailable"}{shipment.sender?.phone ? ` | ${shipment.sender.phone}` : ""}{shipment.sender?.email ? <><br /><span className="owner-contact-value">{shipment.sender.email}</span></> : null}</dd></div>
                    <div><dt>Receiver</dt><dd>{shipment.receiver?.name || "Unavailable"}{shipment.receiver?.phone ? ` | ${shipment.receiver.phone}` : ""}{shipment.receiver?.email ? <><br /><span className="owner-contact-value">{shipment.receiver.email}</span></> : null}</dd></div>
                    <div><dt>Driver</dt><dd>{shipment.assignedDriver?.name || "Not assigned"}{shipment.assignedDriver?.phone ? ` | ${shipment.assignedDriver.phone}` : ""}{shipment.assignedDriver?.email ? <><br /><span className="owner-contact-value">{shipment.assignedDriver.email}</span></> : null}</dd></div>
                    <div><dt>Created</dt><dd>{new Date(shipment.createdAt).toLocaleString()}</dd></div>
                  </dl>
                  <a className="owner-map-link" href={getDirectionsUrl(shipment.pickup, shipment.delivery)} target="_blank" rel="noreferrer">Open route map</a>
                  {shipment.status === "Accepted" && !shipment.truck && availableTrucks.length > 0 && (
                    <div className="owner-assign-controls">
                      <label htmlFor={`owner-truck-${shipment._id}`}>Assign available truck</label>
                      <select
                        id={`owner-truck-${shipment._id}`}
                        value={truckSelections[shipment._id] || ""}
                        onChange={(event) => setTruckSelections({ ...truckSelections, [shipment._id]: event.target.value })}
                      >
                        <option value="">Select truck</option>
                        {availableTrucks.map((truck) => <option value={truck._id} key={truck._id}>{truck.registrationNumber} · {truck.vehicleType}</option>)}
                      </select>
                      <button className="owner-button owner-button--primary" onClick={() => handleAssignTruck(shipment._id)} disabled={Boolean(workingId)}>
                        {workingId === shipment._id ? "Assigning..." : "Assign Truck"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="owner-section">
          <div className="owner-section-title"><p className="owner-eyebrow">Completed and cancelled records</p><h2>Trip History</h2></div>
          {tripHistory.length === 0 ? (
            <p className="owner-state">No completed or cancelled fleet records yet.</p>
          ) : (
            <div className="owner-history-list">
              {tripHistory.map((trip) => (
                <article className="owner-history-item" key={trip._id}>
                  <div><strong>{trip.pickup} to {trip.delivery}</strong><small>{trip._id}</small></div>
                  <span className="owner-status">{trip.status}</span>
                  <span>{trip.assignedDriver?.name || "No driver"}</span>
                  <span>{trip.truck?.registrationNumber || "No truck"}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="owner-payment-note">
          <h2>Payment Records</h2>
          <p>Payments are not recorded in this application. No revenue or payment history is available.</p>
        </section>
      </div>
    </main>
  );
}

export default TruckOwnerDashboard;