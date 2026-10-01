import { useEffect, useState } from "react";
import { apiRequest, endSession, getDirectionsUrl, getStoredUser, saveUser } from "../api";
import "./DriverDashboard.css";

const nextStatus = { Accepted: "Picked Up", "Picked Up": "In Transit", "In Transit": "Delivered" };

function DriverDashboard() {
  const [user, setUser] = useState(getStoredUser);
  const [available, setAvailable] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [filters, setFilters] = useState({ pickup: "", delivery: "", vehicle: "", status: "", truckNumber: "" });
  const [availableSearch, setAvailableSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [availableError, setAvailableError] = useState("");
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [workingId, setWorkingId] = useState("");
  const normalizedSearch = availableSearch.trim().toLocaleLowerCase();
  const filteredAvailable = available.filter((shipment) => {
    if (!normalizedSearch) return true;
    return [shipment._id, shipment.pickup, shipment.delivery, shipment.packageType, shipment.vehicle]
      .some((value) => typeof value === "string" && value.toLocaleLowerCase().includes(normalizedSearch));
  });

  const loadAvailable = async (activeFilters = filters) => {
    setLoadingAvailable(true);
    setAvailableError("");
    try {
      const pendingFilters = {
        pickup: activeFilters.pickup,
        delivery: activeFilters.delivery,
        vehicle: activeFilters.vehicle
      };
      const query = new URLSearchParams(Object.entries(pendingFilters).filter(([, value]) => value.trim())).toString();
      const data = await apiRequest(`shipments/driver/available${query ? `?${query}` : ""}`);
      setAvailable(data.shipments || []);
    } catch (requestError) {
      setAvailableError(requestError.message);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const loadAssigned = async (activeFilters = filters) => {
    const query = new URLSearchParams(
      Object.entries(activeFilters).filter(([, value]) => value.trim())
    ).toString();
    const data = await apiRequest(`shipments/driver/assigned${query ? `?${query}` : ""}`);
    setAssigned(data.shipments || []);
  };

  const loadProfile = async () => {
    const data = await apiRequest("auth/profile");
    setUser(data.user);
    saveUser(data.user);
  };

  const refreshDashboard = async () => {
    setError("");
    try {
      await Promise.all([loadProfile(), loadAvailable(), loadAssigned()]);
    } catch (requestError) {
      setError(requestError.message);
      await loadAvailable(filters);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    Promise.all([loadAvailable(filters), loadAssigned(filters)]).catch((requestError) => setError(requestError.message));
  };

  const handleAccept = async (shipmentId) => {
    setWorkingId(shipmentId);
    setError("");
    setActionMessage("");
    try {
      await apiRequest(`shipments/${shipmentId}/accept`, { method: "POST" });
      setActionMessage("Shipment accepted and assigned to you.");
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError.message);
      await loadAvailable(filters);
    } finally {
      setWorkingId("");
    }
  };

  const handleAdvance = async (shipment) => {
    const status = nextStatus[shipment.status];
    if (!status) return;
    setWorkingId(shipment._id);
    setError("");
    setActionMessage("");
    try {
      await apiRequest(`shipments/${shipment._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      setActionMessage(`Shipment status updated to ${status}.`);
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

  if (loading) {
    return <main className="driver-dashboard"><p className="driver-state">Loading your dashboard...</p></main>;
  }

  return (
    <main className="driver-dashboard">
      <header className="driver-header">
        <div>
          <p className="driver-eyebrow">Unified Transport Interface</p>
          <h1>Driver Dashboard</h1>
        </div>
        <button className="driver-button driver-button--outline" onClick={handleLogout}>Logout</button>
      </header>

      <div className="driver-content">
        <section className="driver-panel driver-profile">
          <div>
            <p className="driver-eyebrow">Driver profile</p>
            <h2>Welcome, {user?.name}</h2>
          </div>
          <dl className="driver-profile-details">
            <div><dt>Email</dt><dd>{user?.email}</dd></div>
            <div><dt>Phone</dt><dd>{user?.phone}</dd></div>
            <div><dt>Role</dt><dd>{user?.role}</dd></div>
            {user?.truckNumber && <div><dt>Truck number</dt><dd>{user.truckNumber}</dd></div>}
          </dl>
        </section>

        {(error || actionMessage) && (
          <div className={error ? "driver-feedback driver-feedback--error" : "driver-feedback"} role={error ? "alert" : "status"}>
            {error || actionMessage}
          </div>
        )}

        <section className="driver-section">
          <div className="driver-section-title">
            <p className="driver-eyebrow">Pending work</p>
            <h2>Available Shipments</h2>
            <button className="driver-button driver-button--outline" type="button" onClick={() => loadAvailable()} disabled={loadingAvailable}>
              {loadingAvailable ? "Refreshing..." : "Refresh Available"}
            </button>
          </div>
          <form className="driver-filter-form" onSubmit={handleFilterSubmit}>
            <label>Pickup<input name="pickup" value={filters.pickup} onChange={handleFilterChange} placeholder="Filter pickup" /></label>
            <label>Delivery<input name="delivery" value={filters.delivery} onChange={handleFilterChange} placeholder="Filter delivery" /></label>
            <label>Vehicle
              <select name="vehicle" value={filters.vehicle} onChange={handleFilterChange}>
                <option value="">All vehicle types</option>
                <option>Truck</option><option>Mini Truck</option><option>Tempo</option><option>Container</option>
              </select>
            </label>
            <label>Status
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All assigned statuses</option>
                <option>Accepted</option><option>Picked Up</option><option>In Transit</option><option>Delivered</option>
              </select>
            </label>
            <label>Truck Number<input name="truckNumber" value={filters.truckNumber} onChange={handleFilterChange} placeholder="Filter assigned truck" /></label>
            <button className="driver-button driver-button--outline" disabled={loadingAvailable}>Apply Filters</button>
          </form>
          <label className="driver-available-search">
            Search available shipments
            <input
              type="search"
              value={availableSearch}
              onChange={(event) => setAvailableSearch(event.target.value)}
              placeholder="Pickup, delivery, package, vehicle, or ID"
            />
          </label>
          {loadingAvailable ? (
            <p className="driver-state">Loading available shipments...</p>
          ) : availableError ? (
            <div className="driver-state driver-state--error" role="alert">
              <p>{availableError}</p>
              <button className="driver-button driver-button--outline" type="button" onClick={() => loadAvailable()}>
                Retry
              </button>
            </div>
          ) : available.length === 0 ? (
            <p className="driver-state">No eligible shipments are currently available.</p>
          ) : filteredAvailable.length === 0 ? (
            <p className="driver-state">No shipments match your search.</p>
          ) : (
            <div className="driver-shipment-grid">
              {filteredAvailable.map((shipment) => (
                <article className="driver-shipment" key={shipment._id}>
                  <div className="driver-shipment-heading">
                    <div><p className="driver-eyebrow">{shipment._id}</p><h3>{shipment.pickup} to {shipment.delivery}</h3></div>
                    <span className="driver-status">{shipment.status}</span>
                  </div>
                  <dl className="driver-shipment-details">
                    <div><dt>Package</dt><dd>{shipment.packageType}</dd></div>
                    <div><dt>Weight</dt><dd>{shipment.weight} kg</dd></div>
                    <div><dt>Vehicle</dt><dd>{shipment.vehicle}</dd></div>
                    <div><dt>Sender</dt><dd>{shipment.sender?.name || "Unavailable"}{shipment.sender?.phone ? ` | ${shipment.sender.phone}` : ""}{shipment.sender?.email ? <><br /><span className="driver-contact-value">{shipment.sender.email}</span></> : null}</dd></div>
                    <div><dt>Receiver</dt><dd>{shipment.receiver?.name || "Registered receiver"}</dd></div>
                    <div><dt>Created</dt><dd>{new Date(shipment.createdAt).toLocaleString()}</dd></div>
                  </dl>
                  <a className="driver-map-link" href={getDirectionsUrl(shipment.pickup, shipment.delivery)} target="_blank" rel="noreferrer">Open route map</a>
                  <button className="driver-button driver-button--primary" onClick={() => handleAccept(shipment._id)} disabled={Boolean(workingId)}>
                    {workingId === shipment._id ? "Accepting..." : "Accept Shipment"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="driver-section">
          <div className="driver-section-title">
            <p className="driver-eyebrow">Your assignments</p>
            <h2>Assigned Shipments</h2>
          </div>
          {assigned.length === 0 ? (
            <p className="driver-state">You have no assigned shipments.</p>
          ) : (
            <div className="driver-shipment-grid">
              {assigned.map((shipment) => (
                <article className="driver-shipment" key={shipment._id}>
                  <div className="driver-shipment-heading">
                    <div><p className="driver-eyebrow">{shipment._id}</p><h3>{shipment.pickup} to {shipment.delivery}</h3></div>
                    <span className="driver-status">{shipment.status}</span>
                  </div>
                  <dl className="driver-shipment-details">
                    <div><dt>Package</dt><dd>{shipment.packageType}</dd></div>
                    <div><dt>Weight</dt><dd>{shipment.weight} kg</dd></div>
                    <div><dt>Vehicle</dt><dd>{shipment.vehicle}</dd></div>
                    <div><dt>Sender</dt><dd>{shipment.sender?.name || "Unavailable"}{shipment.sender?.phone ? ` | ${shipment.sender.phone}` : ""}{shipment.sender?.email ? <><br /><span className="driver-contact-value">{shipment.sender.email}</span></> : null}</dd></div>
                    <div><dt>Receiver</dt><dd>{shipment.receiver?.name || "Unavailable"}{shipment.receiver?.phone ? ` | ${shipment.receiver.phone}` : ""}{shipment.receiver?.email ? <><br /><span className="driver-contact-value">{shipment.receiver.email}</span></> : null}</dd></div>
                    <div><dt>Truck Number</dt><dd>{shipment.truck?.registrationNumber || user?.truckNumber || "Not assigned"}</dd></div>
                    <div><dt>Truck Type / Capacity</dt><dd>{shipment.truck ? `${shipment.truck.vehicleType} / ${shipment.truck.capacity} kg` : "Not assigned"}</dd></div>
                  </dl>
                  <a className="driver-map-link" href={getDirectionsUrl(shipment.pickup, shipment.delivery)} target="_blank" rel="noreferrer">Open route map</a>
                  {nextStatus[shipment.status] && (
                    <button className="driver-button driver-button--primary" onClick={() => handleAdvance(shipment)} disabled={Boolean(workingId)}>
                      {workingId === shipment._id ? "Updating..." : `Mark ${nextStatus[shipment.status]}`}
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

export default DriverDashboard;