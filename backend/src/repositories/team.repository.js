// =============================
// REPOSITORIO DE EQUIPOS
// =============================

// Es la única capa que habla directamente con la base de datos.
// Maneja todas las consultas relacionadas con equipos y jugadores.

import prisma from '../config/db.js'

// Siempre incluimos los jugadores al consultar un equipo
const includeRelations = {
  players: {
    select: { userId: true }
  }
}

// ─────────────────────────────
// OBTENER EQUIPOS
// ─────────────────────────────
const findAll = async ({ gameId }) => {
  return await prisma.team.findMany({
    where: {
      ...(gameId && { gameId })
    },
    include: includeRelations
  })
}

// ─────────────────────────────
// BUSCAR EQUIPO POR ID
// ─────────────────────────────
const findById = async (id) => {
  return await prisma.team.findUnique({
    where: { id },
    include: includeRelations
  })
}

// ─────────────────────────────
// BUSCAR EQUIPO ACTIVO POR JUGADOR Y JUEGO
// ─────────────────────────────
// Usado para verificar que un jugador no esté
// en dos equipos Activos del mismo juego
const findActiveTeamByPlayer = async (userId, gameId) => {
  return await prisma.team.findFirst({
    where: {
      gameId,
      status: 'Activo',
      players: {
        some: { userId }
      }
    },
    include: includeRelations
  })
}

// ─────────────────────────────
// CREAR EQUIPO
// ─────────────────────────────
// Crea el equipo y agrega los jugadores en una sola operación
const create = async ({ name, tag, gameId, matchId, playerIds }) => {
  // Generamos el id del equipo como slug
  const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`

  return await prisma.team.create({
    data: {
      id,
      name,
      tag,
      gameId,
      matchId,
      type: 'Temporal',
      status: 'Activo',
      // Creamos los registros de jugadores anidados
      players: {
        create: playerIds.map(userId => ({ userId }))
      }
    },
    include: includeRelations
  })
}

// ─────────────────────────────
// ACTUALIZAR EQUIPO
// ─────────────────────────────
const update = async (id, data) => {
  return await prisma.team.update({
    where: { id },
    data,
    include: includeRelations
  })
}

// ─────────────────────────────
// ELIMINAR EQUIPO
// ─────────────────────────────
const remove = async (id) => {
  return await prisma.team.delete({
    where: { id }
  })
}

// ─────────────────────────────
// AGREGAR JUGADOR AL EQUIPO
// ─────────────────────────────
const addPlayer = async (teamId, userId) => {
  return await prisma.team.update({
    where: { id: teamId },
    data: {
      players: {
        create: { userId }
      }
    },
    include: includeRelations
  })
}

// ─────────────────────────────
// QUITAR JUGADOR DEL EQUIPO
// ─────────────────────────────
const removePlayer = async (teamId, userId) => {
  // Primero eliminamos el registro de TeamPlayer
  await prisma.teamPlayer.delete({
    where: {
      teamId_userId: { teamId, userId }
    }
  })

  // Devolvemos el equipo actualizado
  return await prisma.team.findUnique({
    where: { id: teamId },
    include: includeRelations
  })
}

export { findAll, findById, findActiveTeamByPlayer, create, update, remove, addPlayer, removePlayer }