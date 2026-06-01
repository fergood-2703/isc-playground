// =====================================================
// DASHBOARD > CONTROL
// =====================================================
//
// Esta vista muestra el resumen general del torneo.
//
// Corrección importante:
// Antes se asumía que siempre existía gameConfigs[0].
// Si el backend tardaba, fallaba o respondía 429,
// gameConfigs podía venir vacío y el dashboard tronaba.
//
// Ahora protegemos todos los accesos para que la pantalla
// no se rompa aunque todavía no haya datos.

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CalendarClock,
  Gamepad2,
  Radio,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { getMetricLabel } from "../../../utils/rankingEngine";
import "./DashboardHome.css";

export default function DashboardHome() {
  const {
    // Datos cargados desde AppContext.
    gameConfigs,
    teams,
    players,
    matches,
    rankingsByGame,
    globalLeaderboard,
    loading,
  } = useApp();

  // =====================================================
  // ESTADOS DERIVADOS
  // =====================================================

  // Partidas en vivo.
  const liveMatches = matches.filter((match) => match.status === "En curso");

  // Últimas o próximas partidas.
  const nextMatches = matches.slice(0, 4);

  // Datos para la gráfica.
  const chartData = gameConfigs.map((game) => ({
    name: game.shortName,
    partidas: matches.filter((match) => match.gameId === game.id).length,
    equipos: teams.filter((team) => team.gameId === game.id).length,
  }));

  // Juego destacado.
  // Puede ser undefined si todavía no cargaron los juegos.
  const topGame = gameConfigs[0] ?? null;

  // Ranking del juego destacado.
  // Solo lo buscamos si topGame existe.
  const topRanking = topGame ? rankingsByGame[topGame.id]?.[0] : null;

  // Líder global.
  const globalLeader = globalLeaderboard[0] ?? null;

  // Regla destacada.
  // Algunos juegos pueden no tener scoringRules todavía,
  // por eso también se protege con optional chaining.
  const topRule = topGame?.scoringRules?.[0] ?? null;

  // =====================================================
  // LOADING
  // =====================================================
  //
  // Esto no es obligatorio, pero ayuda a evitar que el dashboard
  // parezca vacío mientras carga el backend.
  if (loading) {
    return (
      <div className="admin-page dashboard-home">
        <div className="page-head">
          <div>
            <span className="eyebrow">Centro de mando</span>
            <h2>Cargando datos del torneo...</h2>
            <p>
              Espera un momento mientras se consultan juegos, usuarios,
              partidas, equipos y rankings desde el backend.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page dashboard-home">
      <div className="page-head">
        <div>
          <span className="eyebrow">Centro de mando</span>
          <h2>Gestión real del torneo</h2>
          <p>
            Administra juegos oficiales, partidas, equipos temporales y rankings
            individuales calculados con reglas independientes por juego.
          </p>
        </div>

        <div className="control-badge">
          <Radio size={18} />
          {liveMatches.length} partidas en vivo
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
          <span>Equipos temporales</span>
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
          <strong>
            {globalLeader?.player?.username
              ? `@${globalLeader.player.username}`
              : "Pendiente"}
          </strong>
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
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid rgba(148,163,184,.2)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar
                    dataKey="partidas"
                    fill="#06b6d4"
                    radius={[10, 10, 0, 0]}
                  />
                  <Bar
                    dataKey="equipos"
                    fill="#8b5cf6"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>Todavía no hay datos suficientes para mostrar la gráfica.</p>
            )}
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
            {/* 
              Corregido:
              Crear partida debe mandar a /admin/partidas,
              no a /admin/juegos.
            */}
            <Link className="primary-btn" to="/admin/partidas">
              Crear partida
            </Link>

            <Link className="ghost-btn" to="/admin/equipos">
              Asignar equipos
            </Link>

            <Link className="ghost-btn" to="/admin/ranking">
              Ver rankings
            </Link>
          </div>

          <div className="top-snapshot">
            <CalendarClock />

            <div>
              <span>Regla activa destacada</span>

              <strong>
                {topGame && topRule
                  ? `${topGame.name}: ${getMetricLabel(topGame, topRule.key)}`
                  : "Sin regla destacada"}
              </strong>

              <small>
                Actual líder:{" "}
                {topRanking?.player?.username
                  ? `@${topRanking.player.username}`
                  : "sin datos"}
              </small>
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
          {nextMatches.length === 0 && (
            <p>Todavía no hay partidas registradas.</p>
          )}

          {nextMatches.map((match) => {
            const game = gameConfigs.find((item) => item.id === match.gameId);

            return (
              <article
                className="feed-item"
                key={match.id}
                style={{
                  borderColor: `${game?.accent ?? "#06b6d4"}55`,
                }}
              >
                {game?.image && <img src={game.image} alt={game.name} />}

                <div>
                  <strong>{game?.name ?? "Juego no encontrado"}</strong>
                  <span>
                    {match.stage} · {match.map}
                  </span>
                </div>

                <span
                  className={`pill ${
                    match.status === "En curso"
                      ? "live"
                      : match.status === "Finalizada"
                        ? "done"
                        : ""
                  }`}
                >
                  {match.status}
                </span>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
