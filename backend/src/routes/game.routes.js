// =============================
// RUTAS DE JUEGOS
// =============================

// Define los endpoints del catálogo de juegos.
// Solo mapea rutas a controladores, sin lógica.

import express from 'express'
import * as gameController from '../controllers/game.controller.js'

const router = express.Router()

// GET /api/games → catálogo completo de juegos (página pública)
router.get('/', gameController.getAll)

// GET /api/games/:id → un juego específico (slug o legacyId)
router.get('/:id', gameController.getById)

// POST /api/games → crear juego (solo admin)
router.post('/', gameController.create)

// PATCH /api/games/:id → editar juego (solo admin)
router.patch('/:id', gameController.update)

// DELETE /api/games/:id → eliminar juego (solo admin)
router.delete('/:id', gameController.remove)

// PATCH /api/games/:id/status → toggle Activo/Desactivado (solo admin)
router.patch('/:id/status', gameController.toggleStatus)

export default router