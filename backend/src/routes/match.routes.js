// =============================
// RUTAS DE PARTIDAS
// =============================

// Define los endpoints para gestión de partidas.
// Solo mapea rutas a controladores, sin lógica.

import express from 'express'
import * as matchController from '../controllers/match.controller.js'

const router = express.Router()

// GET /api/matches?gameId= → partidas de un juego
router.get('/', matchController.getAll)

// POST /api/matches → crear partida
// Body: { gameId, phaseType, stage, map, scheduledAt, duration, teamIds[2] }
router.post('/', matchController.create)

// PATCH /api/matches/:id/status → cambiar estado de la partida
// Al finalizar/cancelar los equipos pasan a "Cerrado"
router.patch('/:id/status', matchController.updateStatus)

// POST /api/matches/:id/results → guardar resultado individual de un jugador
// Body: { playerId, stats, points, won }
router.post('/:id/results', matchController.addResult)

// PATCH /api/matches/:id/live → actualizar métrica en tiempo real
// Body: { playerId, metricKey, delta }
router.patch('/:id/live', matchController.updateLive)

export default router