function Stakeholders() {
  return (
    <section className="stakeholders" id="stakeholders">
      <div className="section-heading">
        <p className="section-label">ONE PLATFORM, FOUR STAKEHOLDERS</p>

        <h2>Everyone in the transport ecosystem, connected.</h2>

        <p>
          UTI brings every participant into one connected system, making freight
          movement easier to manage through registered receiver links, driver
          assignments, shipment status updates, and owner-managed fleet records.
        </p>
      </div>

      <div className="stakeholder-grid">
        <div className="stakeholder-card">
          <div className="stakeholder-number">01</div>
          <h3>Sender</h3>
          <p>
            Create a shipment with pickup and delivery locations, package details,
            weight, vehicle type, and a registered receiver account.
          </p>
          <span>Post & Manage Loads →</span>
        </div>

        <div className="stakeholder-card">
          <div className="stakeholder-number">02</div>
          <h3>Driver</h3>
          <p>
            Review pending shipments, accept eligible work, and advance the status
            of trips assigned to your account.
          </p>
          <span>Find & Book Loads →</span>
        </div>

        <div className="stakeholder-card">
          <div className="stakeholder-number">03</div>
          <h3>Truck Owner</h3>
          <p>
            Register trucks, update their availability, assign compatible vehicles,
            and view fleet shipments and trip history.
          </p>
          <span>Manage Your Fleet →</span>
        </div>

        <div className="stakeholder-card">
          <div className="stakeholder-number">04</div>
          <h3>Receiver</h3>
          <p>
            View shipments linked to your registered account, including sender,
            delivery details, assigned vehicle, and current status progress.
          </p>
          <span>Track Your Shipment →</span>
        </div>
      </div>
    </section>
  );
}

export default Stakeholders;