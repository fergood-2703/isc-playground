import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import logo from "../../assets/images/playground-logo.png";

import {
  LayoutDashboard,
  Gamepad2,
  Users,
  Trophy,
  Swords,
  Menu
} from "lucide-react";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin" },
    { name: "Juegos", icon: <Gamepad2 size={18} />, path: "/admin/juegos" },
    { name: "Usuarios", icon: <Users size={18} />, path: "/admin/usuarios" },
    { name: "Equipos", icon: <Swords size={18} />, path: "/admin/equipos" },
    { name: "Ranking", icon: <Trophy size={18} />, path: "/admin/ranking" },
  ];

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : "closed"}`}>

        <div className="sidebar-top">
          <img src={logo} alt="logo" />
          <span className="logo-text">ISC Playground</span>
        </div>

        <nav>
          {menu.map((item, i) => (
            <div
              key={i}
              className="menu-item"
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

      </aside>

      {/* MAIN */}
      <div className="main">

        {/* HEADER */}
        <header className="header">
          <button onClick={() => setOpen(!open)} className="menu-btn">
            <Menu />
          </button>

          <h1>Admin Panel</h1>

          <div className="user">
            Admin
          </div>
        </header>

        {/* CONTENT */}
        <div className="content">
          <Outlet />
        </div>

      </div>
    </div>
  );
}