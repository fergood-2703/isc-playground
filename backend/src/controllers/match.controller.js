// =============================
// CONTROLADOR DE PARTIDAS
// =============================

// Intermediario entre la petición HTTP y la lógica de negocio.
// Solo recibe req/res, llama al servicio y devuelve la respuesta.

import * as matchService from '../services/match.service.js'

// ─────────────────────────────
// OBTENER PARTIDAS
// ─────────────────────────────
// Se activa cuando el frontend hace: GET /api/matches?gameId=
// Usado en Dashboard > Partidas
const getAll = async (req, res) => {
  try {
    const { gameId } = req.query
    const matches = await matchService.getAll({ gameId })
    res.status(200).json({ matches })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ─────────────────────────────
// CREAR PARTIDA
// ─────────────────────────────
// Se activa cuando el frontend hace: POST /api/matches
// Body: { gameId, phaseType, stage, map, scheduledAt, duration, teamIds[2] }
const create = async (req, res) => {
  try {
    const { gameId, phaseType, stage, map, scheduledAt, duration, teamIds } = req.body
    const match = await matchService.create({
      gameId, phaseType, stage, map, scheduledAt, duration, teamIds
    })
    res.status(201).json({
      message: 'Partida creada exitosamente',
      match
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// CAMBIAR ESTADO DE PARTIDA
// ─────────────────────────────
// Se activa cuando el frontend hace: PATCH /api/matches/:id/status
// Body: { status }
// Al finalizar/cancelar → equipos pasan a "Cerrado"
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const match = await matchService.updateStatus(id, status)
    res.status(200).json({
      message: `Partida ${status.toLowerCase()} exitosamente`,
      match
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// GUARDAR RESULTADO DE JUGADOR
// ─────────────────────────────
// Se activa cuando el frontend hace: POST /api/matches/:id/results
// Body: { playerId, stats, points, won }
// Este endpoint es clave para el ranking
const addResult = async (req, res) => {
  try {
    const { id } = req.params
    const { playerId, teamId, stats, points, won } = req.body
    const result = await matchService.addResult(id, {
      playerId, teamId, stats, points, won
    })
    res.status(201).json({
      message: 'Resultado guardado exitosamente',
      result
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// ACTUALIZAR MÉTRICA EN TIEMPO REAL
// ─────────────────────────────
// Se activa cuando el frontend hace: PATCH /api/matches/:id/live
// Body: { playerId, metricKey, delta }
// delta es +1 o -1 para incrementar o decrementar la métrica
const updateLive = async (req, res) => {
  try {
    const { id } = req.params
    const { playerId, metricKey, delta } = req.body
    const result = await matchService.updateLive(id, {
      playerId, metricKey, delta
    })
    res.status(200).json({
      message: 'Métrica actualizada',
      result
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export { getAll, create, updateStatus, addResult, updateLive }