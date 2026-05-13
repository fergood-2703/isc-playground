import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarClock, Gamepad2, Radio, Shield, Trophy, Users } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { getMetricLabel } from "../../../utils/rankingEngine";
import "./DashboardHome.css";

export default function DashboardHome() {
  const { gameConfigs, teams, players, matches, rankingsByGame, globalLeaderboard } = useApp();
  const liveMatches = matches.filter((match) => match.status === "En vivo");
  const nextMatches = matches.slice(0, 4);
  const chartData = gameConfigs.map((game) => ({
    name: game.shortName,
    partidas: matches.filter((match) => match.gameId === game.id).length,
    equipos: teams.filter((team) => team.gameIds.includes(game.id)).length,
  }));

  const topGame = gameConfigs[0];
  const topRanking = rankingsByGame[topGame.id]?.[0];

  return (
    <div className="admin-page dashboard-home">
      <div className="page-head">
        <div>
          <span className="eyebrow">Centro de mando</span>
          <h2>Gestión real del torneo</h2>
          <p>
            Administra juegos oficiales, equipos, partidas, resultados y rankings calculados con reglas independientes por juego.
          </p>
        </div>
        <div className="control-badge">
          <Radio size={18} /> {liveMatches.length} partidas en vivo
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Users />
          <span>Jugadores</span>
          <strong>{players.length}</strong>
        </div>
        <div className="stat-card">
          <Shield />
          <span>Equipos</span>
          <strong>{teams.length}</strong>
        </div>
        <div className="stat-card">
          <Gamepad2 />
          <span>Juegos oficiales</span>
          <strong>{gameConfigs.length}</strong>
        </div>
        <div className="stat-card highlight">
          <Trophy />
          <span>Líder global</span>
          <strong>{globalLeaderboard[0]?.team.name ?? "Pendiente"}</strong>
        </div>
      </div>

      <div className="grid-2">
        <section className="panel-card arena-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Partidas por juego</span>
              <h3>Actividad del evento</h3>
            </div>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,.2)", borderRadius: 12 }} />
                <Bar dataKey="partidas" fill="#06b6d4" radius={[10, 10, 0, 0]} />
                <Bar dataKey="equipos" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel-card live-panel">
          <div className="section-title">
            <div>
              <span className="eyebrow">Acceso rápido</span>
              <h3>Operaciones admin</h3>
            </div>
          </div>
          <div className="quick-actions">
            <a className="primary-btn" href="/admin/juegos">Crear partida</a>
            <a className="ghost-btn" href="/admin/equipos">Asignar equipos</a>
            <a className="ghost-btn" href="/admin/ranking">Ver rankings</a>
          </div>

          <div className="top-snapshot">
            <CalendarClock />
            <div>
              <span>Regla activa destacada</span>
              <strong>{topGame.name}: {getMetricLabel(topGame, topGame.scoringRules[0].key)}</strong>
              <small>Actual líder: {topRanking?.team.name ?? "sin datos"}</small>
            </div>
          </div>
        </section>
      </div>

      <section className="panel-card">
        <div className="section-title">
          <div>
            <span className="eyebrow">Timeline</span>
            <h3>Partidas recientes y próximas</h3>
          </div>
        </div>
        <div className="match-feed">
          {nextMatches.map((match) => {
            const game = gameConfigs.find((item) => item.id === match.gameId);
            return (
              <article className="feed-item" key={match.id} style={{ borderColor: `${game?.accent}55` }}>
                <img src={game?.image} alt={game?.name} />
                <div>
                  <strong>{game?.name}</strong>
                  <span>{match.stage} · {match.map}</span>
                </div>
                <span className={`pill ${match.status === "En vivo" ? "live" : match.status === "Finalizada" ? "done" : ""}`}>{match.status}</span>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
