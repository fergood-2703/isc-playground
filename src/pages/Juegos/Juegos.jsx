import { useMemo, useState } from "react"
import { ImagePlus, Pencil, Plus, Power, Save, SlidersHorizontal, Trash2 } from "lucide-react"
import { useApp } from "../../../context/AppContext"
import "./Juegos.css"

const emptyGame = {
  name: "",
  shortName: "",
  image: "",
  accent: "#06b6d4",
  teamSize: "4 jugadores",
  duration: "Configurable",
  format: "Competitivo",
  status: "Activo",
  description: "",
  pointFormula: "victorias*100 + kills*5",
  maxPlayers: "8",
  matchType: "Equipos temporales",
  rulesText: "Mayor puntuación individual\nFair play obligatorio",
  metricsText: "points:Puntos\nkills:Kills",
  mapsText: "Arena principal",
}

const parseLines = (value, mapper) =>
  value.split("\n").map((line) => line.trim()).filter(Boolean).map(mapper)

const toForm = (game) => ({
  name: game.name,
  shortName: game.shortName,
  image: game.image,
  accent: game.accent,
  teamSize: game.teamSize,
  duration: game.duration,
  format: game.format,
  status: game.status,
  description: game.description,
  pointFormula: game.pointFormula,
  maxPlayers: game.maxPlayers || game.teamSize,
  matchType: game.matchType || game.format,
  rulesText: game.scoringRules?.map((rule) => rule.label).join("\n") || "",
  metricsText: game.metrics?.map((metric) => `${metric.key}:${metric.label}`).join("\n") || "",
  mapsText: game.maps?.join("\n") || "",
})

const buildPayload = (form) => ({
  ...form,
  shortName: form.shortName || form.name,
  scoringRules: parseLines(form.rulesText, (label, index) => ({
    key: `rule-${index + 1}`,
    label,
    direction: "desc",
  })),
  metrics: parseLines(form.metricsText, (line) => {
    const [key, label] = line.split(":")
    return {
      key: (key || label).trim().toLowerCase().replaceAll(" ", "-"),
      label: (label || key).trim(),
      type: "number",
      defaultValue: 0,
    }
  }),
  maps: parseLines(form.mapsText, (line) => line),
  visualMetrics: parseLines(form.metricsText, (line) => line.split(":")[0].trim()).slice(0, 4),
  winCondition: `Gana el jugador con mejor rendimiento según: ${form.pointFormula}.`,
})

export default function Juegos() {
  const { gameConfigs, matches, loading, createGame, updateGame, deleteGame, toggleGameStatus } = useApp()

  if (loading) {
    return <div className="admin-page games-catalog"><p>Cargando juegos...</p></div>
  }

  return <JuegosInner
    gameConfigs={gameConfigs} matches={matches}
    createGame={createGame} updateGame={updateGame}
    deleteGame={deleteGame} toggleGameStatus={toggleGameStatus}
  />
}

