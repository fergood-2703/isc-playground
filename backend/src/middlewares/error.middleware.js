// =============================
// MIDDLEWARE DE ERRORES GLOBAL
// =============================

// ¿Por qué existe este archivo?
// Ahorita cada controlador tiene su propio try/catch y maneja
// los errores de forma diferente. Esto centraliza todo en un solo lugar.
//
// ¿Cómo funciona?
// Express detecta automáticamente un middleware con 4 parámetros
// (err, req, res, next) como manejador de errores global.
// Cuando cualquier controlador lanza un error, llega aquí.

// ─────────────────────────────
// MANEJADOR DE ERRORES GLOBAL
// ─────────────────────────────
const errorHandler = (err, req, res, next) => {

  // Morgan ya logea las peticiones exitosas
  // Aquí logueamos los errores para debug
  console.error(`[ERROR] ${req.method} ${req.url} → ${err.message}`)

  // Errores de Prisma — errores comunes de la BD
  if (err.code === 'P2002') {
    // P2002 = violación de constraint unique
    // Ej: email o username duplicado
    return res.status(409).json({
      error: 'Ya existe un registro con ese valor único'
    })
  }

  if (err.code === 'P2025') {
    // P2025 = registro no encontrado en la BD
    return res.status(404).json({
      error: 'Registro no encontrado'
    })
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({ error: 'Token inválido' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(403).json({ error: 'Token expirado, inicia sesión nuevamente' })
  }

  // Error genérico — cualquier otro error no manejado
  // En producción no mostramos el stack trace por seguridad
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  })
}

export { errorHandler }