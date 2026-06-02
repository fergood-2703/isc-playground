// =============================
// SERVICIO DE INSCRIPCIONES
// =============================
//
// Este archivo contiene la lógica de negocio para:
// - Obtener inscripciones
// - Crear inscripciones
// - Cancelar inscripciones
//
// IMPORTANTE:
// Antes el backend devolvía IDs inventados como:
// reg-u-12-counter-strike-16
//
// Pero Prisma realmente guarda IDs tipo cuid(), por ejemplo:
// cm9x7abc123...
//
// Para poder eliminar correctamente, el frontend necesita recibir
// el ID real de la inscripción.

import * as registrationRepository from "../repositories/registration.repository.js";
import * as gameRepository from "../repositories/game.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { extractNumericId } from "../utils/helpers.js";

// ─────────────────────────────
// OBTENER INSCRIPCIONES
// ─────────────────────────────
//
// GET /api/registrations
// GET /api/registrations?gameId=bomb-squad
// GET /api/registrations?userId=u-12
const getAll = async ({ gameId, userId }) => {
  const registrations = await registrationRepository.findAll({
    gameId,
    userId,
  });

  return registrations.map(formatRegistration);
};

// ─────────────────────────────
// CREAR INSCRIPCIÓN
// ─────────────────────────────
//
// Regla oficial:
// Un usuario solo puede inscribirse a UN juego.
//
// Ejemplo:
// - Si ya está inscrito en Counter Strike,
//   no puede inscribirse a Bomb Squad.
// - Primero debe cancelar su inscripción anterior.
const create = async ({ userId, gameId }) => {
  // Convertimos "u-12" a 12.
  // Si llega 12 directamente, también funciona.
  const numericUserId = extractNumericId(userId);

  // Verificamos que el usuario exista.
  const user = await userRepository.findById(numericUserId);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Verificamos que el juego exista.
  const game = await gameRepository.findById(gameId);

  if (!game) {
    throw new Error("Juego no encontrado");
  }

  // Verificamos si el usuario ya tiene cualquier inscripción.
  const existingUserRegistration =
    await registrationRepository.findByUser(numericUserId);

  if (existingUserRegistration) {
    if (existingUserRegistration.gameId === gameId) {
      throw new Error("Ya estás inscrito en este juego");
    }

    throw new Error(
      "Solo puedes inscribirte a un juego. Cancela tu inscripción actual antes de elegir otro juego.",
    );
  }

  // Creamos la inscripción real en base de datos.
  const registration = await registrationRepository.create({
    userId: numericUserId,
    gameId,
  });

  return formatRegistration(registration);
};

// ─────────────────────────────
// CANCELAR INSCRIPCIÓN
// ─────────────────────────────
//
// DELETE /api/registrations/:id
//
// Ahora aceptamos dos tipos de id:
//
// 1. ID real de Prisma:
//    cm9x7abc123...
//
// 2. ID viejo/inventado por compatibilidad:
//    reg-u-12-counter-strike-16
//
// Esto evita que falle si el frontend todavía tiene en memoria
// una inscripción vieja antes de refrescar.
const remove = async (id) => {
  let registration = await registrationRepository.findById(id);

  // Compatibilidad con IDs viejos tipo:
  // reg-u-12-counter-strike-16
  //
  // Si no encontramos la inscripción por ID real,
  // intentamos interpretar ese ID viejo para buscar por:
  // userId + gameId
  if (!registration) {
    const parsedLegacyId = parseLegacyRegistrationId(id);

    if (parsedLegacyId) {
      registration = await registrationRepository.findByUserAndGame(
        parsedLegacyId.userId,
        parsedLegacyId.gameId,
      );
    }
  }

  // Si después de ambos intentos no existe, devolvemos error.
  if (!registration) {
    throw new Error("Inscripción no encontrada");
  }

  // Verificamos que el usuario no tenga una partida activa.
  //
  // Una partida activa es cualquiera que NO sea:
  // - Pendiente
  // - Cancelada
  const activeMatch = await registrationRepository.findActiveMatch(
    registration.userId,
    registration.gameId,
  );

  if (activeMatch) {
    throw new Error(
      "No puedes cancelar tu inscripción mientras tienes una partida activa",
    );
  }

  // IMPORTANTE:
  // Eliminamos usando registration.id, no usando el id recibido.
  //
  // Esto permite que funcione tanto si llegó un ID real como
  // si llegó un ID viejo tipo reg-u-12-bomb-squad.
  await registrationRepository.remove(registration.id);
};

// ─────────────────────────────
// HELPER: PARSEAR ID VIEJO
// ─────────────────────────────
//
// Convierte esto:
// reg-u-12-counter-strike-16
//
// En esto:
// {
//   userId: 12,
//   gameId: "counter-strike-16"
// }
const parseLegacyRegistrationId = (id) => {
  const match = String(id).match(/^reg-u-(\d+)-(.+)$/);

  if (!match) {
    return null;
  }

  return {
    userId: Number(match[1]),
    gameId: match[2],
  };
};

// ─────────────────────────────
// HELPER: FORMATEAR INSCRIPCIÓN
// ─────────────────────────────
//
// Esta función transforma la inscripción real de Prisma
// al formato que el frontend usa.
//
// Cambio importante:
// - id ahora es registration.id real de Prisma.
// - legacyId queda solo como referencia visual/compatibilidad.
const formatRegistration = (registration) => {
  return {
    // ID REAL de la base de datos.
    // Este es el que debe usarse para DELETE.
    id: registration.id,

    // ID viejo/inventado.
    // Lo dejamos por si en algún lugar quieres mostrarlo o depurar.
    legacyId: `reg-u-${registration.userId}-${registration.gameId}`,

    // El frontend maneja usuarios como "u-12".
    userId: `u-${registration.userId}`,

    // ID del juego.
    gameId: registration.gameId,

    // Estado de la inscripción.
    status: registration.status,

    // Fecha formateada para mostrar en frontend.
    registeredAt: registration.registeredAt
      .toISOString()
      .replace("T", " ")
      .substring(0, 16),
  };
};

export { getAll, create, remove };
