// =====================================================
// COMPONENTE: NAVBAR
// =====================================================
// Barra superior de navegación.
// Muestra enlaces públicos y, si hay sesión, muestra el menú del usuario.
//
// Cambio importante:
// - El botón "Dashboard" SOLO aparece para administradores.
// - Los usuarios normales ya no ven esa opción.
// - Cerrar sesión limpia localStorage desde AppContext.logout().

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Gamepad2,
  LogOut,
  Settings,
  Shield,
  Trophy,
  UserRound,
} from "lucide-react";

import { useApp } from "../../context/AppContext";
import "./Navbar.css";
import logo from "../../assets/images/logo-isc.png";

export default function Navbar() {
  // Menú hamburguesa en pantallas pequeñas.
  const [open, setOpen] = useState(false);

  // Menú desplegable del perfil.
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

  // Tomamos el usuario actual y la función logout del contexto global.
  const { currentUser, logout } = useApp();

  // Cerramos ambos menús para evitar que queden abiertos al navegar.
  const closeMenus = () => {
    setOpen(false);
    setProfileOpen(false);
  };

  // Validamos si el usuario actual es admin.
  // Esto se usa para mostrar u ocultar el botón Dashboard.
  const isAdmin = currentUser?.role === "admin";

  // Iniciales para el avatar.
  // Ejemplo: Mario788 → MA
  const initials = currentUser?.username?.slice(0, 2).toUpperCase() ?? "GG";

  // Cierre de sesión:
  // 1. Borra token y usuario desde AppContext.logout()
  // 2. Cierra menús
  // 3. Redirige al inicio
  const handleLogout = () => {
    logout();
    closeMenus();
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/* Logo / botón de inicio */}
      <button
        className="nav-left"
        onClick={() => navigate("/")}
        aria-label="Ir al inicio"
      >
        <img src={logo} alt="ISC Logo" />
        <span>ISC Playground</span>
      </button>

      {/* Enlaces principales */}
      <div className={`nav-right ${open ? "active" : ""}`}>
        <NavLink to="/" end onClick={closeMenus}>
          Inicio
        </NavLink>

        <NavLink to="/juegos" onClick={closeMenus}>
          Juegos
        </NavLink>

        <NavLink to="/ranking" onClick={closeMenus}>
          Ranking
        </NavLink>

        <NavLink to="/about" onClick={closeMenus}>
          About Us
        </NavLink>

        {/* 
          Si NO hay usuario, mostramos botón Login / Register.
          Si SÍ hay usuario, mostramos menú de perfil.
        */}
        {!currentUser ? (
          <button
            className="btn-login"
            onClick={() => {
              closeMenus();
              navigate("/login");
            }}
          >
            Login / Register
          </button>
        ) : (
          <div className="profile-entry">
            {/* Botón que abre/cierra el menú del usuario */}
            <button
              className="profile-trigger"
              onClick={() => setProfileOpen((value) => !value)}
            >
              <span className="avatar-orb">{initials}</span>

              <span className="profile-copy">
                <strong>{currentUser.username}</strong>
                <small>{currentUser.role}</small>
              </span>

              <ChevronDown size={16} />
            </button>

            {/* Menú desplegable */}
            <div className={`profile-menu ${profileOpen ? "show" : ""}`}>
              <button
                onClick={() => {
                  closeMenus();
                  navigate("/perfil");
                }}
              >
                <UserRound size={16} />
                Mi perfil
              </button>

              <button
                onClick={() => {
                  closeMenus();
                  navigate("/juegos");
                }}
              >
                <Gamepad2 size={16} />
                Mis juegos
              </button>

              <button
                onClick={() => {
                  closeMenus();
                  navigate("/ranking");
                }}
              >
                <Trophy size={16} />
                Estadísticas
              </button>

              {/* 
                Dashboard solo para administradores.
                Esto evita confundir al usuario normal.
                La ruta /admin sigue protegida también en App.jsx.
              */}
              {isAdmin && (
                <button
                  onClick={() => {
                    closeMenus();
                    navigate("/admin");
                  }}
                >
                  <Shield size={16} />
                  Dashboard
                </button>
              )}

              {/* Configuración:
               Por ahora no existe una pantalla /configuracion.
                 Para no crear rutas innecesarias, mandamos al perfil,
                 porque ahí está la configuración rápida del usuario.*/}
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  navigate("/perfil");
                }}
              >
                <Settings size={16} />
                Configuración
              </button>

              <button className="logout" onClick={handleLogout}>
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botón hamburguesa para responsive */}
      <button
        className={`hamburger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Abrir navegación"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}
