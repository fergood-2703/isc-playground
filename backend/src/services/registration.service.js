// =============================
// SERVICIO DE INSCRIPCIONES
// =============================

// Aquí vive toda la lógica de negocio de inscripciones.
// Replica las reglas del Context del frontend según el reporte.

import * as registrationRepository from '../repositories/registration.repository.js'
import * as gameRepository from '../repositories/game.repository.js'
import * as userRepository from '../repositories/user.repository.js'
import { extractNumericId } from '../utils/helpers.js'

// ─────────────────────────────
// OBTENER INSCRIPCIONES
// ─────────────────────────────
// Filtra por gameId o userId según el query param que llegue
const getAll = async ({ gameId, userId }) => {
  const registrations = await registrationRepository.findAll({ gameId, userId })
  return registrations.map(formatRegistration)
}

// ─────────────────────────────
// INSCRIBIRSE A UN JUEGO
// ─────────────────────────────
// Reglas del reporte:
// 1. No se puede inscribir si ya existe un registro con userId + gameId
// 2. Al inscribirse se agrega el gameId al array games del usuario
const create = async ({ userId, gameId }) => {

  // Extraemos el id numérico del formato "u-1"
  const numericUserId = extractNumericId(userId)

  // Verificamos que el usuario existe
  const user = await userRepository.findById(numericUserId)
  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // Verificamos que el juego existe
  const game = await gameRepository.findById(gameId)
  if (!game) {
    throw new Error('Juego no encontrado')
  }

  // Verificamos que no esté ya inscrito
  // El schema.prisma tiene @@unique([userId, gameId]) que también lo previene
  const existing = await registrationRepository.findByUserAndGame(numericUserId, gameId)
  if (existing) {
    throw new Error('Ya estás inscrito en este juego')
  }

  const registration = await registrationRepository.create({
    userId: numericUserId,
    gameId
  })

  return formatRegistration(registration)
}

// ─────────────────────────────
// CANCELAR INSCRIPCIÓN
// ─────────────────────────────
// Reglas del reporte:
// 1. No se puede cancelar si hay partida activa que incluya al usuario
//    (status distinto de "Pendiente" y "Cancelada")
// 2. Al cancelar se elimina el gameId del array games del usuario
const remove = async (id) => {

  // Verificamos que la inscripción existe
  const registration = await registrationRepository.findById(id)
  if (!registration) {
    throw new Error('Inscripción no encontrada')
  }

  // Verificamos que no haya partida activa para este usuario en este juego
  // Una partida activa es cualquiera que NO sea "Pendiente" ni "Cancelada"
  const activeMatch = await registrationRepository.findActiveMatch(
    registration.userId,
    registration.gameId
  )
  if (activeMatch) {
    throw new Error('No puedes cancelar tu inscripción mientras tienes una partida activa')
  }

  await registrationRepository.remove(id)
}

// ─────────────────────────────
// HELPER: FORMATEAR INSCRIPCIÓN
// ─────────────────────────────
// El front espera el id como "reg-u-1-counter-strike-16"
// y el userId como "u-1"
const formatRegistration = (registration) => {
  return {
    id: `reg-u-${registration.userId}-${registration.gameId}`,
    userId: `u-${registration.userId}`,
    gameId: registration.gameId,
    status: registration.status,
    registeredAt: registration.registeredAt
      .toISOString()
      .replace('T', ' ')
      .substring(0, 16) // formato "2026-05-10 09:00"
  }
}

export { getAll, create, remove }