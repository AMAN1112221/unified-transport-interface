function Stakeholders() {
  return (
    <section className="stakeholders" id="stakeholders">
      <div className="section-heading">
        <p className="section-label">ONE PLATFORM, FOUR STAKEHOLDERS</p>

        <h2>Everyone in the transport ecosystem, connected.</h2>

        <p>
          UTI brings every participant into one connected system, making freight
          movement easier to manage, track, and complete while improving route
          visibility, communication, and payments across the journey.
        </p>
      </div>

      <div className="stakeholder-grid">
        <div className="stakeholder-card">
          <div className="stakeholder-number">01</div>
          <h3>Sender</h3>
          <p>
            Upload your goods requirements with pickup location, destination,
            weight, load type, pickup date, price, and shipment details.
          </p>
          <span>Post & Manage Loads →</span>
        </div>

        <div className="stakeholder-card">
          <div className="stakeholder-number">02</div>
          <h3>Driver</h3>
          <p>
            Search available loads based on route and requirements, request a
            booking, manage trips, and maintain your complete trip history.
          </p>
          <span>Find & Book Loads →</span>
        </div>

        <div className="stakeholder-card">
          <div className="stakeholder-number">03</div>
          <h3>Truck Owner</h3>
          <p>
            Manage your trucks and drivers, monitor bookings and ongoing trips,
            and access fleet, payment, and transportation history.
          </p>
          <span>Manage Your Fleet →</span>
        </div>

        <div className="stakeholder-card">
          <div className="stakeholder-number">04</div>
          <h3>Receiver</h3>
          <p>
            Enter the shipment reference number received from the sender and
            view shipment details, current status, and tracking information.
          </p>
          <span>Track Your Shipment →</span>
        </div>
      </div>
    </section>
  );
}

export default Stakeholders;