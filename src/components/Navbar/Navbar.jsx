import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
        <NavLink to="/" end onClick={() => setOpen(false)}>
          Inicio
        </NavLink>
        <NavLink to="/juegos" onClick={() => setOpen(false)}>
          Juegos
        </NavLink>
        <NavLink to="/ranking" onClick={() => setOpen(false)}>
          Ranking
        </NavLink>
        <NavLink to="/about" onClick={() => setOpen(false)}>
          About Us
        </NavLink>
        <button className="btn-login" onClick={() => { setOpen(false); navigate("/login"); }}>
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
