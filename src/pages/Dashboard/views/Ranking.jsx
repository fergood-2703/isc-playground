import { useState } from "react";
import { Medal, Trophy } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { getMetricLabel } from "../../../utils/rankingEngine";
import "./Ranking.css";

export default function Ranking() {
  const { gameConfigs, rankingsByGame, globalLeaderboard } = useApp();
  const [selectedGameId, setSelectedGameId] = useState(gameConfigs[0].id);
  const selectedGame = gameConfigs.find((game) => game.id === selectedGameId);
  const ranking = rankingsByGame[selectedGameId] ?? [];

  return (
    <div className="admin-page ranking-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Ranking engine</span>
          <h2>Clasificaciones automáticas</h2>
          <p>Los desempates respetan las reglas oficiales: Bomb Squad por victorias/kills/muertes, CS por rondas/kills y Soul Knight por bosses/tiempo/damage.</p>
        </div>
      </div>

      <div className="podium-grid">
        {globalLeaderboard.slice(0, 3).map((row, index) => (
          <article className={`podium-card rank-${index + 1}`} key={row.team.id}>
            <Medal />
            <span>#{index + 1}</span>
            <h3>{row.team.name}</h3>
            <strong>{row.score} pts</strong>
            <small>{row.games} juegos · {row.podiums} podios</small>
          </article>
        ))}
      </div>

      <div className="ranking-tabs">
        {gameConfigs.map((game) => (
          <button
            key={game.id}
            className={selectedGameId === game.id ? "active" : ""}
            onClick={() => setSelectedGameId(game.id)}
            style={{ "--accent": game.accent }}
          >
            {game.shortName}
          </button>
        ))}
      </div>

      <section className="panel-card ranking-board" style={{ "--accent": selectedGame.accent }}>
        <div className="section-title">
          <div>
            <span className="eyebrow">{selectedGame.name}</span>
            <h3>Tabla por reglas oficiales</h3>
          </div>
          <Trophy />
        </div>

        <div className="rule-strip">
          {selectedGame.scoringRules.map((rule, index) => (
            <span key={rule.key}>{index + 1}. {rule.label}</span>
          ))}
        </div>

        <table className="modern-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Equipo</th>
              <th>Partidas</th>
              {selectedGame.scoringRules.map((rule) => <th key={rule.key}>{getMetricLabel(selectedGame, rule.key)}</th>)}
              <th>Historial</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((row) => (
              <tr key={row.team.id}>
                <td><span className="rank-chip">#{row.rank}</span></td>
                <td><strong>{row.team.name}</strong><small>{row.team.tag}</small></td>
                <td>{row.matchesPlayed}</td>
                {selectedGame.scoringRules.map((rule) => <td key={rule.key}>{row.totals[rule.key] ?? 0}</td>)}
                <td>{row.history.length} registros</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
