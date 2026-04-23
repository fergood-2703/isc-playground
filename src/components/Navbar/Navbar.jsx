import "./Navbar.css";

export default function Navbar() {
  return (
    <div className="navbar">
      <h2>🎮 ISC Playground</h2>

      <div className="nav-links">
        <a href="#">Inicio</a>
        <a href="#">Juegos</a>
        <button className="login-btn">Login</button>
      </div>
    </div>
  );
}