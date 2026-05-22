// =============================
// REPOSITORIO DE RANKINGS
// =============================

// Es la única capa que habla directamente con la base de datos.
// Solo obtiene las partidas finalizadas con sus resultados.

import prisma from '../config/db.js'

// ─────────────────────────────
// OBTENER PARTIDAS FINALIZADAS
// ─────────────────────────────
// Según el reporte: el rankingEngine solo procesa
// partidas con status === "Finalizada"
const findFinalizedMatches = async (gameId) => {
  return await prisma.match.findMany({
    where: {
      gameId,
      status: 'Finalizada'
    },
    include: {
      // Incluimos los resultados de cada jugador
      // con los datos del jugador para mostrar username y name
      playerResults: {
        include: {
          player: {
            select: {
              id: true,
              username: true,
              name: true
            }
          }
        }
      }
    }
  })
}

export { findFinalizedMatches }