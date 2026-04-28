import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { games } from "../../data/games";
import "./Juegos.css";

export default function JuegosPage() {
  const navigate = useNavigate();

  return (
    <div className="juegos-page">
      <Navbar />
      <main className="container juegos-container">
        <section className="juegos-hero">
          <p className="juegos-kicker">MODO COMPETITIVO ACTIVADO</p>
          <h1>Elige tu arena de batalla</h1>
          <p>
            Aquí puedes ver todos los juegos disponibles. Entra al que más te guste
            y revisa sus reglas, formato y detalles del torneo.
          </p>
        </section>

        <section>
          <h2 className="title-gamer">JUEGOS DISPONIBLES</h2>
          <div className="grid grid-3">
            {games.map((game) => (
              <article key={game.id} className="game-card game-card--juegos">
                <div className="game-img">
                  <img src={game.img} alt={game.nombre} />
                  <div className="overlay" />
                </div>

                <div className="game-info">
                  <h3>{game.nombre}</h3>
                  <p>{game.desc}</p>

                  <div className="game-tags">
                    {game.tags.map((tag) => (
                      <span
                        key={tag}
                        className="game-tag"
                        style={{ borderColor: game.color }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/juego/${game.id}`)}
                  >
                    Ver información del juego →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
