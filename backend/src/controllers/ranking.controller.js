// =============================
// CONTROLADOR DE RANKINGS
// =============================

// Intermediario entre la petición HTTP y la lógica de negocio.
// Solo recibe req/res, llama al servicio y devuelve la respuesta.

import * as rankingService from '../services/ranking.service.js'

// ─────────────────────────────
// RANKING POR JUEGO
// ─────────────────────────────
// Se activa cuando el frontend hace: GET /api/rankings?gameId=
// Replica la lógica de calculateGameRanking del rankingEngine.js
const getGameRanking = async (req, res) => {
  try {
    const { gameId } = req.query

    if (!gameId) {
      return res.status(400).json({ error: 'gameId es requerido' })
    }

    const ranking = await rankingService.getGameRanking(gameId)
    res.status(200).json({ ranking })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ─────────────────────────────
// RANKING GLOBAL
// ─────────────────────────────
// Se activa cuando el frontend hace: GET /api/rankings/global
// Replica la lógica de calculateGlobalLeaderboard del rankingEngine.js
const getGlobalRanking = async (req, res) => {
  try {
    const ranking = await rankingService.getGlobalRanking()
    res.status(200).json({ ranking })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export { getGameRanking, getGlobalRanking }