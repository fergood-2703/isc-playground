// =============================
// CONTROLADOR DE AUTENTICACIÓN
// =============================

// Intermediario entre la petición HTTP y la lógica de negocio.
// Su única responsabilidad es:
// 1. Recibir la petición (req)
// 2. Llamar al servicio que hace el trabajo real
// 3. Devolver la respuesta (res)

import * as authService from '../services/auth.service.js'
import { securityLog } from '../middlewares/logger.middleware.js'

// ─────────────────────────────
// REGISTRO PÚBLICO
// ─────────────────────────────
// POST /api/auth/register
// El front manda: { nombres, apellidos, email, username, password }
// Todo registro público es "usuario" siempre — sin excepciones
const register = async (req, res) => {
  try {
    const { nombres, apellidos, email, username, password } = req.body

    const user = await authService.register({
      nombres, apellidos, email, username, password
    })

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// REGISTRO DE ADMINISTRADOR
// ─────────────────────────────
// POST /api/auth/register-admin
// Solo accesible para admins autenticados (verifyToken + verifyAdmin en la ruta)
// El admin que lo crea ya pasó la verificación de JWT
// No se necesita adminCode porque la protección es el token mismo
const registerAdmin = async (req, res) => {
  try {
    const { nombres, apellidos, email, username, password } = req.body

    const user = await authService.registerAdmin({
      nombres, apellidos, email, username, password
    })

    // Log de seguridad: quién creó el nuevo admin
    securityLog('ADMIN_CREATED', req,
      `username: ${req.user.username} creó al admin: ${username}`)

    res.status(201).json({
      message: 'Administrador creado exitosamente',
      user
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// LOGIN
// ─────────────────────────────
// POST /api/auth/login
// El front manda: { identifier, password }
// identifier puede ser email O username
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body

    const result = await authService.login({ identifier, password })

    // Log de login exitoso para auditoría
    console.info(
      `[AUTH] ${new Date().toISOString()} - LOGIN_SUCCESS - IP: ${req.ip} - identifier: ${identifier}`
    )

    res.status(200).json({
      message: 'Login exitoso',
      ...result
    })
  } catch (error) {
    // Log de intento fallido — posible ataque de fuerza bruta
    securityLog('LOGIN_FAILED', req, `identifier: ${req.body.identifier}`)
    res.status(401).json({ error: error.message })
  }
}

export { register, registerAdmin, login }