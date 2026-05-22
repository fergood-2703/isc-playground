// =============================
// MIDDLEWARE DE AUTENTICACIÓN
// =============================

// Verifica que el token JWT sea válido antes de permitir el acceso.
// Se aplica a rutas que requieren estar autenticado.

import jwt from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
  // El token llega en el header Authorization con formato "Bearer <token>"
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Guardamos los datos del usuario en req para usarlos en los controladores
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }
}

// Solo permite continuar si el usuario tiene rol "admin"
// Se usa después de verifyToken
const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' })
  }
  next()
}

export { verifyToken, verifyAdmin }