// =============================
// SERVICIO DE JUEGOS
// =============================

// Aquí vive toda la lógica de negocio de juegos.
// No sabe nada de HTTP, solo procesa datos y llama al repositorio.

import * as gameRepository from '../repositories/game.repository.js'

// ─────────────────────────────
// OBTENER TODOS LOS JUEGOS
// ─────────────────────────────
const getAll = async () => {
  const games = await gameRepository.findAll()
  return games.map(formatGame)
}

// ─────────────────────────────
// OBTENER JUEGO POR ID
// ─────────────────────────────
// El :id puede ser slug ("bomb-squad") o legacyId (1, 2, 3)
// Detalles.jsx navega por legacyId, el resto del sistema por slug
const getById = async (id) => {
  // Si el id es numérico, buscamos por legacyId
  // Si es string, buscamos por slug
  const isNumeric = !isNaN(id)
  const game = isNumeric
    ? await gameRepository.findByLegacyId(parseInt(id))
    : await gameRepository.findById(id)

  if (!game) {
    throw new Error('Juego no encontrado')
  }

  return formatGame(game)
}

// ─────────────────────────────
// CREAR JUEGO
// ─────────────────────────────
// Recibe todo el objeto game según el modelo 1.2 del reporte
const create = async (data) => {
  const {
    id, legacyId, name, shortName, image, accent,
    teamSize, duration, format, status, description,
    pointFormula, winCondition, maxPlayers, matchType,
    maps, visualMetrics, scoringRules, metrics
  } = data

  // Verificamos que el slug no esté en uso
  const existing = await gameRepository.findById(id)
  if (existing) {
    throw new Error('Ya existe un juego con ese ID')
  }

  const game = await gameRepository.create({
    id, legacyId, name, shortName, image, accent,
    teamSize, duration, format,
    status: status || 'Activo',
    description, pointFormula, winCondition,
    maxPlayers, matchType,
    maps: maps || [],
    visualMetrics: visualMetrics || [],
    scoringRules: scoringRules || [],
    metrics: metrics || []
  })

  return formatGame(game)
}

// ─────────────────────────────
// ACTUALIZAR JUEGO
// ─────────────────────────────
const update = async (id, data) => {
  const existing = await gameRepository.findById(id)
  if (!existing) {
    throw new Error('Juego no encontrado')
  }

  const game = await gameRepository.update(id, data)
  return formatGame(game)
}

// ─────────────────────────────
// ELIMINAR JUEGO
// ─────────────────────────────
// El cascade en la BD elimina automáticamente
// partidas, equipos, inscripciones y métricas relacionadas
const remove = async (id) => {
  const existing = await gameRepository.findById(id)
  if (!existing) {
    throw new Error('Juego no encontrado')
  }

  await gameRepository.remove(id)
}

// ─────────────────────────────
// TOGGLE STATUS
// ─────────────────────────────
// Alterna entre "Activo" y "Desactivado"
const toggleStatus = async (id) => {
  const existing = await gameRepository.findById(id)
  if (!existing) {
    throw new Error('Juego no encontrado')
  }

  // Si está Activo → Desactivado, si está Desactivado → Activo
  const newStatus = existing.status === 'Activo' ? 'Desactivado' : 'Activo'
  const game = await gameRepository.update(id, { status: newStatus })
  return formatGame(game)
}

// ─────────────────────────────
// HELPER: FORMATEAR JUEGO
// ─────────────────────────────
// Estructura el juego exactamente como el front lo espera
// según el modelo 1.2 del reporte
const formatGame = (game) => {
  return {
    id: game.id,
    legacyId: game.legacyId,
    name: game.name,
    shortName: game.shortName,
    image: game.image,
    accent: game.accent,
    teamSize: game.teamSize,
    duration: game.duration,
    format: game.format,
    status: game.status,
    description: game.description,
    pointFormula: game.pointFormula,
    winCondition: game.winCondition,
    maxPlayers: game.maxPlayers,
    matchType: game.matchType,
    maps: game.maps || [],
    visualMetrics: game.visualMetrics || [],
    // scoringRules ordenadas por su campo order
    scoringRules: game.scoringRules
      ?.sort((a, b) => a.order - b.order)
      .map(r => ({
        key: r.key,
        label: r.label,
        direction: r.direction
      })) || [],
    metrics: game.metrics?.map(m => ({
      key: m.key,
      label: m.label,
      type: m.type,
      defaultValue: m.defaultValue
    })) || []
  }
}

export { getAll, getById, create, update, remove, toggleStatus }