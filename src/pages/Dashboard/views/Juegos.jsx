import { useMemo, useState } from "react";
import { Flame, Plus, Save, Timer, Trophy } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { getMetricLabel, getMatchLeader } from "../../../utils/rankingEngine";
import "./Juegos.css";

const statusClass = (status) => (status === "En vivo" ? "live" : status === "Finalizada" ? "done" : "");

export default function Juegos() {
  const {
    gameConfigs,
    teams,
    matches,
    rankingsByGame,
    createMatch,
    updateMatchResult,
    updateLiveRound,
  } = useApp();
  const [selectedGameId, setSelectedGameId] = useState(gameConfigs[0].id);
  const [matchForm, setMatchForm] = useState({ stage: "Clasificatoria", map: "", scheduledAt: "2026-05-12 15:00", teamA: "", teamB: "" });
  const [draftStats, setDraftStats] = useState({});

  const selectedGame = gameConfigs.find((game) => game.id === selectedGameId);
  const gameTeams = teams.filter((team) => team.gameIds.includes(selectedGameId));
  const gameMatches = matches.filter((match) => match.gameId === selectedGameId);
  const ranking = rankingsByGame[selectedGameId] ?? [];

  const liveMatch = useMemo(
    () => gameMatches.find((match) => match.status === "En vivo") ?? gameMatches[0],
    [gameMatches]
  );

  const handleCreateMatch = (event) => {
    event.preventDefault();
    if (!matchForm.teamA || !matchForm.teamB || matchForm.teamA === matchForm.teamB) return;

    createMatch({
      gameId: selectedGameId,
      stage: matchForm.stage,
      map: matchForm.map || selectedGame.maps?.[0] || "Arena oficial",
      scheduledAt: matchForm.scheduledAt,
      teamIds: [matchForm.teamA, matchForm.teamB],
    });
    setMatchForm((prev) => ({ ...prev, map: "", teamA: "", teamB: "" }));
  };

  const handleStatChange = (matchId, teamId, key, value) => {
    setDraftStats((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] ?? {}),
        [teamId]: {
          ...(prev[matchId]?.[teamId] ?? {}),
          [key]: Number(value),
        },
      },
    }));
  };

  const saveStats = (match, teamResult) => {
    updateMatchResult(match.id, teamResult.teamId, draftStats[match.id]?.[teamResult.teamId] ?? teamResult.stats);
  };

  const metricHighlight = selectedGame.visualMetrics.slice(0, 4);

  return (
    <div className="admin-page games-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Juegos oficiales</span>
          <h2>Partidas, reglas y marcador en vivo</h2>
          <p>Cada juego usa su propio gameConfig, scoringRules y métricas. El ranking se recalcula automáticamente al registrar resultados.</p>
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
            {selectedGame.scoringRules.map((rule, index) => (
              <span className="pill" key={rule.key}>{index + 1}. {rule.label}</span>
            ))}
          </div>
        </div>
        <div className="hero-meta">
          <span><Timer size={16} /> {selectedGame.duration}</span>
          <span><Trophy size={16} /> {selectedGame.teamSize}</span>
          <strong>{selectedGame.status}</strong>
        </div>
      </section>

      <div className="grid-2">
        <section className="panel-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Crear partida</span>
              <h3>Asignación rápida</h3>
            </div>
            <Plus size={20} />
          </div>
          <form className="match-form" onSubmit={handleCreateMatch}>
            <label>Fase / ronda
              <input value={matchForm.stage} onChange={(e) => setMatchForm({ ...matchForm, stage: e.target.value })} />
            </label>
            <label>Mapa / seed / arena
              <input value={matchForm.map} placeholder={selectedGame.maps?.[0] ?? "Arena oficial"} onChange={(e) => setMatchForm({ ...matchForm, map: e.target.value })} />
            </label>
            <label>Horario
              <input value={matchForm.scheduledAt} onChange={(e) => setMatchForm({ ...matchForm, scheduledAt: e.target.value })} />
            </label>
            <label>Equipo A
              <select value={matchForm.teamA} onChange={(e) => setMatchForm({ ...matchForm, teamA: e.target.value })}>
                <option value="">Seleccionar</option>
                {gameTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </label>
            <label>Equipo B
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
              <span className="eyebrow">Marcador vivo</span>
              <h3>{liveMatch?.stage ?? "Sin partida"}</h3>
            </div>
            <Flame size={20} />
          </div>
          {liveMatch ? liveMatch.teamResults.map((result) => {
            const team = teams.find((item) => item.id === result.teamId);
            const primaryMetric = selectedGame.scoringRules[0].key;
            return (
              <div className="score-row" key={result.teamId}>
                <strong>{team?.tag}</strong>
                <span>{team?.name}</span>
                <button onClick={() => updateLiveRound(liveMatch.id, result.teamId, primaryMetric, -1)}>-</button>
                <b>{result.stats[primaryMetric] ?? 0}</b>
                <button onClick={() => updateLiveRound(liveMatch.id, result.teamId, primaryMetric, 1)}>+</button>
                <small>{getMetricLabel(selectedGame, primaryMetric)}</small>
              </div>
            );
          }) : <p>No hay partidas creadas para este juego.</p>}
        </section>
      </div>

      {selectedGame.id === "soul-knight" && (
        <section className="soul-visual panel-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Soul Knight pro stats</span>
              <h3>Cards gamer por métrica visual</h3>
            </div>
          </div>
          <div className="soul-grid">
            {metricHighlight.map((metric) => {
              const leader = ranking[0];
              const maxValue = Math.max(...ranking.map((row) => Number(row.totals[metric] ?? 0)), 1);
              return (
                <div className="soul-card" key={metric}>
                  <span>{getMetricLabel(selectedGame, metric)}</span>
                  <strong>{leader?.totals[metric] ?? 0}</strong>
                  <div className="bar"><i style={{ width: `${Math.min(100, ((leader?.totals[metric] ?? 0) / maxValue) * 100)}%` }} /></div>
                  <small>Líder: {leader?.team.name ?? "Pendiente"}</small>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="panel-card">
        <div className="section-title">
          <div>
            <span className="eyebrow">Historial</span>
            <h3>Registro de resultados</h3>
          </div>
        </div>
        <div className="match-admin-list">
          {gameMatches.map((match) => {
            const leader = getMatchLeader(match, selectedGame);
            return (
              <article className="match-admin-card" key={match.id}>
                <header>
                  <div>
                    <strong>{match.stage}</strong>
                    <span>{match.map} · {match.scheduledAt}</span>
                  </div>
                  <span className={`pill ${statusClass(match.status)}`}>{match.status}</span>
                </header>
                <div className="result-grid">
                  {match.teamResults.map((result) => {
                    const team = teams.find((item) => item.id === result.teamId);
                    return (
                      <div className={`result-editor ${leader?.teamId === result.teamId ? "winner" : ""}`} key={result.teamId}>
                        <h4>{team?.name}</h4>
                        <div className="metric-inputs">
                          {selectedGame.metrics.map((metric) => (
                            <label key={metric.key}>{metric.label}
                              <input
                                type="number"
                                value={draftStats[match.id]?.[result.teamId]?.[metric.key] ?? result.stats[metric.key] ?? 0}
                                onChange={(e) => handleStatChange(match.id, result.teamId, metric.key, e.target.value)}
                              />
                            </label>
                          ))}
                        </div>
                        <button className="ghost-btn" onClick={() => saveStats(match, result)}><Save size={15} /> Guardar resultado</button>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
