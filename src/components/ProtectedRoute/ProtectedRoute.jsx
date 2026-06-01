// =====================================================
// COMPONENTE: PROTECTED ROUTE
// =====================================================
//
// Este componente protege rutas del frontend.
//
// Se usa en App.jsx así:
//
// <ProtectedRoute>
//   <Perfil />
// </ProtectedRoute>
//
// o así:
//
// <ProtectedRoute requireAdmin>
//   <DashboardLayout />
// </ProtectedRoute>
//
// Reglas:
// - Si está cargando el contexto, mostramos "Cargando...".
// - Si no hay sesión, mandamos a /login.
// - Si requiere admin y el usuario no es admin, mandamos a /.
// - Si todo está bien, renderizamos la página solicitada.

import { Navigate, useLocation } from "react-router-dom"
import { useApp } from "../../context/AppContext"

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser, loading } = useApp()

  // useLocation nos permite saber qué ruta intentaba abrir el usuario.
  // Ejemplo:
  // Si quiso entrar a /perfil sin sesión, guardamos "/perfil"
  // para poder regresarlo ahí después del login.
  const location = useLocation()

  // =====================================================
  // ESTADO DE CARGA
  // =====================================================
  //
  // Evita redirecciones falsas mientras AppContext todavía
  // está leyendo localStorage y cargando datos del backend.
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          background: "#020617",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Cargando...
      </div>
    )
  }

  // =====================================================
  // SIN SESIÓN
  // =====================================================
  //
  // Mandamos a /login y guardamos la ruta original en state.
  //
  // Ejemplo:
  // Usuario intenta abrir /perfil
  // ↓
  // Lo mandamos a /login
  // ↓
  // Login puede leer state.from = "/perfil"
  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  // =====================================================
  // RUTA SOLO ADMIN
  // =====================================================
  //
  // Si la ruta pide admin, pero el usuario tiene rol "usuario",
  // lo mandamos al inicio.
  if (requireAdmin && currentUser.role !== "admin") {
    return <Navigate to="/" replace />
  }

  // Si pasó todas las validaciones, mostramos la página.
  return children
}