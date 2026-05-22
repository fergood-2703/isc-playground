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

// Código secreto que valida si alguien puede registrarse como admin
// En producción esto debería ser una variable de entorno
const ADMIN_CODE = process.env.ADMIN_CODE

// ─────────────────────────────
// REGISTRO
// ─────────────────────────────
// El front manda: { nombres, apellidos, email, username, password, role, adminCode? }
const register = async ({ nombres, apellidos, email, username, password, role, adminCode }) => {

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

  // Si el rol es admin, verificamos el código secreto
  // Esto evita que cualquiera se registre como admin
  if (role === 'admin') {
    if (!adminCode || adminCode !== ADMIN_CODE) {
      throw new Error('Código de administrador incorrecto')
    }
  }

  // Solo permitimos roles válidos según el reporte
  const validRoles = ['usuario', 'admin']
  const userRole = validRoles.includes(role) ? role : 'usuario'

  // Encriptamos la contraseña antes de guardarla
  // 10 salt rounds es el estándar recomendado
  const hashedPassword = await bcrypt.hash(password, 10)

  // name es nombres + apellidos concatenados
  // El front lo usa para mostrar el nombre completo
  const name = `${nombres} ${apellidos}`

  // Guardamos el usuario en la BD
  const user = await authRepository.create({
    nombres,
    apellidos,
    name,
    email,
    username,
    password: hashedPassword,
    role: userRole
  })

  // Devolvemos el usuario con el id formateado como "u-1"
  // El front espera este formato según el reporte
  return formatUser(user)
}

// ─────────────────────────────
// LOGIN
// ─────────────────────────────
// El front manda: { identifier, password }
// identifier puede ser email O username
const login = async ({ identifier, password }) => {

  // Buscamos el usuario por email o username
  // El reporte dice que identifier puede ser cualquiera de los dos
  const user = await authRepository.findByEmailOrUsername(identifier)
  if (!user) {
    // Mensaje genérico intencionalmente para no revelar si el email/username existe
    throw new Error('Credenciales incorrectas')
  }

  // Verificamos que el usuario esté activo
  if (user.status === 'Inactivo') {
    throw new Error('Tu cuenta está inactiva')
  }

  // Comparamos la contraseña con la encriptada en la BD
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new Error('Credenciales incorrectas')
  }

  // Generamos el token JWT con los datos del usuario
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )

  return { token, user: formatUser(user) }
}

export { register, login }