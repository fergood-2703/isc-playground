// =============================
// CONTROLADOR DE USUARIOS
// =============================

// Intermediario entre la petición HTTP y la lógica de negocio.
// Solo recibe req/res, llama al servicio y devuelve la respuesta.
// No procesa datos ni habla con la BD.

import * as userService from '../services/user.service.js'

// ─────────────────────────────
// OBTENER TODOS LOS USUARIOS
// ─────────────────────────────
// Se activa cuando el frontend hace: GET /api/users
// Usado en Dashboard > Usuarios para listar todos los jugadores
const getAll = async (req, res) => {
  try {
    const users = await userService.getAll()
    res.status(200).json({ users })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ─────────────────────────────
// OBTENER USUARIO POR ID
// ─────────────────────────────
// Se activa cuando el frontend hace: GET /api/users/:id
// Usado en Perfil.jsx para mostrar los datos del usuario
const getById = async (req, res) => {
  try {
    // req.params.id contiene el id de la URL
    // Ej: /api/users/1 → req.params.id = "1"
    const { id } = req.params
    const user = await userService.getById(id)
    res.status(200).json({ user })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

// ─────────────────────────────
// ACTUALIZAR USUARIO
// ─────────────────────────────
// Se activa cuando el frontend hace: PATCH /api/users/:id
// Usado en Perfil.jsx para editar username y name
// El front manda: { username, name }
const update = async (req, res) => {
  try {
    const { id } = req.params
    const { username, name } = req.body
    const user = await userService.update(id, { username, name })
    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export { getAll, getById, update }