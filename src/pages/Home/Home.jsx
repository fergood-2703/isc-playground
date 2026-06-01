import { useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar/Navbar"
import StatsChart from "../../components/StatsChart/StatsChart"
import logo from "../../assets/images/playground-logo.png"
import { useApp } from "../../context/AppContext"
import "./Home.css"

const activity = [
  {
    tag: "Soul Knight",
    text: "Carlos derrotó a 3 bosses en una run perfecta",
    time: "hace 4 min",
    tone: "green",
  },
  {
    tag: "Bomb Squad",
    text: "Nuevo récord de eliminaciones: 24 KOs",
    time: "hace 11 min",
    tone: "cyan",
  },
  {
    tag: "CS 1.6",
    text: "Semifinal A iniciada en de_dust2",
    time: "en vivo",
    tone: "purple",
  },
  {
    tag: "Ranking",
    text: "fergood subió al top 3 global",
    time: "hace 22 min",
    tone: "gold",
  },
]

const topPlayers = [
  { name: "Omarx", game: "CS 1.6", points: 1240, trend: "+18%", rank: 1 },
  { name: "lucia.gg", game: "Soul Knight", points: 1118, trend: "+12%", rank: 2 },
  { name: "fergood", game: "Bomb Squad", points: 1094, trend: "+9%", rank: 3 },
]

const activeMatches = [
  { game: "Counter Strike", stage: "Semifinal", status: "LIVE", score: "11 - 8" },
  { game: "Bomb Squad", stage: "Clasificatoria", status: "15:30", score: "Lobby listo" },
  { game: "Soul Knight", stage: "Casual", status: "Abierta", score: "3/4 players" },
]

export default function Home() {
  const navigate = useNavigate()

  const {
    gameConfigs,
    rankingsByGame,
    registerToGame,
    getRegistration,
    getRegisteredPlayers,
  } = useApp()

  const playersData = gameConfigs.map((game) => ({
    name: game.shortName,
    value: getRegisteredPlayers(game.id).length,
  }))

  const handleRegistration = (event, gameId) => {
    event.stopPropagation()

    if (!getRegistration(gameId)) {
      registerToGame(gameId)
    }
  }

  return (
    <div>
      <Navbar />

      <div className="container home-shell">
        <section className="hero">
          <div className="hero-left">
            <span className="hero-kicker">
              ISC eSports OS · Campus arena
            </span>

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
                <strong>50</strong>
                <span>jugadores activos</span>
              </div>

              <div>
                <strong>3</strong>
                <span>juegos oficiales</span>
              </div>

              <div>
                <strong>120</strong>
                <span>partidas registradas</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <img src={logo} alt="logo" />
          </div>
        </section>

        <section className="live-strip">
          {activeMatches.map((match) => (
            <article key={`${match.game}-${match.stage}`}>
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
            const registration = getRegistration(game.id)
            const rankingLeader = rankingsByGame[game.id]?.[0]

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
                      {registration ? "✓ Inscrito" : "Inscribirse"}
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
            )
          })}
        </div>

        <section className="command-center">
          <div className="activity-panel premium-panel">
            <div className="section-heading">
              <span>Actividad del sistema</span>
              <h2>La arena se mueve ahora</h2>
            </div>

            <div className="activity-feed">
              {activity.map((item) => (
                <article
                  className={`feed-item ${item.tone}`}
                  key={item.text}
                >
                  <span>{item.tag}</span>
                  <p>{item.text}</p>
                  <small>{item.time}</small>
                </article>
              ))}
            </div>
          </div>

          <div className="top-panel premium-panel">
            <div className="section-heading">
              <span>Top jugadores</span>
              <h2>Jugadores en tendencia</h2>
            </div>

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
            <span>Próximo torneo</span>
            <h2>Neon Cup Weekend</h2>
            <p>
              Bracket de Counter Strike + desafío cooperativo de Soul Knight.
              Inscripciones mock abiertas.
            </p>
            <button className="btn-secondary">Ver calendario</button>
          </div>
        </section>
      </div>
    </div>
  )
}