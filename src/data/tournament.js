import cs from "../assets/images/juegos/cs.jpg";
import bombsquad from "../assets/images/juegos/bombsquad.jpg";
import soulknight from "../assets/images/juegos/soulknight.jpg";

export const gameConfigs = [
  {
    id: "bomb-squad",
    legacyId: 2,
    name: "Bomb Squad",
    shortName: "BombSquad",
    image: bombsquad,
    accent: "#06b6d4",
    teamSize: "2-4 jugadores",
    duration: "5 min",
    format: "Arenas por rondas",
    status: "Activo",
    description: "Combate caótico por equipos temporales; la puntuación final pertenece a cada usuario.",
    pointFormula: "victorias*100 + kills*5 - muertes*2",
    scoringRules: [
      { key: "wins", label: "Mayor número de victorias", direction: "desc" },
      { key: "kills", label: "Mayor número de eliminaciones", direction: "desc" },
      { key: "deaths", label: "Menor número de muertes", direction: "asc" },
    ],
    metrics: [
      { key: "wins", label: "Victorias", type: "number", defaultValue: 0 },
      { key: "losses", label: "Derrotas", type: "number", defaultValue: 0 },
      { key: "kills", label: "Kills", type: "number", defaultValue: 0 },
      { key: "deaths", label: "Muertes", type: "number", defaultValue: 0 },
      { key: "rounds", label: "Rondas", type: "number", defaultValue: 1 },
      { key: "matchTime", label: "Tiempo (min)", type: "number", defaultValue: 5 },
    ],
    visualMetrics: ["wins", "kills", "deaths", "rounds"],
    winCondition: "Gana el usuario con más puntos individuales; el equipo solo organiza la partida.",
  },
  {
    id: "counter-strike-16",
    legacyId: 1,
    name: "Counter Strike 1.6",
    shortName: "CS 1.6",
    image: cs,
    accent: "#8b5cf6",
    teamSize: "5v5",
    duration: "MR configurado",
    format: "Mapas competitivos",
    status: "En bracket",
    description: "FPS táctico con escuadras temporales y ranking individual por rondas, kills y puntos.",
    pointFormula: "rondas*8 + kills*6 + mapas*50",
    scoringRules: [
      { key: "roundsWon", label: "Mayor número de rondas ganadas", direction: "desc" },
      { key: "kills", label: "Mayor número de kills", direction: "desc" },
    ],
    metrics: [
      { key: "roundsWon", label: "Rondas ganadas", type: "number", defaultValue: 0 },
      { key: "kills", label: "Kills", type: "number", defaultValue: 0 },
      { key: "maps", label: "Mapas ganados", type: "number", defaultValue: 0 },
    ],
    maps: ["de_dust2", "de_inferno", "de_nuke", "de_train"],
    visualMetrics: ["roundsWon", "kills", "maps"],
    winCondition: "Gana el usuario con mejor puntuación individual; rondas y kills desempatan.",
  },
  {
    id: "soul-knight",
    legacyId: 3,
    name: "Soul Knight",
    shortName: "Soul Knight",
    image: soulknight,
    accent: "#22c55e",
    teamSize: "4 jugadores",
    duration: "Run cronometrada",
    format: "Co-op roguelike",
    status: "Clasificatorio",
    description: "Runs cooperativas con equipos operativos y ranking individual por bosses, daño y tiempo.",
    pointFormula: "bosses*120 + daño/1000 - tiempo*2",
    scoringRules: [
      { key: "bossesDefeated", label: "Mayor número de jefes derrotados", direction: "desc" },
      { key: "totalTime", label: "Menor tiempo total", direction: "asc" },
      { key: "totalDamage", label: "Mayor damage total", direction: "desc" },
    ],
    metrics: [
      { key: "bossesDefeated", label: "Bosses", type: "number", defaultValue: 0 },
      { key: "totalTime", label: "Tiempo (min)", type: "number", defaultValue: 0 },
      { key: "totalDamage", label: "Damage", type: "number", defaultValue: 0 },
      { key: "monstersKilled", label: "Monstruos", type: "number", defaultValue: 0 },
      { key: "rescuedPartners", label: "Rescates", type: "number", defaultValue: 0 },
      { key: "deaths", label: "Muertes", type: "number", defaultValue: 0 },
    ],
    visualMetrics: ["bossesDefeated", "totalDamage", "monstersKilled", "rescuedPartners"],
    winCondition: "Gana el usuario con más aporte individual; bosses, tiempo y daño desempatan.",
  },
];

