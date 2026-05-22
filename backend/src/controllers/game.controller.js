// =============================
// CONTROLADOR DE JUEGOS
// =============================

// Intermediario entre la petición HTTP y la lógica de negocio.
// Solo recibe req/res, llama al servicio y devuelve la respuesta.

import * as gameService from '../services/game.service.js'

// ─────────────────────────────
// OBTENER TODOS LOS JUEGOS
// ─────────────────────────────
// Se activa cuando el frontend hace: GET /api/games
// Usado en JuegosPage y Dashboard > Juegos
const getAll = async (req, res) => {
  try {
    const games = await gameService.getAll()
    res.status(200).json({ games })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ─────────────────────────────
// OBTENER JUEGO POR ID
// ─────────────────────────────
// Se activa cuando el frontend hace: GET /api/games/:id
// El :id puede ser slug ("bomb-squad") o legacyId (1, 2, 3)
const getById = async (req, res) => {
  try {
    const { id } = req.params
    const game = await gameService.getById(id)
    res.status(200).json({ game })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

// ─────────────────────────────
// CREAR JUEGO
// ─────────────────────────────
// Se activa cuando el frontend hace: POST /api/games
// Solo admin puede crear juegos
// Recibe todo el objeto game según el modelo 1.2 del reporte
const create = async (req, res) => {
  try {
    const game = await gameService.create(req.body)
    res.status(201).json({
      message: 'Juego creado exitosamente',
      game
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// ACTUALIZAR JUEGO
// ─────────────────────────────
// Se activa cuando el frontend hace: PATCH /api/games/:id
// Solo admin puede editar juegos
const update = async (req, res) => {
  try {
    const { id } = req.params
    const game = await gameService.update(id, req.body)
    res.status(200).json({
      message: 'Juego actualizado exitosamente',
      game
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// ELIMINAR JUEGO
// ─────────────────────────────
// Se activa cuando el frontend hace: DELETE /api/games/:id
// También elimina partidas y equipos relacionados (cascade en BD)
const remove = async (req, res) => {
  try {
    const { id } = req.params
    await gameService.remove(id)
    res.status(200).json({ message: 'Juego eliminado exitosamente' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// TOGGLE STATUS
// ─────────────────────────────
// Se activa cuando el frontend hace: PATCH /api/games/:id/status
// Cambia entre "Activo" y "Desactivado"
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params
    const game = await gameService.toggleStatus(id)
    res.status(200).json({
      message: `Juego ${game.status.toLowerCase()} exitosamente`,
      game
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export { getAll, getById, create, update, remove, toggleStatus }