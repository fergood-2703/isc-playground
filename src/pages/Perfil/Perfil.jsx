import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { useApp } from "../../context/AppContext";
import api from "../../api/axios.js";
import "./Perfil.css";

const trophies = ["MVP Neon", "Boss Hunter", "Clutch 1v3", "Top 3 Global"];

export default function Perfil() {
  const { currentUser, updateCurrentUser, gameConfigs, rankingsByGame, globalLeaderboard, matches, registrations, cancelRegistration } = useApp();
  
  // Usamos currentUser real del backend en lugar de buscar en players mockeados
  const safeUser = currentUser ?? { id: "", name: "Invitado", username: "guest" }
  
  const [profile, setProfile] = useState({ 
    username: safeUser.username, 
    name: safeUser.name, 
    password: "" 
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")

  // Estadísticas globales del usuario actual
  const globalStats = useMemo(() => 
    globalLeaderboard.find((row) => row.player.id === safeUser.id), 
    [globalLeaderboard, safeUser.id]
  )
  const globalRank = useMemo(() => 
    globalLeaderboard.findIndex((row) => row.player.id === safeUser.id) + 1, 
    [globalLeaderboard, safeUser.id]
  )

  // Historial e inscripciones del usuario actual
  const history = matches.filter((match) => match.playerIds.includes(safeUser.id))
  const userRegistrations = registrations.filter((reg) => reg.userId === safeUser.id)

  // ─────────────────────────────
  // GUARDAR CAMBIOS DEL PERFIL
  // ─────────────────────────────
  // Llama al backend para actualizar username y name
  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaveLoading(true)
    setSaveError("")
    setSaveSuccess("")

    try {
      // Extraemos el id numérico de "u-4" → 4
      const numericId = safeUser.id.replace("u-", "")

      const response = await api.patch(`/users/${numericId}`, {
        username: profile.username,
        name: profile.name
      })

      // Actualizamos el contexto y localStorage con los datos nuevos
      updateCurrentUser(response.data.user)
      setSaveSuccess("Perfil actualizado exitosamente")
      setProfile((prev) => ({ ...prev, password: "" }))
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
          <form className="profile-panel" onSubmit={handleSubmit}>
            <h2>Configuración rápida</h2>

            {/* Mensajes de éxito o error */}
            {saveSuccess && <p style={{ color: "green" }}>{saveSuccess}</p>}
            {saveError && <p style={{ color: "red" }}>{saveError}</p>}

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
            <label>Nueva contraseña
              <input 
                type="password" 
                value={profile.password} 
                onChange={(e) => setProfile({ ...profile, password: e.target.value })} 
                placeholder="••••••••" 
              />
            </label>
            <button disabled={saveLoading}>
              {saveLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>

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
                  {Math.round((globalStats?.wins ?? 0) * 100 / Math.max(globalStats?.matchesPlayed ?? 1, 1))}%
                </strong>
                <span>Win rate</span>
              </div>
            </div>
          </section>
        </section>

        <section className="profile-panel">
          <h2>Juegos inscritos</h2>
          <div className="profile-games">
            {userRegistrations.length === 0 && <p>No estás inscrito en ningún juego.</p>}
            {userRegistrations.map((registration) => {
              const game = gameConfigs.find((item) => item.id === registration.gameId)
              const row = rankingsByGame[registration.gameId]?.find((item) => item.player.id === safeUser.id)
              if (!game) return null
              return (
                <article key={registration.id} style={{ "--accent": game.accent }}>
                  <img src={game.image} alt={game.name} />
                  <div>
                    <strong>{game.shortName}</strong>
                    <span>
                      {registration.status} · {row ? `Ranking #${row.rank} · ${Math.round(row.score)} pts` : "sin partidas"}
                    </span>
                  </div>
                  {registration.status !== "en torneo" && (
                    <button type="button" onClick={() => cancelRegistration(game.id, safeUser.id)}>
                      Cancelar
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        <section className="profile-grid lower">
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

          <section className="profile-panel trophy-panel">
            <h2>Logros / trofeos</h2>
            <div className="trophy-grid">
              {trophies.map((trophy) => (
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