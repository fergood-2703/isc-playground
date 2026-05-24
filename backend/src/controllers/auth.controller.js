// =============================
// CONTROLADOR DE AUTENTICACIÓN
// =============================

// Es el intermediario entre la petición HTTP y la lógica de negocio.
// Su única responsabilidad es:
// 1. Recibir la petición (req)
// 2. Llamar al servicio que hace el trabajo real
// 3. Devolver la respuesta (res)

import * as authService from '../services/auth.service.js'
import { securityLog } from '../middlewares/logger.middleware.js'

// ─────────────────────────────
// REGISTRO DE NUEVO USUARIO
// ─────────────────────────────
// Se activa cuando el frontend hace: POST /api/auth/register
// El front manda: { nombres, apellidos, email, username, password }
// Todo registro público es "usuario" siempre
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
// LOGIN DE USUARIO EXISTENTE
// ─────────────────────────────
// Se activa cuando el frontend hace: POST /api/auth/login
// El front manda: { identifier, password }
// identifier puede ser email O username
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body

    const result = await authService.login({ identifier, password })

    // Log de login exitoso
    console.info(`[AUTH] ${new Date().toISOString()} - LOGIN_SUCCESS - IP: ${req.ip} - identifier: ${identifier}`)

    // 200 = "OK", la petición fue exitosa
    res.status(200).json({
      message: 'Login exitoso',
      ...result
    })
  } catch (error) {
    // Log de login fallido — posible ataque de fuerza bruta
    securityLog('LOGIN_FAILED', req, `identifier: ${req.body.identifier}`)
    res.status(401).json({ error: error.message })
  }
}

export { register, login }