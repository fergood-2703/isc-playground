import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
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

const ROLES = {
  normal: "usuario",
  admin: "admin",
};

export default function Registro() {
  const navigate = useNavigate();
  const [roleType, setRoleType] = useState("normal");
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
    adminCode: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.nombres.trim()) newErrors.nombres = "Los nombres son requeridos";
    if (!form.apellidos.trim()) newErrors.apellidos = "Los apellidos son requeridos";
    if (!form.email.trim()) {
      newErrors.email = "Ingresa tu correo";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Correo inválido";
    }

    if (!form.username.trim()) {
      newErrors.username = "Ingresa un username";
    }

    if (!form.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (form.password.length < 4) {
      newErrors.password = "Mínimo 4 caracteres";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (roleType === "admin" && !form.adminCode.trim()) {
      newErrors.adminCode = "El código admin es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const users = JSON.parse(localStorage.getItem("isc_users") || "[]");
      const emailValue = form.email.trim().toLowerCase();
      const usernameValue = form.username.trim().toLowerCase();

      const exists = users.some((user) => {
        const storedEmail = (user.email || "").toLowerCase();
        const storedUsername = (user.username || user.identifier || "").toLowerCase();
        const storedIdentifier = (user.identifier || "").toLowerCase();

        return (
          storedEmail === emailValue ||
          storedUsername === usernameValue ||
          storedIdentifier === emailValue ||
          storedIdentifier === usernameValue
        );
      });

      if (exists) {
        setApiError("Este correo o username ya está registrado");
        return;
      }

      const newUser = {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        identifier: form.username.trim(),
        password: form.password,
        role: ROLES[roleType],
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("isc_users", JSON.stringify([...users, newUser]));

      setSuccessMessage(
        roleType === "admin"
          ? "Administrador registrado correctamente"
          : "Usuario registrado correctamente",
      );

      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setApiError("No se pudo guardar el registro en este equipo");
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
            {roleType === "admin" ? <ShieldCheck size={22} /> : <UserRound size={22} />}
          </div>

          <h1>Crear cuenta</h1>
          <p>Completa tus datos para registrarte</p>
        </header>

        <div className="registro-body">
          <div className="role-switch" role="tablist" aria-label="Tipo de registro">
            <button
              type="button"
              role="tab"
              aria-selected={roleType === "normal"}
              className={roleType === "normal" ? "active" : ""}
              onClick={() => {
                setRoleType("normal");
                setErrors((prev) => ({ ...prev, adminCode: "" }));
              }}
            >
              Usuarios
            </button>
            <span className="role-divider" aria-hidden="true">
              |
            </span>
            <button
              type="button"
              role="tab"
              aria-selected={roleType === "admin"}
              className={roleType === "admin" ? "active" : ""}
              onClick={() => setRoleType("admin")}
            >
              Administradores
            </button>
          </div>

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
            <div className="input-grid two">
              <label className="field">
                <span>Nombres *</span>
                <div className="input-wrap">
                  <User size={15} />
                  <input type="text" name="nombres" value={form.nombres} onChange={handleInputChange} />
                </div>
                {errors.nombres && <small className="error-msg">{errors.nombres}</small>}
              </label>

              <label className="field">
                <span>Apellidos *</span>
                <div className="input-wrap">
                  <User size={15} />
                  <input type="text" name="apellidos" value={form.apellidos} onChange={handleInputChange} />
                </div>
                {errors.apellidos && <small className="error-msg">{errors.apellidos}</small>}
              </label>
            </div>

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
              {errors.email && <small className="error-msg">{errors.email}</small>}
            </label>

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
              {errors.username && <small className="error-msg">{errors.username}</small>}
            </label>

            {roleType === "admin" && (
              <label className="field">
                <span>Código de autorización admin *</span>
                <div className="input-wrap">
                  <ShieldCheck size={15} />
                  <input
                    type="text"
                    name="adminCode"
                    value={form.adminCode}
                    onChange={handleInputChange}
                    placeholder="Código interno LAN"
                  />
                </div>
                {errors.adminCode && <small className="error-msg">{errors.adminCode}</small>}
              </label>
            )}

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
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <small className="error-msg">{errors.password}</small>}
              </label>

              <label className="field">
                <span>Confirmar contraseña *</span>
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
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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
                <>{roleType === "admin" ? "Crear admin" : "Crear usuario"}</>
              )}
            </button>

            <div className="registro-links">
              <button type="button" className="link-btn" onClick={() => navigate("/login")}>
                Ir a login
              </button>
              <button type="button" className="link-btn ghost" onClick={() => navigate("/")}>
                <Home size={13} /> Volver al inicio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
