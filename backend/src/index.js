// =============================
// PUNTO DE ENTRADA DEL SERVIDOR
// =============================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import gameRoutes from "./routes/game.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import teamRoutes from "./routes/team.routes.js";
import matchRoutes from "./routes/match.routes.js";
import rankingRoutes from "./routes/ranking.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────
// 1. CORS — PRIMERO SIEMPRE
// ─────────────────────────────
// Debe ir antes de helmet y rate limiting
// para que los preflights OPTIONS respondan correctamente
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─────────────────────────────
// MIDDLEWARES DE SEGURIDAD
// ─────────────────────────────

// Helmet agrega cabeceras HTTP seguras automáticamente
app.use(helmet());

// ─────────────────────────────
// RATE LIMITING GLOBAL
// ─────────────────────────────
//
// En producción sí conviene limitar peticiones para evitar abuso.
// Pero en desarrollo React puede hacer muchas peticiones rápidamente,
// especialmente cuando AppContext carga juegos, usuarios, rankings,
// equipos, partidas e inscripciones.
//
// Por eso usamos un límite más alto en desarrollo.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // Si NODE_ENV es production usamos un límite más estricto.
  // En desarrollo usamos un límite alto para evitar errores 429
  // mientras probamos el frontend.
  max: process.env.NODE_ENV === "production" ? 300 : 2000,

  // No contamos preflight requests de CORS.
  // Esto evita gastar límite con peticiones OPTIONS.
  skip: (req) => req.method === "OPTIONS",

  message: {
    error: "Demasiadas peticiones, intenta más tarde",
  },
});

app.use(limiter);

// ─────────────────────────────
// MIDDLEWARES GENERALES
// ─────────────────────────────

// Morgan registra cada petición en la terminal
// formato "dev": método, ruta, status, tiempo de respuesta
// Ejemplo: POST /api/auth/login 401 2.345 ms
app.use(morgan("dev"));

// express.json() permite leer el body en formato JSON
// Sin esto req.body sería undefined
app.use(express.json());

// ─────────────────────────────
// RUTAS
// ─────────────────────────────

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "Backend ISC-PLAYGROUND funcionando ✅" });
});

// Rutas de autenticación con prefijo /api/auth
// POST /api/auth/register → registrar usuario
// POST /api/auth/login    → iniciar sesión
app.use("/api/auth", authRoutes);

// Rutas de usuarios
// GET /api/users       → lista de usuarios
// GET /api/users/:id   → perfil de usuario
// PATCH /api/users/:id → editar perfil
app.use("/api/users", userRoutes);

// Rutas de juegos
// GET    /api/games             → catálogo completo
// GET    /api/games/:id         → juego por slug o legacyId
// POST   /api/games             → crear juego (admin)
// PATCH  /api/games/:id         → editar juego (admin)
// DELETE /api/games/:id         → eliminar juego (admin)
// PATCH  /api/games/:id/status  → toggle activo/desactivado
app.use("/api/games", gameRoutes);

// Rutas de inscripciones
// GET    /api/registrations?gameId= → jugadores inscritos a un juego
// GET    /api/registrations?userId= → juegos de un usuario
// POST   /api/registrations         → inscribirse a un juego
// DELETE /api/registrations/:id     → cancelar inscripción
app.use("/api/registrations", registrationRoutes);

// Rutas de equipos
// GET    /api/teams?gameId=          → equipos de un juego
// POST   /api/teams                  → crear equipo
// PATCH  /api/teams/:id              → editar nombre
// DELETE /api/teams/:id              → eliminar equipo
// POST   /api/teams/:id/players      → agregar jugador
// DELETE /api/teams/:id/players/:pid → quitar jugador
app.use("/api/teams", teamRoutes);

// Rutas de partidas
// GET   /api/matches?gameId=       → partidas de un juego
// POST  /api/matches               → crear partida
// PATCH /api/matches/:id/status    → cambiar estado
// POST  /api/matches/:id/results   → guardar resultado de jugador
// PATCH /api/matches/:id/live      → actualizar métrica en tiempo real
app.use("/api/matches", matchRoutes);

// Rutas de rankings
// GET /api/rankings?gameId= → ranking por juego
// GET /api/rankings/global  → leaderboard global
app.use("/api/rankings", rankingRoutes);

// MANEJO DE ERRORES GLOBAL
// Siempre al final, después de todas las rutas
// Express lo reconoce por tener 4 parámetros
app.use(errorHandler);

// =====================================================
// INICIAR SERVIDOR
// =====================================================
//
// 0.0.0.0 permite que el backend acepte conexiones
// desde otros dispositivos en la misma red local.
//
// Ejemplo:
// http://192.168.1.45:3000/api/games
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`)
})
