// =============================
// SERVICIO DE PARTIDAS
// =============================

// Aquí vive toda la lógica de negocio de partidas.
// Replica las reglas del Context y rankingEngine del frontend.

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
// Recibe teamIds[2] → dos equipos por partida
const create = async ({ gameId, phaseType, stage, map, scheduledAt, duration, teamIds }) => {

  // Validamos que los valores sean correctos según el reporte
  const validPhases = ['Casual', 'Clasificatoria', 'Cuartos', 'Semifinal', 'Final']
  if (!validPhases.includes(phaseType)) {
    throw new Error(`phaseType inválido. Valores válidos: ${validPhases.join(', ')}`)
  }

  // Verificamos que los equipos existen
  for (const teamId of teamIds) {
    const team = await teamRepository.findById(teamId)
    if (!team) {
      throw new Error(`Equipo ${teamId} no encontrado`)
    }
  }

  // Generamos el id de la partida
  const id = `match-${gameId}-${Date.now()}`

  // Obtenemos todos los playerIds de ambos equipos
  const teams = await Promise.all(teamIds.map(id => teamRepository.findById(id)))
  const playerIds = teams.flatMap(t => t.players.map(p => p.userId))

  const match = await matchRepository.create({
    id,
    gameId,
    phaseType,
    stage,
    map,
    scheduledAt: new Date(scheduledAt),
    duration,
    teamIds,
    playerIds
  })

  return formatMatch(match)
}

// ─────────────────────────────
// CAMBIAR ESTADO DE PARTIDA
// ─────────────────────────────
// Regla del reporte:
// Cuando pasa a "Finalizada" o "Cancelada"
// todos los equipos de esa partida cambian a "Cerrado"
const updateStatus = async (id, status) => {

  const validStatuses = ['Pendiente', 'En preparación', 'En curso', 'Finalizada', 'Cancelada']
  if (!validStatuses.includes(status)) {
    throw new Error(`Status inválido. Valores válidos: ${validStatuses.join(', ')}`)
  }

  const existing = await matchRepository.findById(id)
  if (!existing) {
    throw new Error('Partida no encontrada')
  }

  const match = await matchRepository.updateStatus(id, status)

  // Si la partida se finaliza o cancela
  // todos los equipos relacionados pasan a "Cerrado"
  if (status === 'Finalizada' || status === 'Cancelada') {
    const teamIds = existing.teamResults.map(tr => tr.teamId)
    for (const teamId of teamIds) {
      await teamRepository.update(teamId, { status: 'Cerrado' })
    }
  }

  return formatMatch(match)
}

// ─────────────────────────────
// GUARDAR RESULTADO DE JUGADOR
// ─────────────────────────────
// Clave para el ranking — solo cuenta partidas "Finalizada"
const addResult = async (matchId, { playerId, teamId, stats, points, won }) => {

  const numericPlayerId = extractNumericId(playerId)

  const match = await matchRepository.findById(matchId)
  if (!match) {
    throw new Error('Partida no encontrada')
  }

  const result = await matchRepository.addResult({
    matchId,
    playerId: numericPlayerId,
    teamId,
    stats,
    points,
    won
  })

  return formatResult(result)
}

// ─────────────────────────────
// ACTUALIZAR MÉTRICA EN TIEMPO REAL
// ─────────────────────────────
// delta es +1 o -1
// Actualiza la stat del jugador en la partida actual
const updateLive = async (matchId, { playerId, metricKey, delta }) => {

  const numericPlayerId = extractNumericId(playerId)

  // Buscamos el resultado actual del jugador
  const existing = await matchRepository.findPlayerResult(matchId, numericPlayerId)
  if (!existing) {
    throw new Error('Resultado del jugador no encontrado')
  }

  // Actualizamos solo la métrica específica
  const currentStats = existing.stats || {}
  const currentValue = currentStats[metricKey] ?? 0
  const newStats = {
    ...currentStats,
    [metricKey]: Math.max(0, currentValue + delta) // no permitimos valores negativos
  }

  const result = await matchRepository.updateResult(existing.id, { stats: newStats })
  return formatResult(result)
}

// Formatea la partida exactamente como el front lo espera
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
      .substring(0, 16), // formato "2026-05-12 10:00"
    playerIds: match.playerResults?.map(pr => `u-${pr.playerId}`) || [],
    teamResults: match.teamResults?.map(tr => ({
      teamId: tr.teamId,
      playerIds: tr.team?.players?.map(p => `u-${p.userId}`) || [],
      stats: tr.stats
    })) || [],
    playerResults: match.playerResults?.map(pr => ({
      playerId: `u-${pr.playerId}`,
      teamId: pr.teamId,
      points: pr.points,
      won: pr.won,
      stats: pr.stats
    })) || []
  }
}

const formatResult = (result) => {
  return {
    playerId: `u-${result.playerId}`,
    teamId: result.teamId,
    points: result.points,
    won: result.won,
    stats: result.stats
  }
}

export { getAll, create, updateStatus, addResult, updateLive }