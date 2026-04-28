import { useNavigate } from "react-router-dom"; // 👈 agregado
import Navbar from "../../components/Navbar/Navbar";
import StatsChart from "../../components/StatsChart/StatsChart";
import logo from "../../assets/images/playground-logo.png";
import { games } from "../../data/games";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate(); // 👈 agregado


  const playersData = games.map((g) => ({
    name: g.nombre,
    value: g.jugadores,
  }));

  return (
    <div>
      <Navbar />
      <div className="container">
        {/* HERO */}
        <div className="hero">
          <div className="hero-left">
            <h1>ISC Playground</h1>
            <p>Compite, juega y sube en el ranking</p>
            <div className="hero-actions">
              <button className="btn-primary">Jugar ahora</button>
              <button className="btn-secondary" onClick={() => navigate("/about")}>About us</button>
            </div>
            <div className="hero-stats">
              <div>👤 50 jugadores</div>
              <div>🎮 3 juegos</div>
              <div>🏆 120 partidas</div>
            </div>
          </div>
          <div className="hero-right">
            <img src={logo} alt="logo" />
          </div>
        </div>

        {/* JUEGOS */}
        <h2 className="title-gamer">JUEGOS DISPONIBLES</h2>

        <div className="grid grid-3">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-img">
                <img src={game.img} alt={game.nombre} />
                <div className="overlay" />
              </div>
              <div className="game-info">
                <h3>{game.nombre}</h3>
                <p>{game.desc}</p>
                <button
                  className="btn-primary"
                  onClick={() => navigate(`/juego/${game.id}`)}
                >
                  {" "}
                  {}
                  Ver detalles →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* STATS */}
        <h2>📊 Actividad del sistema</h2>
        <div className="grid grid-3 stats-mini">
          <div className="stat-card">
            <span>👤</span>
            <div>
              <strong>50</strong>
              <p>Jugadores</p>
            </div>
          </div>
          <div className="stat-card">
            <span>🎮</span>
            <div>
              <strong>3</strong>
              <p>Juegos</p>
            </div>
          </div>
          <div className="stat-card">
            <span>🏆</span>
            <div>
              <strong>120</strong>
              <p>Partidas</p>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <StatsChart
            data={playersData}
            title="Distribución de jugadores por juego"
          />
        </div>

        {/* RANKING */}
        <h2>🏆 Top jugadores</h2>
        <div className="ranking-card">
          <div className="ranking-row gold">
            <span>🥇 Omar</span>
            <span>100 pts</span>
          </div>
          <div className="ranking-row silver">
            <span>🥈 Juan</span>
            <span>80 pts</span>
          </div>
          <div className="ranking-row bronze">
            <span>🥉 Carlos</span>
            <span>60 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
