// =============================
// REPOSITORIO DE INSCRIPCIONES
// =============================

import prisma from "../config/db.js";

// ─────────────────────────────
// OBTENER INSCRIPCIONES
// ─────────────────────────────
// Filtra por gameId o userId según lo que llegue
// userId puede llegar como "u-6" o como "6" — normalizamos aquí
const findAll = async ({ gameId, userId }) => {
  // Extraemos el número de "u-6" → 6, o parseamos directo si ya es número
  let numericUserId = null;
  if (userId) {
    const cleaned = String(userId).replace(/^u-/, "");
    const parsed = parseInt(cleaned);
    if (!isNaN(parsed)) numericUserId = parsed;
  }

  return await prisma.registration.findMany({
    where: {
      ...(gameId && { gameId }),
      ...(numericUserId !== null && { userId: numericUserId }),
    },
  });
};

// ─────────────────────────────
// BUSCAR INSCRIPCIÓN POR ID
// ─────────────────────────────
const findById = async (id) => {
  return await prisma.registration.findUnique({
    where: { id },
  });
};

// ─────────────────────────────
// BUSCAR INSCRIPCIÓN POR USUARIO Y JUEGO
// ─────────────────────────────
const findByUserAndGame = async (userId, gameId) => {
  return await prisma.registration.findUnique({
    where: {
      userId_gameId: { userId, gameId },
    },
  });
};

// ─────────────────────────────
// BUSCAR INSCRIPCIÓN ACTIVA POR USUARIO
// ─────────────────────────────
//
// Regla del torneo:
// Un usuario solo puede estar inscrito en UN juego.
//
// Si existe cualquier inscripción para el usuario,
// entonces no debe poder inscribirse a otro juego hasta cancelar la anterior.
const findByUser = async (userId) => {
  return await prisma.registration.findFirst({
    where: {
      userId,
    },
    orderBy: {
      registeredAt: "desc",
    },
  });
};

// ─────────────────────────────
// BUSCAR PARTIDA ACTIVA DEL USUARIO
// ─────────────────────────────
//
// Se usa antes de cancelar una inscripción.
//
// Regla corregida:
// Solo bloqueamos la cancelación si el jugador está en una partida
// realmente activa:
//
// - En preparación
// - En curso
//
// NO bloqueamos si la partida está:
// - Pendiente
// - Finalizada
// - Cancelada
//
// Esto es importante porque durante pruebas o después de una partida
// finalizada, el usuario debe poder cancelar su inscripción si necesita
// cambiar de juego.
const findActiveMatch = async (userId, gameId) => {
  return await prisma.match.findFirst({
    where: {
      gameId,
      status: {
        in: ["En preparación", "En curso"],
      },
      playerResults: {
        some: {
          playerId: userId,
        },
      },
    },
  });
};

// ─────────────────────────────
// CREAR INSCRIPCIÓN
// ─────────────────────────────
const create = async ({ userId, gameId }) => {
  return await prisma.registration.create({
    data: {
      userId,
      gameId,
      status: "inscrito",
    },
  });
};

// ─────────────────────────────
// ELIMINAR INSCRIPCIÓN
// ─────────────────────────────
const remove = async (id) => {
  return await prisma.registration.delete({
    where: { id },
  });
};

export {
  findAll,
  findById,
  findByUserAndGame,
  findByUser,
  findActiveMatch,
  create,
  remove,
};
