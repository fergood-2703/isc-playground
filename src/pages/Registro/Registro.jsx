// =============================
// PÁGINA DE REGISTRO
// =============================

// Solo registro público de usuarios normales.
// Los admins se crean desde /admin/crear-admin por un admin autenticado.
// Esta página no tiene rol de admin ni adminCode.

import api from "../../api/axios.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  User,
  Mail,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Home,
  Loader2,
} from "lucide-react";
import logo from "../../assets/images/playground-logo.png";
import "./Registro.css";

export default function Registro() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // ─────────────────────────────
  // MANEJO DE INPUTS
  // ─────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  // ─────────────────────────────
  // VALIDACIÓN
  // ─────────────────────────────
  const validateForm = () => {
    const newErrors = {};
    if (!form.nombres.trim()) newErrors.nombres = "Los nombres son requeridos";
    if (!form.apellidos.trim())
      newErrors.apellidos = "Los apellidos son requeridos";
    if (!form.email.trim()) {
      newErrors.email = "Ingresa tu correo";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Correo inválido";
    }
    if (!form.username.trim()) newErrors.username = "Ingresa un username";
    if (!form.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (form.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─────────────────────────────
  // ENVÍO DEL FORMULARIO
  // ─────────────────────────────
  // Siempre crea un usuario con rol "usuario"
  // No hay forma de registrarse como admin desde aquí
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setApiError("");
    try {
      await api.post("/auth/register", {
        // trim() elimina espacios al inicio/final.
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),

        // El email lo mandamos en minúsculas para evitar duplicados raros:
        // Ejemplo: Mario@correo.com y mario@correo.com
        email: form.email.trim().toLowerCase(),

        // El username lo dejamos como el usuario lo escribió,
        // solo quitando espacios extremos.
        username: form.username.trim(),

        password: form.password,
      });
      setSuccessMessage("¡Cuenta creada exitosamente! Redirigiendo...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setApiError(err.response?.data?.error || "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registro-page">
      <div className="registro-card">
        <header className="registro-header">
          <div className="logo-wrapper">
            <img src={logo} alt="ISC Playground Logo" />
          </div>
          <div className="registro-icon-wrap">
            <UserRound size={22} />
          </div>
          <h1>Crear cuenta</h1>
          <p>Completa tus datos para registrarte</p>
        </header>

        <div className="registro-body">
          {/* Mensajes de error/éxito */}
          {apiError && (
            <div className="registro-alert error">
              <AlertCircle size={16} />
              <span>{apiError}</span>
            </div>
          )}
          {successMessage && (
            <div className="registro-alert success">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="registro-form">
            {/* Nombres y Apellidos */}
            <div className="input-grid two">
              <label className="field">
                <span>Nombres *</span>
                <div className="input-wrap">
                  <User size={15} />
                  <input
                    type="text"
                    name="nombres"
                    value={form.nombres}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.nombres && (
                  <small className="error-msg">{errors.nombres}</small>
                )}
              </label>
              <label className="field">
                <span>Apellidos *</span>
                <div className="input-wrap">
                  <User size={15} />
                  <input
                    type="text"
                    name="apellidos"
                    value={form.apellidos}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.apellidos && (
                  <small className="error-msg">{errors.apellidos}</small>
                )}
              </label>
            </div>

            {/* Email */}
            <label className="field">
              <span>Correo *</span>
              <div className="input-wrap">
                <Mail size={15} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="correo@dominio.com"
                />
              </div>
              {errors.email && (
                <small className="error-msg">{errors.email}</small>
              )}
            </label>

            {/* Username */}
            <label className="field">
              <span>Username *</span>
              <div className="input-wrap">
                <AtSign size={15} />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleInputChange}
                  placeholder="gamer123"
                />
              </div>
              {errors.username && (
                <small className="error-msg">{errors.username}</small>
              )}
            </label>

            {/* Contraseñas */}
            <div className="input-grid two">
              <label className="field">
                <span>Contraseña *</span>
                <div className="input-wrap">
                  <Lock size={15} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <small className="error-msg">{errors.password}</small>
                )}
              </label>
              <label className="field">
                <span>Confirmar *</span>
                <div className="input-wrap">
                  <Lock size={15} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <small className="error-msg">{errors.confirmPassword}</small>
                )}
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin" /> Registrando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </button>

            <div className="registro-links">
              <button
                type="button"
                className="link-btn"
                onClick={() => navigate("/login")}
              >
                Ya tengo cuenta
              </button>
              <button
                type="button"
                className="link-btn ghost"
                onClick={() => navigate("/")}
              >
                <Home size={13} /> Volver al inicio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
