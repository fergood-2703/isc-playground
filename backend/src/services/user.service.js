// =============================
// SERVICIO DE USUARIOS
// =============================

// Aquí vive toda la lógica de negocio de usuarios.
// No sabe nada de HTTP, solo procesa datos y llama al repositorio.

import * as userRepository from '../repositories/user.repository.js'

// ─────────────────────────────
// OBTENER TODOS LOS USUARIOS
// ─────────────────────────────
// Devuelve la lista completa de usuarios para el Dashboard
const getAll = async () => {
  const users = await userRepository.findAll()
  // Formateamos cada usuario antes de devolverlo
  return users.map(formatUser)
}

// ─────────────────────────────
// OBTENER USUARIO POR ID
// ─────────────────────────────
// El front manda el id como "u-1", extraemos el número
const getById = async (id) => {
  // Convertimos "u-1" → 1 para buscar en la BD
  const numericId = extractNumericId(id)

  const user = await userRepository.findById(numericId)
  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  return formatUser(user)
}

// ─────────────────────────────
// ACTUALIZAR USUARIO
// ─────────────────────────────
// Solo permite actualizar username y name según el reporte
const update = async (id, { username, name }) => {
  const numericId = extractNumericId(id)

  // Verificamos que el usuario existe
  const existing = await userRepository.findById(numericId)
  if (!existing) {
    throw new Error('Usuario no encontrado')
  }

  // Si cambia el username, verificamos que no esté en uso por otro usuario
  if (username && username !== existing.username) {
    const takenUsername = await userRepository.findByUsername(username)
    if (takenUsername) {
      throw new Error('El username ya está en uso')
    }
  }

  const user = await userRepository.update(numericId, { username, name })
  return formatUser(user)
}

// ─────────────────────────────
// HELPERS
// ─────────────────────────────

// Extrae el número de un id con formato "u-1" → 1
// Si ya es un número lo devuelve tal cual
const extractNumericId = (id) => {
  if (typeof id === 'string' && id.startsWith('u-')) {
    return parseInt(id.replace('u-', ''))
  }
  return parseInt(id)
}

// Formatea el usuario para el frontend
// Convierte el id a "u-1" y nunca devuelve la contraseña
const formatUser = (user) => {
  const { password, ...rest } = user
  return {
    ...rest,
    id: `u-${user.id}`,
    games: user.registrations?.map(r => r.gameId) || [],
    createdAt: user.createdAt.toISOString()
  }
}

export { getAll, getById, update }