// =============================
// RUTAS DE RANKINGS
// =============================

// Define los endpoints para rankings y leaderboards.
// Solo mapea rutas a controladores, sin lógica.

import express from 'express'
import * as rankingController from '../controllers/ranking.controller.js'

const router = express.Router()

// GET /api/rankings?gameId= → ranking calculado de un juego
// El servidor replica la lógica de rankingEngine.js del frontend
router.get('/', rankingController.getGameRanking)

// GET /api/rankings/global → leaderboard global calculado
router.get('/global', rankingController.getGlobalRanking)

export default router