function JuegosInner({ gameConfigs, matches, createGame, updateGame, deleteGame, toggleGameStatus }) {
  // Si no hay juegos arrancamos en modo "nuevo"
  const [selectedId, setSelectedId] = useState(gameConfigs[0]?.id ?? "new")
  const [form, setForm] = useState(() => gameConfigs[0] ? toForm(gameConfigs[0]) : emptyGame)

  const selectedGame = gameConfigs.find((game) => game.id === selectedId)

  const gameUsage = useMemo(
    () =>
      Object.fromEntries(
        gameConfigs.map((game) => [
          game.id,
          matches.filter((match) => match.gameId === game.id).length,
        ])
      ),
    [gameConfigs, matches]
  )

  const selectGame = (game) => {
    setSelectedId(game.id)
    setForm(toForm(game))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim()) return
    if (selectedId === "new") {
      createGame(buildPayload({ ...form, id: form.name.toLowerCase().replaceAll(" ", "-") }))
      setSelectedId(form.name.toLowerCase().replaceAll(" ", "-"))
    } else {
      updateGame(selectedId, buildPayload(form))
    }
  }

  const startNew = () => {
    setSelectedId("new")
    setForm(emptyGame)
  }

  return (
    <div className="admin-page games-catalog">
      <div className="page-head">
        <div>
          <span className="eyebrow">Juegos permanentes</span>
          <h2>Catálogo gamer de la plataforma</h2>
          <p>
            Administra juegos base como Bomb Squad, Counter Strike, Soul Knight y futuros títulos.
            Las partidas temporales viven en una sección separada.
          </p>
        </div>
        <button className="primary-btn premium-action" onClick={startNew}>
          <Plus size={18} /> Crear juego
        </button>
      </div>

      <section className="catalog-grid">
        <div className="game-library">
          {gameConfigs.length === 0 && (
            <p>No hay juegos aún. Crea el primero con el botón de arriba.</p>
          )}
          {gameConfigs.map((game) => (
            <article
              key={game.id}
              className={`library-card ${selectedId === game.id ? "active" : ""}`}
              onClick={() => selectGame(game)}
              style={{ "--accent": game.accent }}
            >
              <img src={game.image} alt={game.name} />
              <div>
                <span>{game.status}</span>
                <h3>{game.name}</h3>
                <p>{game.format} · {game.teamSize}</p>
              </div>
              <strong>{gameUsage[game.id]} partidas</strong>
            </article>
          ))}
        </div>

        <form
          className="panel-card catalog-editor"
          onSubmit={handleSubmit}
          style={{ "--accent": form.accent }}
        >
          <div className="editor-head">
            <div>
              <span className="eyebrow">{selectedId === "new" ? "Nuevo juego" : "Editar juego"}</span>
              <h3>{form.name || "Juego sin nombre"}</h3>
            </div>
            <div className="editor-actions">
              {selectedGame && selectedId !== "new" && (
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => toggleGameStatus(selectedId)}
                >
                  <Power size={16} /> Activar/desactivar
                </button>
              )}
              {selectedGame && selectedId !== "new" && (
                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => { deleteGame(selectedId); startNew() }}
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              )}
            </div>
          </div>

          <div className="banner-drop">
            {form.image
              ? <img src={form.image} alt="Banner del juego" />
              : <ImagePlus size={34} />}
            <div>
              <strong>Imagen / banner</strong>
              <span>URL o asset importado del juego permanente.</span>
            </div>
          </div>

          <div className="editor-fields">
            <label>Nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Short name<input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} /></label>
            <label>Banner URL<input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></label>
            <label>Color neon<input type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} /></label>
            <label>Jugadores máximos<input value={form.maxPlayers} onChange={(e) => setForm({ ...form, maxPlayers: e.target.value, teamSize: e.target.value })} /></label>
            <label>Tipo de partida<input value={form.matchType} onChange={(e) => setForm({ ...form, matchType: e.target.value, format: e.target.value })} /></label>
            <label>Duración<input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></label>
            <label>Estado
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Activo</option>
                <option>Desactivado</option>
                <option>En bracket</option>
                <option>Clasificatorio</option>
              </select>
            </label>
          </div>

          <label>Descripción<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label>Sistema de puntuación<input value={form.pointFormula} onChange={(e) => setForm({ ...form, pointFormula: e.target.value })} /></label>

          <div className="editor-fields advanced">
            <label><SlidersHorizontal size={15} /> Reglas<textarea value={form.rulesText} onChange={(e) => setForm({ ...form, rulesText: e.target.value })} /></label>
            <label><Pencil size={15} /> Métricas key:label<textarea value={form.metricsText} onChange={(e) => setForm({ ...form, metricsText: e.target.value })} /></label>
            <label>Mapas / modos<textarea value={form.mapsText} onChange={(e) => setForm({ ...form, mapsText: e.target.value })} /></label>
          </div>

          <button className="primary-btn premium-action">
            <Save size={18} /> Guardar juego permanente
          </button>
        </form>
      </section>
    </div>
  )
}