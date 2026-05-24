// =============================
// MIDDLEWARE DE AUTENTICACIÓN
// =============================

// Verifica que el token JWT sea válido antes de permitir el acceso.
// Se aplica a rutas que requieren estar autenticado.
// Dos middlewares:
// 1. verifyToken → autenticación: ¿eres quien dices ser?
// 2. verifyAdmin → autorización: ¿tienes permiso para esto?

import jwt from "jsonwebtoken";
import { securityLog } from "./logger.middleware.js";

// ─────────────────────────────
// VERIFICAR TOKEN JWT
// ─────────────────────────────
// Se aplica a rutas que requieren estar autenticado
// Extrae el token del header Authorization: Bearer <token>
const verifyToken = (req, res, next) => {
  // El token llega en el header Authorization con formato "Bearer <token>"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // Log: alguien intentó acceder sin token
    securityLog("TOKEN_MISSING", req, `${req.method} ${req.path}`);
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Guardamos los datos del usuario en req para usarlos en los controladores
    req.user = decoded;
    next();
  } catch (error) {
    // Diferenciamos si el token expiró o es inválido
    if (error.name === "TokenExpiredError") {
      securityLog("TOKEN_EXPIRED", req, `${req.method} ${req.path}`);
      return res
        .status(403)
        .json({ error: "Token expirado, inicia sesión nuevamente" });
    }
    securityLog("TOKEN_INVALID", req, `${req.method} ${req.path}`);
    return res.status(403).json({ error: "Token inválido" });
  }
};


// ─────────────────────────────
// VERIFICAR ROL ADMIN
// ─────────────────────────────
// Solo permite continuar si el usuario tiene rol "admin"
// Se usa después de verifyToken
const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    // Log: usuario sin permisos intentó acceder a ruta admin
    securityLog('UNAUTHORIZED_ADMIN_ACCESS', req,
      `username: ${req.user?.username} intentó ${req.method} ${req.path}`)
    return res.status(403).json({ error: 'Acceso solo para administradores' })
  }
  next()
}

export { verifyToken, verifyAdmin }
