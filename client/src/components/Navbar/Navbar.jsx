function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>UTI</h2>
        <span>Unified Transport Interface</span>
      </div>

      <div className="navbar-links">
        <a href="#home">Home</a>
        <a href="#feature">Features</a>
        <a href="#stakeholders">How It Works</a>
        <a href="#footer">About</a>
      </div>

      <div className="navbar-actions">
        <a href="/login" className="btn btn-secondary">Sign In</a>
        <a href="/signup" className="btn btn-primary">Get Started</a>
      </div>
    </nav>
  );
}

export default Navbar;