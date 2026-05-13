import { createContext, useContext, useMemo, useState } from "react";
import {
  currentUser as mockedCurrentUser,
  gameConfigs,
  initialMatches,
  initialPlayers,
  initialTeams,
} from "../data/tournament";
import {
  calculateAllRankings,
  calculateGlobalLeaderboard,
  createEmptyStats,
} from "../utils/rankingEngine";

const AppContext = createContext();

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;

export function AppProvider({ children }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [teams, setTeams] = useState(initialTeams);
  const [matches, setMatches] = useState(initialMatches);
  const [currentUser, setCurrentUser] = useState(mockedCurrentUser);

  const rankingsByGame = useMemo(
    () => calculateAllRankings({ gameConfigs, teams, matches }),
    [teams, matches]
  );

  const globalLeaderboard = useMemo(
    () => calculateGlobalLeaderboard({ rankingsByGame }),
    [rankingsByGame]
  );

  const createTeam = ({ name, tag, gameIds, playerIds = [] }) => {
    const id = createId("team");
    const newTeam = {
      id,
      name,
      tag: tag || name.slice(0, 3).toUpperCase(),
      captainId: playerIds[0] ?? players[0]?.id,
      playerIds,
      gameIds,
    };

    setTeams((prev) => [...prev, newTeam]);
    setPlayers((prev) =>
      prev.map((player) =>
        playerIds.includes(player.id)
          ? {
              ...player,
              teamIds: [...new Set([...(player.teamIds ?? []), id])],
              games: [...new Set([...(player.games ?? []), ...gameIds])],
            }
          : player
      )
    );
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
      }))
    );
  };

  const assignPlayerToTeam = (teamId, playerId) => {
    const team = teams.find((item) => item.id === teamId);
    if (!team) return;

    setTeams((prev) =>
      prev.map((item) =>
        item.id === teamId
          ? { ...item, playerIds: [...new Set([...item.playerIds, playerId])] }
          : item
      )
    );
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId
          ? {
              ...player,
              teamIds: [...new Set([...(player.teamIds ?? []), teamId])],
              games: [...new Set([...(player.games ?? []), ...team.gameIds])],
            }
          : player
      )
    );
  };

  const createMatch = ({ gameId, stage, map, teamIds, scheduledAt }) => {
    const gameConfig = gameConfigs.find((game) => game.id === gameId);
    if (!gameConfig) return;

    setMatches((prev) => [
      {
        id: createId("match"),
        gameId,
        stage,
        map,
        status: "Programada",
        scheduledAt,
        teamResults: teamIds.map((teamId) => ({
          teamId,
          stats: createEmptyStats(gameConfig),
        })),
      },
      ...prev,
    ]);
  };

  const updateMatchResult = (matchId, teamId, stats) => {
    setMatches((prev) =>
      prev.map((match) =>
        match.id === matchId
          ? {
              ...match,
              status: "Finalizada",
              teamResults: match.teamResults.map((result) =>
                result.teamId === teamId
                  ? { ...result, stats: { ...result.stats, ...stats } }
                  : result
              ),
            }
          : match
      )
    );
  };

  const updateLiveRound = (matchId, teamId, metricKey, delta = 1) => {
    setMatches((prev) =>
      prev.map((match) =>
        match.id === matchId
          ? {
              ...match,
              status: "En vivo",
              teamResults: match.teamResults.map((result) =>
                result.teamId === teamId
                  ? {
                      ...result,
                      stats: {
                        ...result.stats,
                        [metricKey]: Math.max(0, Number(result.stats[metricKey] ?? 0) + delta),
                      },
                    }
                  : result
              ),
            }
          : match
      )
    );
  };

  const updateCurrentUser = (updates) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const value = {
    currentUser,
    gameConfigs,
    players,
    teams,
    matches,
    rankingsByGame,
    globalLeaderboard,
    createTeam,
    updateTeam,
    deleteTeam,
    assignPlayerToTeam,
    createMatch,
    updateMatchResult,
    updateLiveRound,
    updateCurrentUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
