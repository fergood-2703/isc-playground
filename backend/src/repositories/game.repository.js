// =============================
// REPOSITORIO DE JUEGOS
// =============================
//
// Esta capa es la única que habla directamente con Prisma.
// Aquí NO va lógica de negocio, solo consultas a la base de datos.
//
// Cambio importante de este paso:
// - Al actualizar un juego, también actualizamos sus scoringRules y metrics.
// - Antes solo se actualizaban campos simples del juego.
// - Eso hacía que cambios en reglas/métricas desde el dashboard no se reflejaran bien.

import prisma from '../config/db.js'

// Relaciones que siempre queremos traer junto con cada juego.
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
    include: includeRelations,
    orderBy: {
      legacyId: 'asc'
    }
  })
}

// ─────────────────────────────
// BUSCAR JUEGO POR ID / SLUG
// ─────────────────────────────
//
// Ejemplo:
// bomb-squad
// counter-strike-16
const findById = async (id) => {
  return await prisma.game.findUnique({
    where: { id },
    include: includeRelations
  })
}

// ─────────────────────────────
// BUSCAR JUEGO POR LEGACY ID
// ─────────────────────────────
//
// Usado para rutas como:
// /juego/1
// /juego/2
const findByLegacyId = async (legacyId) => {
  return await prisma.game.findUnique({
    where: { legacyId },
    include: includeRelations
  })
}

// ─────────────────────────────
// CREAR JUEGO
// ─────────────────────────────
//
// Crea el juego junto con:
// - scoringRules
// - metrics
const create = async (data) => {
  const {
    scoringRules = [],
    metrics = [],
    ...gameData
  } = data

  return await prisma.game.create({
    data: {
      ...gameData,

      // Reglas de puntuación del juego.
      scoringRules: {
        create: scoringRules.map((rule, index) => ({
          key: rule.key,
          label: rule.label,
          direction: rule.direction || 'desc',
          order: index
        }))
      },

      // Métricas del juego.
      metrics: {
        create: metrics.map((metric) => ({
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
//
// Cambio importante:
// Prisma no actualiza automáticamente arrays relacionados.
// Por eso aquí hacemos:
//
// scoringRules: borrar las anteriores y crear las nuevas.
// metrics: borrar las anteriores y crear las nuevas.
//
// Así el dashboard sí puede modificar reglas y métricas.
const update = async (id, data) => {
  const {
    scoringRules,
    metrics,
    ...gameData
  } = data

  const updateData = {
    ...gameData
  }

  // Si el frontend mandó scoringRules, reemplazamos las anteriores.
  if (Array.isArray(scoringRules)) {
    updateData.scoringRules = {
      deleteMany: {},
      create: scoringRules.map((rule, index) => ({
        key: rule.key,
        label: rule.label,
        direction: rule.direction || 'desc',
        order: index
      }))
    }
  }

  // Si el frontend mandó metrics, reemplazamos las anteriores.
  if (Array.isArray(metrics)) {
    updateData.metrics = {
      deleteMany: {},
      create: metrics.map((metric) => ({
        key: metric.key,
        label: metric.label,
        type: metric.type || 'number',
        defaultValue: metric.defaultValue ?? 0
      }))
    }
  }

  return await prisma.game.update({
    where: { id },
    data: updateData,
    include: includeRelations
  })
}

// ─────────────────────────────
// ELIMINAR JUEGO
// ─────────────────────────────
//
// En schema.prisma las relaciones tienen onDelete: Cascade.
// Eso significa que al borrar un juego, se borran sus datos relacionados.
const remove = async (id) => {
  return await prisma.game.delete({
    where: { id }
  })
}

export {
  findAll,
  findById,
  findByLegacyId,
  create,
  update,
  remove
}