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
// FORMATEAR USUARIO
// ─────────────────────────────
// Nunca devuelve la contraseña
// Convierte el id a "u-1"
// Construye el array games desde las inscripciones
const formatUser = (user) => {
  const { password, ...rest } = user
  return {
    ...rest,
    id: `u-${user.id}`,
    games: user.registrations?.map(r => r.gameId) || [],
    createdAt: user.createdAt.toISOString()
  }
}

export { extractNumericId, formatUser }