// =============================
// REPOSITORIO DE INSCRIPCIONES
// =============================

// Es la única capa que habla directamente con la base de datos.
// Maneja todas las consultas relacionadas con inscripciones.

import prisma from '../config/db.js'

// ─────────────────────────────
// OBTENER INSCRIPCIONES
// ─────────────────────────────
// Filtra por gameId o userId según lo que llegue
const findAll = async ({ gameId, userId }) => {
  return await prisma.registration.findMany({
    where: {
      // Solo aplica el filtro si el valor existe
      ...(gameId && { gameId }),
      ...(userId && { userId: parseInt(userId) })
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
// Usado para verificar si ya existe una inscripción
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
// Una partida activa es cualquiera que NO sea "Pendiente" ni "Cancelada"
// Según las reglas del reporte para cancelar inscripción
const findActiveMatch = async (userId, gameId) => {
  return await prisma.match.findFirst({
    where: {
      gameId,
      // Status que bloquean cancelar inscripción
      status: {
        notIn: ['Pendiente', 'Cancelada']
      },
      // Verificamos que el usuario esté en esa partida
      playerResults: {
        some: {
          playerId: userId
        }
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