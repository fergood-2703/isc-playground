import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, Gamepad2, LogOut, Settings, Shield, Trophy, UserRound } from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./Navbar.css";
import logo from "../../assets/images/logo-isc.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();

  const closeMenus = () => {
    setOpen(false);
    setProfileOpen(false);
  };

  const initials = currentUser?.username?.slice(0, 2).toUpperCase() ?? "GG";

  return (
    <nav className="navbar">
      <button className="nav-left" onClick={() => navigate("/")} aria-label="Ir al inicio">
        <img src={logo} alt="ISC Logo" />
        <span>ISC Playground</span>
      </button>

      <div className={`nav-right ${open ? "active" : ""}`}>
        <NavLink to="/" end onClick={closeMenus}>Inicio</NavLink>
        <NavLink to="/juegos" onClick={closeMenus}>Juegos</NavLink>
        <NavLink to="/ranking" onClick={closeMenus}>Ranking</NavLink>
        <NavLink to="/about" onClick={closeMenus}>About Us</NavLink>

        {!currentUser ? (
          <button className="btn-login" onClick={() => { closeMenus(); navigate("/login"); }}>Login / Register</button>
        ) : (
          <div className="profile-entry">
            <button className="profile-trigger" onClick={() => setProfileOpen((value) => !value)}>
              <span className="avatar-orb">{initials}</span>
              <span className="profile-copy"><strong>{currentUser.username}</strong><small>{currentUser.role}</small></span>
              <ChevronDown size={16} />
            </button>
            <div className={`profile-menu ${profileOpen ? "show" : ""}`}>
              <button onClick={() => { closeMenus(); navigate("/perfil"); }}><UserRound size={16} /> Mi perfil</button>
              <button onClick={() => { closeMenus(); navigate("/juegos"); }}><Gamepad2 size={16} /> Mis juegos</button>
              <button onClick={() => { closeMenus(); navigate("/ranking"); }}><Trophy size={16} /> Estadísticas</button>
              <button onClick={() => { closeMenus(); navigate("/admin"); }}><Shield size={16} /> Dashboard</button>
              <button><Settings size={16} /> Configuración</button>
              <button className="logout" onClick={() => { logout(); closeMenus(); navigate("/"); }}><LogOut size={16} /> Cerrar sesión</button>
            </div>
          </div>
        )}
      </div>

      <button className={`hamburger ${open ? "open" : ""}`} onClick={() => setOpen(!open)} aria-label="Abrir navegación">
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
}
