import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Registro from "./pages/Registro/Registro";
import JuegosPage from "./pages/Juegos/Juegos";
import RankingPage from "./pages/Ranking/Ranking";
import AboutPage from "./pages/About/About";

// detalles juego
import Detalles from "./pages/Juegos/Detalles/Detalles";

// dashboard
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import Juegos from "./pages/Dashboard/views/Juegos";
import Equipos from "./pages/Dashboard/views/Equipos";
import Usuarios from "./pages/Dashboard/views/Usuarios";
import Ranking from "./pages/Dashboard/views/Ranking";
import DashboardHome from "./pages/Dashboard/views/DashboardHome";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/juegos" element={<JuegosPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* detalles */}
        <Route path="/juego/:id" element={<Detalles />} />

        {/* admin */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="juegos" element={<Juegos />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="equipos" element={<Equipos />} />
          <Route path="ranking" element={<Ranking />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}