import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Registro from "./pages/Registro/Registro";
import DashboardLayout from "./pages/Dashboard/DashboardLayout"; // 
import Juegos from "./pages/Dashboard/views/Juegos";
import Equipos from "./pages/Dashboard/views/Equipos";
import Usuarios from "./pages/Dashboard/views/Usuarios";
import Ranking from "./pages/Dashboard/views/Ranking";
import DashboardHome from "./pages/Dashboard/views/DashboardHome";

import { AppProvider } from "./context/AppContext";


export default function App() {

  <AppProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AppProvider>

  return (
    <BrowserRouter>
      <Routes>

        {/* públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* ADMIN DASHBOARD */}
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