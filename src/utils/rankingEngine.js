export function createEmptyStats(gameConfig) {
  return Object.fromEntries(
    gameConfig.metrics.map((metric) => [metric.key, metric.defaultValue ?? 0])
  );
}

export function getMetricLabel(gameConfig, key) {
  return gameConfig.metrics.find((metric) => metric.key === key)?.label ?? key;
}

function compareByRule(a, b, rule) {
  const left = Number(a.totals[rule.key] ?? 0);
  const right = Number(b.totals[rule.key] ?? 0);

  if (left === right) return 0;
  return rule.direction === "asc" ? left - right : right - left;
}

export function calculateGameRanking({ gameConfig, teams, matches }) {
  const teamRows = teams
    .filter((team) => team.gameIds.includes(gameConfig.id))
    .map((team) => ({
      team,
      totals: createEmptyStats(gameConfig),
      matchesPlayed: 0,
      history: [],
    }));

  const rowByTeamId = new Map(teamRows.map((row) => [row.team.id, row]));

  matches
    .filter((match) => match.gameId === gameConfig.id)
    .forEach((match) => {
      match.teamResults.forEach((result) => {
        const row = rowByTeamId.get(result.teamId);
        if (!row) return;

        row.matchesPlayed += 1;
        row.history.push(match.id);
        gameConfig.metrics.forEach((metric) => {
          row.totals[metric.key] = Number(row.totals[metric.key] ?? 0) + Number(result.stats[metric.key] ?? 0);
        });
      });
    });

  return teamRows
    .sort((a, b) => {
      for (const rule of gameConfig.scoringRules) {
        const result = compareByRule(a, b, rule);
        if (result !== 0) return result;
      }
      return a.team.name.localeCompare(b.team.name);
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function calculateAllRankings({ gameConfigs, teams, matches }) {
  return Object.fromEntries(
    gameConfigs.map((gameConfig) => [
      gameConfig.id,
      calculateGameRanking({ gameConfig, teams, matches }),
    ])
  );
}

export function getMatchLeader(match, gameConfig) {
  const rows = match.teamResults.map((result) => ({
    teamId: result.teamId,
    totals: result.stats,
  }));

  return [...rows].sort((a, b) => {
    for (const rule of gameConfig.scoringRules) {
      const result = compareByRule(a, b, rule);
      if (result !== 0) return result;
    }
    return 0;
  })[0];
}

export function calculateGlobalLeaderboard({ rankingsByGame }) {
  const rowsByTeam = new Map();

  Object.values(rankingsByGame).forEach((ranking) => {
    ranking.forEach((row) => {
      const current = rowsByTeam.get(row.team.id) ?? {
        team: row.team,
        score: 0,
        podiums: 0,
        games: 0,
      };

      current.games += 1;
      current.score += Math.max(0, 100 - (row.rank - 1) * 15) + row.matchesPlayed * 5;
      if (row.rank <= 3) current.podiums += 1;
      rowsByTeam.set(row.team.id, current);
    });
  });

  return [...rowsByTeam.values()].sort((a, b) => b.score - a.score || b.podiums - a.podiums);
}
