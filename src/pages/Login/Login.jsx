import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import logo from "../../assets/images/playground-logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [activeInput, setActiveInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  // ✅ SIN ERROR (no usamos Math.random directo en render)
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${(i * 37) % 100}%`, // pseudo-random SIN Math.random
      delay: `${(i * 0.7) % 10}s`,
    }));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    navigate("/");
  };

  return (
    <div className="login-page">

      {/* partículas */}
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            left: p.left,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* CARD */}
      <div className={`login-card ${activeInput ? "focus" : ""}`}>

        {/* HEADER */}
        <div className="login-header">

          <div className="logo-wrapper">
            <img src={logo} alt="ISC Playground Logo" />
          </div>

          <h2>Bienvenido</h2>
          <p>ISC Playground</p>

        </div>

        {/* FORM */}
        <form className="login-body" onSubmit={handleSubmit}>

          {/* USER / EMAIL */}
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

              <span
                className="eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>

          {/* BUTTON */}
          <button type="submit" className="login-btn">
            Iniciar sesión
          </button>

          {/* LINKS */}
          {/* LINKS */}
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