// =============================
// SERVICIO DE RANKINGS
// =============================
//
// Este servicio calcula:
//
// 1. Ranking por juego:
//    GET /api/rankings?gameId=
//
// 2. Ranking global:
//    GET /api/rankings/global
//
// Importante:
// - Solo cuentan partidas con status "Finalizada".
// - El ranking es individual por usuario.
// - Los equipos solo sirven para organizar partidas.
// - Los puntos vienen de PlayerResult.points.
// - Las estadísticas vienen de PlayerResult.stats.

import * as rankingRepository from '../repositories/ranking.repository.js'
import * as gameRepository from '../repositories/game.repository.js'

// ─────────────────────────────
// RANKING POR JUEGO
// ─────────────────────────────
//
// Calcula ranking individual para un juego específico.
//
// Acumula por jugador:
// - matchesPlayed
// - totalPoints
// - wins
// - totals: métricas acumuladas desde stats
// - history: partidas donde participó
const getGameRanking = async (gameId) => {
  // Buscamos el juego para saber sus reglas de ordenamiento.
  const game = await gameRepository.findById(gameId)

  if (!game) {
    throw new Error('Juego no encontrado')
  }

  // Solo traemos partidas Finalizadas.
  const matches = await rankingRepository.findFinalizedMatches(gameId)

  // Mapa temporal:
  // {
  //   "u-12": {
  //      player: {...},
  //      matchesPlayed: 0,
  //      totalPoints: 0,
  //      wins: 0,
  //      totals: {},
  //      history: []
  //   }
  // }
  const playerMap = {}

  for (const match of matches) {
    for (const result of match.playerResults) {
      const frontendPlayerId = `u-${result.playerId}`

      // Si es la primera vez que vemos a este jugador,
      // creamos su registro inicial.
      if (!playerMap[frontendPlayerId]) {
        playerMap[frontendPlayerId] = {
          player: {
            id: frontendPlayerId,
            username: result.player?.username || '',
            name: result.player?.name || ''
          },
          matchesPlayed: 0,
          totalPoints: 0,
          wins: 0,
          totals: {},
          history: []
        }
      }

      const entry = playerMap[frontendPlayerId]

      // Acumulamos resultados base.
      entry.matchesPlayed += 1
      entry.totalPoints += Number(result.points || 0)

      if (result.won) {
        entry.wins += 1
      }

      // Acumulamos métricas dinámicas.
      //
      // Ejemplo de stats:
      // {
      //   kills: 10,
      //   deaths: 2,
      //   points: 100
      // }
      const stats = result.stats || {}

      for (const [key, value] of Object.entries(stats)) {
        entry.totals[key] =
          Number(entry.totals[key] || 0) + Number(value || 0)
      }

      // Historial simple para mostrar cuántos registros tiene.
      entry.history.push({
        matchId: match.id,
        stage: match.stage,
        phaseType: match.phaseType,
        map: match.map,
        status: match.status
      })
    }
  }

  let ranking = Object.values(playerMap)

  // Orden oficial:
  // 1. Mayor totalPoints.
  // 2. Luego reglas específicas del juego.
  // 3. Más victorias.
  // 4. Username alfabético.
  ranking.sort((a, b) => {
    // 1. Puntos manuales primero.
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints
    }

    // 2. Reglas configuradas por juego.
    for (const rule of game.scoringRules || []) {
      const aVal = Number(a.totals[rule.key] || 0)
      const bVal = Number(b.totals[rule.key] || 0)

      if (aVal !== bVal) {
        return rule.direction === 'asc'
          ? aVal - bVal
          : bVal - aVal
      }
    }

    // 3. Desempate por victorias.
    if (b.wins !== a.wins) {
      return b.wins - a.wins
    }

    // 4. Desempate final por username.
    return String(a.player.username).localeCompare(
      String(b.player.username)
    )
  })

  // Agregamos rank.
  return ranking.map((entry, index) => ({
    rank: index + 1,
    player: entry.player,
    matchesPlayed: entry.matchesPlayed,
    totalPoints: entry.totalPoints,
    wins: entry.wins,
    totals: entry.totals,
    history: entry.history
  }))
}

