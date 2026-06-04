// =====================================================
// PÁGINA: HOME
// =====================================================
//
// Esta página ya no usa datos estáticos.
// Ahora toma datos desde AppContext, que a su vez carga desde backend:
//
// - gameConfigs        → GET /api/games
// - players            → GET /api/users
// - matches            → GET /api/matches?gameId=...
// - registrations      → GET /api/registrations?gameId=...
// - globalLeaderboard  → GET /api/rankings/global
// - rankingsByGame     → GET /api/rankings?gameId=...

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import StatsChart from "../../components/StatsChart/StatsChart";
import logo from "../../assets/images/playground-logo.png";
import { useApp } from "../../context/AppContext";

import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  const {
    // Usuario actual.
    currentUser,

    // Datos desde backend.
    gameConfigs,
    players,
    matches,
    registrations,
    rankingsByGame,
    globalLeaderboard,
    loading,

    // Funciones.
    registerToGame,
    getRegistration,
    getRegisteredPlayers,
  } = useApp();

  // =====================================================
  // ESTADÍSTICAS PRINCIPALES
  // =====================================================

  const activePlayers = players.filter(
    (player) => player.status === "Activo",
  ).length;

  const officialGames = gameConfigs.length;

  const totalMatches = matches.length;

  // =====================================================
  // GRÁFICA DE INSCRITOS POR JUEGO
  // =====================================================

  const playersData = gameConfigs.map((game) => ({
    name: game.shortName,
    value: getRegisteredPlayers(game.id).length,
  }));

  // =====================================================
  // PARTIDAS ACTIVAS / RECIENTES
  // =====================================================
  //
  // Reemplaza el array estático activeMatches.
  const activeMatches = useMemo(() => {
    const priority = {
      "En curso": 1,
      "En preparación": 2,
      Pendiente: 3,
      Finalizada: 4,
      Cancelada: 5,
    };

    return [...matches]
      .sort((a, b) => {
        const aPriority = priority[a.status] ?? 99;
        const bPriority = priority[b.status] ?? 99;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        return String(b.scheduledAt).localeCompare(String(a.scheduledAt));
      })
      .slice(0, 3)
      .map((match) => {
        const game = gameConfigs.find((item) => item.id === match.gameId);

        return {
          game: game?.shortName ?? "Juego",
          stage: match.stage,
          status: match.status === "En curso" ? "LIVE" : match.status,
          score: match.map || match.phaseType,
        };
      });
  }, [gameConfigs, matches]);

  // =====================================================
  // ACTIVIDAD DEL SISTEMA
  // =====================================================
  //
  // Reemplaza el array estático activity.
  // Se arma con inscripciones, partidas y ranking.
  const activity = useMemo(() => {
    const items = [];

    // Últimas inscripciones.
    registrations.slice(-3).forEach((registration) => {
      const game = gameConfigs.find((item) => item.id === registration.gameId);

      const player = players.find((item) => item.id === registration.userId);

      items.push({
        tag: game?.shortName ?? "Inscripción",
        text: `@${player?.username ?? "usuario"} se inscribió a ${
          game?.name ?? registration.gameId
        }`,
        time: registration.registeredAt ?? "reciente",
        tone: "cyan",
      });
    });

    // Últimas partidas.
    matches.slice(0, 3).forEach((match) => {
      const game = gameConfigs.find((item) => item.id === match.gameId);

      items.push({
        tag: game?.shortName ?? "Partida",
        text: `${match.stage} · ${match.status}`,
        time: match.scheduledAt ?? "programada",
        tone: match.status === "En curso" ? "green" : "purple",
      });
    });

    // Líder global.
    if (globalLeaderboard[0]) {
      items.push({
        tag: "Ranking",
        text: `@${globalLeaderboard[0].player?.username ?? "usuario"} lidera el ranking global`,
        time: `${Math.round(globalLeaderboard[0].score ?? 0)} pts`,
        tone: "gold",
      });
    }

    return items.slice(0, 4);
  }, [gameConfigs, globalLeaderboard, matches, players, registrations]);

  // =====================================================
  // TOP JUGADORES DESDE RANKING GLOBAL
  // =====================================================

  const topPlayers = globalLeaderboard.slice(0, 3).map((row, index) => ({
    name: row.player?.username ?? "sin_usuario",
    game: "Ranking global",
    points: Math.round(row.score ?? 0),
    trend: `${row.wins ?? 0} victorias`,
    rank: row.rank ?? index + 1,
  }));

  // =====================================================
  // MANEJAR INSCRIPCIÓN
  // =====================================================

  const handleRegistration = (event, gameId) => {
    event.stopPropagation();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!getRegistration(gameId)) {
      registerToGame(gameId);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="container home-shell">
        <section className="hero">
          <div className="hero-left">
            <span className="hero-kicker">ISC eSports OS · Campus arena</span>

            <h1>ISC Playground</h1>

            <p>
              Compite, registra partidas reales y escala rankings con una
              experiencia gamer premium.
            </p>

            <div className="hero-actions">
              <button
                className="btn-primary"
                onClick={() => navigate("/juegos")}
              >
                Entrar a la arena
              </button>

              <button
                className="btn-secondary"
                onClick={() => navigate("/ranking")}
              >
                Ver ranking global
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{loading ? "..." : activePlayers}</strong>
                <span>jugadores activos</span>
              </div>

              <div>
                <strong>{loading ? "..." : officialGames}</strong>
                <span>juegos oficiales</span>
              </div>

              <div>
                <strong>{loading ? "..." : totalMatches}</strong>
                <span>partidas registradas</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <img src={logo} alt="logo" />
          </div>
        </section>

        {/* PARTIDAS ACTIVAS / RECIENTES */}
        <section className="live-strip">
          {activeMatches.length === 0 && (
            <article>
              <span>Sin partidas</span>
              <strong>Calendario vacío</strong>
              <p>Crea partidas desde el panel admin.</p>
            </article>
          )}

          {activeMatches.map((match) => (
            <article key={`${match.game}-${match.stage}-${match.status}`}>
              <span>{match.status}</span>
              <strong>{match.game}</strong>
              <p>
                {match.stage} · {match.score}
              </p>
            </article>
          ))}
        </section>

        <h2 className="title-gamer">JUEGOS DISPONIBLES</h2>

        <div className="grid grid-3">
          {gameConfigs.map((game) => {
            const registration = getRegistration(game.id);
            const rankingLeader = rankingsByGame[game.id]?.[0];

            return (
              <div key={game.id} className="game-card">
                <div className="game-img">
                  <img src={game.image} alt={game.name} />
                  <div className="overlay" />
                </div>

                <div className="game-info">
                  <div className="game-card-heading">
                    <h3>{game.name}</h3>

                    <span>
                      {getRegisteredPlayers(game.id).length} inscritos
                    </span>
                  </div>

                  <p>{game.description}</p>

                  <div className="game-mini-meta">
                    <span>{game.status}</span>
                    <span>{game.format}</span>

                    <span>
                      Top: @{rankingLeader?.player?.username ?? "pendiente"}
                    </span>
                  </div>

                  <div className="game-actions-row">
                    <button
                      className={
                        registration
                          ? "btn-secondary is-registered"
                          : "btn-primary"
                      }
                      onClick={(event) => handleRegistration(event, game.id)}
                    >
                      {!currentUser
                        ? "Iniciar sesión"
                        : registration
                          ? "✓ Inscrito"
                          : "Inscribirse"}
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() => navigate("/ranking")}
                    >
                      Ver ranking
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() => navigate(`/juego/${game.legacyId}`)}
                    >
                      Detalles
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <section className="command-center">
          {/* ACTIVIDAD REAL */}
          <div className="activity-panel premium-panel">
            <div className="section-heading">
              <span>Actividad del sistema</span>
              <h2>La arena se mueve ahora</h2>
            </div>

            <div className="activity-feed">
              {activity.length === 0 && (
                <article className="feed-item cyan">
                  <span>Sistema</span>
                  <p>Todavía no hay actividad registrada.</p>
                  <small>pendiente</small>
                </article>
              )}

              {activity.map((item) => (
                <article
                  className={`feed-item ${item.tone}`}
                  key={`${item.tag}-${item.text}-${item.time}`}
                >
                  <span>{item.tag}</span>
                  <p>{item.text}</p>
                  <small>{item.time}</small>
                </article>
              ))}
            </div>
          </div>

          {/* TOP GLOBAL REAL */}
          <div className="top-panel premium-panel">
            <div className="section-heading">
              <span>Top jugadores</span>
              <h2>Jugadores en tendencia</h2>
            </div>

            {topPlayers.length === 0 && (
              <article className="player-card">
                <b>#</b>

                <div>
                  <strong>Sin ranking</strong>
                  <span>Finaliza partidas para generar datos</span>
                </div>

                <p>0 pts</p>
                <em>pendiente</em>
              </article>
            )}

            {topPlayers.map((player) => (
              <article className="player-card" key={player.name}>
                <b>#{player.rank}</b>

                <div>
                  <strong>{player.name}</strong>
                  <span>{player.game}</span>
                </div>

                <p>{player.points} pts</p>
                <em>{player.trend}</em>
              </article>
            ))}
          </div>
        </section>

        <section className="insights-grid">
          <div className="premium-panel chart-container">
            <StatsChart
              data={playersData}
              title="Distribución de jugadores por juego"
            />
          </div>

          <div className="premium-panel tournament-card">
            <span>Estado del torneo</span>

            <h2>
              {activeMatches[0]
                ? activeMatches[0].game
                : "Sin partidas activas"}
            </h2>

            <p>
              {activeMatches[0]
                ? `${activeMatches[0].stage} · ${activeMatches[0].status}`
                : "Cuando el administrador cree partidas, aparecerán aquí automáticamente."}
            </p>

            <button
              className="btn-secondary"
              onClick={() => navigate("/juegos")}
            >
              Ver juegos
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
