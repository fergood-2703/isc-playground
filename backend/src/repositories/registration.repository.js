// =============================
// REPOSITORIO DE INSCRIPCIONES
// =============================

import prisma from '../config/db.js'

// ─────────────────────────────
// OBTENER INSCRIPCIONES
// ─────────────────────────────
// Filtra por gameId o userId según lo que llegue
// userId puede llegar como "u-6" o como "6" — normalizamos aquí
const findAll = async ({ gameId, userId }) => {
  // Extraemos el número de "u-6" → 6, o parseamos directo si ya es número
  let numericUserId = null
  if (userId) {
    const cleaned = String(userId).replace(/^u-/, '')
    const parsed = parseInt(cleaned)
    if (!isNaN(parsed)) numericUserId = parsed
  }

  return await prisma.registration.findMany({
    where: {
      ...(gameId && { gameId }),
      ...(numericUserId !== null && { userId: numericUserId })
    }
  })
}

// ─────────────────────────────
// BUSCAR INSCRIPCIÓN POR ID
// ─────────────────────────────
const findById = async (id) => {
  return await prisma.registration.findUnique({
    where: { id }
  })
}

// ─────────────────────────────
// BUSCAR INSCRIPCIÓN POR USUARIO Y JUEGO
// ─────────────────────────────
const findByUserAndGame = async (userId, gameId) => {
  return await prisma.registration.findUnique({
    where: {
      userId_gameId: { userId, gameId }
    }
  })
}

// ─────────────────────────────
// BUSCAR PARTIDA ACTIVA
// ─────────────────────────────
// Verifica si el usuario tiene una partida activa en ese juego
// Bloquea cancelar inscripción si status no es "Pendiente" ni "Cancelada"
const findActiveMatch = async (userId, gameId) => {
  return await prisma.match.findFirst({
    where: {
      gameId,
      status: {
        notIn: ['Pendiente', 'Cancelada']
      },
      playerResults: {
        some: { playerId: userId }
      }
    }
  })
}

// ─────────────────────────────
// CREAR INSCRIPCIÓN
// ─────────────────────────────
const create = async ({ userId, gameId }) => {
  return await prisma.registration.create({
    data: {
      userId,
      gameId,
      status: 'inscrito'
    }
  })
}

// ─────────────────────────────
// ELIMINAR INSCRIPCIÓN
// ─────────────────────────────
const remove = async (id) => {
  return await prisma.registration.delete({
    where: { id }
  })
}

export { findAll, findById, findByUserAndGame, findActiveMatch, create, remove }