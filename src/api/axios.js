// =====================================================
// CONFIGURACIÓN GLOBAL DE AXIOS
// =====================================================
//
// Este archivo crea una instancia única de axios para hablar
// con el backend.
//
// Ventajas:
// - No repetimos http://localhost:3000/api en todos los archivos.
// - El token JWT se agrega automáticamente.
// - Si el token expira, limpiamos sesión automáticamente.

import axios from "axios"

// =====================================================
// BASE URL DEL BACKEND
// =====================================================
//
// Si existe VITE_API_URL en .env, se usa esa.
// Si no existe, usamos localhost para desarrollo.
//
// Ejemplo de .env del frontend:
// VITE_API_URL=http://localhost:3000/api
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// =====================================================
// INTERCEPTOR DE PETICIONES
// =====================================================
//
// Antes de enviar cualquier petición al backend,
// revisamos si existe isc_token en localStorage.
//
// Si existe, se manda así:
//
// Authorization: Bearer <token>
//
// Esto permite que rutas protegidas del backend sepan
// quién está haciendo la petición.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("isc_token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// =====================================================
// INTERCEPTOR DE RESPUESTAS
// =====================================================
//
// Si el backend responde que el token expiró o es inválido,
// limpiamos la sesión del navegador.
//
// Casos comunes:
// - 401 Token requerido
// - 403 Token expirado
// - 403 Token inválido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.error ?? ""

    const isAuthError =
      status === 401 ||
      message.toLowerCase().includes("token expirado") ||
      message.toLowerCase().includes("token inválido")

    if (isAuthError) {
      localStorage.removeItem("isc_token")
      localStorage.removeItem("isc_user")

      // Evitamos redireccionar si ya está en login o registro.
      const currentPath = window.location.pathname
      const isAuthPage =
        currentPath === "/login" ||
        currentPath === "/registro"

      if (!isAuthPage) {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

export default api