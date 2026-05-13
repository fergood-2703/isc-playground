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
    description: "Combate caótico por equipos con rondas rápidas, eliminaciones y supervivencia.",
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
    winCondition: "Gana el equipo con más victorias; desempata kills y luego menos muertes.",
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
    description: "FPS táctico donde el progreso se define por rondas ganadas y kills acumuladas.",
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
    winCondition: "Gana quien acumule más rondas; kills resuelve empates.",
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
    description: "Runs cooperativas con foco en jefes derrotados, tiempo total y daño producido.",
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
    winCondition: "Gana la run con más bosses; desempata menor tiempo y mayor damage.",
  },
];

export const initialPlayers = [
  { id: "u-1", name: "Fernando Ruiz", username: "fergood", role: "Capitán", games: ["counter-strike-16", "bomb-squad"], teamIds: ["team-neon"] },
  { id: "u-2", name: "Ana López", username: "ana_dev", role: "Player", games: ["soul-knight", "bomb-squad"], teamIds: ["team-orbit"] },
  { id: "u-3", name: "Carlos Méndez", username: "carlitos", role: "Player", games: ["counter-strike-16"], teamIds: ["team-neon"] },
  { id: "u-4", name: "Lucía Gómez", username: "lucia.gg", role: "Player", games: ["soul-knight"], teamIds: ["team-pixel"] },
  { id: "u-5", name: "Omar Castillo", username: "omarx", role: "Capitán", games: ["counter-strike-16", "soul-knight"], teamIds: ["team-pixel"] },
  { id: "u-6", name: "Dylan Torres", username: "dylant", role: "Player", games: ["bomb-squad"], teamIds: ["team-orbit"] },
];

export const initialTeams = [
  { id: "team-neon", name: "Neon Strikers", tag: "NS", captainId: "u-1", playerIds: ["u-1", "u-3"], gameIds: ["counter-strike-16", "bomb-squad"] },
  { id: "team-orbit", name: "Orbit Boom", tag: "OB", captainId: "u-2", playerIds: ["u-2", "u-6"], gameIds: ["bomb-squad", "soul-knight"] },
  { id: "team-pixel", name: "Pixel Raiders", tag: "PR", captainId: "u-5", playerIds: ["u-4", "u-5"], gameIds: ["soul-knight", "counter-strike-16"] },
];

export const initialMatches = [
  {
    id: "match-bs-1",
    gameId: "bomb-squad",
    stage: "Clasificatoria",
    map: "Doom Shroom",
    status: "Finalizada",
    scheduledAt: "2026-05-12 10:00",
    teamResults: [
      { teamId: "team-neon", stats: { wins: 2, losses: 0, kills: 24, deaths: 9, rounds: 3, matchTime: 5 } },
      { teamId: "team-orbit", stats: { wins: 1, losses: 1, kills: 19, deaths: 14, rounds: 3, matchTime: 5 } },
    ],
  },
  {
    id: "match-cs-1",
    gameId: "counter-strike-16",
    stage: "Semifinal A",
    map: "de_dust2",
    status: "En vivo",
    scheduledAt: "2026-05-12 11:30",
    teamResults: [
      { teamId: "team-neon", stats: { roundsWon: 11, kills: 48, maps: 0 } },
      { teamId: "team-pixel", stats: { roundsWon: 8, kills: 41, maps: 0 } },
    ],
  },
  {
    id: "match-sk-1",
    gameId: "soul-knight",
    stage: "Run 01",
    map: "Dungeon Seed A7",
    status: "Finalizada",
    scheduledAt: "2026-05-12 13:00",
    teamResults: [
      { teamId: "team-orbit", stats: { bossesDefeated: 4, totalTime: 18, totalDamage: 84200, monstersKilled: 216, rescuedPartners: 3, deaths: 2 } },
      { teamId: "team-pixel", stats: { bossesDefeated: 4, totalTime: 16, totalDamage: 79600, monstersKilled: 198, rescuedPartners: 5, deaths: 1 } },
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
