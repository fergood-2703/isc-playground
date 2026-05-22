// =============================
// RUTAS DE AUTENTICACIÓN
// =============================

// ¿Qué hace este archivo?
// Define los endpoints disponibles para autenticación.
// Solo declara qué URL corresponde a qué controlador.
// No tiene lógica, solo mapea rutas a funciones.

import express from 'express'
import * as authController from '../controllers/auth.controller.js'
import { validateRegister, validateLogin } from '../middlewares/validate.middleware.js'

// Router es una mini-aplicación de express que agrupa rutas relacionadas
// Permite organizar endpoints por módulo (auth, users, tournaments, etc.)
const router = express.Router()

// POST /api/auth/register → registrar nuevo usuario
// El prefijo /api/auth viene definido en index.js
router.post('/register', validateRegister, authController.register)

// POST /api/auth/login → iniciar sesión
router.post('/login', validateLogin, authController.login)

export default router