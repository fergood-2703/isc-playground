import { useMemo, useState } from "react";
import { Ban, Search, Trophy } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import "./Usuarios.css";

export default function Usuarios() {
  const { players, gameConfigs, rankingsByGame, globalLeaderboard } = useApp();
  const [query, setQuery] = useState("");

  const globalByPlayerId = useMemo(
    () => Object.fromEntries(globalLeaderboard.map((row, index) => [row.player.id, { ...row, rank: index + 1 }])),
    [globalLeaderboard]
  );

  const filteredPlayers = players.filter((player) =>
    `${player.name} ${player.username}`.toLowerCase().includes(query.toLowerCase())
  );

  const getGameRanks = (playerId) => gameConfigs
    .map((game) => {
      const row = rankingsByGame[game.id]?.find((item) => item.player.id === playerId);
      return row ? `${game.shortName} #${row.rank}` : null;
    })
    .filter(Boolean)
    .join(" · ") || "Sin ranking";

  return (
    <div className="admin-page users-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Usuarios · control del torneo</span>
          <h2>Jugadores, estadísticas y acciones competitivas</h2>
          <p>El administrador no edita username, contraseña ni perfil personal: esta vista se limita a control competitivo, puntos, descalificaciones e historial.</p>
        </div>
      </div>

      <div className="admin-kpi-grid">
        <section className="panel-card profile-summary">
          <span className="eyebrow">Ranking global</span>
          <h3>Top usuario</h3>
          <div className="summary-grid">
            <div><strong>@{globalLeaderboard[0]?.player.username ?? "-"}</strong><span>Líder</span></div>
            <div><strong>{players.length}</strong><span>Jugadores</span></div>
            <div><strong>{globalLeaderboard.reduce((acc, row) => acc + row.matchesPlayed, 0)}</strong><span>Partidas jugadas</span></div>
          </div>
        </section>

        <section className="panel-card admin-actions-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Acciones permitidas</span>
              <h3>Administración competitiva</h3>
            </div>
            <Trophy size={20} />
          </div>
          <div className="action-chips">
            <span>Registrar puntos manuales</span>
            <span>Editar estadísticas del torneo</span>
            <span>Ver historial de partidas</span>
            <span>Descalificar si aplica</span>
          </div>
        </section>
      </div>

      <section className="panel-card users-table-card">
        <div className="section-title user-tools">
          <div>
            <span className="eyebrow">Jugadores</span>
            <h3>Ranking, métricas e historial</h3>
          </div>
          <label className="search-box"><Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar jugador o username" />
          </label>
        </div>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Username</th>
              <th>Estado</th>
              <th>Rank global</th>
              <th>Puntos</th>
              <th>Partidas</th>
              <th>Victorias</th>
              <th>Kills</th>
              <th>Daño</th>
              <th>Bosses</th>
              <th>Ranking por juego</th>
              <th>Acción admin</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => {
              const stats = globalByPlayerId[player.id] ?? {};
              return (
                <tr key={player.id}>
                  <td><strong>{player.name}</strong></td>
                  <td>@{player.username}</td>
                  <td>{player.status}</td>
                  <td><span className="rank-mini">{stats.rank ? `#${stats.rank}` : "-"}</span></td>
                  <td>{Math.round(stats.score ?? 0)}</td>
                  <td>{stats.matchesPlayed ?? 0}</td>
                  <td>{stats.wins ?? 0}</td>
                  <td>{stats.kills ?? 0}</td>
                  <td>{stats.damage ?? 0}</td>
                  <td>{stats.bossesDefeated ?? 0}</td>
                  <td>{getGameRanks(player.id)}</td>
                  <td><button className="danger-btn" type="button"><Ban size={14} /> DQ</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
