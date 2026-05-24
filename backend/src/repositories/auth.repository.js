// =============================
// REPOSITORIO DE AUTENTICACIÓN
// =============================

// Es la única capa que habla directamente con la base de datos.
// El servicio le pide datos y él los busca o guarda en PostgreSQL.
// Si mañana cambiamos de BD, solo cambiamos aquí.

import prisma from '../config/db.js'

// ─────────────────────────────
// BUSCAR USUARIO POR EMAIL
// ─────────────────────────────
// Usado en register para verificar que el email no esté duplicado
const findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  })
}

// ─────────────────────────────
// BUSCAR USUARIO POR USERNAME
// ─────────────────────────────
// Usado en register para verificar que el username no esté duplicado
const findByUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username }
  })
}

// ─────────────────────────────
// BUSCAR USUARIO POR EMAIL O USERNAME
// ─────────────────────────────
// Usado en login porque el front manda "identifier"
// que puede ser email o username
const findByEmailOrUsername = async (identifier) => {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    },
    // Incluimos las inscripciones para devolver games correcto
    include: {
      registrations: {
        select: { gameId: true }
      }
    }
  })
}

// ─────────────────────────────
// CREAR NUEVO USUARIO
// ─────────────────────────────
// La contraseña ya viene encriptada desde el servicio
const create = async ({ nombres, apellidos, name, email, username, password, role }) => {
  return await prisma.user.create({
    data: {
      nombres, apellidos, name, email,
      username, password, role,
      status: 'Activo'
    },
    // Incluimos las inscripciones aunque estén vacías al crear
    include: {
      registrations: {
        select: { gameId: true }
      }
    }
  })
}

export { findByEmail, findByUsername, findByEmailOrUsername, create }