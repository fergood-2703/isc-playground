import { useMemo, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import "./Equipos.css";

export default function Equipos() {
  const { gameConfigs, players, teams, createTeam, updateTeam, deleteTeam, assignPlayerToTeam } = useApp();
  const [form, setForm] = useState({ name: "", tag: "", gameIds: [gameConfigs[0].id], playerIds: [] });
  const [assignment, setAssignment] = useState({ teamId: teams[0]?.id ?? "", playerId: players[0]?.id ?? "" });

  const playersById = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player])), [players]);

  const toggleFormGame = (gameId) => {
    setForm((prev) => ({
      ...prev,
      gameIds: prev.gameIds.includes(gameId)
        ? prev.gameIds.filter((id) => id !== gameId)
        : [...prev.gameIds, gameId],
    }));
  };

  const handleCreateTeam = (event) => {
    event.preventDefault();
    if (!form.name || form.gameIds.length === 0) return;
    createTeam(form);
    setForm({ name: "", tag: "", gameIds: [gameConfigs[0].id], playerIds: [] });
  };

  const handleAssign = (event) => {
    event.preventDefault();
    if (!assignment.teamId || !assignment.playerId) return;
    assignPlayerToTeam(assignment.teamId, assignment.playerId);
  };

  return (
    <div className="admin-page teams-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Gestión de equipos</span>
          <h2>Roster, integrantes y juegos asignados</h2>
          <p>Crea equipos, edita su tag competitivo, asigna jugadores y define en qué juegos oficiales participa cada roster.</p>
        </div>
      </div>

      <div className="grid-2">
        <section className="panel-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Nuevo equipo</span>
              <h3>Alta rápida de roster</h3>
            </div>
          </div>
          <form className="team-form" onSubmit={handleCreateTeam}>
            <label>Nombre del equipo
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Neon Strikers" />
            </label>
            <label>Tag
              <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value.toUpperCase() })} placeholder="NS" maxLength={5} />
            </label>
            <div className="game-checks">
              {gameConfigs.map((game) => (
                <label key={game.id} className="check-card" style={{ "--accent": game.accent }}>
                  <input type="checkbox" checked={form.gameIds.includes(game.id)} onChange={() => toggleFormGame(game.id)} />
                  <span>{game.shortName}</span>
                </label>
              ))}
            </div>
            <button className="primary-btn">Crear equipo</button>
          </form>
        </section>

        <section className="panel-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Asignar jugador</span>
              <h3>Roster manager</h3>
            </div>
            <UserPlus size={20} />
          </div>
          <form className="assign-form" onSubmit={handleAssign}>
            <label>Equipo
              <select value={assignment.teamId} onChange={(e) => setAssignment({ ...assignment, teamId: e.target.value })}>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </label>
            <label>Jugador
              <select value={assignment.playerId} onChange={(e) => setAssignment({ ...assignment, playerId: e.target.value })}>
                {players.map((player) => <option key={player.id} value={player.id}>{player.name} (@{player.username})</option>)}
              </select>
            </label>
            <button className="ghost-btn">Agregar al equipo</button>
          </form>
        </section>
      </div>

      <section className="team-grid">
        {teams.map((team) => (
          <article className="panel-card team-card" key={team.id}>
            <header>
              <div className="team-avatar">{team.tag}</div>
              <div>
                <input value={team.name} onChange={(e) => updateTeam(team.id, { name: e.target.value })} />
                <span>{team.playerIds.length} integrantes</span>
              </div>
              <button className="danger-btn" onClick={() => deleteTeam(team.id)}><Trash2 size={16} /></button>
            </header>

            <div className="assigned-games">
              {gameConfigs.map((game) => (
                <button
                  key={game.id}
                  className={team.gameIds.includes(game.id) ? "active" : ""}
                  onClick={() => updateTeam(team.id, {
                    gameIds: team.gameIds.includes(game.id)
                      ? team.gameIds.filter((id) => id !== game.id)
                      : [...team.gameIds, game.id],
                  })}
                  style={{ "--accent": game.accent }}
                >
                  {game.shortName}
                </button>
              ))}
            </div>

            <div className="roster-list">
              {team.playerIds.map((playerId) => (
                <div key={playerId}>
                  <strong>{playersById[playerId]?.name}</strong>
                  <span>@{playersById[playerId]?.username}</span>
                </div>
              ))}
              {team.playerIds.length === 0 && <p>Sin jugadores asignados.</p>}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
