// =============================
// REPOSITORIO DE USUARIOS
// =============================

// Es la única capa que habla directamente con la base de datos.
// Si mañana cambiamos de BD, solo cambiamos aquí.

import prisma from '../config/db.js'

// ─────────────────────────────
// OBTENER TODOS LOS USUARIOS
// ─────────────────────────────
// Incluimos las inscripciones para saber en qué juegos está cada usuario
const findAll = async () => {
  return await prisma.user.findMany({
    include: {
      registrations: {
        select: { gameId: true }
      }
    }
  })
}

// ─────────────────────────────
// BUSCAR USUARIO POR ID
// ─────────────────────────────
const findById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      registrations: {
        select: { gameId: true }
      }
    }
  })
}

// ─────────────────────────────
// BUSCAR USUARIO POR USERNAME
// ─────────────────────────────
// Usado para verificar si un username ya está en uso
const findByUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username }
  })
}

// ─────────────────────────────
// ACTUALIZAR USUARIO
// ─────────────────────────────
// Solo actualiza los campos que lleguen (username, name)
const update = async (id, { username, name }) => {
  return await prisma.user.update({
    where: { id },
    data: {
      // Solo actualizamos los campos que llegaron
      // Si no llega un campo, no lo tocamos
      ...(username && { username }),
      ...(name && { name })
    },
    include: {
      registrations: {
        select: { gameId: true }
      }
    }
  })
}

// ─────────────────────────────
// ELIMINAR USUARIO
// ─────────────────────────────
//
// Elimina físicamente un usuario de la base de datos.
//
// IMPORTANTE:
// En schema.prisma las relaciones de User tienen onDelete: Cascade,
// por eso también se eliminan sus:
// - inscripciones
// - participaciones en equipos
// - resultados individuales
const remove = async (id) => {
  return await prisma.user.delete({
    where: { id }
  })
}
export { findAll, findById, findByUsername, update, remove }