import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { useApp } from "../../context/AppContext";
import "./Juegos.css";

export default function JuegosPage() {
  const navigate = useNavigate();

  const {
    // Usuario actual. Sirve para saber si puede inscribirse.
    currentUser,

    // Datos principales cargados desde backend.
    gameConfigs,
    rankingsByGame,

    // Funciones para inscripciones y conteo de jugadores.
    registerToGame,
    getRegistration,
    getRegisteredPlayers,
  } = useApp();

  // =====================================================
  // MANEJAR INSCRIPCIÓN DESDE /juegos
  // =====================================================
  // Sin sesión → mandamos a /login.
  // Ya inscrito → evitamos duplicar POST.
  // No inscrito → llamamos a registerToGame(), que usa POST /api/registrations.
  const handleRegistration = (gameId) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!getRegistration(gameId)) {
      registerToGame(gameId);
    }
  };

  return (
    <div className="juegos-page">
      <Navbar />

      <main className="container juegos-container">
        <section className="juegos-hero">
          <p className="juegos-kicker">MODO COMPETITIVO ACTIVADO</p>

          <h1>Elige tu arena de batalla</h1>

          <p>
            Aquí puedes ver todos los juegos disponibles. Entra al que más te
            guste y revisa sus reglas, formato y detalles del torneo.
          </p>
        </section>

        <section>
          <h2 className="title-gamer">JUEGOS DISPONIBLES</h2>

          <div className="grid grid-3">
            {gameConfigs.map((game) => {
              const registration = getRegistration(game.id);
              const rankingLeader = rankingsByGame[game.id]?.[0];

              return (
                <article key={game.id} className="game-card game-card--juegos">
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

                    <div className="game-tags">
                      {[game.format, game.teamSize, game.status].map((tag) => (
                        <span
                          key={tag}
                          className="game-tag"
                          style={{ borderColor: game.accent }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="game-mini-meta">
                      <span>
                        Ranking: @
                        {rankingLeader?.player?.username ?? "pendiente"}
                      </span>
                      <span>{registration?.status ?? "abierto"}</span>
                    </div>

                    <div className="game-actions-row">
                      <button
                        className={
                          registration
                            ? "btn-secondary is-registered"
                            : "btn-primary"
                        }
                        onClick={() => handleRegistration(game.id)}
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
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
