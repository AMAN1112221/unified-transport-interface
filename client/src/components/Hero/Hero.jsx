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
          <button className="btn btn-outline">Track Shipment</button>
        </div>

        <div className="hero-feature-panel" aria-label="FleetFlow features"id="feature">
          <div className="feature-highlight">
            <span className="feature-kicker">FleetFlow Advantage</span>
            <h3>Smarter logistics for faster, safer, and more efficient movement.</h3>
          </div>

          <div className="feature-grid" >
            <article className="feature-item" >
              <strong>Live Tracking</strong>
              <p>
                Monitor shipments in real time and keep every stakeholder informed
                with transparent status updates.
              </p>
            </article>

            <article className="feature-item">
              <strong>Route Optimization</strong>
              <p>
                Reduce empty miles and improve delivery planning with better route
                coordination across the network.
              </p>
            </article>

            <article className="feature-item">
              <strong>Fuel Efficiency</strong>
              <p>
                Cut wastage and improve trip planning so vehicles move smarter and
                operating costs stay lower.
              </p>
            </article>

            <article className="feature-item">
              <strong>Voice Translation</strong>
              <p>
                Break language barriers with voice-enabled communication so drivers
                and partners can work smoothly across regions.
              </p>
            </article>

            <article className="feature-item">
              <strong>Digital Payments</strong>
              <p>
                Make settlements faster and more secure with built-in digital
                payment flows that reduce delays and paperwork.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;