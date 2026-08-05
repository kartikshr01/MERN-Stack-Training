import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <h2><a href="#hero">Portfolio</a></h2>
      </div>

      <ul className="nav-links">
        <li><a href="#services">Services</a></li>
        <li><a href="#reviews">Reviews</a></li>
        <li><a href="#blog">Blog</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <button className="hire-btn"><a href="#contact">Hire Me</a></button>
    </nav>
  );
}

export default Navbar;