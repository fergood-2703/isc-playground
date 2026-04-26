import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/images/logo-isc.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* LOGO */}
      <div className="nav-left">
        <img src={logo} alt="ISC Logo" />
        <span>ISC Playground</span>
      </div>

      {/* LINKS DESKTOP */}
      <div className={`nav-right ${open ? "active" : ""}`}>
        <a href="#">Inicio</a>
        <a href="#">Juegos</a>
        <a href="#">Ranking</a>
        <a href="#">About Us</a>
        <button className="btn-login" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>

      {/* MENU HAMBURGUESA */}
      <div
        className={`hamburger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
}
