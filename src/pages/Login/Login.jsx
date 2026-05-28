// =============================
// PÁGINA DE LOGIN
// =============================

// Si el usuario ya tiene sesión activa, redirige automáticamente.
// Admin → /admin, Usuario → /

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import logo from "../../assets/images/playground-logo.png"
import api from "../../api/axios.js"
import { useApp } from "../../context/AppContext.jsx"

export default function Login() {
  const navigate = useNavigate()
  const { currentUser, updateCurrentUser } = useApp()
  const [activeInput, setActiveInput] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({ identifier: "", password: "" })

  // ─────────────────────────────
  // REDIRECCIÓN SI YA ESTÁ LOGUEADO
  // ─────────────────────────────
  // Si el usuario ya tiene sesión, no necesita ver el login
  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === "admin" ? "/admin" : "/", { replace: true })
    }
  }, [currentUser, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  // ─────────────────────────────
  // ENVÍO DEL FORMULARIO
  // ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const response = await api.post("/auth/login", {
        identifier: formData.identifier,
        password: formData.password,
      })
      const { token, user } = response.data

      // Guardamos token y usuario en localStorage
      localStorage.setItem("isc_token", token)
      localStorage.setItem("isc_user", JSON.stringify(user))

      // Actualizamos el contexto — el useEffect de arriba hará la redirección
      updateCurrentUser(user)
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className={`login-card ${activeInput ? "focus" : ""}`}>
        <div className="login-header">
          <div className="logo-wrapper">
            <img src={logo} alt="ISC Playground Logo" />
          </div>
          <h2>Bienvenido</h2>
          <p>ISC Playground</p>
        </div>

        <form className="login-body" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label>Correo o usuario</label>
            <div className="input-box">
              <Mail size={16} />
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Correo o username"
                onFocus={() => setActiveInput("identifier")}
                onBlur={() => setActiveInput(null)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <div className="input-box">
              <Lock size={16} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                onFocus={() => setActiveInput("password")}
                onBlur={() => setActiveInput(null)}
              />
              <span className="eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          <div className="login-links">
            <button type="button" className="link-btn" onClick={() => navigate("/registro")}>
              Crear cuenta
            </button>
            <button type="button" className="link-btn ghost" onClick={() => navigate("/")}>
              ← Volver al inicio
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}