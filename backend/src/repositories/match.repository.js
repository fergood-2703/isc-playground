// =============================
// REPOSITORIO DE PARTIDAS
// =============================

// Es la única capa que habla directamente con la base de datos.
// Maneja todas las consultas relacionadas con partidas y resultados.

import prisma from '../config/db.js'

// Siempre incluimos teamResults y playerResults al consultar una partida
const includeRelations = {
  teamResults: {
    include: {
      team: {
        include: {
          players: { select: { userId: true } }
        }
      }
    }
  },
  playerResults: true
}

// ─────────────────────────────
// OBTENER PARTIDAS
// ─────────────────────────────
const findAll = async ({ gameId }) => {
  return await prisma.match.findMany({
    where: {
      ...(gameId && { gameId })
    },
    include: includeRelations
  })
}

// ─────────────────────────────
// BUSCAR PARTIDA POR ID
// ─────────────────────────────
const findById = async (id) => {
  return await prisma.match.findUnique({
    where: { id },
    include: includeRelations
  })
}

// ─────────────────────────────
// CREAR PARTIDA
// ─────────────────────────────
const create = async ({ id, gameId, phaseType, stage, map, scheduledAt, duration, teamIds, playerIds }) => {
  return await prisma.match.create({
    data: {
      id,
      gameId,
      phaseType,
      stage,
      map,
      scheduledAt,
      duration,
      status: 'Pendiente',
      // Creamos los teamResults vacíos para cada equipo
      teamResults: {
        create: teamIds.map(teamId => ({
          teamId,
          stats: {}
        }))
      },
      // Creamos los playerResults vacíos para cada jugador
      playerResults: {
        create: playerIds.map(playerId => ({
          playerId,
          teamId: teamIds[0], // se actualiza cuando se guardan resultados reales
          points: 0,
          won: false,
          stats: {}
        }))
      }
    },
    include: includeRelations
  })
}

// ─────────────────────────────
// ACTUALIZAR STATUS
// ─────────────────────────────
const updateStatus = async (id, status) => {
  return await prisma.match.update({
    where: { id },
    data: { status },
    include: includeRelations
  })
}

// ─────────────────────────────
// AGREGAR RESULTADO DE JUGADOR
// ─────────────────────────────
const addResult = async ({ matchId, playerId, teamId, stats, points, won }) => {
  // Usamos upsert para crear o actualizar el resultado
  // Si ya existe un resultado para ese jugador en esa partida, lo actualiza
  return await prisma.playerResult.upsert({
    where: {
      matchId_playerId: { matchId, playerId }
    },
    update: { teamId, stats, points, won },
    create: { matchId, playerId, teamId, stats, points, won }
  })
}

// ─────────────────────────────
// BUSCAR RESULTADO DE JUGADOR
// ─────────────────────────────
const findPlayerResult = async (matchId, playerId) => {
  return await prisma.playerResult.findUnique({
    where: {
      matchId_playerId: { matchId, playerId }
    }
  })
}

// ─────────────────────────────
// ACTUALIZAR RESULTADO
// ─────────────────────────────
const updateResult = async (id, data) => {
  return await prisma.playerResult.update({
    where: { id },
    data
  })
}

export { findAll, findById, create, updateStatus, addResult, findPlayerResult, updateResult }