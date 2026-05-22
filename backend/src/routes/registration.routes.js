// =============================
// RUTAS DE INSCRIPCIONES
// =============================

// Define los endpoints para inscripciones de usuarios a juegos.
// Solo mapea rutas a controladores, sin lógica.

import express from 'express'
import * as registrationController from '../controllers/registration.controller.js'

const router = express.Router()

// GET /api/registrations?gameId= → jugadores inscritos a un juego
// GET /api/registrations?userId= → juegos en los que está inscrito un usuario
router.get('/', registrationController.getAll)

// POST /api/registrations → inscribirse a un juego
// Body: { userId, gameId }
router.post('/', registrationController.create)

// DELETE /api/registrations/:id → cancelar inscripción
// Solo si no hay partida activa
router.delete('/:id', registrationController.remove)

export default router