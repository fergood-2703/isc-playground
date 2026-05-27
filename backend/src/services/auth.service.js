// =============================
// SERVICIO DE AUTENTICACIÓN
// =============================

// Aquí vive toda la lógica de negocio del auth.
// No sabe nada de HTTP (req, res), solo procesa datos.
// Responsabilidades:
// 1. Validar reglas del negocio
// 2. Encriptar contraseñas con bcrypt
// 3. Generar tokens JWT
// 4. Llamar al repositorio para guardar o buscar en la BD

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as authRepository from '../repositories/auth.repository.js'
import { formatUser } from '../utils/helpers.js'
import { securityLog } from '../middlewares/logger.middleware.js'

// ─────────────────────────────
// REGISTRO PÚBLICO
// ─────────────────────────────
// El front manda: { nombres, apellidos, email, username, password }
// El rol es SIEMPRE "usuario" — no hay forma de cambiarlo desde aquí
const register = async ({ nombres, apellidos, email, username, password }) => {

  // Verificamos que el email no esté ya registrado
  const existingEmail = await authRepository.findByEmail(email)
  if (existingEmail) {
    throw new Error('El email ya está registrado')
  }

  // Verificamos que el username no esté ya tomado
  const existingUsername = await authRepository.findByUsername(username)
  if (existingUsername) {
    throw new Error('El username ya está en uso')
  }

  // Encriptamos la contraseña antes de guardarla
  // 10 salt rounds es el estándar recomendado para bcrypt
  const hashedPassword = await bcrypt.hash(password, 10)

  // name es nombres + apellidos concatenados
  // El front lo usa para mostrar el nombre completo del jugador
  const name = `${nombres} ${apellidos}`

  const user = await authRepository.create({
    nombres, apellidos, name, email, username,
    password: hashedPassword,
    role: 'usuario' // siempre usuario, sin excepciones
  })

  // Devolvemos el usuario formateado — nunca la contraseña
  return formatUser(user)
}

// ─────────────────────────────
// REGISTRO DE ADMINISTRADOR
// ─────────────────────────────
// Solo accesible desde el endpoint protegido /register-admin
// La verificación de que quien llama es admin ya la hizo verifyAdmin
// Aquí solo validamos duplicados y creamos con rol "admin"
const registerAdmin = async ({ nombres, apellidos, email, username, password }) => {

  // Verificamos duplicados igual que en el registro normal
  const existingEmail = await authRepository.findByEmail(email)
  if (existingEmail) {
    throw new Error('El email ya está registrado')
  }

  const existingUsername = await authRepository.findByUsername(username)
  if (existingUsername) {
    throw new Error('El username ya está en uso')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const name = `${nombres} ${apellidos}`

  const user = await authRepository.create({
    nombres, apellidos, name, email, username,
    password: hashedPassword,
    role: 'admin' // rol explícito — solo llega aquí si verifyAdmin pasó
  })

  return formatUser(user)
}

// ─────────────────────────────
// LOGIN
// ─────────────────────────────
// El front manda: { identifier, password }
// identifier puede ser email O username
const login = async ({ identifier, password }) => {

  // Buscamos el usuario por email o username
  const user = await authRepository.findByEmailOrUsername(identifier)
  if (!user) {
    // Mensaje genérico intencionalmente para no revelar si el email/username existe
    throw new Error('Credenciales incorrectas')
  }

  // Verificamos que la cuenta esté activa
  if (user.status === 'Inactivo') {
    throw new Error('Tu cuenta está inactiva')
  }

  // Comparamos la contraseña con la encriptada en la BD
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new Error('Credenciales incorrectas')
  }

  // Generamos el token JWT con los datos mínimos necesarios
  // id como número para que extractNumericId funcione correctamente
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )

  return { token, user: formatUser(user) }
}

export { register, registerAdmin, login }