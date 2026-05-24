// =============================
// HELPERS COMPARTIDOS
// =============================

// Funciones utilitarias reutilizables entre servicios.
// Evita tener extractNumericId y formatUser duplicados en cada servicio.

// ─────────────────────────────
// EXTRAER ID NUMÉRICO
// ─────────────────────────────
// Convierte "u-1" → 1
// Si ya es número lo devuelve tal cual
const extractNumericId = (id) => {
  if (typeof id === 'string' && id.startsWith('u-')) {
    return parseInt(id.replace('u-', ''))
  }
  return parseInt(id)
}

// ─────────────────────────────
// HELPER: FORMATEAR USUARIO
// ─────────────────────────────
// El front espera el id como string "u-1", "u-2"
// games se construye desde las inscripciones reales
// La contraseña nunca se devuelve
const formatUser = (user) => {
  const { password, ...rest } = user
  return {
    ...rest,
    id: `u-${user.id}`,
    // Usamos las inscripciones reales en lugar de hardcodear []
    games: user.registrations?.map(r => r.gameId) || [],
    createdAt: user.createdAt.toISOString()
  }
}

export { extractNumericId, formatUser }