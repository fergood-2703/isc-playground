// =====================================================
// DASHBOARD > RANKINGS
// =====================================================
//
// Esta vista permite al admin revisar:
// - Top 3 global.
// - Ranking individual por juego.
// - Métricas usadas para ordenar.
// - Historial de registros por jugador.
//
// Corrección importante:
// Antes esta vista usaba gameConfigs[0].id directamente.
// Si los juegos no habían cargado todavía, podía romper.
// Ahora protegemos estados vacíos.

import { useEffect, useMemo, useState } from "react"
import { Medal, Trophy } from "lucide-react"

import { useApp } from "../../../context/AppContext"
import { getMetricLabel } from "../../../utils/rankingEngine"
import "./Ranking.css"

export default function Ranking() {
  const {
    gameConfigs,
    rankingsByGame,
    globalLeaderboard,
    loading,
  } = useApp()

  // Juego seleccionado.
  // Inicia null para evitar leer gameConfigs[0] antes de tiempo.
  const [selectedGameId, setSelectedGameId] = useState(null)

  // =====================================================
  // SELECCIÓN SEGURA DE JUEGO
  // =====================================================
  //
  // Cuando los juegos cargan, seleccionamos el primero.
  // Si se elimina un juego y era el seleccionado, elegimos otro.
  useEffect(() => {
    if (gameConfigs.length === 0) {
      setSelectedGameId(null)
      return
    }

    const exists = gameConfigs.some((game) => game.id === selectedGameId)

    if (!selectedGameId || !exists) {
      setSelectedGameId(gameConfigs[0].id)
    }
  }, [gameConfigs, selectedGameId])

  const selectedGame = useMemo(() => {
    return gameConfigs.find((game) => game.id === selectedGameId) ?? null
  }, [gameConfigs, selectedGameId])

  const ranking = selectedGameId
    ? rankingsByGame[selectedGameId] ?? []
    : []

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-page ranking-admin">
        <div className="page-head">
          <div>
            <span className="eyebrow">Ranking individual</span>
            <h2>Cargando rankings...</h2>
            <p>
              Espera mientras se consultan partidas finalizadas y resultados.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // =====================================================
  // SIN JUEGOS
  // =====================================================

  if (!gameConfigs.length || !selectedGame) {
    return (
      <div className="admin-page ranking-admin">
        <div className="page-head">
          <div>
            <span className="eyebrow">Ranking individual</span>
            <h2>No hay juegos disponibles</h2>
            <p>
              Primero crea juegos, equipos y partidas finalizadas para generar
              rankings.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page ranking-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Ranking individual</span>
          <h2>Ganadores por usuario, no por equipo</h2>
          <p>
            El ranking global y por juego usa puntos individuales, estadísticas
            del usuario e historial de partidas. Los equipos solo organizan
            rondas.
          </p>
        </div>
      </div>

      {/* PODIO GLOBAL */}
      <div className="podium-grid">
        {globalLeaderboard.slice(0, 3).map((row, index) => (
          <article
            className={`podium-card rank-${index + 1}`}
            key={row.player?.id ?? index}
          >
            <Medal />
            <span>#{index + 1}</span>

            <h3>
              @{row.player?.username ?? "sin_usuario"}
            </h3>

            <strong>{Math.round(row.score ?? 0)} pts</strong>

            <small>
              {row.matchesPlayed ?? 0} partidas · {row.wins ?? 0} victorias
            </small>
          </article>
        ))}

        {globalLeaderboard.length === 0 && (
          <article className="podium-card">
            <Medal />
            <span>—</span>
            <h3>Sin líder global</h3>
            <strong>0 pts</strong>
            <small>Finaliza partidas para generar ranking.</small>
          </article>
        )}
      </div>

      {/* TABS DE JUEGOS */}
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

      {/* TABLA POR JUEGO */}
      <section
        className="panel-card ranking-board"
        style={{ "--accent": selectedGame.accent }}
      >
        <div className="section-title">
          <div>
            <span className="eyebrow">{selectedGame.name}</span>
            <h3>Tabla individual por reglas oficiales</h3>
          </div>

          <Trophy />
        </div>

        <div className="rule-strip">
          <span>Puntos manuales primero</span>

          {selectedGame.scoringRules?.map((rule, index) => (
            <span key={rule.key}>
              {index + 1}. {rule.label}
            </span>
          ))}

          {(!selectedGame.scoringRules ||
            selectedGame.scoringRules.length === 0) && (
            <span>Sin reglas configuradas</span>
          )}
        </div>

        <table className="modern-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Usuario</th>
              <th>Puntos</th>
              <th>Partidas</th>
              <th>Victorias</th>

              {selectedGame.scoringRules?.map((rule) => (
                <th key={rule.key}>
                  {getMetricLabel(selectedGame, rule.key)}
                </th>
              ))}

              <th>Historial</th>
            </tr>
          </thead>

          <tbody>
            {ranking.length === 0 && (
              <tr>
                <td colSpan={6 + (selectedGame.scoringRules?.length ?? 0)}>
                  No hay ranking para este juego todavía. Registra resultados y
                  finaliza una partida.
                </td>
              </tr>
            )}

            {ranking.map((row) => (
              <tr key={row.player?.id}>
                <td>
                  <span className="rank-chip">#{row.rank}</span>
                </td>

                <td>
                  <strong>
                    {row.player?.name ?? "Jugador"}
                  </strong>

                  <small>
                    @{row.player?.username ?? "sin_usuario"}
                  </small>
                </td>

                <td>{row.totalPoints ?? 0}</td>
                <td>{row.matchesPlayed ?? 0}</td>
                <td>{row.wins ?? 0}</td>

                {selectedGame.scoringRules?.map((rule) => (
                  <td key={rule.key}>
                    {row.totals?.[rule.key] ?? 0}
                  </td>
                ))}

                <td>{row.history?.length ?? 0} registros</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}