// =============================
// MIDDLEWARE DE VALIDACIÓN
// =============================

// Valida los datos del body antes de que lleguen al controlador.
// Si algo falta o está mal, responde con 400 antes de procesar nada.

// ─────────────────────────────
// REGISTRO
// ─────────────────────────────
const validateRegister = (req, res, next) => {
  const { nombres, apellidos, email, username, password } = req.body;

  if (!nombres || !apellidos || !email || !username || !password) {
    return res
      .status(400)
      .json({
        error:
          "Todos los campos son requeridos: nombres, apellidos, email, username, password",
      });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ error: "El email no es válido" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  next();
};

// ─────────────────────────────
// LOGIN
// ─────────────────────────────
const validateLogin = (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ error: "identifier y password son requeridos" });
  }

  next();
};

// ─────────────────────────────
// CREAR JUEGO
// ─────────────────────────────
const validateGame = (req, res, next) => {
  const { id, name, legacyId } = req.body;

  if (!id || !name || !legacyId) {
    return res
      .status(400)
      .json({ error: "id, name y legacyId son requeridos" });
  }

  next();
};

// ─────────────────────────────
// CREAR EQUIPO
// ─────────────────────────────
const validateTeam = (req, res, next) => {
  const { name, tag, gameId, playerIds } = req.body;

  if (!name || !tag || !gameId || !playerIds) {
    return res
      .status(400)
      .json({ error: "name, tag, gameId y playerIds son requeridos" });
  }

  if (!Array.isArray(playerIds) || playerIds.length === 0) {
    return res
      .status(400)
      .json({ error: "playerIds debe ser un array con al menos un jugador" });
  }

  next();
};

// ─────────────────────────────
// CREAR PARTIDA
// ─────────────────────────────
//
// Valida el body antes de crear una partida.
//
// Cambio importante:
// Antes se usaba !duration, pero si duration era 0,
// JavaScript lo tomaba como falso y podía causar errores raros.
// Ahora convertimos duration a número y exigimos que sea mayor a 0.
const validateMatch = (req, res, next) => {
  const { gameId, phaseType, stage, map, scheduledAt, duration, teamIds } =
    req.body;

  if (!gameId || !phaseType || !stage || !map || !scheduledAt || !teamIds) {
    return res.status(400).json({
      error:
        "Todos los campos son requeridos: gameId, phaseType, stage, map, scheduledAt, duration, teamIds",
    });
  }

  const durationNumber = Number(duration);

  if (!Number.isFinite(durationNumber) || durationNumber <= 0) {
    return res.status(400).json({
      error: "duration debe ser un número mayor a 0",
    });
  }

  if (!Array.isArray(teamIds) || teamIds.length !== 2) {
    return res.status(400).json({
      error: "teamIds debe ser un array con exactamente 2 equipos",
    });
  }

  if (teamIds[0] === teamIds[1]) {
    return res.status(400).json({
      error: "No puedes crear una partida con el mismo equipo dos veces",
    });
  }

  next();
};

export {
  validateRegister,
  validateLogin,
  validateGame,
  validateTeam,
  validateMatch,
};
