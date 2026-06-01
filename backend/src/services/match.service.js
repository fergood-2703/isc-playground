// =============================
// SERVICIO DE PARTIDAS
// =============================
//
// Aquí vive la lógica de negocio de partidas.
//
// Reglas importantes:
// - Una partida usa exactamente 2 equipos.
// - Los equipos deben existir.
// - Los equipos deben pertenecer al mismo juego.
// - Los equipos deben estar Activos.
// - Los equipos deben tener jugadores.
// - Cada jugador queda asociado a su equipo correcto.
// - El ranking solo cuenta partidas Finalizadas.

import * as matchRepository from '../repositories/match.repository.js'
import * as teamRepository from '../repositories/team.repository.js'
import { extractNumericId } from '../utils/helpers.js'

// ─────────────────────────────
// OBTENER PARTIDAS
// ─────────────────────────────
const getAll = async ({ gameId }) => {
  const matches = await matchRepository.findAll({ gameId })
  return matches.map(formatMatch)
}

// ─────────────────────────────
// CREAR PARTIDA
// ─────────────────────────────
const create = async ({
  gameId,
  phaseType,
  stage,
  map,
  scheduledAt,
  duration,
  teamIds
}) => {
  const validPhases = [
    'Casual',
    'Clasificatoria',
    'Cuartos',
    'Semifinal',
    'Final'
  ]

  if (!validPhases.includes(phaseType)) {
    throw new Error(`phaseType inválido. Valores válidos: ${validPhases.join(', ')}`)
  }

  if (!Array.isArray(teamIds) || teamIds.length !== 2) {
    throw new Error('La partida debe tener exactamente 2 equipos')
  }

  if (teamIds[0] === teamIds[1]) {
    throw new Error('No puedes usar el mismo equipo dos veces')
  }

  const durationNumber = Number(duration)

  if (!Number.isFinite(durationNumber) || durationNumber <= 0) {
    throw new Error('La duración debe ser mayor a 0')
  }

  // Buscamos los equipos.
  const teams = await Promise.all(
    teamIds.map((teamId) => teamRepository.findById(teamId))
  )

  for (const team of teams) {
    if (!team) {
      throw new Error('Uno de los equipos no existe')
    }

    if (team.gameId !== gameId) {
      throw new Error('Los equipos seleccionados no pertenecen al juego elegido')
    }

    if (team.status !== 'Activo') {
      throw new Error(`El equipo "${team.name}" no está activo`)
    }

    if (!team.players || team.players.length === 0) {
      throw new Error(`El equipo "${team.name}" no tiene jugadores`)
    }
  }

  // Convertimos los jugadores de los equipos al formato que necesita Prisma.
  //
  // Ejemplo:
  // [
  //   { playerId: 12, teamId: "equipo-a" },
  //   { playerId: 13, teamId: "equipo-b" }
  // ]
  const teamPlayerRows = teams.flatMap((team) =>
    team.players.map((player) => ({
      playerId: player.userId,
      teamId: team.id
    }))
  )

  if (teamPlayerRows.length === 0) {
    throw new Error('No hay jugadores para crear resultados')
  }

  const id = `match-${gameId}-${Date.now()}`

  const match = await matchRepository.create({
    id,
    gameId,
    phaseType,
    stage,
    map,
    scheduledAt: new Date(scheduledAt),
    duration: durationNumber,
    teamIds,
    teamPlayerRows
  })

  return formatMatch(match)
}

// ─────────────────────────────
// CAMBIAR ESTADO DE PARTIDA
// ─────────────────────────────
//
// Cuando una partida pasa a Finalizada o Cancelada,
// cerramos los equipos para que esos mismos equipos
// no se reutilicen accidentalmente.
const updateStatus = async (id, status) => {
  const validStatuses = [
    'Pendiente',
    'En preparación',
    'En curso',
    'Finalizada',
    'Cancelada'
  ]

  if (!validStatuses.includes(status)) {
    throw new Error(`Status inválido. Valores válidos: ${validStatuses.join(', ')}`)
  }

  const existing = await matchRepository.findById(id)

  if (!existing) {
    throw new Error('Partida no encontrada')
  }

  const match = await matchRepository.updateStatus(id, status)

  if (status === 'Finalizada' || status === 'Cancelada') {
    const teamIds = existing.teamResults.map((teamResult) => teamResult.teamId)

    for (const teamId of teamIds) {
      await teamRepository.update(teamId, {
        status: 'Cerrado'
      })
    }
  }

  return formatMatch(match)
}

