import { useState } from "react";
import { Save, UserCog } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import "./Usuarios.css";

export default function Usuarios() {
  const { currentUser, players, teams, gameConfigs, rankingsByGame, updateCurrentUser } = useApp();
  const [profile, setProfile] = useState({ username: currentUser.username, password: "" });

  const getPlayerStats = (player) => {
    const playerTeams = teams.filter((team) => team.playerIds.includes(player.id));
    const bestRanks = playerTeams.flatMap((team) =>
      gameConfigs.map((game) => rankingsByGame[game.id]?.find((row) => row.team.id === team.id)?.rank).filter(Boolean)
    );
    return {
      teams: playerTeams.map((team) => team.name).join(", ") || "Sin equipo",
      games: [...new Set(player.games)].map((gameId) => gameConfigs.find((game) => game.id === gameId)?.shortName).join(", "),
      bestRank: bestRanks.length ? Math.min(...bestRanks) : "-",
    };
  };

  const handleProfile = (event) => {
    event.preventDefault();
    updateCurrentUser({ username: profile.username });
    setProfile((prev) => ({ ...prev, password: "" }));
  };

  return (
    <div className="admin-page users-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Usuarios y perfil</span>
          <h2>Autenticación simulada y jugadores inscritos</h2>
          <p>Vista preparada para backend: el usuario logeado puede actualizar username/contraseña y consultar juegos, equipos, estadísticas y ranking.</p>
        </div>
      </div>

      <div className="grid-2">
        <section className="panel-card profile-card">
          <UserCog />
          <div>
            <span className="eyebrow">Perfil logeado</span>
            <h3>{currentUser.name}</h3>
            <p>{currentUser.email} · {currentUser.role}</p>
          </div>
          <form onSubmit={handleProfile}>
            <label>Username
              <input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
            </label>
            <label>Nueva contraseña
              <input type="password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} placeholder="••••••••" />
            </label>
            <button className="primary-btn"><Save size={15} /> Guardar perfil</button>
          </form>
        </section>

        <section className="panel-card profile-summary">
          <span className="eyebrow">Mis inscripciones</span>
          <h3>Vista del jugador</h3>
          <div className="summary-grid">
            <div><strong>{teams.filter((team) => team.playerIds.includes(currentUser.id)).length}</strong><span>Equipos</span></div>
            <div><strong>{gameConfigs.filter((game) => players.find((p) => p.id === currentUser.id)?.games.includes(game.id)).length}</strong><span>Juegos</span></div>
            <div><strong>#{getPlayerStats(players.find((p) => p.id === currentUser.id) ?? players[0]).bestRank}</strong><span>Mejor rank</span></div>
          </div>
        </section>
      </div>

      <section className="panel-card users-table-card">
        <div className="section-title">
          <div>
            <span className="eyebrow">Jugadores</span>
            <h3>Inscripciones, equipos y ranking</h3>
          </div>
        </div>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Username</th>
              <th>Rol</th>
              <th>Juegos inscritos</th>
              <th>Equipos</th>
              <th>Mejor rank</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const stats = getPlayerStats(player);
              return (
                <tr key={player.id}>
                  <td><strong>{player.name}</strong></td>
                  <td>@{player.username}</td>
                  <td>{player.role}</td>
                  <td>{stats.games}</td>
                  <td>{stats.teams}</td>
                  <td><span className="rank-mini">{stats.bestRank === "-" ? "-" : `#${stats.bestRank}`}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
