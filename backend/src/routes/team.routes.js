// =============================
// RUTAS DE EQUIPOS
// =============================

// Define los endpoints para gestión de equipos.
// Solo mapea rutas a controladores, sin lógica.

import express from 'express'
import * as teamController from '../controllers/team.controller.js'

const router = express.Router()

// GET /api/teams?gameId= → equipos de un juego
router.get('/', teamController.getAll)

// POST /api/teams → crear equipo temporal
// Body: { name, tag, gameId, playerIds, matchId? }
router.post('/', teamController.create)

// PATCH /api/teams/:id → editar nombre del equipo
router.patch('/:id', teamController.update)

// DELETE /api/teams/:id → eliminar equipo
router.delete('/:id', teamController.remove)

// POST /api/teams/:id/players → asignar jugador a equipo
router.post('/:id/players', teamController.addPlayer)

// DELETE /api/teams/:id/players/:playerId → quitar jugador de equipo
router.delete('/:id/players/:playerId', teamController.removePlayer)

export default router