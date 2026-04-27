import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Registro from "./pages/Registro/Registro";
import DashboardLayout from "./pages/Dashboard/DashboardLayout"; // 👈 corregido

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* ADMIN DASHBOARD */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<h2>Dashboard Home</h2>} />
          <Route path="juegos" element={<h2>Juegos</h2>} />
          <Route path="usuarios" element={<h2>Usuarios</h2>} />
          <Route path="equipos" element={<h2>Equipos</h2>} />
          <Route path="ranking" element={<h2>Ranking</h2>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}