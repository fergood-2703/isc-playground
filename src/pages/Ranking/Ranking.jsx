import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { useApp } from "../../context/AppContext";
import "./Ranking.css";

const SESSION_KEY = "isc_user";

export default function RankingPage() {
  const { gameConfigs, globalLeaderboard, rankingsByGame, currentUser } = useApp();
  const [selectedGame, setSelectedGame] = useState("Global");

  const sessionUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }, []);

  const rankingBySelectedGame = useMemo(() => {
    if (selectedGame === "Global") {
      return globalLeaderboard.map((row, index) => ({
        id: row.player.id,
        posicion: index + 1,
        nombre: row.player.name,
        usuario: `@${row.player.username}`,
        partidas: row.matchesPlayed,
        victorias: row.wins,
        puntaje: Math.round(row.score),
      }));
    }

    return (rankingsByGame[selectedGame] ?? []).map((row) => ({
      id: row.player.id,
      posicion: row.rank,
      nombre: row.player.name,
      usuario: `@${row.player.username}`,
      partidas: row.matchesPlayed,
      victorias: row.wins,
      puntaje: row.totalPoints || row.totals[gameConfigs.find((game) => game.id === selectedGame)?.scoringRules[0].key] || 0,
    }));
  }, [gameConfigs, globalLeaderboard, rankingsByGame, selectedGame]);

  const currentPlayer = useMemo(() => {
    const identifier = sessionUser?.identifier ?? currentUser.username;
    return rankingBySelectedGame.find((row) => `${row.nombre} ${row.usuario}`.toLowerCase().includes(identifier.toLowerCase())) ?? rankingBySelectedGame[0];
  }, [currentUser.username, rankingBySelectedGame, sessionUser]);

  return (
    <div className="ranking-page">
      <Navbar />
      <main className="container ranking-container">
        <section className="ranking-hero">
          <p className="ranking-kicker">CLASIFICATORIA EN TIEMPO REAL</p>
          <h1>Ranking oficial ISC Playground</h1>
          <p>
            Consulta la tabla global individual y las clasificaciones por juego calculadas por usuario. Los equipos son temporales y no compiten como entidades permanentes.
          </p>
        </section>

        <section className="ranking-switches" aria-label="Filtros de ranking">
          <button type="button" className={selectedGame === "Global" ? "active" : ""} onClick={() => setSelectedGame("Global")}>🌍 Global</button>
          {gameConfigs.map((game) => (
            <button key={game.id} type="button" className={selectedGame === game.id ? "active" : ""} onClick={() => setSelectedGame(game.id)}>🎮 {game.name}</button>
          ))}
        </section>

        {currentPlayer && (
          <section className="ranking-player-card">
            <div><p className="ranking-player-card__label">Posición destacada</p><h3>#{currentPlayer.posicion}</h3></div>
            <div><p className="ranking-player-card__label">Usuario</p><h4>{currentPlayer.usuario}</h4></div>
            <div><p className="ranking-player-card__label">Puntaje / métrica</p><h4>{currentPlayer.puntaje} pts</h4></div>
          </section>
        )}

        <section className="ranking-table-wrap">
          <table className="ranking-table">
            <thead>
              <tr><th>#</th><th>Jugador</th><th>Usuario</th><th>Partidas/Juegos</th><th>Victorias/Historial</th><th>Puntaje</th></tr>
            </thead>
            <tbody>
              {rankingBySelectedGame.map((row) => (
                <tr key={row.id} className={currentPlayer?.id === row.id ? "highlight-player" : ""}>
                  <td>{row.posicion <= 3 ? ["🥇", "🥈", "🥉"][row.posicion - 1] : `#${row.posicion}`}</td>
                  <td>{row.nombre}</td>
                  <td>{row.usuario}</td>
                  <td>{row.partidas}</td>
                  <td>{row.victorias}</td>
                  <td>{row.puntaje} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
