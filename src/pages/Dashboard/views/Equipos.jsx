import { useState } from "react";
import "./Equipos.css";

export default function Equipos() {
    const [teams, setTeams] = useState([]);

    const [teamName, setTeamName] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(null);

    const [users] = useState([
        { id: 1, nombre: "Fer" },
        { id: 2, nombre: "Carlos" },
        { id: 3, nombre: "Ana" },
        { id: 4, nombre: "Luis" },
    ]);

    // crear equipo
    const handleCreateTeam = (e) => {
        e.preventDefault();

        if (!teamName) return;

        const newTeam = {
            id: Date.now(),
            name: teamName,
            players: [],
        };

        setTeams([...teams, newTeam]);
        setTeamName("");
    };

    // agregar jugador
    const handleAddPlayer = (e) => {
        e.preventDefault();

        if (!playerName || selectedTeam === null) return;

        setTeams(
            teams.map((team) => {
                if (team.id === selectedTeam) {

                    // ❌ evitar duplicados
                    if (team.players.includes(playerName)) {
                        alert("Este jugador ya está en el equipo");
                        return team;
                    }

                    return {
                        ...team,
                        players: [...team.players, playerName],
                    };
                }
                return team;
            })
        );

        setPlayerName("");
    };

    // eliminar equipo
    const handleDeleteTeam = (id) => {
        setTeams(teams.filter((t) => t.id !== id));
    };

    return (
        <div className="teams">

            <h2>Gestión de Equipos</h2>

            {/* CREAR EQUIPO */}
            <form className="team-form" onSubmit={handleCreateTeam}>
                <input
                    type="text"
                    placeholder="Nombre del equipo"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                />

                <button>Crear equipo</button>
            </form>

            {/* AGREGAR JUGADOR */}
            <form className="player-form" onSubmit={handleAddPlayer}>
                <select onChange={(e) => setSelectedTeam(Number(e.target.value))}>
                    <option value="">Selecciona equipo</option>
                    {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>

                <select
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                >
                    <option value="">Selecciona jugador</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.nombre}>
                            {u.nombre}
                        </option>
                    ))}
                </select>

                <button>Agregar jugador</button>
            </form>

            {/* LISTA */}
            <div className="team-list">
                {teams.length === 0 && <p>No hay equipos aún</p>}

                {teams.map((team) => (
                    <div className="team-card" key={team.id}>
                        <h3>{team.name}</h3>

                        <ul>
                            {team.players.length === 0 && <li>Sin jugadores</li>}
                            {team.players.map((p, i) => (
                                <li key={i}>{p}</li>
                            ))}
                        </ul>

                        <button
                            className="delete"
                            onClick={() => handleDeleteTeam(team.id)}
                        >
                            Eliminar equipo
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}