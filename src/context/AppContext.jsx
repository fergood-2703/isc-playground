import { createContext, useContext, useCallback, useEffect, useState } from "react"
import { tournamentPhases, matchStatuses } from "../data/tournament"
import api from "../api/axios.js"

const AppContext = createContext()

// ─────────────────────────────
// LEER USUARIO DEL LOCALSTORAGE
// ─────────────────────────────
const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem("isc_user")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  // ─────────────────────────────
  // ESTADO PRINCIPAL
  // ─────────────────────────────
  // Arranca vacío — se llena desde el backend
  const [currentUser, setCurrentUser] = useState(getUserFromStorage)
  const [gameConfigs, setGameConfigs] = useState([])
  const [players, setPlayers] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [rankingsByGame, setRankingsByGame] = useState({})
  const [globalLeaderboard, setGlobalLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  // ─────────────────────────────
  // CARGA INICIAL DE DATOS
  // ─────────────────────────────
  // Se ejecuta al montar el provider
  // Carga todos los datos del backend en paralelo
  const loadAll = useCallback(async () => {
    try {
      setLoading(true)

      // Juegos y usuarios — siempre públicos
      const [gamesRes, usersRes, globalRes] = await Promise.all([
        api.get("/games"),
        api.get("/users"),
        api.get("/rankings/global")
      ])

      const games = gamesRes.data.games ?? []
      setGameConfigs(games)
      setPlayers(usersRes.data.users ?? [])
      setGlobalLeaderboard(globalRes.data.ranking ?? [])

      // Equipos, partidas y rankings por cada juego en paralelo
      if (games.length > 0) {
        const perGameResults = await Promise.all(
          games.map(game =>
            Promise.all([
              api.get(`/teams?gameId=${game.id}`),
              api.get(`/matches?gameId=${game.id}`),
              api.get(`/rankings?gameId=${game.id}`)
            ]).then(([teamsRes, matchesRes, rankingRes]) => ({
              gameId: game.id,
              teams: teamsRes.data.teams ?? [],
              matches: matchesRes.data.matches ?? [],
              ranking: rankingRes.data.ranking ?? []
            }))
          )
        )

        const allTeams = perGameResults.flatMap(r => r.teams)
        const allMatches = perGameResults.flatMap(r => r.matches)
        const rankingsMap = Object.fromEntries(
          perGameResults.map(r => [r.gameId, r.ranking])
        )

        setTeams(allTeams)
        setMatches(allMatches)
        setRankingsByGame(rankingsMap)
      }

      // Inscripciones del usuario actual si está logueado
      if (getUserFromStorage()?.id) {
        const regRes = await api.get(`/registrations?userId=${getUserFromStorage().id}`)
        setRegistrations(regRes.data.registrations ?? [])
      }

    } catch (err) {
      console.error("[AppContext] Error cargando datos:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // ─────────────────────────────
  // RECARGAR RANKINGS
  // ─────────────────────────────
  // Se llama después de guardar resultados de partidas
  const reloadRankings = async () => {
    try {
      const [globalRes, ...gameRankings] = await Promise.all([
        api.get("/rankings/global"),
        ...gameConfigs.map(game => api.get(`/rankings?gameId=${game.id}`))
      ])
      setGlobalLeaderboard(globalRes.data.ranking ?? [])
      const rankingsMap = Object.fromEntries(
        gameConfigs.map((game, i) => [game.id, gameRankings[i].data.ranking ?? []])
      )
      setRankingsByGame(rankingsMap)
    } catch (err) {
      console.error("[AppContext] Error recargando rankings:", err)
    }
  }

  // ─────────────────────────────
  // USUARIO
  // ─────────────────────────────
  const updateCurrentUser = (updates) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem("isc_user", JSON.stringify(updated))
      return updated
    })
  }

  const logout = () => {
    localStorage.removeItem("isc_user")
    localStorage.removeItem("isc_token")
    setCurrentUser(null)
    setRegistrations([])
  }

  // ─────────────────────────────
  // JUEGOS
  // ─────────────────────────────
  const createGame = async (game) => {
    try {
      const res = await api.post("/games", game)
      setGameConfigs(prev => [res.data.game, ...prev])
    } catch (err) {
      console.error("[createGame]", err.response?.data?.error ?? err.message)
    }
  }

  const updateGame = async (gameId, updates) => {
    try {
      const res = await api.patch(`/games/${gameId}`, updates)
      setGameConfigs(prev => prev.map(g => g.id === gameId ? res.data.game : g))
    } catch (err) {
      console.error("[updateGame]", err.response?.data?.error ?? err.message)
    }
  }

  const deleteGame = async (gameId) => {
    try {
      await api.delete(`/games/${gameId}`)
      setGameConfigs(prev => prev.filter(g => g.id !== gameId))
      setMatches(prev => prev.filter(m => m.gameId !== gameId))
      setTeams(prev => prev.filter(t => t.gameId !== gameId))
    } catch (err) {
      console.error("[deleteGame]", err.response?.data?.error ?? err.message)
    }
  }

  const toggleGameStatus = async (gameId) => {
    try {
      const res = await api.patch(`/games/${gameId}/status`)
      setGameConfigs(prev => prev.map(g => g.id === gameId ? res.data.game : g))
    } catch (err) {
      console.error("[toggleGameStatus]", err.response?.data?.error ?? err.message)
    }
  }

  // ─────────────────────────────
  // INSCRIPCIONES
  // ─────────────────────────────
  const registerToGame = async (gameId, userId = currentUser?.id) => {
    if (!userId || !currentUser) return
    try {
      const res = await api.post("/registrations", { userId, gameId })
      setRegistrations(prev => [...prev, res.data.registration])
      // Actualizamos el array games del usuario en contexto
      updateCurrentUser({
        games: [...(currentUser.games ?? []), gameId]
      })
    } catch (err) {
      console.error("[registerToGame]", err.response?.data?.error ?? err.message)
    }
  }

  const cancelRegistration = async (gameId, userId = currentUser?.id) => {
    if (!userId || !currentUser) return false
    // Buscamos la inscripción real para obtener su id de BD
    const reg = registrations.find(r => r.gameId === gameId && r.userId === userId)
    if (!reg) return false
    try {
      await api.delete(`/registrations/${reg.id}`)
      setRegistrations(prev => prev.filter(r => !(r.gameId === gameId && r.userId === userId)))
      updateCurrentUser({
        games: (currentUser.games ?? []).filter(id => id !== gameId)
      })
      return true
    } catch (err) {
      console.error("[cancelRegistration]", err.response?.data?.error ?? err.message)
      return false
    }
  }

  const getRegistration = (gameId, userId = currentUser?.id) =>
    registrations.find(r => r.gameId === gameId && r.userId === userId)

  const getRegisteredPlayers = (gameId) =>
    registrations
      .filter(r => r.gameId === gameId)
      .map(r => {
        const player = players.find(p => p.id === r.userId)
        return player ? { ...player, registrationStatus: r.status, registeredAt: r.registeredAt } : null
      })
      .filter(Boolean)

  // ─────────────────────────────
  // EQUIPOS
  // ─────────────────────────────
  const createTeam = async ({ name, tag, gameId, playerIds = [], matchId = null }) => {
    try {
      const res = await api.post("/teams", { name, tag, gameId, playerIds, matchId })
      setTeams(prev => [...prev, res.data.team])
    } catch (err) {
      console.error("[createTeam]", err.response?.data?.error ?? err.message)
    }
  }

  const updateTeam = async (teamId, updates) => {
    try {
      const res = await api.patch(`/teams/${teamId}`, updates)
      setTeams(prev => prev.map(t => t.id === teamId ? res.data.team : t))
    } catch (err) {
      console.error("[updateTeam]", err.response?.data?.error ?? err.message)
    }
  }

  const deleteTeam = async (teamId) => {
    try {
      await api.delete(`/teams/${teamId}`)
      setTeams(prev => prev.filter(t => t.id !== teamId))
    } catch (err) {
      console.error("[deleteTeam]", err.response?.data?.error ?? err.message)
    }
  }

  const assignPlayerToTeam = async (teamId, playerId) => {
    try {
      const res = await api.post(`/teams/${teamId}/players`, { playerId })
      setTeams(prev => prev.map(t => t.id === teamId ? res.data.team : t))
      return true
    } catch (err) {
      console.error("[assignPlayerToTeam]", err.response?.data?.error ?? err.message)
      return false
    }
  }

  const removePlayerFromTeam = async (teamId, playerId) => {
    try {
      const res = await api.delete(`/teams/${teamId}/players/${playerId}`)
      setTeams(prev => prev.map(t => t.id === teamId ? res.data.team : t))
    } catch (err) {
      console.error("[removePlayerFromTeam]", err.response?.data?.error ?? err.message)
    }
  }

  // ─────────────────────────────
  // PARTIDAS
  // ─────────────────────────────
  const createMatch = async ({ gameId, stage, phaseType, map, teamIds, scheduledAt, duration = 0 }) => {
    try {
      const res = await api.post("/matches", {
        gameId, phaseType, stage, map, scheduledAt, duration, teamIds
      })
      setMatches(prev => [res.data.match, ...prev])
      // Actualizamos el matchId en los equipos involucrados
      setTeams(prev => prev.map(t =>
        teamIds.includes(t.id) ? { ...t, matchId: res.data.match.id } : t
      ))
    } catch (err) {
      console.error("[createMatch]", err.response?.data?.error ?? err.message)
    }
  }

  const updateMatchStatus = async (matchId, status) => {
    try {
      const res = await api.patch(`/matches/${matchId}/status`, { status })
      setMatches(prev => prev.map(m => m.id === matchId ? res.data.match : m))
      // Si finaliza o cancela, los equipos pasan a Cerrado localmente también
      if (status === "Finalizada" || status === "Cancelada") {
        const match = matches.find(m => m.id === matchId)
        const teamIds = match?.teamResults?.map(tr => tr.teamId) ?? []
        setTeams(prev => prev.map(t =>
          teamIds.includes(t.id) ? { ...t, status: "Cerrado" } : t
        ))
        await reloadRankings()
      }
    } catch (err) {
      console.error("[updateMatchStatus]", err.response?.data?.error ?? err.message)
    }
  }

  const updateMatchResult = async (matchId, playerId, stats, points = 0, won = false) => {
    try {
      const res = await api.post(`/matches/${matchId}/results`, {
        playerId, stats, points, won,
        // El teamId lo obtenemos del estado local
        teamId: matches
          .find(m => m.id === matchId)
          ?.teamResults?.find(tr => tr.playerIds?.includes(playerId))
          ?.teamId ?? ""
      })
      // Actualizamos el playerResult en el match local
      setMatches(prev => prev.map(m => {
        if (m.id !== matchId) return m
        const existing = m.playerResults ?? []
        const next = existing.some(r => r.playerId === playerId)
          ? existing.map(r => r.playerId === playerId ? res.data.result : r)
          : [...existing, res.data.result]
        return { ...m, status: "Finalizada", playerResults: next }
      }))
      await reloadRankings()
    } catch (err) {
      console.error("[updateMatchResult]", err.response?.data?.error ?? err.message)
    }
  }

  const updateLiveRound = async (matchId, playerId, metricKey, delta = 1) => {
    try {
      const res = await api.patch(`/matches/${matchId}/live`, {
        playerId, metricKey, delta
      })
      setMatches(prev => prev.map(m => {
        if (m.id !== matchId) return m
        const existing = m.playerResults ?? []
        const next = existing.some(r => r.playerId === playerId)
          ? existing.map(r => r.playerId === playerId ? res.data.result : r)
          : [...existing, res.data.result]
        return { ...m, status: "En curso", playerResults: next }
      }))
    } catch (err) {
      console.error("[updateLiveRound]", err.response?.data?.error ?? err.message)
    }
  }

  // ─────────────────────────────
  // VALOR DEL CONTEXTO
  // ─────────────────────────────
  const value = {
    // Estado
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
    loading,
    // Usuario
    updateCurrentUser,
    logout,
    // Juegos
    createGame,
    updateGame,
    deleteGame,
    toggleGameStatus,
    // Inscripciones
    registerToGame,
    cancelRegistration,
    getRegistration,
    getRegisteredPlayers,
    // Equipos
    createTeam,
    updateTeam,
    deleteTeam,
    assignPlayerToTeam,
    removePlayerFromTeam,
    // Partidas
    createMatch,
    updateMatchStatus,
    updateMatchResult,
    updateLiveRound,
    // Utilidades
    reloadRankings,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)