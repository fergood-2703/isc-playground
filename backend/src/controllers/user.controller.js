// =============================
// CONTROLADOR DE USUARIOS
// =============================

import * as userService from '../services/user.service.js'
import { extractNumericId } from '../utils/helpers.js'

const getAll = async (req, res) => {
  try {
    const users = await userService.getAll()
    res.status(200).json({ users })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    const user = await userService.getById(id)
    res.status(200).json({ user })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const { username, name } = req.body

    // ─────────────────────────────
    // VERIFICACIÓN DE OWNERSHIP
    // ─────────────────────────────
    // req.user viene del token JWT (inyectado por verifyToken)
    // Solo puedes editar tu propio perfil
    // Los admins sí pueden editar cualquier perfil
    const numericParamId = extractNumericId(id)
    if (req.user.role !== 'admin' && req.user.id !== numericParamId) {
      return res.status(403).json({ error: 'No puedes editar el perfil de otro usuario' })
    }

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