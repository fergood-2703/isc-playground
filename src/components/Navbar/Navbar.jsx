import "./Navbar.css";
import logo from "../../assets/images/logo-isc.png";

export default function Navbar() {
  return (
    <div className="navbar">

      {/* IZQUIERDA */}
      <div className="nav-left">
        <img src={logo} alt="ISC" className="logo" />
        <span className="brand">ISC Playground</span>
      </div>

      {/* DERECHA */}
      <div className="nav-links">
        <a href="#">Inicio</a>
        <a href="#">Juegos</a>
        <a href="#">About Us</a>
        <button className="login-btn">Login</button>
      </div>

    </div>
  );
}