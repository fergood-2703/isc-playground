import { useMemo, useState } from "react";
import { Trash2, UserMinus, UserPlus } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import "./Equipos.css";

export default function Equipos() {
  const { gameConfigs, players, teams, createTeam, updateTeam, deleteTeam, assignPlayerToTeam, removePlayerFromTeam } = useApp();
  const [form, setForm] = useState({ name: "", tag: "", gameId: gameConfigs[0].id, playerIds: [] });
  const [assignment, setAssignment] = useState({ teamId: teams[0]?.id ?? "", playerId: players[0]?.id ?? "" });

  const playersById = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player])), [players]);
  const activePlayerIds = useMemo(
    () => new Set(teams.filter((team) => team.status === "Activo").flatMap((team) => team.playerIds)),
    [teams]
  );
  const availablePlayers = players.filter((player) => !activePlayerIds.has(player.id));

  const handleCreateTeam = (event) => {
    event.preventDefault();
    if (!form.name || !form.gameId) return;
    createTeam(form);
    setForm({ name: "", tag: "", gameId: gameConfigs[0].id, playerIds: [] });
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
          <span className="eyebrow">Equipos temporales</span>
          <h2>Agrupación rápida para partidas</h2>
          <p>Los equipos son operativos, no competitivos permanentes. Un jugador solo puede estar en un equipo activo a la vez y queda disponible al cerrar la partida.</p>
        </div>
      </div>

      <div className="availability-strip panel-card">
        <div><strong>{availablePlayers.length}</strong><span>Disponibles</span></div>
        <div><strong>{activePlayerIds.size}</strong><span>En equipo activo</span></div>
        <div><strong>{teams.filter((team) => team.status === "Activo").length}</strong><span>Equipos activos</span></div>
      </div>

      <div className="grid-2">
        <section className="panel-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Nuevo equipo temporal</span>
              <h3>Alta rápida de grupo</h3>
            </div>
          </div>
          <form className="team-form" onSubmit={handleCreateTeam}>
            <label>Nombre operativo
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Mesa A - Azul" />
            </label>
            <label>Tag
              <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value.toUpperCase() })} placeholder="A1" maxLength={5} />
            </label>
            <label>Juego
              <select value={form.gameId} onChange={(e) => setForm({ ...form, gameId: e.target.value })}>
                {gameConfigs.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
              </select>
            </label>
            <button className="primary-btn">Crear equipo temporal</button>
          </form>
        </section>

        <section className="panel-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Asignar jugador</span>
              <h3>Evita duplicados activos</h3>
            </div>
            <UserPlus size={20} />
          </div>
          <form className="assign-form" onSubmit={handleAssign}>
            <label>Equipo activo
              <select value={assignment.teamId} onChange={(e) => setAssignment({ ...assignment, teamId: e.target.value })}>
                {teams.filter((team) => team.status === "Activo").map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </label>
            <label>Jugador disponible
              <select value={assignment.playerId} onChange={(e) => setAssignment({ ...assignment, playerId: e.target.value })}>
                <option value="">Seleccionar</option>
                {availablePlayers.map((player) => <option key={player.id} value={player.id}>{player.name} (@{player.username})</option>)}
              </select>
            </label>
            <button className="ghost-btn">Agregar al equipo</button>
          </form>
        </section>
      </div>

      <section className="team-grid">
        {teams.map((team) => {
          const game = gameConfigs.find((item) => item.id === team.gameId);
          return (
            <article className="panel-card team-card" key={team.id}>
              <header>
                <div className="team-avatar">{team.tag}</div>
                <div>
                  <input value={team.name} onChange={(e) => updateTeam(team.id, { name: e.target.value })} />
                  <span>{team.type} · {team.status} · {game?.shortName}</span>
                </div>
                <button className="danger-btn" onClick={() => deleteTeam(team.id)}><Trash2 size={16} /></button>
              </header>

              <div className="assigned-games">
                {gameConfigs.map((option) => (
                  <button
                    key={option.id}
                    className={team.gameId === option.id ? "active" : ""}
                    onClick={() => updateTeam(team.id, { gameId: option.id })}
                    style={{ "--accent": option.accent }}
                  >
                    {option.shortName}
                  </button>
                ))}
              </div>

              <div className="roster-list">
                {team.playerIds.map((playerId) => (
                  <div key={playerId}>
                    <strong>{playersById[playerId]?.name}</strong>
                    <span>@{playersById[playerId]?.username}</span>
                    <button type="button" onClick={() => removePlayerFromTeam(team.id, playerId)}><UserMinus size={14} /></button>
                  </div>
                ))}
                {team.playerIds.length === 0 && <p>Sin jugadores asignados.</p>}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
