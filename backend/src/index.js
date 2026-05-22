// =============================
// PUNTO DE ENTRADA DEL SERVIDOR
// =============================

// ¿Qué hace este archivo?
// Es el archivo principal que arranca el servidor.
// Aquí se configuran todos los middlewares y se registran las rutas.
// Piensa en él como el "director de orquesta" de todo el backend.

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import authRoutes from './routes/auth.routes.js'

const app = express()
const PORT = process.env.PORT || 3000

// ─────────────────────────────
// MIDDLEWARES DE SEGURIDAD
// ─────────────────────────────

// Helmet agrega cabeceras HTTP seguras automáticamente
// Protege contra XSS, clickjacking y otros ataques comunes
app.use(helmet())

// Rate limiting: máximo 100 peticiones por IP cada 15 minutos
// Evita ataques de fuerza bruta al login y register
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, intenta más tarde' }
})
app.use(limiter)

// ─────────────────────────────
// MIDDLEWARES GENERALES
// ─────────────────────────────

// CORS permite que el frontend (puerto 5173) pueda hacer
// peticiones a este backend (puerto 3000) sin ser bloqueado
app.use(cors())

// express.json() permite leer el body de las peticiones en formato JSON
// Sin esto req.body sería undefined
app.use(express.json())

// ─────────────────────────────
// RUTAS
// ─────────────────────────────

// Ruta de prueba para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.json({ message: 'Backend ISC-PLAYGROUND funcionando ✅' })
})

// Rutas de autenticación con prefijo /api/auth
// POST /api/auth/register → registrar usuario
// POST /api/auth/login    → iniciar sesión
app.use('/api/auth', authRoutes)

// ─────────────────────────────
// ARRANCAR SERVIDOR
// ─────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})