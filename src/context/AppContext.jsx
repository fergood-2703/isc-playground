import { createContext, useContext, useMemo, useState } from "react";
import {
  currentUser as mockedCurrentUser,
  gameConfigs as initialGameConfigs,
  initialMatches,
  initialPlayers,
  initialRegistrations,
  initialTeams,
  matchStatuses,
  tournamentPhases,
} from "../data/tournament";
import {
  calculateAllRankings,
  calculateGlobalLeaderboard,
  createEmptyStats,
} from "../utils/rankingEngine";

const AppContext = createContext();

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;

export function AppProvider({ children }) {
  const [gameConfigs, setGameConfigs] = useState(initialGameConfigs);
  const [players, setPlayers] = useState(initialPlayers);
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [teams, setTeams] = useState(initialTeams);
  const [matches, setMatches] = useState(initialMatches);
  const [currentUser, setCurrentUser] = useState(mockedCurrentUser);

  const rankingsByGame = useMemo(
    () => calculateAllRankings({ gameConfigs, players, matches }),
    [gameConfigs, players, matches]
  );

  const globalLeaderboard = useMemo(
    () => calculateGlobalLeaderboard({ rankingsByGame }),
    [rankingsByGame]
  );

  const createTeam = ({ name, tag, gameId, playerIds = [], matchId = null }) => {
    const id = createId("team");
    const enrolledIds = new Set(getRegisteredPlayers(gameId).map((player) => player.id));
    const availablePlayerIds = playerIds.filter((playerId) =>
      enrolledIds.has(playerId) &&
      !teams.some((team) => team.gameId === gameId && team.status === "Activo" && team.playerIds.includes(playerId))
    );

    const newTeam = {
      id,
      name,
      tag: tag || name.slice(0, 3).toUpperCase(),
      type: "Temporal",
      status: "Activo",
      matchId,
      gameId,
      playerIds: availablePlayerIds,
    };

    setTeams((prev) => [...prev, newTeam]);
  };

  const updateTeam = (teamId, updates) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === teamId ? { ...team, ...updates } : team))
    );
  };

  const deleteTeam = (teamId) => {
    setTeams((prev) => prev.filter((team) => team.id !== teamId));
    setMatches((prev) =>
      prev.map((match) => ({
        ...match,
        teamResults: match.teamResults.filter((result) => result.teamId !== teamId),
        playerResults: match.playerResults?.filter((result) => result.teamId !== teamId) ?? [],
      }))
    );
  };

  const assignPlayerToTeam = (teamId, playerId) => {
    const targetTeam = teams.find((team) => team.id === teamId);
    const isRegistered = registrations.some(
      (registration) => registration.userId === playerId && registration.gameId === targetTeam?.gameId
    );
    const isBusy = teams.some(
      (team) => team.id !== teamId && team.gameId === targetTeam?.gameId && team.status === "Activo" && team.playerIds.includes(playerId)
    );
    if (!targetTeam || !isRegistered || isBusy) return false;

    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? { ...team, playerIds: [...new Set([...team.playerIds, playerId])] }
          : team
      )
    );
    return true;
  };

  const removePlayerFromTeam = (teamId, playerId) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? { ...team, playerIds: team.playerIds.filter((id) => id !== playerId) }
          : team
      )
    );
  };

  const createMatch = ({ gameId, stage, phaseType, map, teamIds, scheduledAt, duration = 0 }) => {
    const gameConfig = gameConfigs.find((game) => game.id === gameId);
    if (!gameConfig) return;

    const matchId = createId("match");
    setTeams((prev) => prev.map((team) => (teamIds.includes(team.id) ? { ...team, matchId } : team)));
    setMatches((prev) => [
      {
        id: matchId,
        gameId,
        phaseType,
        stage,
        map,
        status: "Pendiente",
        duration,
        scheduledAt,
        playerIds: teams.filter((team) => teamIds.includes(team.id)).flatMap((team) => team.playerIds),
        teamResults: teamIds.map((teamId) => ({
          teamId,
          playerIds: teams.find((team) => team.id === teamId)?.playerIds ?? [],
          stats: createEmptyStats(gameConfig),
        })),
        playerResults: [],
      },
      ...prev,
    ]);
  };

  const updateMatchStatus = (matchId, status) => {
    setMatches((prev) => prev.map((match) => (match.id === matchId ? { ...match, status } : match)));
    if (["Finalizada", "Cancelada"].includes(status)) {
      const match = matches.find((item) => item.id === matchId);
      const teamIds = match?.teamResults.map((result) => result.teamId) ?? [];
      setTeams((prev) => prev.map((team) => (teamIds.includes(team.id) ? { ...team, status: "Cerrado" } : team)));
    }
  };

  const updateMatchResult = (matchId, playerId, stats, points = 0, won = false) => {
    const matchToClose = matches.find((match) => match.id === matchId);
    const teamIdsToClose = matchToClose?.teamResults.map((result) => result.teamId) ?? [];
    setTeams((prev) => prev.map((team) => (teamIdsToClose.includes(team.id) ? { ...team, status: "Cerrado" } : team)));
    setMatches((prev) =>
      prev.map((match) => {
        if (match.id !== matchId) return match;
        const teamId = match.teamResults.find((result) => result.playerIds.includes(playerId))?.teamId;
        const playerResult = { playerId, teamId, stats, points: Number(points), won };
        const existing = match.playerResults ?? [];
        const nextPlayerResults = existing.some((result) => result.playerId === playerId)
          ? existing.map((result) => (result.playerId === playerId ? playerResult : result))
          : [...existing, playerResult];

        return { ...match, status: "Finalizada", playerResults: nextPlayerResults };
      })
    );
  };

  const updateLiveRound = (matchId, playerId, metricKey, delta = 1) => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.id !== matchId) return match;
        const teamId = match.teamResults.find((result) => result.playerIds.includes(playerId))?.teamId;
        const existing = match.playerResults?.find((result) => result.playerId === playerId);
        const stats = {
          ...(existing?.stats ?? {}),
          [metricKey]: Math.max(0, Number(existing?.stats?.[metricKey] ?? 0) + delta),
        };
        const playerResult = { playerId, teamId, stats, points: existing?.points ?? 0, won: existing?.won ?? false };
        const nextPlayerResults = match.playerResults?.some((result) => result.playerId === playerId)
          ? match.playerResults.map((result) => (result.playerId === playerId ? playerResult : result))
          : [...(match.playerResults ?? []), playerResult];
        return { ...match, status: "En curso", playerResults: nextPlayerResults };
      })
    );
  };

  const createGame = (game) => {
    const id = game.id || createId("game");
    const newGame = {
      id,
      legacyId: Date.now(),
      shortName: game.shortName || game.name,
      image: game.image,
      accent: game.accent || "#06b6d4",
      teamSize: game.teamSize || "4 jugadores",
      duration: game.duration || "Configurable",
      format: game.format || "Partida personalizada",
      status: game.status || "Activo",
      description: game.description || "Nuevo juego disponible en ISC Playground.",
      pointFormula: game.pointFormula || "puntos manuales + métricas",
      scoringRules: game.scoringRules?.length ? game.scoringRules : [{ key: "points", label: "Mayor puntuación", direction: "desc" }],
      metrics: game.metrics?.length ? game.metrics : [{ key: "points", label: "Puntos", type: "number", defaultValue: 0 }],
      maps: game.maps || [],
      visualMetrics: game.visualMetrics?.length ? game.visualMetrics : ["points"],
      winCondition: game.winCondition || "Gana el usuario con mejor puntuación individual.",
      ...game,
      id,
    };
    setGameConfigs((prev) => [newGame, ...prev]);
  };

  const registerToGame = (gameId, userId = currentUser?.id) => {
    if (!userId || registrations.some((registration) => registration.userId === userId && registration.gameId === gameId)) return;

    setRegistrations((prev) => [
      ...prev,
      {
        id: createId("reg"),
        userId,
        gameId,
        status: "inscrito",
        registeredAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      },
    ]);
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === userId ? { ...player, games: [...new Set([...(player.games ?? []), gameId])] } : player
      )
    );
  };

  const cancelRegistration = (gameId, userId = currentUser?.id) => {
    const hasStarted = matches.some(
      (match) => match.gameId === gameId && match.playerIds.includes(userId) && !["Pendiente", "Cancelada"].includes(match.status)
    );
    if (!userId || hasStarted) return false;

    setRegistrations((prev) =>
      prev.filter((registration) => !(registration.userId === userId && registration.gameId === gameId))
    );
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === userId ? { ...player, games: (player.games ?? []).filter((id) => id !== gameId) } : player
      )
    );
    return true;
  };

  const getRegistration = (gameId, userId = currentUser?.id) =>
    registrations.find((registration) => registration.gameId === gameId && registration.userId === userId);

  const getRegisteredPlayers = (gameId) =>
    registrations
      .filter((registration) => registration.gameId === gameId)
      .map((registration) => ({
        ...players.find((player) => player.id === registration.userId),
        registrationStatus: registration.status,
        registeredAt: registration.registeredAt,
      }))
      .filter((player) => player.id);

  const updateGame = (gameId, updates) => {
    setGameConfigs((prev) => prev.map((game) => (game.id === gameId ? { ...game, ...updates } : game)));
  };

  const deleteGame = (gameId) => {
    setGameConfigs((prev) => prev.filter((game) => game.id !== gameId));
    setMatches((prev) => prev.filter((match) => match.gameId !== gameId));
    setTeams((prev) => prev.filter((team) => team.gameId !== gameId));
  };

  const toggleGameStatus = (gameId) => {
    setGameConfigs((prev) =>
      prev.map((game) =>
        game.id === gameId ? { ...game, status: game.status === "Activo" ? "Desactivado" : "Activo" } : game
      )
    );
  };

  const updateCurrentUser = (updates) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const logout = () => setCurrentUser(null);

  const value = {
    currentUser,
    gameConfigs,
    tournamentPhases,
    matchStatuses,
    players,
    registrations,
    teams,
    matches,
    rankingsByGame,
    globalLeaderboard,
    createGame,
    updateGame,
    deleteGame,
    toggleGameStatus,
    registerToGame,
    cancelRegistration,
    getRegistration,
    getRegisteredPlayers,
    createTeam,
    updateTeam,
    deleteTeam,
    assignPlayerToTeam,
    removePlayerFromTeam,
    createMatch,
    updateMatchStatus,
    updateMatchResult,
    updateLiveRound,
    updateCurrentUser,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
