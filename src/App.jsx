// =============================
// RUTAS DE LA APLICACIÓN
// =============================

import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import Registro from "./pages/Registro/Registro"
import Detalles from "./pages/Juegos/Detalles/Detalles"
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"

import DashboardLayout from "./pages/Dashboard/DashboardLayout"
import DashboardHome from "./pages/Dashboard/views/DashboardHome"
import Juegos from "./pages/Dashboard/views/Juegos"
import Equipos from "./pages/Dashboard/views/Equipos"
import Usuarios from "./pages/Dashboard/views/Usuarios"
import Ranking from "./pages/Dashboard/views/Ranking"
import Partidas from "./pages/Dashboard/views/Partidas"
import CrearAdmin from "./pages/Dashboard/views/CrearAdmin"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─────────────────────────────── */}
        {/* RUTAS PÚBLICAS                  */}
        {/* ─────────────────────────────── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/juego/:id" element={<Detalles />} />

        {/* ─────────────────────────────── */}
        {/* RUTAS PROTEGIDAS — SOLO ADMIN   */}
        {/* Sin token o sin rol admin → /   */}
        {/* ─────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="juegos" element={<Juegos />} />
          <Route path="partidas" element={<Partidas />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="equipos" element={<Equipos />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="crear-admin" element={<CrearAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}