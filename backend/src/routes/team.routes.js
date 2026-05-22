// =============================
// RUTAS DE EQUIPOS
// =============================

// Define los endpoints para gestión de equipos.
// Solo mapea rutas a controladores, sin lógica.

import express from 'express'
import * as teamController from '../controllers/team.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js'
import { validateTeam } from '../middlewares/validate.middleware.js'

const router = express.Router()


// Rutas públicas

// GET /api/teams?gameId= → equipos de un juego
router.get('/', teamController.getAll)


// Rutas protegidas — solo admin

// POST /api/teams → crear equipo temporal
// Body: { name, tag, gameId, playerIds, matchId? }
router.post('/', verifyToken, verifyAdmin, validateTeam, teamController.create)

// PATCH /api/teams/:id → editar nombre del equipo
router.patch('/:id', verifyToken, verifyAdmin, teamController.update)

// DELETE /api/teams/:id → eliminar equipo
router.delete('/:id', verifyToken, verifyAdmin, teamController.remove)

// POST /api/teams/:id/players → asignar jugador a equipo
router.post('/:id/players', verifyToken, verifyAdmin, teamController.addPlayer)

// DELETE /api/teams/:id/players/:playerId → quitar jugador de equipo
router.delete('/:id/players/:playerId', verifyToken, verifyAdmin, teamController.removePlayer)

export default router