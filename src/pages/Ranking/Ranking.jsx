import { useState } from "react"
import { Medal, Trophy } from "lucide-react"
import { useApp } from "../../../context/AppContext"
import { getMetricLabel } from "../../../utils/rankingEngine"
import "./Ranking.css"

export default function Ranking() {
  const { gameConfigs, rankingsByGame, globalLeaderboard, loading } = useApp()

  if (loading || !gameConfigs.length) {
    return <div className="admin-page ranking-admin"><p>Cargando rankings...</p></div>
  }

  return <RankingInner
    gameConfigs={gameConfigs}
    rankingsByGame={rankingsByGame}
    globalLeaderboard={globalLeaderboard}
  />
}

function RankingInner({ gameConfigs, rankingsByGame, globalLeaderboard }) {
  const [selectedGameId, setSelectedGameId] = useState(gameConfigs[0].id)
  const selectedGame = gameConfigs.find((game) => game.id === selectedGameId)
  const ranking = rankingsByGame[selectedGameId] ?? []

  return (
    <div className="admin-page ranking-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Ranking individual</span>
          <h2>Ganadores por usuario, no por equipo</h2>
          <p>
            El ranking global y por juego usa puntos individuales, estadísticas del usuario e
            historial de partidas. Los equipos solo organizan rondas.
          </p>
        </div>
      </div>

      <div className="podium-grid">
        {globalLeaderboard.slice(0, 3).map((row, index) => (
          <article className={`podium-card rank-${index + 1}`} key={row.player.id}>
            <Medal />
            <span>#{index + 1}</span>
            <h3>@{row.player.username}</h3>
            <strong>{Math.round(row.score ?? 0)} pts</strong>
            <small>{row.matchesPlayed} partidas · {row.wins} victorias</small>
          </article>
        ))}
        {globalLeaderboard.length === 0 && (
          <p style={{ gridColumn: "1/-1" }}>No hay datos de ranking aún. Juega partidas para generar el ranking.</p>
        )}
      </div>

      <div className="ranking-tabs">
        {gameConfigs.map((game) => (
          <button
            key={game.id}
            className={selectedGameId === game.id ? "active" : ""}
            onClick={() => setSelectedGameId(game.id)}
            style={{ "--accent": game.accent }}
          >
            {game.shortName}
          </button>
        ))}
      </div>

      <section className="panel-card ranking-board" style={{ "--accent": selectedGame?.accent }}>
        <div className="section-title">
          <div>
            <span className="eyebrow">{selectedGame?.name}</span>
            <h3>Tabla individual por reglas oficiales</h3>
          </div>
          <Trophy />
        </div>

        <div className="rule-strip">
          <span>Puntos manuales primero</span>
          {selectedGame?.scoringRules?.map((rule, index) => (
            <span key={rule.key}>{index + 1}. {rule.label}</span>
          ))}
        </div>

        <table className="modern-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Usuario</th>
              <th>Puntos</th>
              <th>Partidas</th>
              <th>Victorias</th>
              {selectedGame?.scoringRules?.map((rule) => (
                <th key={rule.key}>{getMetricLabel(selectedGame, rule.key)}</th>
              ))}
              <th>Historial</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length === 0 ? (
              <tr>
                <td colSpan={6 + (selectedGame?.scoringRules?.length ?? 0)} style={{ textAlign: "center", padding: "24px" }}>
                  Sin datos — completa partidas para ver el ranking.
                </td>
              </tr>
            ) : (
              ranking.map((row) => (
                <tr key={row.player.id}>
                  <td><span className="rank-chip">#{row.rank}</span></td>
                  <td>
                    <strong>{row.player.name}</strong>
                    <small>@{row.player.username}</small>
                  </td>
                  <td>{row.totalPoints}</td>
                  <td>{row.matchesPlayed}</td>
                  <td>{row.wins}</td>
                  {selectedGame?.scoringRules?.map((rule) => (
                    <td key={rule.key}>{row.totals?.[rule.key] ?? 0}</td>
                  ))}
                  <td>{row.history?.length ?? 0} registros</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}