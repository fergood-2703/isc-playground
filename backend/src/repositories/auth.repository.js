// =============================
// REPOSITORIO DE AUTENTICACIÓN
// =============================

// ¿Qué hace un repositorio?
// Es la única capa que habla directamente con la base de datos.
// El servicio le pide datos y él los busca o guarda en PostgreSQL.
// Si mañana cambiamos de BD, solo cambiamos aquí.

// Importamos la conexión a PostgreSQL que configuramos en config/db.js
import prisma from '../config/db.js'

// ─────────────────────────────
// BUSCAR USUARIO POR EMAIL
// ─────────────────────────────
// Usado en login para verificar si el usuario existe
// y en register para evitar emails duplicados
const findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  })
}

// ─────────────────────────────
// CREAR NUEVO USUARIO
// ─────────────────────────────
// Usado en register para guardar el nuevo usuario en la BD
// La contraseña ya viene encriptada desde el servicio
const create = async ({ name, email, password }) => {
  return await prisma.user.create({
    data: { name, email, password }
  })
}

export { findByEmail, create }