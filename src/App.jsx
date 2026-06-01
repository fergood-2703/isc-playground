import { BrowserRouter, Routes, Route } from "react-router-dom";

// páginas públicas
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Registro from "./pages/Registro/Registro";
import JuegosPage from "./pages/Juegos/Juegos";
import RankingPage from "./pages/Ranking/Ranking";
import AboutPage from "./pages/About/About";
import Perfil from "./pages/Perfil/Perfil";
import Detalles from "./pages/Juegos/Detalles/Detalles";

// protección
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// dashboard admin
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import DashboardHome from "./pages/Dashboard/views/DashboardHome";
import JuegosAdmin from "./pages/Dashboard/views/Juegos";
import Equipos from "./pages/Dashboard/views/Equipos";
import Usuarios from "./pages/Dashboard/views/Usuarios";
import RankingAdmin from "./pages/Dashboard/views/Ranking";
import Partidas from "./pages/Dashboard/views/Partidas";
import CrearAdmin from "./pages/Dashboard/views/CrearAdmin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/juegos" element={<JuegosPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/juego/:id" element={<Detalles />} />

        {/* 
           Ruta protegida para perfil.
           Solo usuarios con sesión pueden entrar.
           Si no hay currentUser, ProtectedRoute manda a /login.
        */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS — SOLO ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="juegos" element={<JuegosAdmin />} />
          <Route path="partidas" element={<Partidas />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="equipos" element={<Equipos />} />
          <Route path="ranking" element={<RankingAdmin />} />
          <Route path="crear-admin" element={<CrearAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
