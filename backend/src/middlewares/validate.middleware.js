// =============================
// MIDDLEWARE DE VALIDACIÓN
// =============================

// Valida los datos del body antes de que lleguen al controlador.
// Si algo falta o está mal, responde con 400 antes de procesar nada.

// ─────────────────────────────
// REGISTRO
// ─────────────────────────────
const validateRegister = (req, res, next) => {
  const { nombres, apellidos, email, username, password } = req.body

  if (!nombres || !apellidos || !email || !username || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos: nombres, apellidos, email, username, password' })
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'El email no es válido' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  }

  next()
}

// ─────────────────────────────
// LOGIN
// ─────────────────────────────
const validateLogin = (req, res, next) => {
  const { identifier, password } = req.body

  if (!identifier || !password) {
    return res.status(400).json({ error: 'identifier y password son requeridos' })
  }

  next()
}

// ─────────────────────────────
// CREAR JUEGO
// ─────────────────────────────
const validateGame = (req, res, next) => {
  const { id, name, legacyId } = req.body

  if (!id || !name || !legacyId) {
    return res.status(400).json({ error: 'id, name y legacyId son requeridos' })
  }

  next()
}

// ─────────────────────────────
// CREAR EQUIPO
// ─────────────────────────────
const validateTeam = (req, res, next) => {
  const { name, tag, gameId, playerIds } = req.body

  if (!name || !tag || !gameId || !playerIds) {
    return res.status(400).json({ error: 'name, tag, gameId y playerIds son requeridos' })
  }

  if (!Array.isArray(playerIds) || playerIds.length === 0) {
    return res.status(400).json({ error: 'playerIds debe ser un array con al menos un jugador' })
  }

  next()
}

// ─────────────────────────────
// CREAR PARTIDA
// ─────────────────────────────
const validateMatch = (req, res, next) => {
  const { gameId, phaseType, stage, map, scheduledAt, duration, teamIds } = req.body

  if (!gameId || !phaseType || !stage || !map || !scheduledAt || !duration || !teamIds) {
    return res.status(400).json({ error: 'Todos los campos son requeridos: gameId, phaseType, stage, map, scheduledAt, duration, teamIds' })
  }

  if (!Array.isArray(teamIds) || teamIds.length !== 2) {
    return res.status(400).json({ error: 'teamIds debe ser un array con exactamente 2 equipos' })
  }

  next()
}

export { validateRegister, validateLogin, validateGame, validateTeam, validateMatch }