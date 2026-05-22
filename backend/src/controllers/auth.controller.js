// =============================
// CONTROLADOR DE AUTENTICACIÓN
// =============================

// ¿Qué hace un controlador?
// Es el intermediario entre la petición HTTP y la lógica de negocio.
// Su única responsabilidad es:
// 1. Recibir la petición (req)
// 2. Llamar al servicio que hace el trabajo real
// 3. Devolver la respuesta (res)
// El controlador NO procesa datos ni habla con la BD, eso es trabajo del servicio.

import * as authService from '../services/auth.service.js'

// ─────────────────────────────
// REGISTRO DE NUEVO USUARIO
// ─────────────────────────────
// Se activa cuando el frontend hace: POST /api/auth/register
// Espera recibir en el body: { name, email, password }
const register = async (req, res) => {
  try {
    // req.body contiene los datos que mandó el frontend
    const { name, email, password } = req.body

    // Delegamos el trabajo al servicio:
    // él encripta la contraseña, verifica duplicados y guarda en BD
    const user = await authService.register({ name, email, password })

    // 201 = "Created", significa que algo se creó exitosamente
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user
    })
  } catch (error) {
    // Si el servicio lanza un error (ej: email ya existe)
    // lo capturamos y respondemos con 400 Bad Request
    res.status(400).json({ error: error.message })
  }
}

// ─────────────────────────────
// LOGIN DE USUARIO EXISTENTE
// ─────────────────────────────
// Se activa cuando el frontend hace: POST /api/auth/login
// Espera recibir en el body: { email, password }
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // El servicio verifica credenciales y devuelve token + usuario
    const result = await authService.login({ email, password })

    // 200 = "OK", la petición fue exitosa
    res.status(200).json({
      message: 'Login exitoso',
      ...result
    })
  } catch (error) {
    // 401 = "Unauthorized", credenciales incorrectas
    res.status(401).json({ error: error.message })
  }
}

export { register, login }