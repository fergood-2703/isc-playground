import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { useApp } from "../../context/AppContext";
import "./Perfil.css";

export default function Perfil() {
  const { currentUser, updateCurrentUser, players, gameConfigs, rankingsByGame, globalLeaderboard, matches } = useApp();
  const [profile, setProfile] = useState({ username: currentUser.username, name: currentUser.name, password: "" });

  const player = players.find((item) => item.id === currentUser.id) ?? players[0];
  const globalStats = useMemo(
    () => globalLeaderboard.find((row) => row.player.id === player.id),
    [globalLeaderboard, player.id]
  );
  const history = matches.filter((match) => match.playerIds.includes(player.id));

  const handleSubmit = (event) => {
    event.preventDefault();
    updateCurrentUser({ username: profile.username, name: profile.name });
    setProfile((prev) => ({ ...prev, password: "" }));
  };

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-container">
        <section className="profile-hero">
          <p>PERFIL DEL JUGADOR</p>
          <h1>{currentUser.name}</h1>
          <span>@{currentUser.username}</span>
        </section>

        <section className="profile-grid">
          <form className="profile-panel" onSubmit={handleSubmit}>
            <h2>Editar mi perfil</h2>
            <label>Nombre visible
              <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
            </label>
            <label>Username
              <input value={profile.username} onChange={(event) => setProfile({ ...profile, username: event.target.value })} />
            </label>
            <label>Nueva contraseña
              <input type="password" value={profile.password} onChange={(event) => setProfile({ ...profile, password: event.target.value })} placeholder="••••••••" />
            </label>
            <button>Guardar cambios</button>
          </form>

          <section className="profile-panel stats-panel">
            <h2>Mis estadísticas</h2>
            <div className="profile-stats">
              <div><strong>{Math.round(globalStats?.score ?? 0)}</strong><span>Puntos</span></div>
              <div><strong>{globalStats?.matchesPlayed ?? 0}</strong><span>Partidas</span></div>
              <div><strong>{globalStats?.wins ?? 0}</strong><span>Victorias</span></div>
              <div><strong>{globalStats?.kills ?? 0}</strong><span>Kills</span></div>
              <div><strong>{globalStats?.damage ?? 0}</strong><span>Daño</span></div>
              <div><strong>{globalStats?.bossesDefeated ?? 0}</strong><span>Bosses</span></div>
            </div>
          </section>
        </section>

        <section className="profile-panel">
          <h2>Juegos inscritos y ranking</h2>
          <div className="profile-games">
            {gameConfigs.filter((game) => player.games.includes(game.id)).map((game) => {
              const row = rankingsByGame[game.id]?.find((item) => item.player.id === player.id);
              return <span key={game.id} style={{ "--accent": game.accent }}>{game.shortName} · {row ? `#${row.rank}` : "sin partidas"}</span>;
            })}
          </div>
        </section>

        <section className="profile-panel">
          <h2>Mi historial</h2>
          <div className="profile-history">
            {history.map((match) => {
              const game = gameConfigs.find((item) => item.id === match.gameId);
              return <article key={match.id}><strong>{game?.name}</strong><span>{match.phaseType} · {match.stage} · {match.status}</span></article>;
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
