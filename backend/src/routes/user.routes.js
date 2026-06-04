// =============================
// RUTAS DE USUARIOS
// =============================

// Define los endpoints disponibles para usuarios.
// Solo mapea rutas a controladores, sin lógica.

import express from 'express'
import * as userController from '../controllers/user.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Rutas pública

// GET /api/users → lista de todos los usuarios (Dashboard > Usuarios)
router.get('/', userController.getAll)

// GET /api/users/:id → perfil de un usuario específico
router.get('/:id', userController.getById)

// Rutas protegidas — cualquier usuario autenticado

// DELETE /api/users/:id
// Solo administradores pueden eliminar usuarios.
router.delete('/:id', verifyToken, verifyAdmin, userController.remove)

// PATCH /api/users/:id → editar perfil (username, name)
router.patch('/:id', verifyToken, userController.update)

export default router