// ─────────────────────────────
// GUARDAR RESULTADO DE JUGADOR
// ─────────────────────────────
const addResult = async (matchId, { playerId, teamId, stats, points, won }) => {
  const numericPlayerId = extractNumericId(playerId)

  const match = await matchRepository.findById(matchId)

  if (!match) {
    throw new Error('Partida no encontrada')
  }

  // Si no llega teamId, lo buscamos según los teamResults de la partida.
  const resolvedTeamId =
    teamId ||
    match.teamResults.find((teamResult) =>
      teamResult.team?.players?.some(
        (player) => player.userId === numericPlayerId
      )
    )?.teamId

  if (!resolvedTeamId) {
    throw new Error('No se pudo determinar el equipo del jugador')
  }

  // Validamos que el jugador sí pertenezca a la partida.
  const playerBelongsToMatch = match.teamResults.some((teamResult) =>
    teamResult.team?.players?.some(
      (player) => player.userId === numericPlayerId
    )
  )

  if (!playerBelongsToMatch) {
    throw new Error('El jugador no pertenece a esta partida')
  }

  const result = await matchRepository.addResult({
    matchId,
    playerId: numericPlayerId,
    teamId: resolvedTeamId,
    stats: stats || {},
    points: Number(points) || 0,
    won: Boolean(won)
  })

  return formatResult(result)
}

// ─────────────────────────────
// ACTUALIZAR MÉTRICA EN TIEMPO REAL
// ─────────────────────────────
const updateLive = async (matchId, { playerId, metricKey, delta }) => {
  const numericPlayerId = extractNumericId(playerId)

  let existing = await matchRepository.findPlayerResult(
    matchId,
    numericPlayerId
  )

  // Si por alguna razón no existe PlayerResult,
  // lo creamos usando el equipo real del jugador en esa partida.
  if (!existing) {
    const match = await matchRepository.findById(matchId)

    if (!match) {
      throw new Error('Partida no encontrada')
    }

    const resolvedTeamId = match.teamResults.find((teamResult) =>
      teamResult.team?.players?.some(
        (player) => player.userId === numericPlayerId
      )
    )?.teamId

    if (!resolvedTeamId) {
      throw new Error('No se pudo determinar el equipo del jugador')
    }

    existing = await matchRepository.addResult({
      matchId,
      playerId: numericPlayerId,
      teamId: resolvedTeamId,
      stats: {},
      points: 0,
      won: false
    })
  }

  const currentStats = existing.stats || {}
  const currentValue = Number(currentStats[metricKey] ?? 0)

  const newStats = {
    ...currentStats,
    [metricKey]: Math.max(0, currentValue + Number(delta || 0))
  }

  const result = await matchRepository.updateResult(existing.id, {
    stats: newStats
  })

  return formatResult(result)
}

// ─────────────────────────────
// FORMATEAR PARTIDA PARA EL FRONTEND
// ─────────────────────────────
const formatMatch = (match) => {
  return {
    id: match.id,
    gameId: match.gameId,
    phaseType: match.phaseType,
    stage: match.stage,
    map: match.map,
    status: match.status,
    duration: match.duration,

    scheduledAt: match.scheduledAt
      .toISOString()
      .replace('T', ' ')
      .substring(0, 16),

    playerIds: match.playerResults?.map((result) => `u-${result.playerId}`) || [],

    teamResults: match.teamResults?.map((teamResult) => ({
      teamId: teamResult.teamId,
      playerIds:
        teamResult.team?.players?.map((player) => `u-${player.userId}`) || [],
      stats: teamResult.stats
    })) || [],

    playerResults: match.playerResults?.map((result) => ({
      playerId: `u-${result.playerId}`,
      teamId: result.teamId,
      points: result.points,
      won: result.won,
      stats: result.stats
    })) || []
  }
}

// ─────────────────────────────
// FORMATEAR RESULTADO PARA EL FRONTEND
// ─────────────────────────────
const formatResult = (result) => {
  return {
    playerId: `u-${result.playerId}`,
    teamId: result.teamId,
    points: result.points,
    won: result.won,
    stats: result.stats
  }
}

export {
  getAll,
  create,
  updateStatus,
  addResult,
  updateLive
}