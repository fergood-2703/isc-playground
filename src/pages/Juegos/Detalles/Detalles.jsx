// =====================================================
// PÁGINA: DETALLES DE JUEGO
// =====================================================
//
// Ruta:
// /juego/:id
//
// Esta pantalla muestra la información de un juego.
// Antes dependía de datos estáticos del frontend.
// Ahora usa gameConfigs cargado desde el backend.
//
// Soporta dos tipos de URL:
// /juego/1
// /juego/2
// /juego/counter-strike-16
//
// Esto ayuda porque el proyecto original usaba legacyId,
// pero el backend usa id tipo slug.

import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Navbar from "../../../components/Navbar/Navbar"
import { useApp } from "../../../context/AppContext"
import "./Detalles.css"

export default function Detalles() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    currentUser,
    gameConfigs,
    rankingsByGame,
    registerToGame,
    cancelRegistration,
    getRegistration,
    getRegisteredPlayers,
    loading,
  } = useApp()

  // =====================================================
  // BUSCAR JUEGO
  // =====================================================
  //
  // Permite encontrar el juego por:
  // - legacyId: /juego/1
  // - id real: /juego/counter-strike-16
  const game = useMemo(() => {
    return gameConfigs.find((item) => {
      return (
        String(item.legacyId) === String(id) ||
        String(item.id) === String(id)
      )
    })
  }, [gameConfigs, id])

  // Datos derivados del juego.
  const registration = game ? getRegistration(game.id) : null
  const registeredPlayers = game ? getRegisteredPlayers(game.id) : []
  const ranking = game ? rankingsByGame[game.id] ?? [] : []
  const rankingLeader = ranking[0] ?? null

  // =====================================================
  // LOADING
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
    )
  }

  // =====================================================
  // JUEGO NO ENCONTRADO
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
            Puede que el juego haya sido eliminado o que la ruta no coincida
            con su ID.
          </p>

          <button
            className="btn-volver"
            onClick={() => navigate("/juegos")}
          >
            ← Volver a juegos
          </button>
        </div>
      </div>
    )
  }

  // =====================================================
  // ACCIONES DE INSCRIPCIÓN
  // =====================================================

  const handleRegister = async () => {
    if (!currentUser) {
      navigate("/login", {
        state: {
          from: `/juego/${id}`,
        },
      })

      return
    }

    if (!registration) {
      const ok = await registerToGame(game.id)

      if (!ok) {
        alert("No se pudo realizar la inscripción.")
      }
    }
  }

  const handleCancelRegistration = async () => {
    if (!registration) return

    const confirmed = window.confirm(
      "¿Seguro que quieres cancelar tu inscripción?"
    )

    if (!confirmed) return

    const ok = await cancelRegistration(game.id)

    if (!ok) {
      alert("No se pudo cancelar la inscripción.")
    }
  }

  return (
    <div className="detalles-page">
      <Navbar />

      <div className="detalles-container">
        {/* BOTÓN VOLVER */}
        <button
          className="btn-volver"
          onClick={() => navigate("/juegos")}
        >
          ← Volver a juegos
        </button>

        {/* HERO */}
        <div className="detalles-hero">
          {game.image ? (
            <img src={game.image} alt={game.name} />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(135deg, #020617, #334155)",
              }}
            />
          )}

          <div className="detalles-hero-overlay" />

          <div className="detalles-hero-info">
            <h1>{game.name}</h1>

            <div className="detalles-badges">
              <span className="badge badge-purple">
                👤 {game.maxPlayers ?? game.teamSize}
              </span>

              <span className="badge badge-cyan">
                🎮 {game.format}
              </span>

              <span className="badge badge-green">
                ⚡ {game.status}
              </span>
            </div>
          </div>
        </div>

        {/* INSCRIPCIÓN */}
        <section className="detalles-section enrollment-panel">
          <div>
            <h2>⚡ Inscripción al juego</h2>

            <p>
              Primero te inscribes al juego. Luego el administrador forma
              equipos temporales con jugadores inscritos para cada partida,
              ronda o fase.
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
            >
              {!currentUser
                ? "Iniciar sesión para inscribirse"
                : registration
                  ? `✓ Inscrito · ${registration.status}`
                  : "Inscribirse"}
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

        {/* DESCRIPCIÓN */}
        <section className="detalles-section">
          <h2>🎮 Descripción</h2>

          <p>
            {game.description ||
              "Este juego todavía no tiene una descripción configurada."}
          </p>
        </section>

        {/* INFORMACIÓN DEL TORNEO */}
        <section className="detalles-section">
          <h2>🏆 Información del torneo</h2>

          <div className="torneo-grid">
            <div className="torneo-stat">
              <span>🎯</span>
              <strong>{game.matchType ?? game.format}</strong>
              <p>Tipo de partida</p>
            </div>

            <div className="torneo-stat">
              <span>👥</span>
              <strong>{game.teamSize}</strong>
              <p>Jugadores / equipo</p>
            </div>

            <div className="torneo-stat">
              <span>⏱️</span>
              <strong>{game.duration}</strong>
              <p>Duración</p>
            </div>
          </div>
        </section>

        {/* REGLAS DE PUNTUACIÓN */}
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
                <span>Sin reglas configuradas.</span>
              </div>
            )}
          </div>
        </section>

        {/* MÉTRICAS */}
        <section className="detalles-section">
          <h2>⚙️ Métricas registrables</h2>

          <div className="mecanicas-grid">
            {game.metrics?.map((metric) => (
              <div key={metric.key} className="mecanica-item">
                <span className="mecanica-icon">🎯</span>

                <div>
                  <h4>{metric.label}</h4>

                  <p>
                    Key: <strong>{metric.key}</strong> · Tipo:{" "}
                    {metric.type}
                  </p>
                </div>
              </div>
            ))}

            {(!game.metrics || game.metrics.length === 0) && (
              <p>Sin métricas configuradas.</p>
            )}
          </div>
        </section>

        {/* MAPAS / MODOS */}
        <section className="detalles-section">
          <h2>🗺️ Mapas / modos</h2>

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
              <p>No hay mapas o modos configurados.</p>
            )}
          </div>
        </section>

        {/* LISTA DE INSCRITOS */}
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
  )
}