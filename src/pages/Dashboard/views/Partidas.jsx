// =====================================================
// DASHBOARD > PARTIDAS
// =====================================================
//
// Esta vista permite al admin:
// - Crear partidas usando exactamente 2 equipos activos.
// - Cambiar estado de una partida.
// - Registrar estadísticas individuales.
// - Usar controles rápidos para una métrica principal.
// - Finalizar la partida para que cuente en rankings.
//
// Importante:
// El ranking solo toma partidas con status "Finalizada".

import { useEffect, useMemo, useState } from "react";
import { Flame, Plus, Save, Timer, Trophy } from "lucide-react";

import { useApp } from "../../../context/AppContext";
import { getMetricLabel } from "../../../utils/rankingEngine";
import "./Partidas.css";

// Clase visual para status.
const statusClass = (status) => {
  if (status === "En curso") return "live";
  if (status === "Finalizada") return "done";
  if (status === "Cancelada") return "cancelled";
  return "";
};

// Fecha inicial para input local.
const getInitialSchedule = () => {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
};

export default function Partidas() {
  const {
    gameConfigs,
    tournamentPhases,
    matchStatuses,
    players,
    teams,
    matches,
    rankingsByGame,
    loading,
    createMatch,
    updateMatchResult,
    updateMatchStatus,
    updateLiveRound,
  } = useApp();

  // Guard de carga.
  if (loading) {
    return (
      <div className="admin-page">
        <p>Cargando partidas...</p>
      </div>
    );
  }

  // Sin juegos no se puede crear partida.
  if (!gameConfigs.length) {
    return (
      <div className="admin-page">
        <div className="page-head">
          <div>
            <span className="eyebrow">Partidas temporales</span>
            <h2>No hay juegos disponibles</h2>
            <p>Primero crea juegos en Dashboard &gt; Juegos.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PartidasInner
      gameConfigs={gameConfigs}
      tournamentPhases={tournamentPhases}
      matchStatuses={matchStatuses}
      players={players}
      teams={teams}
      matches={matches}
      rankingsByGame={rankingsByGame}
      createMatch={createMatch}
      updateMatchResult={updateMatchResult}
      updateMatchStatus={updateMatchStatus}
      updateLiveRound={updateLiveRound}
    />
  );
}

function PartidasInner({
  gameConfigs,
  tournamentPhases,
  matchStatuses,
  players,
  teams,
  matches,
  rankingsByGame,
  createMatch,
  updateMatchResult,
  updateMatchStatus,
  updateLiveRound,
}) {
  // Juego seleccionado.
  const [selectedGameId, setSelectedGameId] = useState(gameConfigs[0].id);

  // Partida seleccionada para editar resultados.
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  // Estado del formulario de creación.
  const [matchForm, setMatchForm] = useState({
    phaseType: tournamentPhases[0],
    stage: "Clasificatoria 01",
    map: "",
    duration: 10,
    scheduledAt: getInitialSchedule(),
    teamA: "",
    teamB: "",
  });

  // Borrador de estadísticas por match y jugador.
  const [draftStats, setDraftStats] = useState({});

  // Loading visual al crear partida.
  const [creating, setCreating] = useState(false);

  // Loading visual al cambiar status.
  const [statusLoading, setStatusLoading] = useState(null);

  // =====================================================
  // DATOS DERIVADOS
  // =====================================================

  const selectedGame =
    gameConfigs.find((game) => game.id === selectedGameId) ?? gameConfigs[0];

  const gameTeams = teams.filter(
    (team) => team.gameId === selectedGameId && team.status === "Activo",
  );

  const gameMatches = matches.filter(
    (match) => match.gameId === selectedGameId,
  );

  const selectedMatch =
    gameMatches.find((match) => match.id === selectedMatchId) ??
    gameMatches[0] ??
    null;

  const ranking = rankingsByGame[selectedGameId] ?? [];

  const playersById = useMemo(() => {
    return Object.fromEntries(players.map((player) => [player.id, player]));
  }, [players]);

  const teamsById = useMemo(() => {
    return Object.fromEntries(teams.map((team) => [team.id, team]));
  }, [teams]);

  // Métrica principal para los botones rápidos + / -.
  const primaryMetric =
    selectedGame.scoringRules?.[0]?.key ??
    selectedGame.metrics?.[0]?.key ??
    "points";

  // Métricas editables.
  const editableMetrics =
    selectedGame.metrics?.length > 0
      ? selectedGame.metrics
      : [
          {
            key: primaryMetric,
            label: "Puntos",
            defaultValue: 0,
          },
        ];

  // Métricas visuales para resumen.
  const metricHighlight =
    selectedGame.visualMetrics?.length > 0
      ? selectedGame.visualMetrics.slice(0, 4)
      : editableMetrics.map((metric) => metric.key).slice(0, 4);

  // =====================================================
  // EFECTOS
  // =====================================================

  // Si cambia el juego, limpiamos selección y formulario de equipos.
  useEffect(() => {
    setSelectedMatchId(null);
    setMatchForm((prev) => ({
      ...prev,
      map: "",
      teamA: "",
      teamB: "",
    }));
  }, [selectedGameId]);

  // Si hay partidas y ninguna está seleccionada, seleccionamos la primera.
  useEffect(() => {
    if (!selectedMatchId && gameMatches.length > 0) {
      setSelectedMatchId(gameMatches[0].id);
    }
  }, [gameMatches, selectedMatchId]);

  // =====================================================
  // HELPERS
  // =====================================================

  const findPlayerResult = (match, playerId) => {
    return match.playerResults?.find((result) => result.playerId === playerId);
  };

  const getPlayersFromMatch = (match) => {
    if (!match) return [];

    const fromTeamResults =
      match.teamResults?.flatMap(
        (teamResult) =>
          teamResult.playerIds?.map((playerId) => ({
            playerId,
            teamId: teamResult.teamId,
          })) ?? [],
      ) ?? [];

    if (fromTeamResults.length > 0) {
      return fromTeamResults;
    }

    return (match.playerIds ?? []).map((playerId) => ({
      playerId,
      teamId:
        match.playerResults?.find((result) => result.playerId === playerId)
          ?.teamId ?? "",
    }));
  };

  const getDraftValue = (match, playerId, key) => {
    const existing = findPlayerResult(match, playerId);
    const draft = draftStats[match.id]?.[playerId] ?? {};

    return (
      draft[key] ??
      existing?.stats?.[key] ??
      existing?.[key] ??
      editableMetrics.find((metric) => metric.key === key)?.defaultValue ??
      0
    );
  };

  // =====================================================
  // CREAR PARTIDA
  // =====================================================

  const handleCreateMatch = async (event) => {
    event.preventDefault();

    if (gameTeams.length < 2) {
      alert("Necesitas al menos 2 equipos activos para crear una partida.");
      return;
    }

    if (!matchForm.teamA || !matchForm.teamB) {
      alert("Selecciona Equipo A y Equipo B.");
      return;
    }

    if (matchForm.teamA === matchForm.teamB) {
      alert("No puedes seleccionar el mismo equipo dos veces.");
      return;
    }

    const durationNumber = Number(matchForm.duration);

    if (!Number.isFinite(durationNumber) || durationNumber <= 0) {
      alert("La duración debe ser mayor a 0.");
      return;
    }

    setCreating(true);

    try {
      const ok = await createMatch({
        gameId: selectedGameId,
        phaseType: matchForm.phaseType,
        stage: matchForm.stage.trim() || "Partida sin nombre",
        map: matchForm.map.trim() || selectedGame.maps?.[0] || "Arena oficial",
        scheduledAt: matchForm.scheduledAt,
        duration: durationNumber,
        teamIds: [matchForm.teamA, matchForm.teamB],
      });

      if (ok) {
        alert("Partida creada correctamente.");

        setMatchForm((prev) => ({
          ...prev,
          map: "",
          teamA: "",
          teamB: "",
          duration: 10,
        }));
      } else {
        alert("No se pudo crear la partida. Revisa la consola.");
      }
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // CAMBIAR STATUS
  // =====================================================

  const handleStatusChange = async (matchId, status) => {
    setStatusLoading(`${matchId}-${status}`);

    try {
      const ok = await updateMatchStatus(matchId, status);

      if (!ok) {
        alert("No se pudo cambiar el estado de la partida.");
      }
    } finally {
      setStatusLoading(null);
    }
  };

  // =====================================================
  // EDITAR ESTADÍSTICAS
  // =====================================================

  const handleStatChange = (matchId, playerId, key, value) => {
    setDraftStats((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] ?? {}),
        [playerId]: {
          ...(prev[matchId]?.[playerId] ?? {}),
          [key]: Number(value),
        },
      },
    }));
  };

  const handleMetaChange = (matchId, playerId, key, value) => {
    setDraftStats((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] ?? {}),
        [playerId]: {
          ...(prev[matchId]?.[playerId] ?? {}),
          [key]: key === "won" ? value === "true" : Number(value),
        },
      },
    }));
  };

  const saveStats = async (match, playerId) => {
    const existing = findPlayerResult(match, playerId);
    const draft = draftStats[match.id]?.[playerId] ?? {};

    const stats = editableMetrics.reduce((acc, metric) => {
      acc[metric.key] =
        draft[metric.key] ??
        existing?.stats?.[metric.key] ??
        metric.defaultValue ??
        0;

      return acc;
    }, {});

    const ok = await updateMatchResult(
      match.id,
      playerId,
      stats,
      draft.points ?? existing?.points ?? 0,
      draft.won ?? existing?.won ?? false,
    );

    if (ok) {
      alert("Resultado guardado.");
    } else {
      alert("No se pudo guardar el resultado.");
    }
  };

  return (
    <div className="admin-page games-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Partidas temporales</span>
          <h2>Operación de partidas en vivo</h2>
          <p>
            Crea partidas desde equipos temporales, cambia estados, registra
            resultados individuales y finaliza para actualizar rankings.
          </p>
        </div>
      </div>

      {/* Selector de juego */}
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

      {/* Resumen del juego */}
      <section
        className="panel-card game-hero"
        style={{ "--accent": selectedGame.accent }}
      >
        {selectedGame.image && (
          <img src={selectedGame.image} alt={selectedGame.name} />
        )}

        <div>
          <span className="eyebrow">{selectedGame.format}</span>
          <h3>{selectedGame.name}</h3>
          <p>{selectedGame.description}</p>

          <div className="rule-list">
            <span className="pill">
              {selectedGame.pointFormula || "Sin fórmula configurada"}
            </span>

            {selectedGame.scoringRules?.map((rule, index) => (
              <span className="pill" key={rule.key}>
                {index + 1}. {rule.label}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-meta">
          <span>
            <Timer size={16} />
            {selectedGame.duration}
          </span>

          <span>
            <Trophy size={16} />
            {gameTeams.length} equipos activos
          </span>

          <strong>{selectedGame.status}</strong>
        </div>
      </section>

      <div className="grid-2">
        {/* Crear partida */}
        <section className="panel-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Crear partida</span>
              <h3>Fase + 2 equipos temporales</h3>
            </div>

            <Plus size={20} />
          </div>

          {gameTeams.length < 2 && (
            <p>
              Necesitas al menos 2 equipos activos para este juego. Créelos en
              Dashboard &gt; Equipos.
            </p>
          )}

          <form className="match-form" onSubmit={handleCreateMatch}>
            <div className="phase-picker">
              <span>Fase / ronda</span>

              <div>
                {tournamentPhases.map((phase) => (
                  <button
                    type="button"
                    className={matchForm.phaseType === phase ? "active" : ""}
                    key={phase}
                    onClick={() =>
                      setMatchForm({
                        ...matchForm,
                        phaseType: phase,
                      })
                    }
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>

            <label>
              Ronda / nombre
              <input
                value={matchForm.stage}
                onChange={(event) =>
                  setMatchForm({
                    ...matchForm,
                    stage: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Mapa / seed / arena
              <input
                value={matchForm.map}
                placeholder={selectedGame.maps?.[0] ?? "Arena oficial"}
                onChange={(event) =>
                  setMatchForm({
                    ...matchForm,
                    map: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Duración estimada en minutos
              <input
                type="number"
                min="1"
                value={matchForm.duration}
                onChange={(event) =>
                  setMatchForm({
                    ...matchForm,
                    duration: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Horario
              <input
                value={matchForm.scheduledAt}
                onChange={(event) =>
                  setMatchForm({
                    ...matchForm,
                    scheduledAt: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Equipo temporal A
              <select
                value={matchForm.teamA}
                onChange={(event) =>
                  setMatchForm({
                    ...matchForm,
                    teamA: event.target.value,
                  })
                }
              >
                <option value="">Seleccionar</option>

                {gameTeams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                    disabled={team.id === matchForm.teamB}
                  >
                    {team.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Equipo temporal B
              <select
                value={matchForm.teamB}
                onChange={(event) =>
                  setMatchForm({
                    ...matchForm,
                    teamB: event.target.value,
                  })
                }
              >
                <option value="">Seleccionar</option>

                {gameTeams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                    disabled={team.id === matchForm.teamA}
                  >
                    {team.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="primary-btn"
              disabled={creating || gameTeams.length < 2}
            >
              {creating ? "Creando..." : "Crear partida"}
            </button>
          </form>
        </section>

        {/* Marcador rápido */}
        <section className="panel-card live-scoreboard">
          <div className="section-title">
            <div>
              <span className="eyebrow">Marcador rápido</span>
              <h3>{selectedMatch?.stage ?? "Sin partida"}</h3>
            </div>

            <Flame size={20} />
          </div>

          {selectedMatch ? (
            getPlayersFromMatch(selectedMatch).map(({ playerId }) => {
              const result = findPlayerResult(selectedMatch, playerId);

              return (
                <div className="score-row" key={playerId}>
                  <strong>@</strong>

                  <span>
                    {playersById[playerId]?.username ?? "sin_usuario"}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateLiveRound(
                        selectedMatch.id,
                        playerId,
                        primaryMetric,
                        -1,
                      )
                    }
                  >
                    -
                  </button>

                  <b>{result?.stats?.[primaryMetric] ?? 0}</b>

                  <button
                    type="button"
                    onClick={() =>
                      updateLiveRound(
                        selectedMatch.id,
                        playerId,
                        primaryMetric,
                        1,
                      )
                    }
                  >
                    +
                  </button>

                  <small>{getMetricLabel(selectedGame, primaryMetric)}</small>
                </div>
              );
            })
          ) : (
            <p>No hay partidas creadas para este juego.</p>
          )}
        </section>
      </div>

      {/* Lista de partidas */}
      <section className="panel-card">
        <div className="section-title">
          <div>
            <span className="eyebrow">Partidas del juego</span>
            <h3>{selectedGame.name}</h3>
          </div>
        </div>

        <div className="match-feed">
          {gameMatches.length === 0 && (
            <p>No hay partidas creadas para este juego.</p>
          )}

          {gameMatches.map((match) => (
            <article
              key={match.id}
              className={`feed-item ${
                selectedMatch?.id === match.id ? "active" : ""
              }`}
              onClick={() => setSelectedMatchId(match.id)}
            >
              {selectedGame.image && (
                <img src={selectedGame.image} alt={selectedGame.name} />
              )}

              <div>
                <strong>{match.stage}</strong>

                <span>
                  {match.phaseType} · {match.map} · {match.scheduledAt}
                </span>

                <small>
                  Equipos:{" "}
                  {match.teamResults
                    ?.map((teamResult) => teamsById[teamResult.teamId]?.name)
                    .filter(Boolean)
                    .join(" vs ") || "sin equipos"}
                </small>
              </div>

              <span className={`pill ${statusClass(match.status)}`}>
                {match.status}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* Cambiar status */}
      {selectedMatch && (
        <section className="panel-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Estado de partida</span>
              <h3>{selectedMatch.stage}</h3>
            </div>
          </div>

          <div className="phase-picker">
            <span>Status</span>

            <div>
              {matchStatuses.map((status) => (
                <button
                  type="button"
                  key={status}
                  className={selectedMatch.status === status ? "active" : ""}
                  disabled={statusLoading === `${selectedMatch.id}-${status}`}
                  onClick={() => handleStatusChange(selectedMatch.id, status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <p>
            Recuerda: el ranking solo se recalcula con partidas en estado{" "}
            <strong>Finalizada</strong>.
          </p>
        </section>
      )}

      {/* Resultados individuales */}
      {selectedMatch && (
        <section className="panel-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Resultados individuales</span>
              <h3>{selectedMatch.stage}</h3>
            </div>

            <Save size={20} />
          </div>

          <div className="match-results-editor">
            {getPlayersFromMatch(selectedMatch).map(({ playerId, teamId }) => {
              const player = playersById[playerId];
              const team = teamsById[teamId];
              const existing = findPlayerResult(selectedMatch, playerId);

              return (
                <article className="panel-card" key={playerId}>
                  <header>
                    <div>
                      <strong>@{player?.username ?? "sin_usuario"}</strong>

                      <span>
                        {player?.name ?? "Jugador"} ·{" "}
                        {team?.name ?? "Equipo no encontrado"}
                      </span>
                    </div>
                  </header>

                  <div className="editor-fields">
                    {editableMetrics.map((metric) => (
                      <label key={metric.key}>
                        {metric.label}
                        <input
                          type="number"
                          value={getDraftValue(
                            selectedMatch,
                            playerId,
                            metric.key,
                          )}
                          onChange={(event) =>
                            handleStatChange(
                              selectedMatch.id,
                              playerId,
                              metric.key,
                              event.target.value,
                            )
                          }
                        />
                      </label>
                    ))}

                    <label>
                      Puntos
                      <input
                        type="number"
                        value={
                          draftStats[selectedMatch.id]?.[playerId]?.points ??
                          existing?.points ??
                          0
                        }
                        onChange={(event) =>
                          handleMetaChange(
                            selectedMatch.id,
                            playerId,
                            "points",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      Ganó
                      <select
                        value={String(
                          draftStats[selectedMatch.id]?.[playerId]?.won ??
                            existing?.won ??
                            false,
                        )}
                        onChange={(event) =>
                          handleMetaChange(
                            selectedMatch.id,
                            playerId,
                            "won",
                            event.target.value,
                          )
                        }
                      >
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                      </select>
                    </label>
                  </div>

                  <button
                    className="primary-btn"
                    onClick={() => saveStats(selectedMatch, playerId)}
                  >
                    Guardar resultado
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Resumen ranking */}
      <section className="panel-card">
        <div className="section-title">
          <div>
            <span className="eyebrow">Ranking actual</span>
            <h3>{selectedGame.name}</h3>
          </div>
        </div>

        {ranking.length === 0 && (
          <p>
            Todavía no hay ranking. Registra resultados y finaliza una partida.
          </p>
        )}

        {ranking.slice(0, 5).map((row) => (
          <div className="score-row" key={row.player?.id}>
            <strong>#{row.rank}</strong>

            <span>@{row.player?.username ?? "sin_usuario"}</span>

            {metricHighlight.map((metric) => (
              <small key={metric}>
                {getMetricLabel(selectedGame, metric)}:{" "}
                {row.totals?.[metric] ?? 0}
              </small>
            ))}

            <b>{row.totalPoints ?? 0} pts</b>
          </div>
        ))}
      </section>
    </div>
  );
}
