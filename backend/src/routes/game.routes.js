// =============================
// RUTAS DE JUEGOS
// =============================

// Define los endpoints del catálogo de juegos.
// Solo mapea rutas a controladores, sin lógica.

import express from 'express'
import * as gameController from '../controllers/game.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js'
import { validateGame } from '../middlewares/validate.middleware.js'

const router = express.Router()

// Rutas públicas

// GET /api/games → catálogo completo de juegos (página pública)
router.get('/', gameController.getAll)

// GET /api/games/:id → un juego específico (slug o legacyId)
router.get('/:id', gameController.getById)


// Rutas protegidas — solo admin

// POST /api/games → crear juego (solo admin)
router.post('/', verifyToken, verifyAdmin, validateGame, gameController.create)

// PATCH /api/games/:id → editar juego (solo admin)
router.patch('/:id', verifyToken, verifyAdmin, gameController.update)

// DELETE /api/games/:id → eliminar juego (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, gameController.remove)

// PATCH /api/games/:id/status → toggle Activo/Desactivado (solo admin)
router.patch('/:id/status', verifyToken, verifyAdmin, gameController.toggleStatus)

export default router