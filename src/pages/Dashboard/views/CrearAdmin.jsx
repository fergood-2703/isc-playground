// =============================
// VISTA: CREAR ADMINISTRADOR
// =============================

// Solo accesible desde /admin/crear-admin
// El admin logueado puede crear otros admins desde aquí
// La seguridad la maneja el backend con verifyToken + verifyAdmin
// No se necesita código de autorización — el JWT del admin es suficiente

import { useState } from "react"
import {
  ShieldCheck, User, Mail, AtSign, Lock,
  Eye, EyeOff, AlertCircle, CheckCircle2, Loader2
} from "lucide-react"
import api from "../../../api/axios.js"

export default function CrearAdmin() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    username: "",
    password: "",
  })

  // ─────────────────────────────
  // MANEJO DE CAMBIOS EN INPUTS
  // ─────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Limpiamos el error del campo al escribir
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
    if (apiError) setApiError("")
  }

  // ─────────────────────────────
  // VALIDACIÓN DEL FORMULARIO
  // ─────────────────────────────
  const validate = () => {
    const newErrors = {}
    if (!form.nombres.trim()) newErrors.nombres = "Requerido"
    if (!form.apellidos.trim()) newErrors.apellidos = "Requerido"
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Correo inválido"
    if (!form.username.trim()) newErrors.username = "Requerido"
    if (!form.password || form.password.length < 6)
      newErrors.password = "Mínimo 6 caracteres"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ─────────────────────────────
  // ENVÍO DEL FORMULARIO
  // ─────────────────────────────
  // El token del admin logueado va automáticamente en el header
  // gracias al interceptor de axios (axios.js → Authorization: Bearer)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setApiError("")
    setSuccess("")
    try {
      await api.post("/auth/register-admin", {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
      })
      setSuccess(`Admin @${form.username} creado exitosamente`)
      // Limpiamos el formulario después del éxito
      setForm({ nombres: "", apellidos: "", email: "", username: "", password: "" })
    } catch (err) {
      setApiError(err.response?.data?.error || "Error al crear el administrador")
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────
  // HELPER: RENDERIZAR CAMPO
  // ─────────────────────────────
  const field = (label, name, type = "text", icon) => (
    <label className="field" key={name}>
      <span>{label} *</span>
      <div className="input-wrap" style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {icon && (
          <span style={{ position: "absolute", left: 10, color: "#9ca3af", pointerEvents: "none" }}>
            {icon}
          </span>
        )}
        <input
          type={name === "password" ? (showPassword ? "text" : "password") : type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          style={{
            paddingLeft: icon ? 32 : 12,
            width: "100%",
            padding: "8px 12px 8px 32px",
            border: `1px solid ${errors[name] ? "#fca5a5" : "#374151"}`,
            borderRadius: 8,
            background: "#0f172a",
            color: "white",
            boxSizing: "border-box",
          }}
        />
        {/* Botón ojo solo para el campo contraseña */}
        {name === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute", right: 10,
              background: "none", border: "none",
              cursor: "pointer", color: "#9ca3af"
            }}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {errors[name] && (
        <small style={{ color: "#ef4444", fontSize: 11 }}>{errors[name]}</small>
      )}
    </label>
  )

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Gestión de accesos</span>
          <h2>Crear nuevo administrador</h2>
          <p>
            Solo un administrador autenticado puede acceder a esta sección.
            El nuevo admin tendrá acceso completo al panel de control.
          </p>
        </div>
      </div>

      <div className="panel-card" style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <ShieldCheck size={22} style={{ color: "#8b5cf6" }} />
          <h3 style={{ margin: 0 }}>Datos del nuevo administrador</h3>
        </div>

        {/* Mensaje de error de la API */}
        {apiError && (
          <div style={{
            display: "flex", gap: 8, padding: "10px 12px",
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 8, marginBottom: 16
          }}>
            <AlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#dc2626" }}>{apiError}</span>
          </div>
        )}

        {/* Mensaje de éxito */}
        {success && (
          <div style={{
            display: "flex", gap: 8, padding: "10px 12px",
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 8, marginBottom: 16
          }}>
            <CheckCircle2 size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#16a34a" }}>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Nombres y Apellidos en grid de 2 columnas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {field("Nombres", "nombres", "text", <User size={14} />)}
            {field("Apellidos", "apellidos", "text", <User size={14} />)}
          </div>
          {field("Correo", "email", "email", <Mail size={14} />)}
          {field("Username", "username", "text", <AtSign size={14} />)}
          {field("Contraseña", "password", "password", <Lock size={14} />)}

          <button
            type="submit"
            disabled={isLoading}
            className="primary-btn"
            style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}
          >
            {isLoading
              ? <><Loader2 size={16} /> Creando...</>
              : <><ShieldCheck size={16} /> Crear administrador</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}