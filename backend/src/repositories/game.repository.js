// =============================
// REPOSITORIO DE JUEGOS
// =============================

// Es la única capa que habla directamente con la base de datos.
// Incluye scoringRules y metrics en todas las consultas
// porque el front siempre los necesita junto al juego.

import prisma from '../config/db.js'

// Campos que siempre incluimos al consultar un juego
const includeRelations = {
  scoringRules: {
    orderBy: { order: 'asc' }
  },
  metrics: true
}

// ─────────────────────────────
// OBTENER TODOS LOS JUEGOS
// ─────────────────────────────
const findAll = async () => {
  return await prisma.game.findMany({
    include: includeRelations
  })
}

// ─────────────────────────────
// BUSCAR JUEGO POR SLUG
// ─────────────────────────────
// Ej: "bomb-squad", "counter-strike-16"
const findById = async (id) => {
  return await prisma.game.findUnique({
    where: { id },
    include: includeRelations
  })
}

// ─────────────────────────────
// BUSCAR JUEGO POR LEGACY ID
// ─────────────────────────────
// Usado en Detalles.jsx que navega por /juego/1, /juego/2, /juego/3
const findByLegacyId = async (legacyId) => {
  return await prisma.game.findUnique({
    where: { legacyId },
    include: includeRelations
  })
}

// ─────────────────────────────
// CREAR JUEGO
// ─────────────────────────────
// Crea el juego junto con sus scoringRules y metrics en una sola operación
const create = async (data) => {
  const { scoringRules, metrics, ...gameData } = data

  return await prisma.game.create({
    data: {
      ...gameData,
      // Creamos las scoringRules anidadas
      scoringRules: {
        create: scoringRules.map((rule, index) => ({
          key: rule.key,
          label: rule.label,
          direction: rule.direction,
          order: index // guardamos el orden para mantener prioridad
        }))
      },
      // Creamos las metrics anidadas
      metrics: {
        create: metrics.map(metric => ({
          key: metric.key,
          label: metric.label,
          type: metric.type || 'number',
          defaultValue: metric.defaultValue ?? 0
        }))
      }
    },
    include: includeRelations
  })
}

// ─────────────────────────────
// ACTUALIZAR JUEGO
// ─────────────────────────────
const update = async (id, data) => {
  const { scoringRules, metrics, ...gameData } = data

  return await prisma.game.update({
    where: { id },
    data: gameData,
    include: includeRelations
  })
}

// ─────────────────────────────
// ELIMINAR JUEGO
// ─────────────────────────────
// El cascade en schema.prisma elimina automáticamente
// todas las relaciones (inscripciones, equipos, partidas, métricas)
const remove = async (id) => {
  return await prisma.game.delete({
    where: { id }
  })
}

export { findAll, findById, findByLegacyId, create, update, remove }