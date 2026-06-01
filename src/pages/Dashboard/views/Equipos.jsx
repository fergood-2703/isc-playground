// =====================================================
// DASHBOARD > EQUIPOS
// =====================================================
//
// Esta vista permite al admin crear equipos temporales.
// Flujo correcto:
// 1. Seleccionar juego.
// 2. Ver jugadores inscritos a ese juego.
// 3. Seleccionar jugadores disponibles.
// 4. Crear equipo temporal.
// 5. Usar esos equipos en Dashboard > Partidas.
//
// Importante:
// - No se crean equipos vacíos.
// - No se hacen PATCH en cada tecla al renombrar.
// - Solo se muestran inscritos del juego seleccionado.
// - Un jugador no puede estar en dos equipos activos del mismo juego.

import { useMemo, useState } from "react"
import { Play, Plus, Search, Trash2, UserMinus, UserPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useApp } from "../../../context/AppContext"
import "./Equipos.css"

export default function Equipos() {
  const {
    gameConfigs,
    players,
    teams,
    matches,
    loading,
    createTeam,
    updateTeam,
    deleteTeam,
    assignPlayerToTeam,
    removePlayerFromTeam,
    getRegisteredPlayers,
  } = useApp()

  // =====================================================
  // GUARD DE CARGA
  // =====================================================
  //
  // Evita que la vista truene mientras AppContext todavía
  // está cargando juegos desde el backend.
  if (loading) {
    return (
      <div className="admin-page">
        <p>Cargando equipos...</p>
      </div>
    )
  }

  // Si no existen juegos, no tiene sentido mostrar equipos.
  if (!gameConfigs.length) {
    return (
      <div className="admin-page">
        <div className="page-head">
          <div>
            <span className="eyebrow">Gestión por juego</span>
            <h2>No hay juegos disponibles</h2>
            <p>
              Primero crea un juego en Dashboard &gt; Juegos para poder
              formar equipos temporales.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <EquiposInner
      gameConfigs={gameConfigs}
      players={players}
      teams={teams}
      matches={matches}
      createTeam={createTeam}
      updateTeam={updateTeam}
      deleteTeam={deleteTeam}
      assignPlayerToTeam={assignPlayerToTeam}
      removePlayerFromTeam={removePlayerFromTeam}
      getRegisteredPlayers={getRegisteredPlayers}
    />
  )
}

function EquiposInner({
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
}) {
  const navigate = useNavigate()

  // Juego seleccionado.
  const [selectedGameId, setSelectedGameId] = useState(gameConfigs[0].id)

  // Buscador de jugadores inscritos.
  const [search, setSearch] = useState("")

  // Jugadores seleccionados para crear un equipo.
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([])

  // Nombre del equipo nuevo.
  const [teamName, setTeamName] = useState("Equipo Alpha")

  // Estados visuales para evitar doble click.
  const [saving, setSaving] = useState(false)
  const [movingPlayerId, setMovingPlayerId] = useState(null)
  const [deletingTeamId, setDeletingTeamId] = useState(null)

  // Estado local para renombrar equipos sin hacer PATCH en cada tecla.
  const [editingNames, setEditingNames] = useState({})

  // =====================================================
  // DATOS DERIVADOS
  // =====================================================

  const selectedGame =
    gameConfigs.find((game) => game.id === selectedGameId) ?? gameConfigs[0]

  const gameTeams = teams.filter((team) => team.gameId === selectedGameId)

  const activeTeams = gameTeams.filter((team) => team.status === "Activo")

  // Diccionario de jugadores por ID.
  // Ejemplo: { "u-12": { id:"u-12", username:"Mario788" } }
  const playersById = useMemo(() => {
    return Object.fromEntries(players.map((player) => [player.id, player]))
  }, [players])

  // Jugadores que ya están ocupados en un equipo activo del mismo juego.
  const busyPlayerIds = useMemo(() => {
    return new Set(activeTeams.flatMap((team) => team.playerIds ?? []))
  }, [activeTeams])

  // Jugadores inscritos al juego seleccionado.
  const registeredPlayers = getRegisteredPlayers(selectedGameId)

  // Lista filtrada por buscador.
  const filteredPlayers = registeredPlayers.filter((player) =>
    `${player.name} ${player.username}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // Jugadores disponibles para mover/agregar.
  const availablePlayers = registeredPlayers.filter(
    (player) => !busyPlayerIds.has(player.id)
  )

  // Partidas activas o pendientes del juego.
  const activeMatches = matches.filter(
    (match) =>
      match.gameId === selectedGameId &&
      ["Pendiente", "En preparación", "En curso"].includes(match.status)
  )

  // =====================================================
  // CAMBIAR JUEGO
  // =====================================================

  const handleSelectGame = (gameId) => {
    setSelectedGameId(gameId)
    setSelectedPlayerIds([])
    setSearch("")
    setTeamName("Equipo Alpha")
  }

  // =====================================================
  // SELECCIONAR JUGADORES
  // =====================================================
  //
  // Si el jugador ya está en un equipo activo, no se puede seleccionar.
  const togglePlayer = (playerId) => {
    if (busyPlayerIds.has(playerId)) return

    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    )
  }

  // =====================================================
  // CREAR EQUIPO
  // =====================================================
  //
  // Validamos desde frontend antes de llamar al backend.
  // El backend también valida, pero así evitamos errores 400 innecesarios.
  const handleCreateTeam = async (event) => {
    event.preventDefault()

    if (!teamName.trim()) {
      alert("Escribe un nombre para el equipo.")
      return
    }

    if (selectedPlayerIds.length === 0) {
      alert("Selecciona al menos un jugador inscrito.")
      return
    }

    setSaving(true)

    try {
      const ok = await createTeam({
        name: teamName.trim(),
        tag: teamName.trim().slice(0, 3).toUpperCase(),
        gameId: selectedGameId,
        playerIds: selectedPlayerIds,
      })

      if (ok) {
        setTeamName("Equipo Alpha")
        setSelectedPlayerIds([])
        alert("Equipo creado correctamente.")
      } else {
        alert("No se pudo crear el equipo. Revisa la consola.")
      }
    } finally {
      setSaving(false)
    }
  }

  // =====================================================
  // RENOMBRAR EQUIPO
  // =====================================================
  //
  // Antes el input hacía PATCH en cada tecla.
  // Ahora solo guardamos al perder foco o presionar Enter.
  const handleTeamNameChange = (teamId, value) => {
    setEditingNames((prev) => ({
      ...prev,
      [teamId]: value,
    }))
  }

  const saveTeamName = async (team) => {
    const nextName = editingNames[team.id]?.trim()

    // Si no hubo cambio real, no hacemos petición.
    if (!nextName || nextName === team.name) {
      return
    }

    const ok = await updateTeam(team.id, { name: nextName })

    if (!ok) {
      alert("No se pudo renombrar el equipo.")
    }
  }

  // =====================================================
  // MOVER JUGADOR A EQUIPO EXISTENTE
  // =====================================================

  const movePlayer = async (teamId, playerId) => {
    setMovingPlayerId(playerId)

    try {
      const ok = await assignPlayerToTeam(teamId, playerId)

      if (ok) {
        setSelectedPlayerIds((prev) =>
          prev.filter((id) => id !== playerId)
        )
      } else {
        alert("No se pudo agregar el jugador al equipo.")
      }
    } finally {
      setMovingPlayerId(null)
    }
  }

  // =====================================================
  // QUITAR JUGADOR DE EQUIPO
  // =====================================================

  const handleRemovePlayer = async (teamId, playerId) => {
    const ok = await removePlayerFromTeam(teamId, playerId)

    if (!ok) {
      alert("No se pudo quitar el jugador del equipo.")
    }
  }

  // =====================================================
  // ELIMINAR EQUIPO
  // =====================================================

  const handleDeleteTeam = async (team) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar el equipo "${team.name}"?`
    )

    if (!confirmed) return

    setDeletingTeamId(team.id)

    try {
      const ok = await deleteTeam(team.id)

      if (!ok) {
        alert("No se pudo eliminar el equipo.")
      }
    } finally {
      setDeletingTeamId(null)
    }
  }

  return (
    <div className="admin-page teams-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Gestión por juego</span>
          <h2>Equipos temporales desde inscritos</h2>
          <p>
            Selecciona un juego, revisa sus inscritos y arma equipos temporales
            para usarlos después en una partida.
          </p>
        </div>
      </div>

      {/* Selector de juego */}
      <div className="game-switcher">
        {gameConfigs.map((game) => (
          <button
            className={game.id === selectedGameId ? "active" : ""}
            key={game.id}
            onClick={() => handleSelectGame(game.id)}
            style={{ "--accent": game.accent }}
          >
            <img src={game.image} alt={game.name} />
            <span>{game.name}</span>
          </button>
        ))}
      </div>

      {/* Resumen del juego seleccionado */}
      <section
        className="panel-card enrollment-admin-hero"
        style={{ "--accent": selectedGame.accent }}
      >
        <div>
          <span className="eyebrow">{selectedGame.status}</span>
          <h3>{selectedGame.name}</h3>
          <p>
            {selectedGame.format} · {selectedGame.teamSize} · equipos no
            permanentes para partidas, rondas o fases específicas.
          </p>
        </div>

        <div className="availability-strip compact">
          <div>
            <strong>{registeredPlayers.length}</strong>
            <span>Inscritos</span>
          </div>

          <div>
            <strong>{availablePlayers.length}</strong>
            <span>Disponibles</span>
          </div>

          <div>
            <strong>{activeTeams.length}</strong>
            <span>Equipos activos</span>
          </div>

          <div>
            <strong>{activeMatches.length}</strong>
            <span>Partidas abiertas</span>
          </div>
        </div>
      </section>

      <div className="team-builder-layout">
        {/* Jugadores inscritos */}
        <section className="panel-card registered-panel">
          <div className="section-title">
            <div>
              <span className="eyebrow">Jugadores inscritos</span>
              <h3>{selectedGame.name}</h3>
            </div>

            <Search size={20} />
          </div>

          <label className="search-box">
            Buscar por nombre o username
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ej. Mario, ana_dev..."
            />
          </label>

          <div className="registered-admin-list">
            {filteredPlayers.map((player) => {
              const isBusy = busyPlayerIds.has(player.id)
              const isSelected = selectedPlayerIds.includes(player.id)

              return (
                <button
                  key={player.id}
                  type="button"
                  className={`${isBusy ? "busy" : ""} ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => togglePlayer(player.id)}
                >
                  <strong>{player.name}</strong>

                  <span>
                    @{player.username} · {player.registrationStatus}
                  </span>

                  <em>
                    {isBusy
                      ? "En equipo"
                      : isSelected
                        ? "Seleccionado"
                        : "Disponible"}
                  </em>
                </button>
              )
            })}

            {filteredPlayers.length === 0 && (
              <p>No hay jugadores inscritos en este juego.</p>
            )}
          </div>
        </section>

        {/* Crear equipo desde selección */}
        <section className="panel-card create-from-selection">
          <div className="section-title">
            <div>
              <span className="eyebrow">+ Crear equipo</span>
              <h3>Desde selección actual</h3>
            </div>

            <Plus size={20} />
          </div>

          <form className="team-form" onSubmit={handleCreateTeam}>
            <label>
              Nombre operativo
              <input
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="Equipo Alpha"
              />
            </label>

            <div className="selection-preview">
              {selectedPlayerIds.map((playerId) => (
                <span key={playerId}>
                  {playersById[playerId]?.name ?? playerId}
                </span>
              ))}

              {selectedPlayerIds.length === 0 && (
                <p>Selecciona jugadores disponibles desde la lista del juego.</p>
              )}
            </div>

            <button
              className="primary-btn"
              disabled={saving || selectedPlayerIds.length === 0}
            >
              {saving ? "Creando..." : "Crear equipo temporal"}
            </button>
          </form>
        </section>
      </div>

      {/* Equipos creados */}
      <section className="team-grid">
        {gameTeams.map((team) => {
          const currentName = editingNames[team.id] ?? team.name

          return (
            <article className="panel-card team-card" key={team.id}>
              <header>
                <div className="team-avatar">{team.tag}</div>

                <div>
                  <input
                    value={currentName}
                    onChange={(event) =>
                      handleTeamNameChange(team.id, event.target.value)
                    }
                    onBlur={() => saveTeamName(team)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.currentTarget.blur()
                      }
                    }}
                  />

                  <span>
                    {team.type} · {team.status} · {selectedGame.shortName}
                  </span>
                </div>

                <button
                  className="danger-btn"
                  onClick={() => handleDeleteTeam(team)}
                  disabled={deletingTeamId === team.id}
                  title="Eliminar equipo"
                >
                  <Trash2 size={16} />
                </button>
              </header>

              {/* Agregar jugadores disponibles al equipo */}
              <div className="quick-move-list">
                {availablePlayers.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => movePlayer(team.id, player.id)}
                    disabled={movingPlayerId === player.id}
                  >
                    <UserPlus size={13} />
                    {player.username}
                  </button>
                ))}

                {availablePlayers.length === 0 && (
                  <p>No hay jugadores disponibles para agregar.</p>
                )}
              </div>

              {/* Roster del equipo */}
              <div className="roster-list">
                {(team.playerIds ?? []).map((playerId) => (
                  <div key={playerId}>
                    <strong>{playersById[playerId]?.name ?? "Jugador"}</strong>

                    <span>
                      @{playersById[playerId]?.username ?? "sin_usuario"}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(team.id, playerId)}
                    >
                      <UserMinus size={14} />
                    </button>
                  </div>
                ))}

                {(team.playerIds ?? []).length === 0 && (
                  <p>Sin jugadores asignados.</p>
                )}
              </div>

              <button
                className="ghost-btn start-match-hint"
                onClick={() => navigate("/admin/partidas")}
              >
                <Play size={15} />
                Usar en Partidas → Crear partida
              </button>
            </article>
          )
        })}

        {gameTeams.length === 0 && (
          <p>No hay equipos para este juego todavía.</p>
        )}
      </section>
    </div>
  )
}