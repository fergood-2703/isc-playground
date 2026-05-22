// =============================
// RUTAS DE USUARIOS
// =============================

// Define los endpoints disponibles para usuarios.
// Solo mapea rutas a controladores, sin lógica.

import express from 'express'
import * as userController from '../controllers/user.controller.js'

const router = express.Router()

// GET /api/users → lista de todos los usuarios (Dashboard > Usuarios)
router.get('/', userController.getAll)

// GET /api/users/:id → perfil de un usuario específico
router.get('/:id', userController.getById)

// PATCH /api/users/:id → editar perfil (username, name)
router.patch('/:id', userController.update)

export default router