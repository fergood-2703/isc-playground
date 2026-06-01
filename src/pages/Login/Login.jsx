// =============================
// PÁGINA DE LOGIN
// =============================

// Si el usuario ya tiene sesión activa, redirige automáticamente.
// Admin → /admin, Usuario → /

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Login.css";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import logo from "../../assets/images/playground-logo.png";
import api from "../../api/axios.js";
import { useApp } from "../../context/AppContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  // useLocation permite leer si ProtectedRoute mandó al usuario aquí
  // desde una ruta protegida como /perfil o /admin.
  const location = useLocation();
  const { currentUser, updateCurrentUser } = useApp();
  // Ruta a la que el usuario quería entrar antes de iniciar sesión.
  //
  // Ejemplo:
  // - Intentó abrir /perfil sin sesión → redirectTo será "/perfil"
  // - Intentó abrir /admin sin sesión → redirectTo será "/admin"
  //
  // Si entró directamente a /login, dejamos null.
  // Así podremos mandarlo según su rol:
  // - admin → /admin
  // - usuario → /
  const redirectTo = location.state?.from ?? null;

  const [activeInput, setActiveInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ identifier: "", password: "" });

  // =====================================================
  // REDIRECCIÓN SI YA ESTÁ LOGUEADO
  // =====================================================
  //
  // Si el usuario ya tiene sesión activa y entra a /login,
  // lo mandamos a una ruta lógica.
  //
  // Casos:
  // - Si venía de /perfil, lo regresamos a /perfil.
  // - Si es admin y no venía de ninguna ruta, lo mandamos a /admin.
  // - Si es usuario normal y no venía de ninguna ruta, lo mandamos a /.
  useEffect(() => {
    if (!currentUser) return;

    const defaultRoute = currentUser.role === "admin" ? "/admin" : "/";

    navigate(redirectTo || defaultRoute, { replace: true });
  }, [currentUser, navigate, redirectTo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // ─────────────────────────────
  // ENVÍO DEL FORMULARIO
  // ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login", {
        // trim() evita errores por espacios accidentales.
        // Ejemplo: " Mario788 " → "Mario788"
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      const { token, user } = response.data;

      // Guardamos token y usuario en localStorage.
      // El token se usará automáticamente en axios.js.
      localStorage.setItem("isc_token", token);
      localStorage.setItem("isc_user", JSON.stringify(user));

      // Actualizamos el contexto.
      // Al cambiar currentUser, el useEffect de arriba hará la redirección.
      updateCurrentUser(user);
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

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
              <span
                className="eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          <div className="login-links">
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/registro")}
            >
              Crear cuenta
            </button>
            <button
              type="button"
              className="link-btn ghost"
              onClick={() => navigate("/")}
            >
              ← Volver al inicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
