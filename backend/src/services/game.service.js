// =============================
// SERVICIO DE JUEGOS
// =============================
//
// Aquí va la lógica de negocio de juegos.
// Esta capa recibe datos del controlador, los valida/normaliza,
// y luego llama al repositorio.
//
// Cambio importante de este paso:
// - Limpiamos el payload antes de mandarlo a Prisma.
// - Evitamos que lleguen campos del formulario como rulesText, metricsText o mapsText.
// - Validamos legacyId.
// - Evitamos duplicados por id y legacyId.

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
//
// El id puede ser:
// - slug: bomb-squad
// - legacyId numérico: 1, 2, 3
const getById = async (id) => {
  const isNumeric = !Number.isNaN(Number(id))

  const game = isNumeric
    ? await gameRepository.findByLegacyId(Number(id))
    : await gameRepository.findById(id)

  if (!game) {
    throw new Error('Juego no encontrado')
  }

  return formatGame(game)
}

// ─────────────────────────────
// CREAR JUEGO
// ─────────────────────────────
const create = async (data) => {
  const payload = normalizeGamePayload(data, {
    isCreate: true
  })

  // Validación básica.
  if (!payload.id || !payload.name || !payload.legacyId) {
    throw new Error('id, name y legacyId son requeridos')
  }

  // Evitamos duplicar slug.
  const existingById = await gameRepository.findById(payload.id)

  if (existingById) {
    throw new Error('Ya existe un juego con ese ID')
  }

  // Evitamos duplicar legacyId.
  const existingByLegacyId = await gameRepository.findByLegacyId(payload.legacyId)

  if (existingByLegacyId) {
    throw new Error('Ya existe un juego con ese legacyId')
  }

  const game = await gameRepository.create(payload)
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

  const payload = normalizeGamePayload(data, {
    isCreate: false
  })

  // No permitimos cambiar id ni legacyId desde edición normal.
  // Cambiarlos puede romper relaciones existentes.
  delete payload.id
  delete payload.legacyId

  const game = await gameRepository.update(id, payload)
  return formatGame(game)
}

// ─────────────────────────────
// ELIMINAR JUEGO
// ─────────────────────────────
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
//
// Alterna entre Activo y Desactivado.
const toggleStatus = async (id) => {
  const existing = await gameRepository.findById(id)

  if (!existing) {
    throw new Error('Juego no encontrado')
  }

  const newStatus = existing.status === 'Activo'
    ? 'Desactivado'
    : 'Activo'

  const game = await gameRepository.update(id, {
    status: newStatus
  })

  return formatGame(game)
}

// ─────────────────────────────
// NORMALIZAR PAYLOAD
// ─────────────────────────────
//
// Este helper solo deja pasar los campos que realmente existen
// en el modelo Game de Prisma.
//
// Esto evita errores tipo:
// Unknown argument rulesText
// Unknown argument metricsText
// Unknown argument mapsText
const normalizeGamePayload = (data, { isCreate }) => {
  const legacyIdNumber = Number(data.legacyId)

  const payload = {
    // Campos principales.
    id: data.id,
    legacyId: Number.isInteger(legacyIdNumber) ? legacyIdNumber : undefined,
    name: data.name,
    shortName: data.shortName || data.name,
    image: data.image || '',
    accent: data.accent || '#06b6d4',
    teamSize: data.teamSize || data.maxPlayers || 'Sin definir',
    duration: data.duration || 'Configurable',
    format: data.format || data.matchType || 'Competitivo',
    status: data.status || 'Activo',
    description: data.description || '',
    pointFormula: data.pointFormula || '',
    winCondition: data.winCondition || '',
    maxPlayers: data.maxPlayers || data.teamSize || 'Sin definir',
    matchType: data.matchType || data.format || 'Competitivo',

    // Arrays del modelo Game.
    maps: Array.isArray(data.maps) ? data.maps : [],
    visualMetrics: Array.isArray(data.visualMetrics) ? data.visualMetrics : [],

    // Relaciones.
    scoringRules: Array.isArray(data.scoringRules)
      ? data.scoringRules
      : [],

    metrics: Array.isArray(data.metrics)
      ? data.metrics
      : []
  }

  // En update no queremos mandar undefined innecesarios.
  if (!isCreate) {
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key]
      }
    })
  }

  return payload
}

// ─────────────────────────────
// FORMATEAR JUEGO
// ─────────────────────────────
//
// Devuelve el juego exactamente como el frontend lo espera.
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

    scoringRules: game.scoringRules
      ?.sort((a, b) => a.order - b.order)
      .map((rule) => ({
        key: rule.key,
        label: rule.label,
        direction: rule.direction
      })) || [],

    metrics: game.metrics?.map((metric) => ({
      key: metric.key,
      label: metric.label,
      type: metric.type,
      defaultValue: metric.defaultValue
    })) || []
  }
}

export {
  getAll,
  getById,
  create,
  update,
  remove,
  toggleStatus
}