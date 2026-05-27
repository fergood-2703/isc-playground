import { useMemo, useState } from "react"
import { Flame, Plus, Save, Timer, Trophy } from "lucide-react"
import { useApp } from "../../../context/AppContext"
import { getMatchLeader, getMetricLabel } from "../../../utils/rankingEngine"
import "./Partidas.css"

const statusClass = (status) => (status === "En curso" ? "live" : status === "Finalizada" ? "done" : "")

export default function Partidas() {
  const {
    gameConfigs, tournamentPhases, matchStatuses,
    players, teams, matches, rankingsByGame, loading,
    createMatch, updateMatchResult, updateMatchStatus, updateLiveRound,
  } = useApp()

  // Guard: mientras carga o no hay juegos aún
  if (loading || !gameConfigs.length) {
    return <div className="admin-page"><p>Cargando juegos...</p></div>
  }

  return <PartidasInner
    gameConfigs={gameConfigs} tournamentPhases={tournamentPhases}
    matchStatuses={matchStatuses} players={players} teams={teams}
    matches={matches} rankingsByGame={rankingsByGame}
    createMatch={createMatch} updateMatchResult={updateMatchResult}
    updateMatchStatus={updateMatchStatus} updateLiveRound={updateLiveRound}
  />
}

function PartidasInner({
  gameConfigs, tournamentPhases, matchStatuses,
  players, teams, matches, rankingsByGame,
  createMatch, updateMatchResult, updateMatchStatus, updateLiveRound,
}) {
  const [selectedGameId, setSelectedGameId] = useState(gameConfigs[0].id)
  const [matchForm, setMatchForm] = useState({
    phaseType: tournamentPhases[0],
    stage: "Clasificatoria 01",
    map: "",
    duration: 0,
    scheduledAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    teamA: "",
    teamB: "",
  })
  const [draftStats, setDraftStats] = useState({})

  const selectedGame = gameConfigs.find((game) => game.id === selectedGameId)
  const gameTeams = teams.filter((team) => team.gameId === selectedGameId && team.status === "Activo")
  const gameMatches = matches.filter((match) => match.gameId === selectedGameId)
  const ranking = rankingsByGame[selectedGameId] ?? []
  const playersById = useMemo(
    () => Object.fromEntries(players.map((player) => [player.id, player])),
    [players]
  )
  const liveMatch = useMemo(
    () => gameMatches.find((match) => match.status === "En curso") ?? gameMatches[0],
    [gameMatches]
  )

  const handleCreateMatch = (event) => {
    event.preventDefault()
    if (!matchForm.teamA || !matchForm.teamB || matchForm.teamA === matchForm.teamB) return
    createMatch({
      gameId: selectedGameId,
      phaseType: matchForm.phaseType,
      stage: matchForm.stage,
      map: matchForm.map || selectedGame.maps?.[0] || "Arena oficial",
      scheduledAt: matchForm.scheduledAt,
      duration: Number(matchForm.duration),
      teamIds: [matchForm.teamA, matchForm.teamB],
    })
    setMatchForm((prev) => ({ ...prev, map: "", teamA: "", teamB: "" }))
  }

  const handleStatChange = (matchId, playerId, key, value) => {
    setDraftStats((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] ?? {}),
        [playerId]: { ...(prev[matchId]?.[playerId] ?? {}), [key]: Number(value) },
      },
    }))
  }

  const handleMetaChange = (matchId, playerId, key, value) => {
    setDraftStats((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] ?? {}),
        [playerId]: {
          ...(prev[matchId]?.[playerId] ?? {}),
          [key]: key === "won" ? value : Number(value),
        },
      },
    }))
  }

  const findPlayerResult = (match, playerId) =>
    match.playerResults?.find((result) => result.playerId === playerId)

  const saveStats = (match, playerId) => {
    const existing = findPlayerResult(match, playerId)
    const draft = draftStats[match.id]?.[playerId] ?? {}
    const stats = selectedGame.metrics.reduce((acc, metric) => ({
      ...acc,
      [metric.key]: draft[metric.key] ?? existing?.stats?.[metric.key] ?? metric.defaultValue ?? 0,
    }), {})
    updateMatchResult(
      match.id, playerId, stats,
      draft.points ?? existing?.points ?? 0,
      draft.won ?? existing?.won ?? false
    )
  }

  const metricHighlight = selectedGame.visualMetrics.slice(0, 4)

  return (
    <div className="admin-page games-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Partidas temporales</span>
          <h2>Operación de partidas en vivo</h2>
          <p>Crea eventos temporales separados del catálogo permanente de juegos: selecciona fase visual, asigna equipos, inicia/finaliza, registra puntos y actualiza rankings.</p>
        </div>
      </div>

      <div className="game-switcher">
        {gameConfigs.map((game) => (
          <button
            className={game.id === selectedGameId ? "active" : ""}
            key={game.id}
            onClick={() => setSelectedGameId(game.id)}
            style={{ "--accent": game.accent }}
          >
            <img src={game.image} alt={game.name} />
            <span>{game.name}</span>
          </button>
        ))}
      </div>

      <section className="panel-card game-hero" style={{ "--accent": selectedGame.accent }}>
        <img src={selectedGame.image} alt={selectedGame.name} />
        <div>
          <span className="eyebrow">{selectedGame.format}</span>
          <h3>{selectedGame.name}</h3>
          <p>{selectedGame.description}</p>
          <div className="rule-list">
            <span className="pill">{selectedGame.pointFormula}</span>
            {selectedGame.scoringRules.map((rule, index) => (
              <span className="pill" key={rule.key}>{index + 1}. {rule.label}</span>
            ))}
          </div>
        </div>
        <div className="hero-meta">
          <span><Timer size={16} /> {selectedGame.duration}</span>
          <span><Trophy size={16} /> equipos temporales</span>
          <strong>{selectedGame.status}</strong>
        </div>
      </section>

      <div className="grid-2">
        <section className="panel-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Crear partida</span>
              <h3>Fase + equipos temporales</h3>
            </div>
            <Plus size={20} />
          </div>
          <form className="match-form" onSubmit={handleCreateMatch}>
            <div className="phase-picker">
              <span>Fase / ronda</span>
              <div>
                {tournamentPhases.map((phase) => (
                  <button
                    type="button"
                    className={matchForm.phaseType === phase ? "active" : ""}
                    key={phase}
                    onClick={() => setMatchForm({ ...matchForm, phaseType: phase })}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>
            <label>Ronda / nombre
              <input value={matchForm.stage} onChange={(e) => setMatchForm({ ...matchForm, stage: e.target.value })} />
            </label>
            <label>Mapa / seed / arena
              <input
                value={matchForm.map}
                placeholder={selectedGame.maps?.[0] ?? "Arena oficial"}
                onChange={(e) => setMatchForm({ ...matchForm, map: e.target.value })}
              />
            </label>
            <label>Duración estimada (min)
              <input type="number" value={matchForm.duration} onChange={(e) => setMatchForm({ ...matchForm, duration: e.target.value })} />
            </label>
            <label>Horario
              <input value={matchForm.scheduledAt} onChange={(e) => setMatchForm({ ...matchForm, scheduledAt: e.target.value })} />
            </label>
            <label>Equipo temporal A
              <select value={matchForm.teamA} onChange={(e) => setMatchForm({ ...matchForm, teamA: e.target.value })}>
                <option value="">Seleccionar</option>
                {gameTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </label>
            <label>Equipo temporal B
              <select value={matchForm.teamB} onChange={(e) => setMatchForm({ ...matchForm, teamB: e.target.value })}>
                <option value="">Seleccionar</option>
                {gameTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </label>
            <button className="primary-btn">Crear partida</button>
          </form>
        </section>

        <section className="panel-card live-scoreboard">
          <div className="section-title">
            <div>
              <span className="eyebrow">Marcador individual</span>
              <h3>{liveMatch?.stage ?? "Sin partida"}</h3>
            </div>
            <Flame size={20} />
          </div>
          {liveMatch ? liveMatch.playerIds.map((playerId) => {
            const primaryMetric = selectedGame.scoringRules[0].key
            const result = findPlayerResult(liveMatch, playerId)
            return (
              <div className="score-row" key={playerId}>
                <strong>@</strong>
                <span>{playersById[playerId]?.username}</span>
                <button onClick={() => updateLiveRound(liveMatch.id, playerId, primaryMetric, -1)}>-</button>
                <b>{result?.stats?.[primaryMetric] ?? 0}</b>
                <button onClick={() => updateLiveRound(liveMatch.id, playerId, primaryMetric, 1)}>+</button>
                <small>{getMetricLabel(selectedGame, primaryMetric)}</small>
              </div>
            )
          }) : <p>No hay partidas creadas para este juego.</p>}
        </section>
      </div>

      {selectedGame.id === "soul-knight" && (
        <section className="soul-visual panel-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Soul Knight pro stats</span>
              <h3>Cards por usuario líder</h3>
            </div>
          </div>
          <div className="soul-grid">
            {metricHighlight.map((metric) => {
              const leader = ranking[0]
              const maxValue = Math.max(...ranking.map((row) => Number(row.totals[metric] ?? 0)), 1)
              return (
                <div className="soul-card" key={metric}>
                  <span>{getMetricLabel(selectedGame, metric)}</span>
                  <strong>{leader?.totals[metric] ?? 0}</strong>
                  <div className="bar">
                    <i style={{ width: `${Math.min(100, ((leader?.totals[metric] ?? 0) / maxValue) * 100)}%` }} />
                  </div>
                  <small>Líder: @{leader?.player.username ?? "pendiente"}</small>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="panel-card">
        <div className="section-title">
          <div>
            <span className="eyebrow">Historial</span>
            <h3>Estados, puntuaciones e historial</h3>
          </div>
        </div>
        <div className="match-admin-list">
          {gameMatches.length === 0 && <p>No hay partidas registradas para este juego.</p>}
          {gameMatches.map((match) => {
            const leader = getMatchLeader(match, selectedGame)
            return (
              <article className="match-admin-card" key={match.id}>
                <header>
                  <div>
                    <strong>{match.stage}</strong>
                    <span>{match.phaseType} · {match.map} · {match.duration} min · {match.scheduledAt}</span>
                    <small>
                      Ranking resultante: {leader
                        ? `@${playersById[leader.playerId]?.username} lidera la partida`
                        : "pendiente de puntos"}
                    </small>
                  </div>
                  <label className={`pill ${statusClass(match.status)}`}>Estado
                    <select value={match.status} onChange={(event) => updateMatchStatus(match.id, event.target.value)}>
                      {matchStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </header>
                <div className="result-grid individual-results">
                  {match.playerIds.map((playerId) => {
                    const result = findPlayerResult(match, playerId)
                    return (
                      <div
                        className={`result-editor ${leader?.playerId === playerId ? "winner" : ""}`}
                        key={playerId}
                      >
                        <h4>
                          {playersById[playerId]?.name}
                          <small>@{playersById[playerId]?.username}</small>
                        </h4>
                        <div className="metric-inputs">
                          <label>Puntos
                            <input
                              type="number"
                              value={draftStats[match.id]?.[playerId]?.points ?? result?.points ?? 0}
                              onChange={(e) => handleMetaChange(match.id, playerId, "points", e.target.value)}
                            />
                          </label>
                          <label>Victoria
                            <select
                              value={String(draftStats[match.id]?.[playerId]?.won ?? result?.won ?? false)}
                              onChange={(e) => handleMetaChange(match.id, playerId, "won", e.target.value === "true")}
                            >
                              <option value="false">No</option>
                              <option value="true">Sí</option>
                            </select>
                          </label>
                          {selectedGame.metrics.map((metric) => (
                            <label key={metric.key}>{metric.label}
                              <input
                                type="number"
                                value={draftStats[match.id]?.[playerId]?.[metric.key] ?? result?.stats?.[metric.key] ?? metric.defaultValue ?? 0}
                                onChange={(e) => handleStatChange(match.id, playerId, metric.key, e.target.value)}
                              />
                            </label>
                          ))}
                        </div>
                        <button className="ghost-btn" onClick={() => saveStats(match, playerId)}>
                          <Save size={15} /> Guardar usuario
                        </button>
                      </div>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}