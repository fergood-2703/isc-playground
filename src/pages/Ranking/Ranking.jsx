import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { games } from "../../data/games";
import { playerRankings } from "../../data/rankings";
import "./Ranking.css";

const SESSION_KEY = "isc_user";

export default function RankingPage() {
  const [selectedGame, setSelectedGame] = useState("Global");

  const sessionUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }, []);

  const rankingBySelectedGame = useMemo(() => {
    const sorted = [...playerRankings].sort((a, b) => {
      if (selectedGame === "Global") {
        return b.puntuacionGlobal - a.puntuacionGlobal;
      }
      return (b.juegos[selectedGame] || 0) - (a.juegos[selectedGame] || 0);
    });

    return sorted.map((player, index) => ({
      ...player,
      posicion: index + 1,
      puntaje:
        selectedGame === "Global"
          ? player.puntuacionGlobal
          : player.juegos[selectedGame] || 0,
    }));
  }, [selectedGame]);

  const currentPlayer = useMemo(() => {
    if (!sessionUser?.identifier) return null;

    const row = rankingBySelectedGame.find(
      (player) =>
        player.nombre.toLowerCase() === sessionUser.identifier.toLowerCase()
    );

    return row || null;
  }, [rankingBySelectedGame, sessionUser]);

  return (
    <div className="ranking-page">
      <Navbar />
      <main className="container ranking-container">
        <section className="ranking-hero">
          <p className="ranking-kicker">CLASIFICATORIA EN TIEMPO REAL</p>
          <h1>Ranking oficial ISC Playground</h1>
          <p>
            Consulta la tabla global, cambia entre juegos y revisa tu progreso
            personal si ya iniciaste sesión.
          </p>
        </section>

        <section className="ranking-switches" aria-label="Filtros de ranking">
          <button
            type="button"
            className={selectedGame === "Global" ? "active" : ""}
            onClick={() => setSelectedGame("Global")}
          >
            🌍 Global
          </button>

          {games.map((game) => (
            <button
              key={game.id}
              type="button"
              className={selectedGame === game.nombre ? "active" : ""}
              onClick={() => setSelectedGame(game.nombre)}
            >
              🎮 {game.nombre}
            </button>
          ))}
        </section>

        {currentPlayer && (
          <section className="ranking-player-card">
            <div>
              <p className="ranking-player-card__label">Tu posición actual</p>
              <h3>#{currentPlayer.posicion}</h3>
            </div>
            <div>
              <p className="ranking-player-card__label">Jugador</p>
              <h4>{currentPlayer.nombre}</h4>
            </div>
            <div>
              <p className="ranking-player-card__label">Puntaje</p>
              <h4>{currentPlayer.puntaje} pts</h4>
            </div>
          </section>
        )}

        <section className="ranking-table-wrap">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Jugador</th>
                <th>Facultad</th>
                <th>Partidas</th>
                <th>Victorias</th>
                <th>Puntaje</th>
              </tr>
            </thead>
            <tbody>
              {rankingBySelectedGame.map((player) => (
                <tr
                  key={player.id}
                  className={
                    sessionUser?.identifier?.toLowerCase() ===
                    player.nombre.toLowerCase()
                      ? "highlight-player"
                      : ""
                  }
                >
                  <td>{player.posicion <= 3 ? ["🥇", "🥈", "🥉"][player.posicion - 1] : `#${player.posicion}`}</td>
                  <td>{player.nombre}</td>
                  <td>{player.facultad}</td>
                  <td>{player.partidas}</td>
                  <td>{player.victorias}</td>
                  <td>{player.puntaje} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
