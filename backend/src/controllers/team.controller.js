// =============================
// CONTROLADOR DE EQUIPOS
// =============================

// Intermediario entre la petición HTTP y la lógica de negocio.
// Solo recibe req/res, llama al servicio y devuelve la respuesta.

import * as teamService from '../services/team.service.js'

// ─────────────────────────────
// OBTENER EQUIPOS
// ─────────────────────────────
// Se activa cuando el frontend hace: GET /api/teams?gameId=
// Usado en Dashboard > Equipos
const getAll = async (req, res) => {
  try {
    const { gameId } = req.query
    const teams = await teamService.getAll({ gameId })
    res.status(200).json({ teams })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ─────────────────────────────
// CREAR EQUIPO
// ─────────────────────────────
// Se activa cuando el frontend hace: POST /api/teams
// Body: { name, tag, gameId, playerIds, matchId? }
const create = async (req, res) => {
  try {
    const { name, tag, gameId, playerIds, matchId } = req.body
    const team = await teamService.create({ name, tag, gameId, playerIds, matchId })
    res.status(201).json({
      message: 'Equipo creado exitosamente',
      team
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// ACTUALIZAR EQUIPO
// ─────────────────────────────
// Se activa cuando el frontend hace: PATCH /api/teams/:id
// Solo permite editar el nombre según el reporte
const update = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const team = await teamService.update(id, { name })
    res.status(200).json({
      message: 'Equipo actualizado exitosamente',
      team
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// ELIMINAR EQUIPO
// ─────────────────────────────
// Se activa cuando el frontend hace: DELETE /api/teams/:id
// También limpia el matchId en partidas relacionadas
const remove = async (req, res) => {
  try {
    const { id } = req.params
    await teamService.remove(id)
    res.status(200).json({ message: 'Equipo eliminado exitosamente' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// AGREGAR JUGADOR AL EQUIPO
// ─────────────────────────────
// Se activa cuando el frontend hace: POST /api/teams/:id/players
// Body: { playerId }
const addPlayer = async (req, res) => {
  try {
    const { id } = req.params
    const { playerId } = req.body
    const team = await teamService.addPlayer(id, playerId)
    res.status(200).json({
      message: 'Jugador agregado exitosamente',
      team
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// QUITAR JUGADOR DEL EQUIPO
// ─────────────────────────────
// Se activa cuando el frontend hace: DELETE /api/teams/:id/players/:playerId
const removePlayer = async (req, res) => {
  try {
    const { id, playerId } = req.params
    const team = await teamService.removePlayer(id, playerId)
    res.status(200).json({
      message: 'Jugador removido exitosamente',
      team
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export { getAll, create, update, remove, addPlayer, removePlayer }