// =============================
// COMPONENTE: RUTA PROTEGIDA
// =============================

// Envuelve rutas que requieren autenticación o rol específico.
// Si no hay sesión activa → redirige a /login
// Si hay sesión pero no es admin → redirige a /
// Se usa en App.jsx para proteger /admin

import { Navigate } from "react-router-dom"
import { useApp } from "../../context/AppContext"

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser, loading } = useApp()

  // Mientras carga los datos del contexto, no redirigimos todavía
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        background: "#020617"
      }}>
        Cargando...
      </div>
    )
  }

  // Sin sesión → al login
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Con sesión pero no es admin → al inicio
  if (requireAdmin && currentUser.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}