// ─────────────────────────────
// RANKING GLOBAL
// ─────────────────────────────
//
// Une los rankings de todos los juegos.
//
// Fórmula simple:
// performance = totalPoints + wins*25 + matchesPlayed*5
// score = totalPoints + rankBonus + performance
//
// rankBonus:
// #1 = 100
// #2 = 88
// #3 = 76
// etc.
const getGlobalRanking = async () => {
  const games = await gameRepository.findAll()

  const playerMap = {}

  for (const game of games) {
    const gameRanking = await getGameRanking(game.id)

    for (const entry of gameRanking) {
      // CORRECCIÓN IMPORTANTE:
      // Antes se usaba entry.playerId, pero no existe.
      // El jugador viene dentro de entry.player.id.
      const playerId = entry.player.id

      if (!playerMap[playerId]) {
        playerMap[playerId] = {
          player: {
            id: entry.player.id,
            username: entry.player.username,
            name: entry.player.name
          },
          matchesPlayed: 0,
          wins: 0,
          totalPoints: 0,

          // Métricas globales conocidas.
          // Si un juego no usa alguna, queda en 0.
          kills: 0,
          damage: 0,
          bossesDefeated: 0,

          // totals guarda todas las métricas acumuladas,
          // incluso las que no conocemos de antemano.
          totals: {}
        }
      }

      const player = playerMap[playerId]

      player.matchesPlayed += entry.matchesPlayed
      player.wins += entry.wins
      player.totalPoints += entry.totalPoints

      // Acumulamos todas las métricas dinámicas.
      for (const [key, value] of Object.entries(entry.totals || {})) {
        player.totals[key] =
          Number(player.totals[key] || 0) + Number(value || 0)
      }

      // Métricas globales comunes para tarjetas públicas.
      player.kills += Number(entry.totals?.kills || 0)
      player.damage += Number(entry.totals?.totalDamage || 0)
      player.bossesDefeated += Number(entry.totals?.bossesDefeated || 0)
    }
  }

  let ranking = Object.values(playerMap)

  // Si no hay partidas finalizadas, regresamos vacío.
  if (ranking.length === 0) {
    return []
  }

  // Primer cálculo sin bonus de rank.
  ranking = ranking.map((player) => {
    const performance =
      player.totalPoints +
      player.wins * 25 +
      player.matchesPlayed * 5

    return {
      ...player,
      performance,
      score: player.totalPoints + performance
    }
  })

  // Orden inicial para asignar bonus de rank.
  ranking.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.wins !== a.wins) return b.wins - a.wins

    return String(a.player.username).localeCompare(
      String(b.player.username)
    )
  })

  // Aplicamos bonus por posición.
  ranking = ranking.map((player, index) => {
    const rank = index + 1
    const rankBonus = Math.max(0, 100 - (rank - 1) * 12)

    return {
      ...player,
      rankBonus,
      score: player.totalPoints + player.performance + rankBonus
    }
  })

  // Orden final.
  ranking.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.wins !== a.wins) return b.wins - a.wins

    return String(a.player.username).localeCompare(
      String(b.player.username)
    )
  })

  // Reasignamos rank final.
  return ranking.map((entry, index) => ({
    rank: index + 1,
    player: entry.player,
    score: entry.score,
    rankBonus: entry.rankBonus,
    performance: entry.performance,
    matchesPlayed: entry.matchesPlayed,
    wins: entry.wins,
    totalPoints: entry.totalPoints,
    kills: entry.kills,
    damage: entry.damage,
    bossesDefeated: entry.bossesDefeated,
    totals: entry.totals
  }))
}

export {
  getGameRanking,
  getGlobalRanking
}