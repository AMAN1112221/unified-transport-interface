import { useEffect } from "react";

function Hero() {
  useEffect(() => {
    const updateParallax = () => {
      const offset = Math.min(window.scrollY * 0.14, 90);
      document.documentElement.style.setProperty("--hero-shift", `${offset}px`);
    };

    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateParallax);
    };
  }, []);

  return (
    <section id="home" className="hero">
      <div className="hero-watermark" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-bubbles" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="hero-content">
        <p className="hero-label">INDIA'S UNIFIED TRANSPORT NETWORK</p>

        <h1>
          One Platform.
          <br />
          <span>Every Journey Connected.</span>
        </h1>

        <p className="hero-description">
          Unified Transport Interface brings senders, drivers, truck owners,
          and receivers together on one digital platform to make freight
          transportation simpler, more transparent, and more connected.
        </p>

        <div className="hero-actions">
          <a href="/signup" className="btn btn-primary">Get Started</a>
          <a href="/login" className="btn btn-outline">Sign In to View Shipments</a>
        </div>

        <div className="hero-feature-panel" aria-label="FleetFlow features"id="feature">
          <div className="feature-highlight">
            <span className="feature-kicker">FleetFlow Advantage</span>
            <h3>Smarter logistics for faster, safer, and more efficient movement.</h3>
          </div>

          <div className="feature-grid" >
            <article className="feature-item" >
              <strong>Shipment Status</strong>
              <p>
                Follow shipment progress through pending, accepted, pickup, transit,
                and delivery status updates.
              </p>
            </article>

            <article className="feature-item">
              <strong>Receiver Association</strong>
              <p>
                Link every shipment to a registered receiver account so delivery
                details reach the right dashboard.
              </p>
            </article>

            <article className="feature-item">
              <strong>Driver Assignments</strong>
              <p>
                Drivers can review eligible shipments, accept available work, and
                update their assigned trip status.
              </p>
            </article>

            <article className="feature-item">
              <strong>Fleet Management</strong>
              <p>
                Truck owners can register vehicles, manage availability, and view
                shipments assigned to their fleet.
              </p>
            </article>

            <article className="feature-item">
              <strong>Role-Based Access</strong>
              <p>
                Senders, receivers, drivers, and truck owners each get access to
                the records and actions for their role.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;