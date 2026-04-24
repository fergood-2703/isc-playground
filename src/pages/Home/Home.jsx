import Navbar from "../../components/Navbar/Navbar";
import StatsChart from "../../components/StatsChart/StatsChart";
import logo from "../../assets/images/playground-logo.png";
import "./Home.css";

export default function Home() {

  const games = [
    { id: 1, nombre: "Counter Strike", jugadores: 11 },
    { id: 2, nombre: "Among Us", jugadores: 10 },
    { id: 3, nombre: "Soul Knight", jugadores: 8 },
  ];

  const playersData = games.map(g => ({
    name: g.nombre,
    value: g.jugadores
  }));

  return (
    <div>
      <Navbar />

      <div className="container">

        {/* HERO */}
        <div className="hero">
          <div className="hero-content">
            <h1>ISC Playground</h1>
            <p>Compite, juega y sube en el ranking</p>
            <button className="btn-primary">About us</button>
          </div>

          <div className="hero-image">
            <img src={logo} alt="ISC Playground Logo" />
          </div>
        </div>

        {/* JUEGOS */}
        <h2>🎮 Juegos disponibles</h2>
        <div className="grid grid-3">
          {games.map(game => (
            <div key={game.id} className="game-card">
              <h3>{game.nombre}</h3>
              <p>{game.jugadores} jugadores activos</p>

              <div className="buttons">
                <button className="btn-primary">Jugar</button>
                <button className="btn-secondary">Detalles</button>
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