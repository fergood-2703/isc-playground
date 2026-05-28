// =============================
// PÁGINA DE PERFIL
// =============================

// Muestra estadísticas del jugador, juegos inscritos e historial.
// Permite editar nombre visible y username.
// El campo contraseña se eliminó — no hay endpoint para cambiarlo.

import { useMemo, useState } from "react"
import Navbar from "../../components/Navbar/Navbar"
import { useApp } from "../../context/AppContext"
import api from "../../api/axios.js"
import "./Perfil.css"

export default function Perfil() {
  const {
    currentUser, updateCurrentUser,
    gameConfigs, rankingsByGame, globalLeaderboard,
    matches, registrations, cancelRegistration,
  } = useApp()

  const safeUser = currentUser ?? { id: "", name: "Invitado", username: "guest" }

  const [profile, setProfile] = useState({
    username: safeUser.username,
    name: safeUser.name,
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")

  // ─────────────────────────────
  // ESTADÍSTICAS GLOBALES
  // ─────────────────────────────
  const globalStats = useMemo(
    () => globalLeaderboard.find((row) => row.player.id === safeUser.id),
    [globalLeaderboard, safeUser.id]
  )
  const globalRank = useMemo(
    () => globalLeaderboard.findIndex((row) => row.player.id === safeUser.id) + 1,
    [globalLeaderboard, safeUser.id]
  )

  // Historial e inscripciones del usuario actual
  const history = matches.filter((match) => match.playerIds.includes(safeUser.id))
  const userRegistrations = registrations.filter((reg) => reg.userId === safeUser.id)

  // ─────────────────────────────
  // GUARDAR CAMBIOS DEL PERFIL
  // ─────────────────────────────
  // Solo actualiza username y name
  // El id se manda como número puro — extractNumericId en el service lo maneja igual
  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaveLoading(true)
    setSaveError("")
    setSaveSuccess("")
    try {
      const numericId = safeUser.id.replace("u-", "")
      const response = await api.patch(`/users/${numericId}`, {
        username: profile.username,
        name: profile.name,
      })
      updateCurrentUser(response.data.user)
      setSaveSuccess("Perfil actualizado exitosamente")
    } catch (err) {
      setSaveError(err.response?.data?.error || "Error al guardar cambios")
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-container">

        {/* HERO */}
        <section className="profile-hero">
          <div className="profile-avatar">{safeUser.username?.slice(0, 2).toUpperCase()}</div>
          <div className="profile-identity">
            <p>PERFIL DEL JUGADOR</p>
            <h1>{safeUser.name}</h1>
            <span>@{safeUser.username} · Ranking global #{globalRank || "—"}</span>
          </div>
          <div className="profile-rank">
            <strong>{Math.round(globalStats?.score ?? 0)}</strong>
            <span>power score</span>
          </div>
        </section>

        <section className="profile-grid">
          {/* FORMULARIO DE EDICIÓN */}
          <form className="profile-panel" onSubmit={handleSubmit}>
            <h2>Configuración rápida</h2>
            {saveSuccess && <p style={{ color: "green", fontSize: 13 }}>{saveSuccess}</p>}
            {saveError && <p style={{ color: "red", fontSize: 13 }}>{saveError}</p>}
            <label>Nombre visible
              <input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </label>
            <label>Username
              <input
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              />
            </label>
            <button disabled={saveLoading}>
              {saveLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>

          {/* ESTADÍSTICAS COMPETITIVAS */}
          <section className="profile-panel stats-panel">
            <h2>Rendimiento competitivo</h2>
            <div className="profile-stats">
              <div><strong>{globalStats?.matchesPlayed ?? 0}</strong><span>Partidas</span></div>
              <div><strong>{globalStats?.wins ?? 0}</strong><span>Victorias</span></div>
              <div><strong>{globalStats?.kills ?? 0}</strong><span>Kills</span></div>
              <div><strong>{globalStats?.damage ?? 0}</strong><span>Daño</span></div>
              <div><strong>{globalStats?.bossesDefeated ?? 0}</strong><span>Bosses</span></div>
              <div>
                <strong>
                  {Math.round(
                    (globalStats?.wins ?? 0) * 100 /
                    Math.max(globalStats?.matchesPlayed ?? 1, 1)
                  )}%
                </strong>
                <span>Win rate</span>
              </div>
            </div>
          </section>
        </section>

        {/* JUEGOS INSCRITOS */}
        <section className="profile-panel">
          <h2>Juegos inscritos</h2>
          <div className="profile-games">
            {userRegistrations.length === 0 && <p>No estás inscrito en ningún juego.</p>}
            {userRegistrations.map((registration) => {
              const game = gameConfigs.find((item) => item.id === registration.gameId)
              const row = rankingsByGame[registration.gameId]?.find(
                (item) => item.player.id === safeUser.id
              )
              if (!game) return null
              return (
                <article key={registration.id} style={{ "--accent": game.accent }}>
                  <img src={game.image} alt={game.name} />
                  <div>
                    <strong>{game.shortName}</strong>
                    <span>
                      {registration.status} ·{" "}
                      {row
                        ? `Ranking #${row.rank} · ${Math.round(row.score ?? 0)} pts`
                        : "sin partidas"}
                    </span>
                  </div>
                  {/* Solo permite cancelar si no está "en torneo" */}
                  {registration.status !== "en torneo" && (
                    <button
                      type="button"
                      onClick={() => cancelRegistration(game.id, safeUser.id)}
                    >
                      Cancelar
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        <section className="profile-grid lower">
          {/* HISTORIAL */}
          <section className="profile-panel">
            <h2>Historial reciente</h2>
            <div className="profile-history">
              {history.length === 0 && <p>No tienes partidas registradas.</p>}
              {history.map((match) => {
                const game = gameConfigs.find((item) => item.id === match.gameId)
                return (
                  <article key={match.id}>
                    <strong>{game?.name}</strong>
                    <span>{match.phaseType} · {match.stage}</span>
                    <em>{match.status}</em>
                  </article>
                )
              })}
            </div>
          </section>

          {/* LOGROS — estáticos por ahora, no hay modelo en BD para esto */}
          <section className="profile-panel trophy-panel">
            <h2>Logros / trofeos</h2>
            <div className="trophy-grid">
              {["MVP Neon", "Boss Hunter", "Clutch 1v3", "Top 3 Global"].map((trophy) => (
                <div key={trophy}>
                  <span>◆</span>
                  <strong>{trophy}</strong>
                  <small>Desbloqueado</small>
                </div>
              ))}
            </div>
          </section>
        </section>

      </main>
    </div>
  )
}