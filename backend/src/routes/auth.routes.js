// =============================
// RUTAS DE AUTENTICACIÓN
// =============================

// Define los endpoints disponibles para autenticación.
// Solo declara qué URL corresponde a qué controlador.
// No tiene lógica, solo mapea rutas a funciones.

import express from 'express'
import * as authController from '../controllers/auth.controller.js'
import { validateRegister, validateLogin } from '../middlewares/validate.middleware.js'
import { loginLimiter } from '../middlewares/rateLimit.middleware.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

// ─────────────────────────────
// POST /api/auth/register
// ─────────────────────────────
// Registro público — siempre crea rol "usuario"
// Sin códigos ni flags de rol
router.post('/register', validateRegister, authController.register)

// ─────────────────────────────
// POST /api/auth/register-admin
// ─────────────────────────────
// Solo un admin autenticado puede crear otro admin
// verifyToken → verifica que hay sesión activa
// verifyAdmin → verifica que el usuario es admin
// validateRegister → valida que los campos estén presentes
router.post('/register-admin', verifyToken, verifyAdmin, validateRegister, authController.registerAdmin)

// ─────────────────────────────
// POST /api/auth/login
// ─────────────────────────────
// loginLimiter bloquea la IP después de 5 intentos en 15 minutos
// Evita ataques de fuerza bruta
router.post('/login', loginLimiter, validateLogin, authController.login)

export default router