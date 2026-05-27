// =============================
// SERVICIO DE RANKINGS
// =============================

// Replica exactamente la lógica de rankingEngine.js del frontend.
// Lee las partidas finalizadas y calcula los rankings.

import * as rankingRepository from '../repositories/ranking.repository.js'
import * as gameRepository from '../repositories/game.repository.js'

// ─────────────────────────────
// RANKING POR JUEGO
// ─────────────────────────────
// Según el reporte:
// Solo cuenta partidas con status === "Finalizada"
// Para cada jugador acumula:
// - matchesPlayed: +1 por cada partida
// - totalPoints: suma de playerResult.points
// - wins: +1 por cada playerResult.won === true
// - totals: suma de cada key en playerResult.stats
// - history: array de { matchId, stage, phaseType }
const getGameRanking = async (gameId) => {

  // Obtenemos el juego para sus scoringRules
  const game = await gameRepository.findById(gameId)
  if (!game) {
    throw new Error('Juego no encontrado')
  }

  // Obtenemos solo las partidas finalizadas del juego
  const matches = await rankingRepository.findFinalizedMatches(gameId)

  // Mapa para acumular stats por jugador
  const playerMap = {}

  for (const match of matches) {
    for (const result of match.playerResults) {
      const playerId = `u-${result.playerId}`

        if (!playerMap[playerId]) {
          playerMap[playerId] = {
          // ✅ player anidado — estructura que espera el frontend
          player: {
            id: playerId,
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

      const player = playerMap[playerId]

      // Acumulamos stats según las reglas del reporte
      player.matchesPlayed += 1
      player.totalPoints += result.points
      if (result.won) player.wins += 1

      // Sumamos cada métrica del stats del jugador
      const stats = result.stats || {}
      for (const [key, value] of Object.entries(stats)) {
        player.totals[key] = (player.totals[key] || 0) + value
      }

      // Agregamos al historial
      player.history.push({
        matchId: match.id,
        stage: match.stage,
        phaseType: match.phaseType
      })
    }
  }

  // Convertimos el mapa a array
  let ranking = Object.values(playerMap)

  // Ordenamos según las reglas del reporte:
  // 1. Mayor totalPoints
  // 2. Luego por cada scoringRule del juego (respetando direction)
  // 3. Desempate final por username alfabético
  ranking.sort((a, b) => {
    // 1. Mayor totalPoints primero
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints
    }

    // 2. Aplicamos cada scoringRule en orden
    for (const rule of game.scoringRules) {
      const aVal = a.totals[rule.key] || 0
      const bVal = b.totals[rule.key] || 0

      if (aVal !== bVal) {
        // desc = mayor primero, asc = menor primero
        return rule.direction === 'desc' ? bVal - aVal : aVal - bVal
      }
    }

    // 3. Desempate por username alfabético
    return a.username.localeCompare(b.username)
  })

    // Agregamos el rank a cada jugador
    return ranking.map((entry, index) => ({
    rank: index + 1,
    player: entry.player,        // ✅ anidado
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
// Según el reporte:
// score = totalPoints + max(0, 100 - (rank-1)*12) + performance
// performance = totalPoints + wins*25 + matchesPlayed*5
const getGlobalRanking = async () => {

  // Obtenemos todos los juegos para sus scoringRules
  const games = await gameRepository.findAll()

  // Calculamos el ranking por juego para cada uno
  const playerMap = {}

  for (const game of games) {
    const gameRanking = await getGameRanking(game.id)

    for (const entry of gameRanking) {
      if (!playerMap[entry.playerId]) {
        playerMap[entry.playerId] = {
          player: {
            id: entry.playerId,
            username: entry.player.username,
            name: entry.player.name
          },
          matchesPlayed: 0,
          wins: 0,
          totalPoints: 0,
          kills: 0,
          damage: 0,
          bossesDefeated: 0
        }
      }

      const player = playerMap[entry.playerId]

      // Acumulamos a través de todos los juegos
      player.matchesPlayed += entry.matchesPlayed
      player.wins += entry.wins
      player.totalPoints += entry.totalPoints

      // Métricas específicas por juego según el reporte
      player.kills += entry.totals?.kills || 0
      player.damage += entry.totals?.totalDamage || 0
      player.bossesDefeated += entry.totals?.bossesDefeated || 0
    }
  }

  let ranking = Object.values(playerMap)

  // Primer paso: calculamos performance y score sin bonus de rank
  ranking = ranking.map(player => {
    const performance = player.totalPoints + player.wins * 25 + player.matchesPlayed * 5
    return { ...player, performance, score: player.totalPoints + performance }
  })

  // Ordenamos por score para asignar ranks
  ranking.sort((a, b) => b.score - a.score)

  // Segundo paso: agregamos el bonus de rank y recalculamos score final
  ranking = ranking.map((player, index) => {
    const rank = index + 1
    const rankBonus = Math.max(0, 100 - (rank - 1) * 12)
    const score = player.totalPoints + rankBonus + player.performance
    return { rank, ...player, score }
  })

  // Ordenamos por score final, desempate por wins
  ranking.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.wins - a.wins
  })

  // Reasignamos ranks después del orden final
  return ranking.map((entry, index) => ({
    rank: index + 1,
    player: entry.player,
    score: entry.score,
    matchesPlayed: entry.matchesPlayed,
    wins: entry.wins,
    totalPoints: entry.totalPoints,
    kills: entry.kills,
    damage: entry.damage,
    bossesDefeated: entry.bossesDefeated
  }))
}

export { getGameRanking, getGlobalRanking }