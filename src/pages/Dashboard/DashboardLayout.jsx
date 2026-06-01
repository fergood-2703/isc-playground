// =====================================================
// DASHBOARD LAYOUT
// =====================================================
//
// Este componente es el contenedor del panel admin.
// Aquí vive:
// - Sidebar izquierda
// - Header superior
// - Usuario admin
// - Botón cerrar sesión
// - Outlet para cargar las vistas internas del dashboard
//
// Cambio importante:
// - Agregamos opción "Inicio público" para volver al home.
// - Hacemos clickeable el logo del dashboard.
// - El admin ya no queda "encerrado" dentro del panel.

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import logo from "../../assets/images/playground-logo.png";

import {
  Activity,
  CalendarClock,
  Gamepad2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  ShieldPlus,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

import { useApp } from "../../context/AppContext";

export default function DashboardLayout() {
  const {
    // Usuario actual logueado.
    currentUser,

    // Partidas cargadas desde AppContext.
    matches,

    // Función para cerrar sesión.
    logout,
  } = useApp();

  const navigate = useNavigate();

  // Si por alguna razón currentUser todavía no existe,
  // mostramos datos seguros para evitar errores visuales.
  const activeUser = currentUser ?? {
    username: "guest",
    role: "Operador",
  };

  // Controla si la sidebar está abierta o compacta.
  const [open, setOpen] = useState(true);

  // Contador de partidas activas.
  const liveMatches = matches.filter(
    (match) => match.status === "En curso",
  ).length;

  // =====================================================
  // MENÚ DEL DASHBOARD
  // =====================================================
  //
  // path "/" regresa al home público.
  // path "/admin" y demás son secciones internas del panel.
  const menu = [
    {
      name: "Inicio público",
      icon: <Home size={18} />,
      path: "/",
      end: true,
    },
    {
      name: "Control",
      icon: <LayoutDashboard size={18} />,
      path: "/admin",
      end: true,
    },
    {
      name: "Juegos",
      icon: <Gamepad2 size={18} />,
      path: "/admin/juegos",
    },
    {
      name: "Partidas",
      icon: <CalendarClock size={18} />,
      path: "/admin/partidas",
    },
    {
      name: "Equipos",
      icon: <Swords size={18} />,
      path: "/admin/equipos",
    },
    {
      name: "Rankings",
      icon: <Trophy size={18} />,
      path: "/admin/ranking",
    },
    {
      name: "Usuarios",
      icon: <Users size={18} />,
      path: "/admin/usuarios",
    },
    {
      name: "Crear admin",
      icon: <ShieldPlus size={18} />,
      path: "/admin/crear-admin",
    },
  ];

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================
  //
  // Limpia localStorage desde AppContext.logout()
  // y manda al home público.
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        {/* 
          Logo del dashboard.
          También sirve para regresar al home público.
        */}
        <button
          type="button"
          className="sidebar-top sidebar-home-link"
          onClick={() => navigate("/")}
          title="Volver al inicio público"
        >
          <img src={logo} alt="logo" />

          <div className="logo-copy">
            <span className="logo-text">ISC Playground</span>
            <small>Admin eSports OS</small>
          </div>
        </button>

        {/* Navegación lateral */}
        <nav className="sidebar-nav">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
              end={item.end ?? false}
              to={item.path}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Estado rápido de partidas en vivo */}
        <div className="sidebar-status">
          <Activity size={18} />

          <div>
            <strong>{liveMatches} live</strong>
            <span>partidas activas</span>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="header">
          {/* Botón para abrir/cerrar sidebar */}
          <button
            onClick={() => setOpen(!open)}
            className="menu-btn"
            aria-label="Alternar menú"
          >
            <Menu />
          </button>

          <div className="header-title">
            <span>Panel de torneo</span>
            <h1>Operación en vivo</h1>
          </div>

          {/* Usuario admin y botón salir */}
          <div className="user">
            <ShieldCheck size={16} />

            <div>
              <strong>{activeUser.username}</strong>
              <span>{activeUser.role}</span>
            </div>

            {/* 
            Botón visible para cerrar sesión desde el dashboard.
            Antes solo se veía el ícono, por eso podía confundirse.
          */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="dashboard-logout-btn"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
