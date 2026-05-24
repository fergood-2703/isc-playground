// =============================
// MIDDLEWARE DE LOGS DE SEGURIDAD
// =============================

// ¿Qué hace este archivo?
// Registra eventos de seguridad importantes en la terminal.
// Morgan ya logea todas las peticiones HTTP generales.
// Este middleware logea específicamente eventos de seguridad:
// - Intentos de acceso sin token
// - Tokens inválidos o expirados
// - Intentos de acceso sin permisos de admin
// Esto nos permite detectar ataques o comportamientos sospechosos.

// ─────────────────────────────
// FORMATO DEL LOG
// ─────────────────────────────
// [SECURITY] EVENTO - IP: x.x.x.x - Detalle
// Ejemplo:
// [SECURITY] TOKEN_MISSING - IP: 192.168.1.5 - DELETE /api/games/bomb-squad
// [SECURITY] LOGIN_FAILED - IP: 192.168.1.5 - identifier: admin@isc.com

const securityLog = (event, req, detail = '') => {
  const ip = req.ip || req.connection.remoteAddress
  const timestamp = new Date().toISOString()
  console.warn(`[SECURITY] ${timestamp} - ${event} - IP: ${ip} - ${detail}`)
}

export { securityLog }