export const initialPlayers = [
  { id: "u-1", name: "Fernando Ruiz", username: "fergood", role: "Jugador", status: "Activo", games: ["counter-strike-16", "bomb-squad"] },
  { id: "u-2", name: "Ana López", username: "ana_dev", role: "Jugador", status: "Activo", games: ["soul-knight", "bomb-squad"] },
  { id: "u-3", name: "Carlos Méndez", username: "carlitos", role: "Jugador", status: "Activo", games: ["counter-strike-16"] },
  { id: "u-4", name: "Lucía Gómez", username: "lucia.gg", role: "Jugador", status: "Activo", games: ["soul-knight"] },
  { id: "u-5", name: "Omar Castillo", username: "omarx", role: "Jugador", status: "Activo", games: ["counter-strike-16", "soul-knight"] },
  { id: "u-6", name: "Dylan Torres", username: "dylant", role: "Jugador", status: "Activo", games: ["bomb-squad"] },
];

export const initialRegistrations = [
  { id: "reg-u-1-counter-strike-16", userId: "u-1", gameId: "counter-strike-16", status: "en torneo", registeredAt: "2026-05-10 09:00" },
  { id: "reg-u-1-bomb-squad", userId: "u-1", gameId: "bomb-squad", status: "inscrito", registeredAt: "2026-05-10 09:15" },
  { id: "reg-u-2-soul-knight", userId: "u-2", gameId: "soul-knight", status: "inscrito", registeredAt: "2026-05-10 09:20" },
  { id: "reg-u-2-bomb-squad", userId: "u-2", gameId: "bomb-squad", status: "inscrito", registeredAt: "2026-05-10 09:25" },
  { id: "reg-u-3-counter-strike-16", userId: "u-3", gameId: "counter-strike-16", status: "en torneo", registeredAt: "2026-05-10 09:30" },
  { id: "reg-u-3-bomb-squad", userId: "u-3", gameId: "bomb-squad", status: "inscrito", registeredAt: "2026-05-10 09:35" },
  { id: "reg-u-4-soul-knight", userId: "u-4", gameId: "soul-knight", status: "inscrito", registeredAt: "2026-05-10 09:40" },
  { id: "reg-u-5-counter-strike-16", userId: "u-5", gameId: "counter-strike-16", status: "en torneo", registeredAt: "2026-05-10 09:45" },
  { id: "reg-u-5-soul-knight", userId: "u-5", gameId: "soul-knight", status: "inscrito", registeredAt: "2026-05-10 09:50" },
  { id: "reg-u-6-bomb-squad", userId: "u-6", gameId: "bomb-squad", status: "inscrito", registeredAt: "2026-05-10 09:55" },
];

export const tournamentPhases = ["Casual", "Clasificatoria", "Cuartos", "Semifinal", "Final"];

export const matchStatuses = ["Pendiente", "En preparación", "En curso", "Finalizada", "Cancelada"];

export const initialTeams = [
  { id: "team-neon", name: "Neon Strikers", tag: "NS", type: "Temporal", status: "Cerrado", matchId: "match-bs-1", gameId: "bomb-squad", playerIds: ["u-1", "u-3"] },
  { id: "team-orbit", name: "Orbit Boom", tag: "OB", type: "Temporal", status: "Cerrado", matchId: "match-bs-1", gameId: "bomb-squad", playerIds: ["u-2", "u-6"] },
  { id: "team-pixel", name: "Pixel Raiders", tag: "PR", type: "Temporal", status: "Cerrado", matchId: "match-sk-1", gameId: "soul-knight", playerIds: ["u-4", "u-5"] },
  { id: "team-cs-blue", name: "Mesa CS Azul", tag: "CSA", type: "Temporal", status: "Activo", matchId: "match-cs-1", gameId: "counter-strike-16", playerIds: ["u-1", "u-3"] },
  { id: "team-cs-red", name: "Mesa CS Roja", tag: "CSR", type: "Temporal", status: "Activo", matchId: "match-cs-1", gameId: "counter-strike-16", playerIds: ["u-5"] },
];

