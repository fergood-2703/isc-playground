// =============================
// REPOSITORIO DE PARTIDAS
// =============================
//
// Esta capa habla directamente con Prisma.
// Aquí corregimos algo importante:
//
// Antes todos los playerResults se creaban con teamIds[0],
// aunque algunos jugadores pertenecieran al equipo B.
// Eso rompía los resultados individuales y el ranking.
//
// Ahora recibimos teamPlayerRows:
// [
//   { playerId: 12, teamId: "equipo-a" },
//   { playerId: 13, teamId: "equipo-b" }
// ]
//
// Así cada jugador queda asociado a su equipo real.

import prisma from "../config/db.js";

// Relaciones que siempre queremos traer al consultar partidas.
const includeRelations = {
  teamResults: {
    include: {
      team: {
        include: {
          players: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  },
  playerResults: true,
};

// ─────────────────────────────
// OBTENER PARTIDAS
// ─────────────────────────────
const findAll = async ({ gameId }) => {
  return await prisma.match.findMany({
    where: {
      ...(gameId && { gameId }),
    },
    include: includeRelations,
    orderBy: {
      scheduledAt: "desc",
    },
  });
};

// ─────────────────────────────
// BUSCAR PARTIDA POR ID
// ─────────────────────────────
const findById = async (id) => {
  return await prisma.match.findUnique({
    where: { id },
    include: includeRelations,
  });
};

// ─────────────────────────────
// CREAR PARTIDA
// ─────────────────────────────
//
// Crea:
// - Match
// - TeamResult por cada equipo
// - PlayerResult por cada jugador de los equipos
//
// Además actualiza matchId en los equipos usados.
const create = async ({
  id,
  gameId,
  phaseType,
  stage,
  map,
  scheduledAt,
  duration,
  teamIds,
  teamPlayerRows,
}) => {
  return await prisma.$transaction(async (tx) => {
    await tx.match.create({
      data: {
        id,
        gameId,
        phaseType,
        stage,
        map,
        scheduledAt,
        duration,
        status: "Pendiente",

        // Resultado base por equipo.
        teamResults: {
          create: teamIds.map((teamId) => ({
            teamId,
            stats: {},
          })),
        },

        // Resultado base por jugador.
        // Cada jugador queda ligado a su equipo real.
        playerResults: {
          create: teamPlayerRows.map((row) => ({
            playerId: row.playerId,
            teamId: row.teamId,
            points: 0,
            won: false,
            stats: {},
          })),
        },
      },
    });

    // Marcamos los equipos como usados por esta partida.
    await tx.team.updateMany({
      where: {
        id: {
          in: teamIds,
        },
      },
      data: {
        matchId: id,
      },
    });

    // Devolvemos la partida con relaciones completas.
    return await tx.match.findUnique({
      where: { id },
      include: includeRelations,
    });
  });
};

// ─────────────────────────────
// ACTUALIZAR STATUS
// ─────────────────────────────
const updateStatus = async (id, status) => {
  return await prisma.match.update({
    where: { id },
    data: { status },
    include: includeRelations,
  });
};

// ─────────────────────────────
// AGREGAR / ACTUALIZAR RESULTADO DE JUGADOR
// ─────────────────────────────
//
// upsert:
// - Si ya existe resultado de ese jugador en esa partida, lo actualiza.
// - Si no existe, lo crea.
const addResult = async ({ matchId, playerId, teamId, stats, points, won }) => {
  return await prisma.playerResult.upsert({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
    update: {
      teamId,
      stats,
      points,
      won,
    },
    create: {
      matchId,
      playerId,
      teamId,
      stats,
      points,
      won,
    },
  });
};

// ─────────────────────────────
// BUSCAR RESULTADO DE JUGADOR
// ─────────────────────────────
const findPlayerResult = async (matchId, playerId) => {
  return await prisma.playerResult.findUnique({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
  });
};

// ─────────────────────────────
// ACTUALIZAR RESULTADO
// ─────────────────────────────
const updateResult = async (id, data) => {
  return await prisma.playerResult.update({
    where: { id },
    data,
  });
};

export {
  findAll,
  findById,
  create,
  updateStatus,
  addResult,
  findPlayerResult,
  updateResult,
};
