import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { useApp } from "../../context/AppContext";
import "./Perfil.css";

const trophies = ["MVP Neon", "Boss Hunter", "Clutch 1v3", "Top 3 Global"];

export default function Perfil() {
  const { currentUser, updateCurrentUser, players, gameConfigs, rankingsByGame, globalLeaderboard, matches } = useApp();
  const safeUser = currentUser ?? { id: "u-1", name: "Invitado", username: "guest" };
  const [profile, setProfile] = useState({ username: safeUser.username, name: safeUser.name, password: "" });

  const player = players.find((item) => item.id === safeUser.id) ?? players[0];
  const globalStats = useMemo(() => globalLeaderboard.find((row) => row.player.id === player.id), [globalLeaderboard, player.id]);
  const globalRank = useMemo(() => globalLeaderboard.findIndex((row) => row.player.id === player.id) + 1, [globalLeaderboard, player.id]);
  const history = matches.filter((match) => match.playerIds.includes(player.id));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (currentUser) updateCurrentUser({ username: profile.username, name: profile.name });
    setProfile((prev) => ({ ...prev, password: "" }));
  };

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-container">
        <section className="profile-hero">
          <div className="profile-avatar">{safeUser.username.slice(0, 2).toUpperCase()}</div>
          <div className="profile-identity">
            <p>PERFIL DEL JUGADOR</p>
            <h1>{safeUser.name}</h1>
            <span>@{safeUser.username} · Ranking global #{globalRank || "—"}</span>
          </div>
          <div className="profile-rank"><strong>{Math.round(globalStats?.score ?? 0)}</strong><span>power score</span></div>
        </section>

        <section className="profile-grid">
          <form className="profile-panel" onSubmit={handleSubmit}>
            <h2>Configuración rápida</h2>
            <label>Nombre visible<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
            <label>Username<input value={profile.username} onChange={(event) => setProfile({ ...profile, username: event.target.value })} /></label>
            <label>Nueva contraseña<input type="password" value={profile.password} onChange={(event) => setProfile({ ...profile, password: event.target.value })} placeholder="••••••••" /></label>
            <button>Guardar cambios</button>
          </form>

          <section className="profile-panel stats-panel">
            <h2>Rendimiento competitivo</h2>
            <div className="profile-stats">
              <div><strong>{globalStats?.matchesPlayed ?? 0}</strong><span>Partidas</span></div>
              <div><strong>{globalStats?.wins ?? 0}</strong><span>Victorias</span></div>
              <div><strong>{globalStats?.kills ?? 0}</strong><span>Kills</span></div>
              <div><strong>{globalStats?.damage ?? 0}</strong><span>Daño</span></div>
              <div><strong>{globalStats?.bossesDefeated ?? 0}</strong><span>Bosses</span></div>
              <div><strong>{Math.round((globalStats?.wins ?? 0) * 100 / Math.max(globalStats?.matchesPlayed ?? 1, 1))}%</strong><span>Win rate</span></div>
            </div>
          </section>
        </section>

        <section className="profile-panel">
          <h2>Juegos inscritos</h2>
          <div className="profile-games">
            {gameConfigs.filter((game) => player.games.includes(game.id)).map((game) => {
              const row = rankingsByGame[game.id]?.find((item) => item.player.id === player.id);
              return <article key={game.id} style={{ "--accent": game.accent }}><img src={game.image} alt={game.name} /><div><strong>{game.shortName}</strong><span>{row ? `Ranking #${row.rank} · ${Math.round(row.score)} pts` : "sin partidas"}</span></div></article>;
            })}
          </div>
        </section>

        <section className="profile-grid lower">
          <section className="profile-panel">
            <h2>Historial reciente</h2>
            <div className="profile-history">
              {history.map((match) => {
                const game = gameConfigs.find((item) => item.id === match.gameId);
                return <article key={match.id}><strong>{game?.name}</strong><span>{match.phaseType} · {match.stage}</span><em>{match.status}</em></article>;
              })}
            </div>
          </section>

          <section className="profile-panel trophy-panel">
            <h2>Logros / trofeos</h2>
            <div className="trophy-grid">
              {trophies.map((trophy) => <div key={trophy}><span>◆</span><strong>{trophy}</strong><small>Desbloqueado</small></div>)}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
