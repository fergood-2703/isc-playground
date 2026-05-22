// =============================
// CONTROLADOR DE INSCRIPCIONES
// =============================

// Intermediario entre la petición HTTP y la lógica de negocio.
// Solo recibe req/res, llama al servicio y devuelve la respuesta.

import * as registrationService from '../services/registration.service.js'

// ─────────────────────────────
// OBTENER INSCRIPCIONES
// ─────────────────────────────
// Se activa cuando el frontend hace: GET /api/registrations
// Acepta query params:
// ?gameId=bomb-squad → jugadores inscritos a ese juego
// ?userId=u-1        → juegos en los que está inscrito ese usuario
const getAll = async (req, res) => {
  try {
    // req.query contiene los parámetros de la URL después del ?
    // Ej: /api/registrations?gameId=bomb-squad → req.query.gameId = "bomb-squad"
    const { gameId, userId } = req.query
    const registrations = await registrationService.getAll({ gameId, userId })
    res.status(200).json({ registrations })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ─────────────────────────────
// INSCRIBIRSE A UN JUEGO
// ─────────────────────────────
// Se activa cuando el frontend hace: POST /api/registrations
// Body: { userId, gameId }
const create = async (req, res) => {
  try {
    const { userId, gameId } = req.body
    const registration = await registrationService.create({ userId, gameId })
    res.status(201).json({
      message: 'Inscripción exitosa',
      registration
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// CANCELAR INSCRIPCIÓN
// ─────────────────────────────
// Se activa cuando el frontend hace: DELETE /api/registrations/:id
// Solo se puede cancelar si no hay partida activa
const remove = async (req, res) => {
  try {
    const { id } = req.params
    await registrationService.remove(id)
    res.status(200).json({ message: 'Inscripción cancelada exitosamente' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export { getAll, create, remove }