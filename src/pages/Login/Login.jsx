import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn as LogInIcon,
  UserPlus,
  Home,
  CheckCircle2,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [recordarSesion, setRecordarSesion] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido";
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setApiError("");
    setSuccessMessage("");
    try {
      // TODO: conectar con el backend
      // const response = await loginEstudiante(formData.email, formData.password, recordarSesion);
      setSuccessMessage("¡Inicio de sesión exitoso!");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      setApiError("Error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      background: "linear-gradient(135deg, #f8fafc, #eff6ff, #f8fafc)",
      fontFamily: "sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "520px",
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
      overflow: "hidden",
      border: "1px solid #f1f5f9",
    },
    header: {
      background: "linear-gradient(135deg, #1A386A, #1e3a8a)",
      padding: "24px",
      textAlign: "center",
    },
    iconBox: {
      width: "64px",
      height: "64px",
      background: "rgba(255,255,255,0.1)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 12px",
    },
    title: {
      color: "white",
      fontSize: "24px",
      fontWeight: "800",
      margin: "0 0 4px",
    },
    subtitle: { color: "#bfdbfe", fontSize: "12px", margin: 0 },
    body: { padding: "24px 32px" },
    label: {
      fontSize: "12px",
      fontWeight: "500",
      color: "#374151",
      display: "block",
      marginBottom: "4px",
    },
    inputWrap: { position: "relative" },
    input: (hasError) => ({
      width: "100%",
      paddingLeft: "36px",
      paddingRight: "12px",
      paddingTop: "10px",
      paddingBottom: "10px",
      fontSize: "14px",
      border: `1px solid ${hasError ? "#fca5a5" : "#d1d5db"}`,
      borderRadius: "8px",
      outline: "none",
      color: "#111827",
      background: "white",
      boxSizing: "border-box",
    }),
    inputPassword: (hasError) => ({
      width: "100%",
      paddingLeft: "36px",
      paddingRight: "40px",
      paddingTop: "10px",
      paddingBottom: "10px",
      fontSize: "14px",
      border: `1px solid ${hasError ? "#fca5a5" : "#d1d5db"}`,
      borderRadius: "8px",
      outline: "none",
      color: "#111827",
      background: "white",
      boxSizing: "border-box",
    }),
    iconLeft: (hasError) => ({
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "16px",
      height: "16px",
      color: hasError ? "#f87171" : "#9ca3af",
    }),
    eyeBtn: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#9ca3af",
      padding: 0,
      display: "flex",
    },
    errorMsg: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      color: "#ef4444",
      fontSize: "11px",
      marginTop: "4px",
    },
    row: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "12px",
    },
    checkLabel: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      gap: "6px",
      color: "#4b5563",
    },
    link: {
      color: "#1A386A",
      fontWeight: "500",
      textDecoration: "none",
      fontSize: "12px",
    },
    btn: (loading) => ({
      width: "100%",
      background: loading ? "#94a3b8" : "#1A386A",
      color: "white",
      fontWeight: "700",
      padding: "12px",
      borderRadius: "8px",
      border: "none",
      cursor: loading ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontSize: "14px",
      marginTop: "8px",
    }),
    divider: {
      borderTop: "1px solid #f1f5f9",
      paddingTop: "16px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    linkRow: { fontSize: "12px", color: "#4b5563", margin: 0 },
    linkBlue: {
      fontWeight: "600",
      color: "#1A386A",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
    },
    linkGray: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      color: "#6b7280",
      textDecoration: "none",
      fontWeight: "500",
    },
    footer: {
      marginTop: "16px",
      textAlign: "center",
      color: "#6b7280",
      fontSize: "12px",
    },
    alertRed: {
      marginBottom: "16px",
      padding: "12px",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: "8px",
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
    },
    alertGreen: {
      marginBottom: "16px",
      padding: "12px",
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      borderRadius: "8px",
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
    },
  };

  return (
    <div style={s.page}>
      <style>{`
        @media (max-width: 540px) {
          .login-card { padding: 16px !important; }
          .login-body { padding: 20px 16px !important; }
        }
      `}</style>
      <div style={{ width: "100%", maxWidth: "520px" }}>
        <div style={s.card}>
          {/* Header */}
          <div className="login-card" style={s.header}>
            <div style={s.iconBox}>
              <LogInIcon
                style={{ width: "32px", height: "32px", color: "white" }}
              />
            </div>
            <h2 style={s.title}>Bienvenido Estudiante</h2>
            <p style={s.subtitle}>ISC University Playground</p>
          </div>

          {/* Body */}
          <div className="login-body" style={s.body}>
            {apiError && (
              <div style={s.alertRed}>
                <AlertCircle
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "#ef4444",
                    flexShrink: 0,
                  }}
                />
                <p style={{ fontSize: "12px", color: "#dc2626", margin: 0 }}>
                  {apiError}
                </p>
              </div>
            )}

            {successMessage && (
              <div style={s.alertGreen}>
                <CheckCircle2
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "#22c55e",
                    flexShrink: 0,
                  }}
                />
                <p style={{ fontSize: "12px", color: "#16a34a", margin: 0 }}>
                  {successMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Email */}
                <div>
                  <label style={s.label}>
                    Correo Electrónico{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={s.inputWrap}>
                    <Mail style={s.iconLeft(errors.email)} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="ejemplo@correo.com"
                      style={s.input(errors.email)}
                    />
                  </div>
                  {errors.email && (
                    <div style={s.errorMsg}>
                      <AlertCircle style={{ width: "10px", height: "10px" }} />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <label style={s.label}>
                    Contraseña <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={s.inputWrap}>
                    <Lock style={s.iconLeft(errors.password)} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="••••••••"
                      style={s.inputPassword(errors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={s.eyeBtn}
                    >
                      {showPassword ? (
                        <EyeOff style={{ width: "16px", height: "16px" }} />
                      ) : (
                        <Eye style={{ width: "16px", height: "16px" }} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div style={s.errorMsg}>
                      <AlertCircle style={{ width: "10px", height: "10px" }} />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                {/* Recordar sesión */}
                <div style={s.row}>
                  <label style={s.checkLabel}>
                    <input
                      type="checkbox"
                      checked={recordarSesion}
                      onChange={(e) => setRecordarSesion(e.target.checked)}
                      style={{
                        width: "14px",
                        height: "14px",
                        accentColor: "#1A386A",
                      }}
                    />
                    Recordar sesión
                  </label>
                  <a href="#" style={s.link}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {/* Botón submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={s.btn(isLoading)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 style={{ width: "16px", height: "16px" }} />
                      <span>Iniciando...</span>
                    </>
                  ) : (
                    <>
                      <LogInIcon style={{ width: "16px", height: "16px" }} />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </button>

                {/* Links */}
                <div style={s.divider}>
                  <p style={s.linkRow}>
                    ¿No tienes cuenta?{" "}
                    <a href="/registro" style={s.linkBlue}>
                      <UserPlus style={{ width: "12px", height: "12px" }} />
                      Regístrate
                    </a>
                  </p>
                  <p style={{ margin: 0 }}>
                    <a
                      href="/"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#6b7280",
                        textDecoration: "none",
                        fontWeight: "500",
                        fontSize: "12px",
                        background: "none",
                        border: "none",
                        padding: 0,
                      }}
                    >
                      <Home
                        style={{ width: "12px", height: "12px", flexShrink: 0 }}
                      />
                      <span style={{ fontSize: "12px", lineHeight: "1" }}>
                        Volver al inicio
                      </span>
                    </a>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div style={s.footer}>
          <p style={{ margin: 0 }}>
            &copy; {new Date().getFullYear()} ISC Playground
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
