// =============================
// SERVICIO DE EQUIPOS
// =============================

// Aquí vive toda la lógica de negocio de equipos.
// Replica las reglas del Context del frontend según el reporte.

import * as teamRepository from '../repositories/team.repository.js'
import * as registrationRepository from '../repositories/registration.repository.js'

// ─────────────────────────────
// OBTENER EQUIPOS
// ─────────────────────────────
const getAll = async ({ gameId }) => {
  const teams = await teamRepository.findAll({ gameId })
  return teams.map(formatTeam)
}

// ─────────────────────────────
// CREAR EQUIPO
// ─────────────────────────────
// Reglas del reporte:
// 1. Solo jugadores inscritos en ese juego pueden estar en el equipo
// 2. Un jugador no puede estar en dos equipos Activos del mismo juego
const create = async ({ name, tag, gameId, playerIds, matchId }) => {

  // Convertimos los playerIds de "u-1" a números
  const numericPlayerIds = playerIds.map(extractNumericId)

  // Verificamos que todos los jugadores estén inscritos en el juego
  for (const playerId of numericPlayerIds) {
    const registration = await registrationRepository.findByUserAndGame(playerId, gameId)
    if (!registration) {
      throw new Error(`El jugador u-${playerId} no está inscrito en este juego`)
    }
  }

  // Verificamos que ningún jugador esté ya en un equipo Activo del mismo juego
  for (const playerId of numericPlayerIds) {
    const activeTeam = await teamRepository.findActiveTeamByPlayer(playerId, gameId)
    if (activeTeam) {
      throw new Error(`El jugador u-${playerId} ya está en un equipo activo de este juego`)
    }
  }

  const team = await teamRepository.create({
    name,
    tag,
    gameId,
    matchId: matchId || null,
    playerIds: numericPlayerIds
  })

  return formatTeam(team)
}

// ─────────────────────────────
// ACTUALIZAR EQUIPO
// ─────────────────────────────
// Solo permite editar el nombre según el reporte
const update = async (id, { name }) => {
  const existing = await teamRepository.findById(id)
  if (!existing) {
    throw new Error('Equipo no encontrado')
  }

  const team = await teamRepository.update(id, { name })
  return formatTeam(team)
}

// ─────────────────────────────
// ELIMINAR EQUIPO
// ─────────────────────────────
const remove = async (id) => {
  const existing = await teamRepository.findById(id)
  if (!existing) {
    throw new Error('Equipo no encontrado')
  }

  await teamRepository.remove(id)
}

// ─────────────────────────────
// AGREGAR JUGADOR AL EQUIPO
// ─────────────────────────────
const addPlayer = async (teamId, playerId) => {
  const numericPlayerId = extractNumericId(playerId)

  const team = await teamRepository.findById(teamId)
  if (!team) {
    throw new Error('Equipo no encontrado')
  }

  // Verificamos que el jugador esté inscrito en el juego del equipo
  const registration = await registrationRepository.findByUserAndGame(
    numericPlayerId,
    team.gameId
  )
  if (!registration) {
    throw new Error('El jugador no está inscrito en este juego')
  }

  // Verificamos que no esté ya en un equipo activo del mismo juego
  const activeTeam = await teamRepository.findActiveTeamByPlayer(
    numericPlayerId,
    team.gameId
  )
  if (activeTeam && activeTeam.id !== teamId) {
    throw new Error('El jugador ya está en un equipo activo de este juego')
  }

  const updatedTeam = await teamRepository.addPlayer(teamId, numericPlayerId)
  return formatTeam(updatedTeam)
}

// ─────────────────────────────
// QUITAR JUGADOR DEL EQUIPO
// ─────────────────────────────
const removePlayer = async (teamId, playerId) => {
  const numericPlayerId = extractNumericId(playerId)

  const team = await teamRepository.findById(teamId)
  if (!team) {
    throw new Error('Equipo no encontrado')
  }

  const updatedTeam = await teamRepository.removePlayer(teamId, numericPlayerId)
  return formatTeam(updatedTeam)
}

// ─────────────────────────────
// HELPERS
// ─────────────────────────────

// Extrae el número de un id con formato "u-1" → 1
const extractNumericId = (id) => {
  if (typeof id === 'string' && id.startsWith('u-')) {
    return parseInt(id.replace('u-', ''))
  }
  return parseInt(id)
}

// Formatea el equipo exactamente como el front lo espera
// playerIds como array de strings "u-1", "u-2"
const formatTeam = (team) => {
  return {
    id: team.id,
    name: team.name,
    tag: team.tag,
    type: team.type,
    status: team.status,
    matchId: team.matchId,
    gameId: team.gameId,
    playerIds: team.players?.map(p => `u-${p.userId}`) || []
  }
}

export { getAll, create, update, remove, addPlayer, removePlayer }