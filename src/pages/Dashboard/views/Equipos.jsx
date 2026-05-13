import { useMemo, useState } from "react";
import { Play, Plus, Search, Trash2, UserMinus, UserPlus } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import "./Equipos.css";

export default function Equipos() {
  const {
    gameConfigs,
    players,
    teams,
    matches,
    createTeam,
    updateTeam,
    deleteTeam,
    assignPlayerToTeam,
    removePlayerFromTeam,
    getRegisteredPlayers,
  } = useApp();
  const [selectedGameId, setSelectedGameId] = useState(gameConfigs[0].id);
  const [search, setSearch] = useState("");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [teamName, setTeamName] = useState("Equipo Alpha");

  const selectedGame = gameConfigs.find((game) => game.id === selectedGameId) ?? gameConfigs[0];
  const gameTeams = teams.filter((team) => team.gameId === selectedGameId);
  const activeTeams = gameTeams.filter((team) => team.status === "Activo");
  const playersById = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player])), [players]);
  const busyPlayerIds = useMemo(
    () => new Set(activeTeams.flatMap((team) => team.playerIds)),
    [activeTeams]
  );
  const registeredPlayers = getRegisteredPlayers(selectedGameId);
  const filteredPlayers = registeredPlayers.filter((player) =>
    `${player.name} ${player.username}`.toLowerCase().includes(search.toLowerCase())
  );
  const availablePlayers = registeredPlayers.filter((player) => !busyPlayerIds.has(player.id));
  const activeMatches = matches.filter((match) => match.gameId === selectedGameId && ["Pendiente", "En preparación", "En curso"].includes(match.status));

  const togglePlayer = (playerId) => {
    if (busyPlayerIds.has(playerId)) return;
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const handleCreateTeam = (event) => {
    event.preventDefault();
    if (!teamName.trim()) return;
    createTeam({ name: teamName, tag: teamName.slice(0, 3).toUpperCase(), gameId: selectedGameId, playerIds: selectedPlayerIds });
    setTeamName("");
    setSelectedPlayerIds([]);
  };

  const movePlayer = (teamId, playerId) => {
    if (assignPlayerToTeam(teamId, playerId)) {
      setSelectedPlayerIds((prev) => prev.filter((id) => id !== playerId));
    }
  };

  return (
    <div className="admin-page teams-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Gestión por juego</span>
          <h2>Equipos temporales desde inscritos</h2>
          <p>El administrador ya no toma usuarios globales: primero selecciona el juego, revisa sus inscritos, arma equipos temporales y luego crea la partida por fase o ronda.</p>
        </div>
      </div>

      <div className="game-switcher">
        {gameConfigs.map((game) => (
          <button className={game.id === selectedGameId ? "active" : ""} key={game.id} onClick={() => { setSelectedGameId(game.id); setSelectedPlayerIds([]); }} style={{ "--accent": game.accent }}>
            <img src={game.image} alt={game.name} />
            <span>{game.name}</span>
          </button>
        ))}
      </div>

      <section className="panel-card enrollment-admin-hero" style={{ "--accent": selectedGame.accent }}>
        <div>
          <span className="eyebrow">{selectedGame.status}</span>
          <h3>{selectedGame.name}</h3>
          <p>{selectedGame.format} · {selectedGame.teamSize} · equipos no permanentes para partida, ronda o fase específica.</p>
        </div>
        <div className="availability-strip compact">
          <div><strong>{registeredPlayers.length}</strong><span>Inscritos</span></div>
          <div><strong>{availablePlayers.length}</strong><span>Disponibles</span></div>
          <div><strong>{activeTeams.length}</strong><span>Equipos activos</span></div>
          <div><strong>{activeMatches.length}</strong><span>Partidas abiertas</span></div>
        </div>
      </section>

      <div className="team-builder-layout">
        <section className="panel-card registered-panel">
          <div className="section-title">
            <div>
              <span className="eyebrow">Jugadores inscritos</span>
              <h3>{selectedGame.name}</h3>
            </div>
            <Search size={20} />
          </div>
          <label className="search-box">Buscar por nombre o username
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ej. Omar, ana_dev..." />
          </label>
          <div className="registered-admin-list">
            {filteredPlayers.map((player) => {
              const isBusy = busyPlayerIds.has(player.id);
              const isSelected = selectedPlayerIds.includes(player.id);
              return (
                <button key={player.id} type="button" className={`${isBusy ? "busy" : ""} ${isSelected ? "selected" : ""}`} onClick={() => togglePlayer(player.id)}>
                  <strong>{player.name}</strong>
                  <span>@{player.username} · {player.registrationStatus}</span>
                  <em>{isBusy ? "En equipo" : isSelected ? "Seleccionado" : "Disponible"}</em>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel-card create-from-selection">
          <div className="section-title">
            <div>
              <span className="eyebrow">+ Crear equipo</span>
              <h3>Desde selección actual</h3>
            </div>
            <Plus size={20} />
          </div>
          <form className="team-form" onSubmit={handleCreateTeam}>
            <label>Nombre operativo
              <input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Equipo Alpha" />
            </label>
            <div className="selection-preview">
              {selectedPlayerIds.map((playerId) => <span key={playerId}>{playersById[playerId]?.name}</span>)}
              {selectedPlayerIds.length === 0 && <p>Selecciona jugadores disponibles desde la lista del juego.</p>}
            </div>
            <button className="primary-btn">Crear equipo temporal</button>
          </form>
        </section>
      </div>

      <section className="team-grid">
        {gameTeams.map((team) => (
          <article className="panel-card team-card" key={team.id}>
            <header>
              <div className="team-avatar">{team.tag}</div>
              <div>
                <input value={team.name} onChange={(event) => updateTeam(team.id, { name: event.target.value })} />
                <span>{team.type} · {team.status} · {selectedGame.shortName}</span>
              </div>
              <button className="danger-btn" onClick={() => deleteTeam(team.id)}><Trash2 size={16} /></button>
            </header>

            <div className="quick-move-list">
              {availablePlayers.map((player) => (
                <button key={player.id} type="button" onClick={() => movePlayer(team.id, player.id)}><UserPlus size={13} /> {player.username}</button>
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

            <button className="ghost-btn start-match-hint"><Play size={15} /> Usar en Partidas → Crear partida</button>
          </article>
        ))}
      </section>
    </div>
  );
}
