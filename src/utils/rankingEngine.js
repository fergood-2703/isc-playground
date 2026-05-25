export function createEmptyStats(gameConfig) {
  return Object.fromEntries(
    gameConfig.metrics.map((metric) => [metric.key, metric.defaultValue ?? 0])
  );
}

export function getMetricLabel(gameConfig, key) {
  return gameConfig.metrics.find((metric) => metric.key === key)?.label ?? key;
}

export function getMatchResults(match) {
  if (match.playerResults?.length) return match.playerResults;

  return match.teamResults.flatMap((teamResult) =>
    teamResult.playerIds.map((playerId) => ({
      playerId,
      teamId: teamResult.teamId,
      stats: teamResult.stats,
      points: 0,
      won: false,
    }))
  );
}

function compareByRule(a, b, rule) {
  const left = Number(a.totals[rule.key] ?? 0);
  const right = Number(b.totals[rule.key] ?? 0);

  if (left === right) return 0;
  return rule.direction === "asc" ? left - right : right - left;
}

export function calculateGameRanking({ gameConfig, players, matches }) {
  const rows = players
    .filter((player) => player.games.includes(gameConfig.id))
    .map((player) => ({
      player,
      totals: createEmptyStats(gameConfig),
      totalPoints: 0,
      matchesPlayed: 0,
      wins: 0,
      history: [],
      performance: 0,
    }));

  const rowByPlayerId = new Map(rows.map((row) => [row.player.id, row]));

  matches
    .filter((match) => match.gameId === gameConfig.id && match.status === "Finalizada")
    .forEach((match) => {
      getMatchResults(match).forEach((result) => {
        const row = rowByPlayerId.get(result.playerId);
        if (!row) return;

        row.matchesPlayed += 1;
        row.totalPoints += Number(result.points ?? 0);
        if (result.won) row.wins += 1;
        row.history.push({ matchId: match.id, stage: match.stage, phaseType: match.phaseType });

        gameConfig.metrics.forEach((metric) => {
          row.totals[metric.key] = Number(row.totals[metric.key] ?? 0) + Number(result.stats?.[metric.key] ?? 0);
        });
      });
    });

  return rows
    .map((row) => ({
      ...row,
      performance: Math.round(row.totalPoints + row.wins * 25 + row.matchesPlayed * 5),
    }))
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      for (const rule of gameConfig.scoringRules) {
        const result = compareByRule(a, b, rule);
        if (result !== 0) return result;
      }
      return a.player.username.localeCompare(b.player.username);
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function calculateAllRankings({ gameConfigs, players, matches }) {
  return Object.fromEntries(
    gameConfigs.map((gameConfig) => [
      gameConfig.id,
      calculateGameRanking({ gameConfig, players, matches }),
    ])
  );
}

export function getMatchLeader(match, gameConfig) {
  const rows = getMatchResults(match).map((result) => ({
    playerId: result.playerId,
    teamId: result.teamId,
    totals: result.stats ?? {},
    points: Number(result.points ?? 0),
  }));

  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    for (const rule of gameConfig.scoringRules) {
      const result = compareByRule(a, b, rule);
      if (result !== 0) return result;
    }
    return 0;
  })[0];
}

export function calculateGlobalLeaderboard({ rankingsByGame }) {
  const rowsByPlayer = new Map();

  Object.values(rankingsByGame).forEach((ranking) => {
    ranking.forEach((row) => {
      const current = rowsByPlayer.get(row.player.id) ?? {
        player: row.player,
        score: 0,
        podiums: 0,
        games: 0,
        matchesPlayed: 0,
        wins: 0,
        kills: 0,
        damage: 0,
        bossesDefeated: 0,
        history: [],
      };

      current.games += 1;
      current.score += row.totalPoints + Math.max(0, 100 - (row.rank - 1) * 12) + row.performance;
      current.matchesPlayed += row.matchesPlayed;
      current.wins += row.wins;
      current.kills += Number(row.totals.kills ?? 0);
      current.damage += Number(row.totals.totalDamage ?? 0);
      current.bossesDefeated += Number(row.totals.bossesDefeated ?? 0);
      current.history.push(...row.history);
      if (row.rank <= 3) current.podiums += 1;
      rowsByPlayer.set(row.player.id, current);
    });
  });

  return [...rowsByPlayer.values()].sort((a, b) => b.score - a.score || b.wins - a.wins);
}
