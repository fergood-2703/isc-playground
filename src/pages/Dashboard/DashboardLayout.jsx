import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./Dashboard.css";
import logo from "../../assets/images/playground-logo.png";

import {
  Activity,
  Gamepad2,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function DashboardLayout() {
  const { currentUser, matches } = useApp();
  const [open, setOpen] = useState(true);
  const liveMatches = matches.filter((match) => match.status === "En vivo").length;

  const menu = [
    { name: "Control", icon: <LayoutDashboard size={18} />, path: "/admin" },
    { name: "Juegos & partidas", icon: <Gamepad2 size={18} />, path: "/admin/juegos" },
    { name: "Equipos", icon: <Swords size={18} />, path: "/admin/equipos" },
    { name: "Rankings", icon: <Trophy size={18} />, path: "/admin/ranking" },
    { name: "Usuarios", icon: <Users size={18} />, path: "/admin/usuarios" },
  ];

  return (
    <div className="dashboard">
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        <div className="sidebar-top">
          <img src={logo} alt="logo" />
          <div className="logo-copy">
            <span className="logo-text">ISC Playground</span>
            <small>Admin eSports OS</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
              end={item.path === "/admin"}
              to={item.path}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

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
          <button onClick={() => setOpen(!open)} className="menu-btn" aria-label="Alternar menú">
            <Menu />
          </button>

          <div className="header-title">
            <span>Panel de torneo</span>
            <h1>Operación en vivo</h1>
          </div>

          <div className="user">
            <ShieldCheck size={16} />
            <div>
              <strong>{currentUser.username}</strong>
              <span>{currentUser.role}</span>
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
