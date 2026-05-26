import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import logo from "../../assets/images/playground-logo.png";
import api from "../../api/axios.js";

export default function Login() {
  const navigate = useNavigate();
  const [activeInput, setActiveInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Llamada real al backend
      const response = await api.post("/auth/login", {
        identifier: formData.identifier,
        password: formData.password,
      });

      const { token, user } = response.data;

      // Guardamos el token y el usuario en localStorage
      localStorage.setItem("isc_token", token);
      localStorage.setItem("isc_user", JSON.stringify(user));

      // Redirigimos según el rol
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      // Mostramos el error que devuelve el backend
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

          {/* ERROR */}
          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* IDENTIFIER */}
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

          {/* PASSWORD */}
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

          {/* BUTTON */}
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          {/* LINKS */}
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
  );
}