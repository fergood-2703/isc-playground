// =============================
// MIDDLEWARES DE RATE LIMITING
// =============================

// Rate limiting específico por endpoint
// Complementa el rate limiting global del index.js

import rateLimit from 'express-rate-limit'

// ─────────────────────────────
// RATE LIMIT PARA LOGIN
// ─────────────────────────────
// Solo 5 intentos de login cada 15 minutos por IP
// Es más estricto que el global (100 peticiones)
// porque el login es el endpoint más vulnerable a fuerza bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,                    // máximo 5 intentos
  message: { error: 'Demasiados intentos de login, intenta en 15 minutos' }
})

export { loginLimiter }