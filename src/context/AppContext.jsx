// =====================================================
// CONTEXTO GLOBAL DE LA APLICACIÓN
// =====================================================
// Este archivo conecta el front con el backend.
// Antes el proyecto usaba datos mock/localStorage.
// Ahora cargamos juegos, usuarios, inscripciones, equipos,
// partidas y rankings desde la API.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Datos estáticos que todavía vienen del frontend.
// No dependen de la base de datos.
import { tournamentPhases, matchStatuses } from "../data/tournament";

// Instancia de axios configurada con baseURL y token JWT.
import api from "../api/axios.js";

// Creamos el contexto.
const AppContext = createContext();

// =====================================================
// HELPER: LEER USUARIO DEL LOCALSTORAGE
// =====================================================
// El backend maneja la sesión con token JWT.
// Pero el frontend guarda el usuario en localStorage para
// recordar la sesión cuando recargas la página.
const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem("isc_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// =====================================================
// PROVIDER PRINCIPAL
// =====================================================
// Este componente envuelve toda la app desde main.jsx.
// Todo lo que pongamos en "value" estará disponible usando useApp().
export function AppProvider({ children }) {
  // =====================================================
  // ESTADOS PRINCIPALES
  // =====================================================
  // Estos estados reemplazan a los datos mock del front original.

  // Usuario actual logueado.
  const [currentUser, setCurrentUser] = useState(getUserFromStorage);

  // Catálogo de juegos.
  const [gameConfigs, setGameConfigs] = useState([]);

  // Lista de usuarios/jugadores.
  const [players, setPlayers] = useState([]);

  // Inscripciones de usuarios a juegos.
  const [registrations, setRegistrations] = useState([]);

  // Equipos temporales creados por admin.
  const [teams, setTeams] = useState([]);

  // Partidas creadas por admin.
  const [matches, setMatches] = useState([]);

  // Ranking por juego.
  // Ejemplo:
  // {
  //   "bomb-squad": [...],
  //   "counter-strike-16": [...]
  // }
  const [rankingsByGame, setRankingsByGame] = useState({});

  // Ranking global.
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);

  // Loading general para evitar redirecciones antes de cargar datos.
  const [loading, setLoading] = useState(true);

  // =====================================================
  // HELPER: PETICIÓN SEGURA
  // =====================================================
  // Sirve para que si falla un endpoint secundario,
  // no se caiga toda la app.
  //
  // Ejemplo:
  // Si falla /rankings/global, todavía queremos que cargue /games.
  const safeGet = async (url, responseKey, fallbackValue) => {
    try {
      const response = await api.get(url);
      return response.data?.[responseKey] ?? fallbackValue;
    } catch (err) {
      console.warn(
        `[AppContext] No se pudo cargar ${url}:`,
        err.response?.data?.error ?? err.message,
      );

      return fallbackValue;
    }
  };

  // =====================================================
  // CARGA INICIAL DE DATOS
  // =====================================================
  // Se ejecuta una vez cuando carga la app.
  //
  // Importante:
  // - Primero cargamos juegos.
  // - Luego, por cada juego, cargamos equipos, partidas,
  //   rankings e inscripciones.
  // - Las inscripciones ahora se cargan por gameId para que
  //   también sirvan en el dashboard admin.
  const loadAll = useCallback(async () => {
    setLoading(true);

    try {
      // -----------------------------
      // 1. Cargar juegos
      // -----------------------------
      // Este es el dato más importante. Sin juegos, varias páginas
      // no tienen qué mostrar.
      const games = await safeGet("/games", "games", []);
      setGameConfigs(games);

      // -----------------------------
      // 2. Cargar usuarios
      // -----------------------------
      // Los usuarios se usan para:
      // - Dashboard > Usuarios
      // - Armar equipos
      // - Mostrar inscritos por juego
      const users = await safeGet("/users", "users", []);
      setPlayers(users);

      // -----------------------------
      // 3. Cargar ranking global
      // -----------------------------
      // Si falla, no debe romper Home/Juegos.
      const globalRanking = await safeGet("/rankings/global", "ranking", []);
      setGlobalLeaderboard(globalRanking);

      // -----------------------------
      // 4. Cargar datos por cada juego
      // -----------------------------
      // Aquí se agrupa lo relacionado a cada juego:
      // equipos, partidas, ranking e inscripciones.
      if (games.length > 0) {
        const perGameResults = await Promise.all(
          games.map(async (game) => {
            const [gameTeams, gameMatches, gameRanking, gameRegistrations] =
              await Promise.all([
                safeGet(`/teams?gameId=${game.id}`, "teams", []),
                safeGet(`/matches?gameId=${game.id}`, "matches", []),
                safeGet(`/rankings?gameId=${game.id}`, "ranking", []),
                safeGet(
                  `/registrations?gameId=${game.id}`,
                  "registrations",
                  [],
                ),
              ]);

            return {
              gameId: game.id,
              teams: gameTeams,
              matches: gameMatches,
              ranking: gameRanking,
              registrations: gameRegistrations,
            };
          }),
        );

        // Unimos todos los equipos de todos los juegos.
        setTeams(perGameResults.flatMap((item) => item.teams));

        // Unimos todas las partidas de todos los juegos.
        setMatches(perGameResults.flatMap((item) => item.matches));

        // Unimos todas las inscripciones de todos los juegos.
        // Esto permite que getRegisteredPlayers(gameId) funcione
        // aunque el usuario actual no sea admin.
        setRegistrations(perGameResults.flatMap((item) => item.registrations));

        // Convertimos rankings por juego en un objeto:
        // { gameId: ranking[] }
        setRankingsByGame(
          Object.fromEntries(
            perGameResults.map((item) => [item.gameId, item.ranking]),
          ),
        );
      } else {
        // Si no hay juegos, limpiamos estados dependientes.
        setTeams([]);
        setMatches([]);
        setRegistrations([]);
        setRankingsByGame({});
      }
    } catch (err) {
      console.error(
        "[AppContext] Error general cargando datos:",
        err.response?.data?.error ?? err.message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Ejecutamos loadAll cuando se monta la app.
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // =====================================================
  // RECARGAR RANKINGS
  // =====================================================
  // Se usa después de registrar resultados de partidas.
  const reloadRankings = async () => {
    const globalRanking = await safeGet("/rankings/global", "ranking", []);

    const gameRankings = await Promise.all(
      gameConfigs.map(async (game) => {
        const ranking = await safeGet(
          `/rankings?gameId=${game.id}`,
          "ranking",
          [],
        );

        return [game.id, ranking];
      }),
    );

    setGlobalLeaderboard(globalRanking);
    setRankingsByGame(Object.fromEntries(gameRankings));
  };

  // =====================================================
  // USUARIO / SESIÓN
  // =====================================================

  // Actualiza currentUser y también localStorage.
  // Se usa en Login y Perfil.
  const updateCurrentUser = (updates) => {
    const updatedUser = currentUser ? { ...currentUser, ...updates } : updates;

    setCurrentUser(updatedUser);
    localStorage.setItem("isc_user", JSON.stringify(updatedUser));

    // También sincronizamos el usuario dentro de players.
    // Así Perfil y Dashboard > Usuarios ven el cambio sin recargar.
    setPlayers((prev) => {
      const exists = prev.some((player) => player.id === updatedUser.id);

      if (exists) {
        return prev.map((player) =>
          player.id === updatedUser.id ? { ...player, ...updatedUser } : player,
        );
      }

      return [updatedUser, ...prev];
    });
  };

  // =====================================================
  // ACTUALIZAR PERFIL EN BACKEND
  // =====================================================
  //
  // Esta función se usa en /perfil.
  //
  // Diferencia importante:
  // - updateCurrentUser() solo actualiza el estado local.
  // - updateProfile() manda PATCH al backend y luego sincroniza el estado.
  //
  // Endpoint usado:
  // PATCH /api/users/:id
  //
  // Body:
  // {
  //   username,
  //   name
  // }
  const updateProfile = async (updates) => {
    if (!currentUser?.id) {
      console.warn("[updateProfile] No hay usuario logueado");
      return false;
    }

    try {
      const response = await api.patch(`/users/${currentUser.id}`, {
        username: updates.username?.trim(),
        name: updates.name?.trim(),
      });

      const updatedUser = response.data.user;

      // Actualizamos currentUser y localStorage.
      setCurrentUser(updatedUser);
      localStorage.setItem("isc_user", JSON.stringify(updatedUser));

      // También actualizamos la lista de jugadores.
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === updatedUser.id ? { ...player, ...updatedUser } : player,
        ),
      );

      return true;
    } catch (err) {
      console.error(
        "[updateProfile]",
        err.response?.data?.error ?? err.message,
      );
      return false;
    }
  };

  // Cierra sesión.
  const logout = () => {
    localStorage.removeItem("isc_user");
    localStorage.removeItem("isc_token");
    setCurrentUser(null);
  };

  // =====================================================
  // CREAR JUEGO
  // =====================================================
  //
  // Usado por Dashboard > Juegos.
  // Recibe un payload ya preparado desde el formulario admin.
  //
  // Importante:
  // - Ya NO usamos Date.now() como legacyId.
  // - Date.now() es demasiado grande para un Int de PostgreSQL.
  // - El formulario admin debe mandar legacyId pequeño: 1, 2, 3, 4...
  const createGame = async (game) => {
    try {
      const response = await api.post("/games", game);
      const createdGame = response.data.game;

      // Agregamos el juego recién creado al estado local.
      setGameConfigs((prev) => [createdGame, ...prev]);

      // Inicializamos su ranking vacío para evitar undefined.
      setRankingsByGame((prev) => ({
        ...prev,
        [createdGame.id]: [],
      }));

      return true;
    } catch (err) {
      console.error("[createGame]", err.response?.data?.error ?? err.message);
      return false;
    }
  };

  // =====================================================
  // ACTUALIZAR JUEGO
  // =====================================================
  //
  // Usado por Dashboard > Juegos.
  // Actualiza datos generales, reglas, métricas y mapas.
  const updateGame = async (gameId, updates) => {
    try {
      const response = await api.patch(`/games/${gameId}`, updates);
      const updatedGame = response.data.game;

      setGameConfigs((prev) =>
        prev.map((game) => (game.id === gameId ? updatedGame : game)),
      );

      return true;
    } catch (err) {
      console.error("[updateGame]", err.response?.data?.error ?? err.message);
      return false;
    }
  };

  const deleteGame = async (gameId) => {
    try {
      await api.delete(`/games/${gameId}`);

      // Limpiamos localmente todo lo relacionado con ese juego.
      setGameConfigs((prev) => prev.filter((game) => game.id !== gameId));
      setTeams((prev) => prev.filter((team) => team.gameId !== gameId));
      setMatches((prev) => prev.filter((match) => match.gameId !== gameId));
      setRegistrations((prev) =>
        prev.filter((registration) => registration.gameId !== gameId),
      );
    } catch (err) {
      console.error("[deleteGame]", err.response?.data?.error ?? err.message);
    }
  };

  const toggleGameStatus = async (gameId) => {
    try {
      const response = await api.patch(`/games/${gameId}/status`);

      setGameConfigs((prev) =>
        prev.map((game) => (game.id === gameId ? response.data.game : game)),
      );
    } catch (err) {
      console.error(
        "[toggleGameStatus]",
        err.response?.data?.error ?? err.message,
      );
    }
  };

  // =====================================================
  // INSCRIBIR USUARIO A JUEGO
  // =====================================================
  //
  // Regla corregida:
  // Un usuario puede inscribirse a varios juegos.
  //
  // Lo único que bloqueamos aquí:
  // - Que se inscriba dos veces al mismo juego.
  //
  // La restricción de equipos se aplica en Dashboard > Equipos:
  // un jugador no puede estar en dos equipos activos del mismo juego.
  const registerToGame = async (gameId, userId = currentUser?.id) => {
    if (!currentUser || !userId) {
      console.warn("[registerToGame] No hay usuario logueado");
      return false;
    }

    // Evita duplicados en el mismo juego.
    const alreadyRegistered = registrations.some(
      (registration) =>
        registration.gameId === gameId && registration.userId === userId,
    );

    if (alreadyRegistered) {
      return true;
    }

    try {
      const response = await api.post("/registrations", {
        userId,
        gameId,
      });

      const registration = response.data.registration;

      setRegistrations((prev) => [...prev, registration]);

      // Guardamos todos los juegos del usuario, no solo uno.
      updateCurrentUser({
        games: [...new Set([...(currentUser.games ?? []), gameId])],
      });

      return true;
    } catch (err) {
      const message = err.response?.data?.error ?? err.message;

      console.error("[registerToGame]", message);
      alert(message);

      return false;
    }
  };

  // =====================================================
  // CANCELAR INSCRIPCIÓN
  // =====================================================
  //
  // Cancela la inscripción del usuario actual.
  // El backend puede bloquear la cancelación si el usuario
  // tiene una partida En preparación o En curso.
  const cancelRegistration = async (gameId, userId = currentUser?.id) => {
    if (!currentUser || !userId) {
      console.warn("[cancelRegistration] No hay usuario logueado");
      return {
        ok: false,
        message: "No hay usuario logueado.",
      };
    }

    const registration = registrations.find(
      (item) => item.gameId === gameId && item.userId === userId,
    );

    if (!registration) {
      console.warn("[cancelRegistration] No existe inscripción local");

      return {
        ok: false,
        message: "No existe una inscripción local para cancelar.",
      };
    }

    try {
      await api.delete(`/registrations/${registration.id}`);

      setRegistrations((prev) =>
        prev.filter(
          (item) => !(item.gameId === gameId && item.userId === userId),
        ),
      );

      updateCurrentUser({
        games: (currentUser.games ?? []).filter((id) => id !== gameId),
      });

      return {
        ok: true,
        message: "Inscripción cancelada correctamente.",
      };
    } catch (err) {
      const message = err.response?.data?.error ?? err.message;

      console.error("[cancelRegistration]", message);

      return {
        ok: false,
        message,
      };
    }
  };

  // Devuelve la inscripción del usuario actual a un juego.
  const getRegistration = (gameId, userId = currentUser?.id) => {
    return registrations.find(
      (registration) =>
        registration.gameId === gameId && registration.userId === userId,
    );
  };

  // Devuelve los usuarios inscritos a un juego.
  // Esto lo usan Home, Juegos y Dashboard > Equipos.
  const getRegisteredPlayers = (gameId) => {
    return registrations
      .filter((registration) => registration.gameId === gameId)
      .map((registration) => {
        const player = players.find((item) => item.id === registration.userId);

        if (!player) return null;

        return {
          ...player,
          registrationStatus: registration.status,
          registeredAt: registration.registeredAt,
        };
      })
      .filter(Boolean);
  };

  // =====================================================
  // EQUIPOS
  // =====================================================
  //
  // Los equipos son temporales.
  // Se crean por juego y sirven para armar partidas.
  // Solo pueden tener jugadores inscritos en ese juego.

  const createTeam = async ({
    name,
    tag,
    gameId,
    playerIds = [],
    matchId = null,
  }) => {
    try {
      const response = await api.post("/teams", {
        name,
        tag,
        gameId,
        playerIds,
        matchId,
      });

      const createdTeam = response.data.team;

      setTeams((prev) => [...prev, createdTeam]);

      return true;
    } catch (err) {
      console.error("[createTeam]", err.response?.data?.error ?? err.message);
      return false;
    }
  };

  const updateTeam = async (teamId, updates) => {
    try {
      const response = await api.patch(`/teams/${teamId}`, updates);
      const updatedTeam = response.data.team;

      setTeams((prev) =>
        prev.map((team) => (team.id === teamId ? updatedTeam : team)),
      );

      return true;
    } catch (err) {
      console.error("[updateTeam]", err.response?.data?.error ?? err.message);
      return false;
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      await api.delete(`/teams/${teamId}`);

      setTeams((prev) => prev.filter((team) => team.id !== teamId));

      return true;
    } catch (err) {
      console.error("[deleteTeam]", err.response?.data?.error ?? err.message);
      return false;
    }
  };

  const assignPlayerToTeam = async (teamId, playerId) => {
    try {
      const response = await api.post(`/teams/${teamId}/players`, {
        playerId,
      });

      const updatedTeam = response.data.team;

      setTeams((prev) =>
        prev.map((team) => (team.id === teamId ? updatedTeam : team)),
      );

      return true;
    } catch (err) {
      console.error(
        "[assignPlayerToTeam]",
        err.response?.data?.error ?? err.message,
      );
      return false;
    }
  };

  const removePlayerFromTeam = async (teamId, playerId) => {
    try {
      const response = await api.delete(`/teams/${teamId}/players/${playerId}`);
      const updatedTeam = response.data.team;

      setTeams((prev) =>
        prev.map((team) => (team.id === teamId ? updatedTeam : team)),
      );

      return true;
    } catch (err) {
      console.error(
        "[removePlayerFromTeam]",
        err.response?.data?.error ?? err.message,
      );
      return false;
    }
  };

  // =====================================================
  // PARTIDAS
  // =====================================================
  //
  // Las partidas se crean desde equipos temporales.
  // El flujo correcto es:
  // 1. Crear equipos en Dashboard > Equipos.
  // 2. Crear partida con 2 equipos activos.
  // 3. Poner partida "En curso".
  // 4. Registrar resultados.
  // 5. Finalizar partida para que cuente en ranking.

  const createMatch = async ({
    gameId,
    stage,
    phaseType,
    map,
    teamIds,
    scheduledAt,
    duration = 10,
  }) => {
    try {
      const response = await api.post("/matches", {
        gameId,
        phaseType,
        stage,
        map,
        scheduledAt,
        duration,
        teamIds,
      });

      const createdMatch = response.data.match;

      setMatches((prev) => [createdMatch, ...prev]);

      // Marcamos localmente los equipos usados por la partida.
      setTeams((prev) =>
        prev.map((team) =>
          teamIds.includes(team.id)
            ? { ...team, matchId: createdMatch.id }
            : team,
        ),
      );

      return true;
    } catch (err) {
      console.error("[createMatch]", err.response?.data?.error ?? err.message);
      return false;
    }
  };

  const updateMatchStatus = async (matchId, status) => {
    try {
      const response = await api.patch(`/matches/${matchId}/status`, {
        status,
      });

      const updatedMatch = response.data.match;

      setMatches((prev) =>
        prev.map((match) => (match.id === matchId ? updatedMatch : match)),
      );

      // Si se finaliza o cancela, el backend cierra los equipos.
      // Recargamos todo para sincronizar equipos, partidas y rankings.
      if (status === "Finalizada" || status === "Cancelada") {
        await loadAll();
        await reloadRankings();
      }

      return true;
    } catch (err) {
      console.error(
        "[updateMatchStatus]",
        err.response?.data?.error ?? err.message,
      );
      return false;
    }
  };

  const updateMatchResult = async (
    matchId,
    playerId,
    stats,
    points = 0,
    won = false,
  ) => {
    try {
      const match = matches.find((item) => item.id === matchId);

      // Buscamos el equipo real del jugador dentro de la partida.
      const teamId =
        match?.teamResults?.find((teamResult) =>
          teamResult.playerIds?.includes(playerId),
        )?.teamId ?? "";

      const response = await api.post(`/matches/${matchId}/results`, {
        playerId,
        teamId,
        stats,
        points,
        won,
      });

      const result = response.data.result;

      setMatches((prev) =>
        prev.map((matchItem) => {
          if (matchItem.id !== matchId) return matchItem;

          const existingResults = matchItem.playerResults ?? [];

          const nextResults = existingResults.some(
            (item) => item.playerId === playerId,
          )
            ? existingResults.map((item) =>
                item.playerId === playerId ? result : item,
              )
            : [...existingResults, result];

          return {
            ...matchItem,
            playerResults: nextResults,
            playerIds: [...new Set([...(matchItem.playerIds ?? []), playerId])],
          };
        }),
      );

      // El ranking solo cambiará realmente si la partida está Finalizada.
      await reloadRankings();

      return true;
    } catch (err) {
      console.error(
        "[updateMatchResult]",
        err.response?.data?.error ?? err.message,
      );
      return false;
    }
  };

  const updateLiveRound = async (matchId, playerId, metricKey, delta = 1) => {
    try {
      const response = await api.patch(`/matches/${matchId}/live`, {
        playerId,
        metricKey,
        delta,
      });

      const result = response.data.result;

      setMatches((prev) =>
        prev.map((matchItem) => {
          if (matchItem.id !== matchId) return matchItem;

          const existingResults = matchItem.playerResults ?? [];

          const nextResults = existingResults.some(
            (item) => item.playerId === playerId,
          )
            ? existingResults.map((item) =>
                item.playerId === playerId ? result : item,
              )
            : [...existingResults, result];

          return {
            ...matchItem,
            playerResults: nextResults,
            playerIds: [...new Set([...(matchItem.playerIds ?? []), playerId])],
          };
        }),
      );

      return true;
    } catch (err) {
      console.error(
        "[updateLiveRound]",
        err.response?.data?.error ?? err.message,
      );
      return false;
    }
  };

  // Devuelve la inscripción actual de un usuario,
  // sin importar a qué juego esté inscrito.
  //
  // Sirve para aplicar la regla:
  // "un usuario solo puede inscribirse a un juego".
  const getUserRegistration = (userId = currentUser?.id) => {
    return registrations.find((registration) => registration.userId === userId);
  };

  // =====================================================
  // VALOR COMPARTIDO DEL CONTEXTO
  // =====================================================
  // Todo lo que se coloque aquí podrá usarse con:
  // const { algo } = useApp()
  const value = {
    // Estados
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
    updateProfile,
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
    getUserRegistration,
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
    loadAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook personalizado para usar el contexto fácilmente.
export const useApp = () => useContext(AppContext);
