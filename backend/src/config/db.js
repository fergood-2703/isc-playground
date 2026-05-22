// =============================
// CONEXIÓN A LA BASE DE DATOS
// =============================

// ¿Qué hace este archivo?
// Crea y exporta una sola instancia de Prisma para toda la aplicación.
// Usamos el adapter de pg (PostgreSQL) porque Prisma 7 con ES Modules
// requiere un driver explícito para conectarse a la BD

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Leemos la URL de conexión del .env
// formato: postgresql://usuario:contraseña@localhost:5432/nombre_bd
const connectionString = process.env.DATABASE_URL

// El adapter le dice a Prisma cómo conectarse a PostgreSQL
const adapter = new PrismaPg({ connectionString })

// Creamos una sola instancia de Prisma con el adapter
// Buena práctica: una sola conexión evita saturar la BD
const prisma = new PrismaClient({ adapter })

export default prisma