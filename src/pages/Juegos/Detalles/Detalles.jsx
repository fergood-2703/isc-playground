// =====================================================
// PÁGINA: DETALLES DE JUEGO
// =====================================================
//
// Ruta:
// /juego/:id
//
// Esta pantalla combina dos fuentes:
//
// 1. Backend:
//    - nombre
//    - imagen
//    - estado
//    - inscritos
//    - ranking
//    - métricas
//    - mapas
//    - inscripción/cancelación
//
// 2. Front original:
//    - descripción oficial larga
//    - mecánicas
//    - modos
//    - torneo
//    - requisitos
//    - reglas oficiales
//
// Esto evita perder la información oficial que ya existía,
// sin dejar de usar el backend para datos reales.

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../../components/Navbar/Navbar";
import { useApp } from "../../../context/AppContext";
import { getOfficialGameDetail } from "../../../data/officialGameDetails";

import "./Detalles.css";

export default function Detalles() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    // Usuario actual.
    currentUser,

    // Datos del backend.
    gameConfigs,
    rankingsByGame,
    loading,

    // Funciones de inscripción.
    registerToGame,
    cancelRegistration,
    getRegistration,
    getUserRegistration,
    getRegisteredPlayers,
  } = useApp();

  // =====================================================
  // BUSCAR JUEGO
  // =====================================================
  //
  // Soporta:
  // /juego/1
  // /juego/2
  // /juego/3
  // /juego/counter-strike-16
  //
  // El front original usaba legacyId.
  // El backend usa id tipo slug.
  const game = useMemo(() => {
    return gameConfigs.find((item) => {
      return (
        String(item.legacyId) === String(id) || String(item.id) === String(id)
      );
    });
  }, [gameConfigs, id]);

  // =====================================================
  // DETALLE OFICIAL
  // =====================================================
  //
  // Recupera la información oficial del front original.
  // Si el admin crea un juego nuevo, probablemente no tendrá
  // detalle oficial y mostrará fallbacks.
  const official = game ? getOfficialGameDetail(game) : null;

  // =====================================================
  // DATOS DERIVADOS
  // =====================================================

  // Inscripción del usuario actual a este juego.
  const registration = game ? getRegistration(game.id) : null;

  // Inscripción actual del usuario a cualquier juego.
  // Sirve para aplicar la regla:
  // "un usuario solo puede inscribirse a un juego".
  const userRegistration = currentUser ? getUserRegistration?.() : null;

  // Saber si el usuario ya está inscrito en otro juego diferente.
  const isRegisteredInAnotherGame =
    Boolean(userRegistration) &&
    Boolean(game) &&
    userRegistration.gameId !== game.id;

  // Lista de jugadores inscritos al juego actual.
  const registeredPlayers = game ? getRegisteredPlayers(game.id) : [];

  // Ranking del juego actual.
  const ranking = game ? (rankingsByGame[game.id] ?? []) : [];

  // Líder del ranking del juego actual.
  const rankingLeader = ranking[0] ?? null;

  // =====================================================
  // ESTADO: CARGANDO
  // =====================================================

  if (loading) {
    return (
      <div className="detalles-page">
        <Navbar />

        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "white",
          }}
        >
          <h2>Cargando detalles del juego...</h2>
        </div>
      </div>
    );
  }

  // =====================================================
  // ESTADO: JUEGO NO ENCONTRADO
  // =====================================================

  if (!game) {
    return (
      <div className="detalles-page">
        <Navbar />

        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "white",
          }}
        >
          <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>
            Juego no encontrado
          </h2>

          <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
            Puede que el juego haya sido eliminado o que la ruta no coincida con
            su ID.
          </p>

          <button className="btn-volver" onClick={() => navigate("/juegos")}>
            ← Volver a juegos
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // ACCIÓN: INSCRIBIRSE
  // =====================================================

  const handleRegister = async () => {
    // Si no hay sesión, mandamos al login y guardamos la ruta actual.
    // Así, después de iniciar sesión, puede volver a este detalle.
    if (!currentUser) {
      navigate("/login", {
        state: {
          from: `/juego/${id}`,
        },
      });

      return;
    }

    // Si ya está inscrito en este juego, no hacemos nada.
    if (registration) {
      return;
    }

    // Si ya está inscrito en otro juego, bloqueamos desde frontend.
    // El backend también debe bloquearlo.
    if (isRegisteredInAnotherGame) {
      alert(
        "Solo puedes inscribirte a un juego. Cancela tu inscripción actual desde tu perfil antes de elegir otro.",
      );

      return;
    }

    const ok = await registerToGame(game.id);

    if (!ok) {
      alert("No se pudo realizar la inscripción.");
    }
  };

  // =====================================================
  // ACCIÓN: CANCELAR INSCRIPCIÓN
  // =====================================================

  const handleCancelRegistration = async () => {
    if (!registration) return;

    const confirmed = window.confirm(
      "¿Seguro que quieres cancelar tu inscripción?",
    );

    if (!confirmed) return;

    const result = await cancelRegistration(game.id);

    if (!result.ok) {
      alert(result.message || "No se pudo cancelar la inscripción.");
    }
  };

  // =====================================================
  // TEXTO DEL BOTÓN DE INSCRIPCIÓN
  // =====================================================

  const getRegistrationButtonText = () => {
    if (!currentUser) {
      return "Iniciar sesión para inscribirse";
    }

    if (registration) {
      return `✓ Inscrito · ${registration.status}`;
    }

    if (isRegisteredInAnotherGame) {
      return "Ya estás inscrito en otro juego";
    }

    return "Inscribirse";
  };

  return (
    <div className="detalles-page">
      <Navbar />

      <div className="detalles-container">
        {/* BOTÓN VOLVER */}
        <button className="btn-volver" onClick={() => navigate("/juegos")}>
          ← Volver a juegos
        </button>

        {/* =====================================================
            HERO DEL JUEGO
           ===================================================== */}
        <div className="detalles-hero">
          {game.image ? (
            <img src={game.image} alt={game.name} />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #020617, #334155)",
              }}
            />
          )}

          <div className="detalles-hero-overlay" />

          <div className="detalles-hero-info">
            <h1>{official?.nombre ?? game.name}</h1>

            <div className="detalles-badges">
              <span className="badge badge-purple">
                👤 {official?.formato ?? game.maxPlayers ?? game.teamSize}
              </span>

              <span className="badge badge-cyan">
                🎮 {official?.dispositivo ?? game.format}
              </span>

              <span className="badge badge-green">⚡ {game.status}</span>
            </div>
          </div>
        </div>

        {/* =====================================================
            INSCRIPCIÓN
           ===================================================== */}
        <section className="detalles-section enrollment-panel">
          <div>
            <h2>⚡ Inscripción al juego</h2>

            <p>
              Solo puedes inscribirte a un juego. Si quieres cambiar de juego,
              primero debes cancelar tu inscripción actual desde tu perfil.
            </p>

            <div className="enrollment-stats">
              <span>
                <strong>{registeredPlayers.length}</strong> inscritos
              </span>

              <span>
                <strong>{game.status}</strong> estado
              </span>

              <span>
                <strong>{game.format}</strong> modalidad
              </span>

              <span>
                <strong>
                  @{rankingLeader?.player?.username ?? "pendiente"}
                </strong>{" "}
                ranking
              </span>
            </div>
          </div>

          <div className="enrollment-actions">
            <button
              className={
                registration
                  ? "btn-inscribirse btn-registered"
                  : "btn-inscribirse"
              }
              onClick={handleRegister}
              disabled={isRegisteredInAnotherGame && !registration}
            >
              {getRegistrationButtonText()}
            </button>

            {registration && (
              <button
                className="btn-cancelar"
                onClick={handleCancelRegistration}
              >
                Cancelar inscripción
              </button>
            )}

            <button
              className="btn-cancelar"
              onClick={() => navigate("/ranking")}
            >
              Ver ranking
            </button>
          </div>
        </section>

        {/* =====================================================
            DESCRIPCIÓN OFICIAL
           ===================================================== */}
        <section className="detalles-section">
          <h2>🎮 Descripción</h2>

          <p>
            {official?.descripcion ||
              game.description ||
              "Este juego todavía no tiene una descripción configurada."}
          </p>
        </section>

        {/* =====================================================
            MECÁNICAS OFICIALES
           ===================================================== */}
        <section className="detalles-section">
          <h2>⚙️ Mecánicas del juego</h2>

          <div className="mecanicas-grid">
            {official?.mecanicas?.map((mecanica, index) => (
              <div key={index} className="mecanica-item">
                <span className="mecanica-icon">{mecanica.icon}</span>

                <div>
                  <h4>{mecanica.titulo}</h4>
                  <p>{mecanica.desc}</p>
                </div>
              </div>
            ))}

            {!official?.mecanicas?.length && (
              <p>
                Este juego todavía no tiene mecánicas oficiales registradas.
              </p>
            )}
          </div>
        </section>

        {/* =====================================================
            MODOS OFICIALES
           ===================================================== */}
        <section className="detalles-section">
          <h2>🗺️ Modos de juego</h2>

          <div className="modos-grid">
            {official?.modos?.map((modo, index) => (
              <div key={index} className="modo-item">
                <h4>{modo.titulo}</h4>

                <ul>
                  {modo.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            {!official?.modos?.length && (
              <p>No hay modos oficiales registrados para este juego.</p>
            )}
          </div>
        </section>

        {/* =====================================================
            INFORMACIÓN OFICIAL DEL TORNEO
           ===================================================== */}
        <section className="detalles-section">
          <h2>🏆 Información del torneo</h2>

          <div className="torneo-grid">
            <div className="torneo-stat">
              <span>🎯</span>
              <strong>
                {official?.torneo?.modalidad ?? game.matchType ?? game.format}
              </strong>
              <p>Modalidad</p>
            </div>

            <div className="torneo-stat">
              <span>👥</span>
              <strong>{official?.torneo?.formato ?? game.teamSize}</strong>
              <p>Formato</p>
            </div>

            <div className="torneo-stat">
              <span>🗺️</span>
              <strong>
                {official?.torneo?.mapas ||
                  game.maps?.join(", ") ||
                  "Sin mapas"}
              </strong>
              <p>Mapas / modo</p>
            </div>
          </div>

          <div className="fases-list">
            {official?.torneo?.fases?.map((fase, index) => (
              <div key={index} className="fase-item">
                <div className="fase-num">{fase.num}</div>

                <div>
                  <h4>{fase.titulo}</h4>
                  <p>{fase.desc}</p>
                </div>
              </div>
            ))}

            {!official?.torneo?.fases?.length && (
              <p>No hay fases oficiales registradas para este juego.</p>
            )}
          </div>
        </section>

        {/* =====================================================
            SISTEMA DE PUNTUACIÓN DEL BACKEND
           ===================================================== */}
        <section className="detalles-section">
          <h2>📊 Sistema de puntuación</h2>

          <p>
            {game.pointFormula ||
              "Este juego todavía no tiene fórmula de puntuación."}
          </p>

          <div className="reglas-list">
            {game.scoringRules?.map((rule, index) => (
              <div key={rule.key} className="regla-item">
                <span>✅</span>

                <span>
                  {index + 1}. {rule.label}{" "}
                  {rule.direction === "asc"
                    ? "(menor es mejor)"
                    : "(mayor es mejor)"}
                </span>
              </div>
            ))}

            {(!game.scoringRules || game.scoringRules.length === 0) && (
              <div className="regla-item">
                <span>ℹ️</span>
                <span>Sin reglas de puntuación configuradas.</span>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            MÉTRICAS DINÁMICAS DEL BACKEND
           ===================================================== */}
        <section className="detalles-section">
          <h2>⚙️ Métricas registrables</h2>

          <div className="mecanicas-grid">
            {game.metrics?.map((metric) => (
              <div key={metric.key} className="mecanica-item">
                <span className="mecanica-icon">🎯</span>

                <div>
                  <h4>{metric.label}</h4>

                  <p>
                    Key: <strong>{metric.key}</strong> · Tipo: {metric.type}
                  </p>
                </div>
              </div>
            ))}

            {(!game.metrics || game.metrics.length === 0) && (
              <p>Sin métricas configuradas.</p>
            )}
          </div>
        </section>

        {/* =====================================================
            MAPAS / MODOS CONFIGURADOS EN BACKEND
           ===================================================== */}
        <section className="detalles-section">
          <h2>🧩 Mapas o modos configurados</h2>

          <div className="modos-grid">
            {game.maps?.map((map) => (
              <div key={map} className="modo-item">
                <h4>{map}</h4>

                <ul>
                  <li>Disponible para partidas del torneo.</li>
                </ul>
              </div>
            ))}

            {(!game.maps || game.maps.length === 0) && (
              <p>No hay mapas o modos configurados desde el backend.</p>
            )}
          </div>
        </section>

        {/* =====================================================
            REQUISITOS OFICIALES
           ===================================================== */}
        <section className="detalles-section">
          <h2>📋 Requisitos para participar</h2>

          <div className="requisitos-list">
            {official?.requisitos?.map((requisito, index) => (
              <div key={index} className="requisito-item">
                <span>{requisito.icon}</span>
                <span>{requisito.texto}</span>
              </div>
            ))}

            {!official?.requisitos?.length && (
              <p>No hay requisitos oficiales registrados para este juego.</p>
            )}
          </div>
        </section>

        {/* =====================================================
            REGLAS OFICIALES DEL TORNEO
           ===================================================== */}
        <section className="detalles-section">
          <h2>📜 Reglas del torneo</h2>

          <div className="reglas-list">
            {official?.reglas?.map((regla, index) => (
              <div
                key={index}
                className={`regla-item ${
                  regla.prohibida ? "regla-prohibida" : ""
                }`}
              >
                <span>{regla.prohibida ? "🚫" : "✅"}</span>
                <span>{regla.texto}</span>
              </div>
            ))}

            {!official?.reglas?.length && (
              <p>No hay reglas oficiales registradas para este juego.</p>
            )}
          </div>
        </section>

        {/* =====================================================
            JUGADORES INSCRITOS
           ===================================================== */}
        <section className="detalles-section">
          <h2>👥 Jugadores inscritos</h2>

          <div className="registered-list">
            {registeredPlayers.length === 0 && (
              <p>Todavía no hay jugadores inscritos.</p>
            )}

            {registeredPlayers.map((player) => (
              <article key={player.id}>
                <strong>{player.name}</strong>
                <span>@{player.username}</span>
                <em>{player.registrationStatus}</em>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