export const initialMatches = [
  {
    id: "match-bs-1",
    gameId: "bomb-squad",
    phaseType: "Clasificatoria",
    stage: "Clasificatoria 01",
    map: "Doom Shroom",
    status: "Finalizada",
    duration: 5,
    scheduledAt: "2026-05-12 10:00",
    playerIds: ["u-1", "u-3", "u-2", "u-6"],
    teamResults: [
      { teamId: "team-neon", playerIds: ["u-1", "u-3"], stats: { wins: 2, losses: 0, kills: 24, deaths: 9, rounds: 3, matchTime: 5 } },
      { teamId: "team-orbit", playerIds: ["u-2", "u-6"], stats: { wins: 1, losses: 1, kills: 19, deaths: 14, rounds: 3, matchTime: 5 } },
    ],
    playerResults: [
      { playerId: "u-1", teamId: "team-neon", points: 218, won: true, stats: { wins: 1, losses: 0, kills: 11, deaths: 4, rounds: 3, matchTime: 5 } },
      { playerId: "u-3", teamId: "team-neon", points: 233, won: true, stats: { wins: 1, losses: 0, kills: 13, deaths: 5, rounds: 3, matchTime: 5 } },
      { playerId: "u-2", teamId: "team-orbit", points: 139, won: false, stats: { wins: 1, losses: 1, kills: 9, deaths: 6, rounds: 3, matchTime: 5 } },
      { playerId: "u-6", teamId: "team-orbit", points: 134, won: false, stats: { wins: 0, losses: 1, kills: 10, deaths: 8, rounds: 3, matchTime: 5 } },
    ],
  },
  {
    id: "match-cs-1",
    gameId: "counter-strike-16",
    phaseType: "Semifinal",
    stage: "Semifinal A",
    map: "de_dust2",
    status: "En curso",
    duration: 35,
    scheduledAt: "2026-05-12 11:30",
    playerIds: ["u-1", "u-3", "u-5"],
    teamResults: [
      { teamId: "team-cs-blue", playerIds: ["u-1", "u-3"], stats: { roundsWon: 11, kills: 48, maps: 0 } },
      { teamId: "team-cs-red", playerIds: ["u-5"], stats: { roundsWon: 8, kills: 41, maps: 0 } },
    ],
  },
  {
    id: "match-sk-1",
    gameId: "soul-knight",
    phaseType: "Casual",
    stage: "Run 01",
    map: "Dungeon Seed A7",
    status: "Finalizada",
    duration: 18,
    scheduledAt: "2026-05-12 13:00",
    playerIds: ["u-2", "u-4", "u-5"],
    teamResults: [
      { teamId: "team-orbit", playerIds: ["u-2"], stats: { bossesDefeated: 4, totalTime: 18, totalDamage: 84200, monstersKilled: 216, rescuedPartners: 3, deaths: 2 } },
      { teamId: "team-pixel", playerIds: ["u-4", "u-5"], stats: { bossesDefeated: 4, totalTime: 16, totalDamage: 79600, monstersKilled: 198, rescuedPartners: 5, deaths: 1 } },
    ],
    playerResults: [
      { playerId: "u-2", teamId: "team-orbit", points: 512, won: false, stats: { bossesDefeated: 4, totalTime: 18, totalDamage: 84200, monstersKilled: 216, rescuedPartners: 3, deaths: 2 } },
      { playerId: "u-4", teamId: "team-pixel", points: 525, won: true, stats: { bossesDefeated: 4, totalTime: 16, totalDamage: 40200, monstersKilled: 102, rescuedPartners: 3, deaths: 0 } },
      { playerId: "u-5", teamId: "team-pixel", points: 511, won: true, stats: { bossesDefeated: 4, totalTime: 16, totalDamage: 39400, monstersKilled: 96, rescuedPartners: 2, deaths: 1 } },
    ],
  },
];

export const currentUser = {
  id: "u-1",
  name: "Fernando Ruiz",
  username: "fergood",
  email: "admin@isc-playground.test",
  role: "Administrador del torneo",
};
