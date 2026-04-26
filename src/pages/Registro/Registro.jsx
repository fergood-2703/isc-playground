import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Home,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

const Registro = () => {
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
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    carrera: "",
    semestre: "",
    telefono: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.nombres.trim()) newErrors.nombres = "Los nombres son requeridos";
    if (!form.apellidos.trim())
      newErrors.apellidos = "Los apellidos son requeridos";
    if (!form.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Correo inválido";
    }
    if (!form.confirmEmail.trim()) {
      newErrors.confirmEmail = "Confirma tu correo";
    } else if (form.email !== form.confirmEmail) {
      newErrors.confirmEmail = "Los correos no coinciden";
    }
    if (!form.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (form.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    if (!form.carrera) newErrors.carrera = "La carrera es requerida";
    if (!form.semestre) newErrors.semestre = "El semestre es requerido";
    if (!form.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!/^[0-9]{10}$/.test(form.telefono.replace(/\s/g, ""))) {
      newErrors.telefono = "Teléfono inválido (10 dígitos)";
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
      const { confirmEmail, ...dataToSend } = form;
      // TODO: conectar con el backend
      // const response = await registrarEstudiante(dataToSend);
      setSuccessMessage("¡Cuenta creada exitosamente!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setApiError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const input = (hasError, extraPadding = false) => ({
    width: "100%",
    paddingLeft: "32px",
    paddingRight: extraPadding ? "36px" : "12px",
    paddingTop: "8px",
    paddingBottom: "8px",
    fontSize: "13px",
    border: `1px solid ${hasError ? "#fca5a5" : "#d1d5db"}`,
    borderRadius: "8px",
    outline: "none",
    color: "#111827",
    background: "white",
    boxSizing: "border-box",
  });

  const iconLeft = {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "15px",
    height: "15px",
    color: "#9ca3af",
  };
  const errorMsg = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#ef4444",
    fontSize: "11px",
    marginTop: "3px",
  };
  const label = {
    fontSize: "12px",
    fontWeight: "500",
    color: "#374151",
    display: "block",
    marginBottom: "3px",
  };
  const grid2 = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "linear-gradient(135deg, #f8fafc, #eff6ff, #f8fafc)",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "720px" }}>
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
            overflow: "hidden",
            border: "1px solid #f1f5f9",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #1A386A, #1e3a8a)",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
              }}
            >
              <UserPlus
                style={{ width: "28px", height: "28px", color: "white" }}
              />
            </div>
            <h2
              style={{
                color: "white",
                fontSize: "22px",
                fontWeight: "800",
                margin: "0 0 4px",
              }}
            >
              Registro Estudiante
            </h2>
            <p style={{ color: "#bfdbfe", fontSize: "12px", margin: 0 }}>
              Crea tu cuenta en el sistema
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 32px" }}>
            {apiError && (
              <div
                style={{
                  marginBottom: "12px",
                  padding: "10px 12px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  display: "flex",
                  gap: "8px",
                }}
              >
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
              <div
                style={{
                  marginBottom: "12px",
                  padding: "10px 12px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  display: "flex",
                  gap: "8px",
                }}
              >
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
                  gap: "12px",
                }}
              >
                {/* Nombres y Apellidos */}
                <div style={grid2}>
                  <div>
                    <label style={label}>
                      Nombres <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <User style={iconLeft} />
                      <input
                        type="text"
                        name="nombres"
                        value={form.nombres}
                        onChange={handleInputChange}
                        style={input(errors.nombres)}
                      />
                    </div>
                    {errors.nombres && (
                      <div style={errorMsg}>
                        <AlertCircle
                          style={{ width: "10px", height: "10px" }}
                        />
                        <span>{errors.nombres}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={label}>
                      Apellidos <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <User style={iconLeft} />
                      <input
                        type="text"
                        name="apellidos"
                        value={form.apellidos}
                        onChange={handleInputChange}
                        style={input(errors.apellidos)}
                      />
                    </div>
                    {errors.apellidos && (
                      <div style={errorMsg}>
                        <AlertCircle
                          style={{ width: "10px", height: "10px" }}
                        />
                        <span>{errors.apellidos}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email y Confirmar Email */}
                <div style={grid2}>
                  <div>
                    <label style={label}>
                      Correo Electrónico{" "}
                      <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Mail style={iconLeft} />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="usuario@correo.com"
                        style={input(errors.email)}
                      />
                    </div>
                    {errors.email && (
                      <div style={errorMsg}>
                        <AlertCircle
                          style={{ width: "10px", height: "10px" }}
                        />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={label}>
                      Confirmar Correo{" "}
                      <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Mail style={iconLeft} />
                      <input
                        type="email"
                        name="confirmEmail"
                        value={form.confirmEmail}
                        onChange={handleInputChange}
                        style={input(errors.confirmEmail)}
                      />
                    </div>
                    {errors.confirmEmail && (
                      <div style={errorMsg}>
                        <AlertCircle
                          style={{ width: "10px", height: "10px" }}
                        />
                        <span>{errors.confirmEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contraseñas */}
                <div style={grid2}>
                  <div>
                    <label style={label}>
                      Contraseña <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock style={iconLeft} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        style={input(errors.password, true)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#9ca3af",
                          padding: 0,
                          display: "flex",
                        }}
                      >
                        {showPassword ? (
                          <EyeOff style={{ width: "15px", height: "15px" }} />
                        ) : (
                          <Eye style={{ width: "15px", height: "15px" }} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <div style={errorMsg}>
                        <AlertCircle
                          style={{ width: "10px", height: "10px" }}
                        />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={label}>
                      Confirmar <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock style={iconLeft} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleInputChange}
                        style={input(errors.confirmPassword, true)}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#9ca3af",
                          padding: 0,
                          display: "flex",
                        }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff style={{ width: "15px", height: "15px" }} />
                        ) : (
                          <Eye style={{ width: "15px", height: "15px" }} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div style={errorMsg}>
                        <AlertCircle
                          style={{ width: "10px", height: "10px" }}
                        />
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Carrera y Semestre */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label style={label}>
                      Carrera <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <GraduationCap style={iconLeft} />
                      <select
                        name="carrera"
                        value={form.carrera}
                        onChange={handleInputChange}
                        style={{ ...input(errors.carrera), appearance: "none" }}
                      >
                        <option value="">Selecciona</option>
                        <option value="Ingeniería Industrial">
                          Ing. Industrial
                        </option>
                        <option value="Ingeniería en Sistemas Computacionales">
                          Ing. Sistemas
                        </option>
                        <option value="Ingeniería en Industrias Alimentarias">
                          Ing. Alimentarias
                        </option>
                        <option value="Ingeniería en Administración">
                          Ing. Administración
                        </option>
                        <option value="Ingeniería en Gestión Empresarial">
                          Ing. Gestión Emp.
                        </option>
                        <option value="Ingeniería en Desarrollo Comunitario">
                          Ing. Des. Comunitario
                        </option>
                      </select>
                    </div>
                    {errors.carrera && (
                      <div style={errorMsg}>
                        <AlertCircle
                          style={{ width: "10px", height: "10px" }}
                        />
                        <span>{errors.carrera}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={label}>
                      Semestre <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      name="semestre"
                      value={form.semestre}
                      onChange={handleInputChange}
                      style={{ ...input(errors.semestre), paddingLeft: "12px" }}
                    >
                      <option value="">-</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.semestre && (
                      <div style={errorMsg}>
                        <AlertCircle
                          style={{ width: "10px", height: "10px" }}
                        />
                        <span>{errors.semestre}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Teléfono */}
                <div>
                  <label style={label}>
                    Teléfono <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone style={iconLeft} />
                    <input
                      type="tel"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleInputChange}
                      placeholder="10 dígitos"
                      maxLength={10}
                      style={input(errors.telefono)}
                    />
                  </div>
                  {errors.telefono && (
                    <div style={errorMsg}>
                      <AlertCircle style={{ width: "10px", height: "10px" }} />
                      <span>{errors.telefono}</span>
                    </div>
                  )}
                </div>

                {/* Botón */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    background: isLoading ? "#94a3b8" : "#1A386A",
                    color: "white",
                    fontWeight: "700",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 style={{ width: "16px", height: "16px" }} />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus style={{ width: "16px", height: "16px" }} />
                      <span>Crear Cuenta</span>
                    </>
                  )}
                </button>

                {/* Links */}
                <div
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "12px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>
                    ¿Ya tienes cuenta?{" "}
                    <a
                      href="/login"
                      style={{
                        fontWeight: "600",
                        color: "#1A386A",
                        textDecoration: "none",
                      }}
                    >
                      Inicia sesión
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
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      <Home style={{ width: "12px", height: "12px" }} />
                      Volver al inicio
                    </a>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;
