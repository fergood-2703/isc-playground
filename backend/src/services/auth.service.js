// =============================
// SERVICIO DE AUTENTICACIÓN
// =============================

// ¿Qué hace un servicio?
// Aquí vive toda la lógica de negocio.
// No sabe nada de HTTP (req, res), solo procesa datos.
// Su responsabilidad es:
// 1. Validar reglas del negocio (¿el email ya existe?)
// 2. Encriptar contraseñas con bcrypt
// 3. Generar tokens JWT para mantener la sesión
// 4. Llamar al repositorio para guardar o buscar en la BD

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as authRepository from '../repositories/auth.repository.js'

// ─────────────────────────────
// REGISTRO
// ─────────────────────────────
// Recibe los datos del controlador, valida y guarda el usuario
const register = async ({ name, email, password }) => {

  // Verificamos si ya existe un usuario con ese email
  // No queremos dos cuentas con el mismo email
  const existingUser = await authRepository.findByEmail(email)
  if (existingUser) {
    throw new Error('El email ya está registrado')
  }

  // Encriptamos la contraseña antes de guardarla en la BD
  // El 10 es el "salt rounds": cuántas veces se procesa el hash
  // 10 es el estándar recomendado (seguro sin ser lento)
  const hashedPassword = await bcrypt.hash(password, 10)

  // Guardamos el usuario con la contraseña encriptada
  const user = await authRepository.create({
    name,
    email,
    password: hashedPassword
  })

  // Devolvemos el usuario sin la contraseña por seguridad
  // El _ descarta el campo password del objeto
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

// ─────────────────────────────
// LOGIN
// ─────────────────────────────
// Verifica credenciales y devuelve un token JWT si son correctas
const login = async ({ email, password }) => {

  // Buscamos si existe un usuario con ese email
  const user = await authRepository.findByEmail(email)
  if (!user) {
    // Mensaje genérico intencionalmente: no revelamos si el email existe
    // Esto evita que un atacante pueda enumerar emails válidos
    throw new Error('Credenciales incorrectas')
  }

  // Comparamos la contraseña recibida con la encriptada en la BD
  // bcrypt.compare hace esto de forma segura sin desencriptar
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new Error('Credenciales incorrectas')
  }

  // Generamos un token JWT con los datos del usuario
  // Este token lo usará el frontend para identificarse en cada petición
  const token = jwt.sign(
    // Payload: datos guardados dentro del token
    { id: user.id, email: user.email, role: user.role },
    // Secret: clave para firmar el token, viene del .env
    process.env.JWT_SECRET,
    // El token expira en 24 horas por seguridad
    { expiresIn: '24h' }
  )

  // Devolvemos el token y los datos del usuario sin contraseña
  const { password: _, ...userWithoutPassword } = user
  return { token, user: userWithoutPassword }
}

export { register, login }