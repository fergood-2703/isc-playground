// =====================================================
// DASHBOARD > JUEGOS
// =====================================================
//
// Esta vista permite al admin:
// - Ver juegos existentes.
// - Crear juegos nuevos.
// - Editar juegos.
// - Activar/desactivar juegos.
// - Eliminar juegos.
//
// Antes esta pantalla tenía varios riesgos:
// - Se rompía si gameConfigs todavía estaba vacío.
// - No mandaba legacyId correctamente.
// - Mandaba campos del formulario que Prisma no conoce.
// - No separaba bien datos visuales del payload real del backend.

import { useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  Pencil,
  Plus,
  Power,
  Save,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { useApp } from "../../../context/AppContext";
import "./Juegos.css";

// =====================================================
// FORMULARIO VACÍO
// =====================================================
//
// Este objeto representa el estado inicial del formulario.
const emptyGame = {
  id: "",
  legacyId: "",
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
};

// =====================================================
// SLUGIFY
// =====================================================
//
// Convierte un nombre como:
// Counter Strike 1.6
//
// En:
// counter-strike-1-6
//
// Esto se usa para crear el id del juego.
const slugify = (value) => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// =====================================================
// PARSEAR LÍNEAS
// =====================================================
//
// Convierte un textarea multilinea en array.
// Ejemplo:
// kills:Kills
// deaths:Muertes
const parseLines = (value, mapper) => {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(mapper);
};

// =====================================================
// GAME → FORM
// =====================================================
//
// Convierte un juego recibido del backend al formato del formulario.
const toForm = (game) => {
  if (!game) {
    return emptyGame;
  }

  return {
    id: game.id ?? "",
    legacyId: game.legacyId ?? "",
    name: game.name ?? "",
    shortName: game.shortName ?? "",
    image: game.image ?? "",
    accent: game.accent ?? "#06b6d4",
    teamSize: game.teamSize ?? "",
    duration: game.duration ?? "",
    format: game.format ?? "",
    status: game.status ?? "Activo",
    description: game.description ?? "",
    pointFormula: game.pointFormula ?? "",
    maxPlayers: game.maxPlayers ?? game.teamSize ?? "",
    matchType: game.matchType ?? game.format ?? "",

    // Los textos del formulario se arman desde arrays del backend.
    rulesText: game.scoringRules?.map((rule) => rule.label).join("\n") ?? "",

    metricsText:
      game.metrics
        ?.map((metric) => `${metric.key}:${metric.label}`)
        .join("\n") ?? "",

    mapsText: game.maps?.join("\n") ?? "",
  };
};

// =====================================================
// FORM → PAYLOAD BACKEND
// =====================================================
//
// Convierte el formulario visual en un objeto limpio para la API.
//
// Importante:
// NO mandamos rulesText, metricsText ni mapsText al backend.
// Esos campos solo existen en el frontend.
const buildPayload = (form, defaultLegacyId) => {
  const generatedId = form.id || slugify(form.name);

  const scoringRules = parseLines(form.rulesText, (label, index) => ({
    key: `rule-${index + 1}`,
    label,
    direction: "desc",
  }));

  const metrics = parseLines(form.metricsText, (line) => {
    const [rawKey, rawLabel] = line.split(":");

    const key = slugify(rawKey || rawLabel || "metric");
    const label = (rawLabel || rawKey || "Métrica").trim();

    return {
      key,
      label,
      type: "number",
      defaultValue: 0,
    };
  });

  const maps = parseLines(form.mapsText, (line) => line);

  return {
    id: generatedId,
    legacyId: Number(form.legacyId || defaultLegacyId),
    name: form.name.trim(),
    shortName: form.shortName.trim() || form.name.trim(),
    image: form.image.trim(),
    accent: form.accent,
    teamSize: form.teamSize.trim(),
    duration: form.duration.trim(),
    format: form.format.trim(),
    status: form.status,
    description: form.description.trim(),
    pointFormula: form.pointFormula.trim(),
    maxPlayers: String(form.maxPlayers).trim(),
    matchType: form.matchType.trim(),
    maps,
    visualMetrics: metrics.map((metric) => metric.key).slice(0, 4),
    scoringRules,
    metrics,
    winCondition: `Gana el jugador con mejor rendimiento según: ${form.pointFormula}.`,
  };
};

export default function Juegos() {
  const {
    gameConfigs,
    matches,
    createGame,
    updateGame,
    deleteGame,
    toggleGameStatus,
  } = useApp();

  // Juego seleccionado en la lista lateral.
  const [selectedId, setSelectedId] = useState(null);

  // Estado del formulario.
  const [form, setForm] = useState(emptyGame);

  // Estado visual para saber si se está guardando.
  const [saving, setSaving] = useState(false);

  // =====================================================
  // CALCULAR SIGUIENTE LEGACY ID
  // =====================================================
  //
  // Si existen juegos con legacyId 1, 2, 3,
  // el siguiente será 4.
  const nextLegacyId = useMemo(() => {
    const maxLegacyId = gameConfigs.reduce((max, game) => {
      return Math.max(max, Number(game.legacyId) || 0);
    }, 0);

    return maxLegacyId + 1;
  }, [gameConfigs]);

  // Juego seleccionado actual.
  const selectedGame = useMemo(() => {
    return gameConfigs.find((game) => game.id === selectedId) ?? null;
  }, [gameConfigs, selectedId]);

  // =====================================================
  // SELECCIÓN AUTOMÁTICA
  // =====================================================
  //
  // Cuando los juegos cargan desde backend, seleccionamos
  // automáticamente el primero.
  //
  // También evita errores si se elimina el juego seleccionado.
  useEffect(() => {
    if (selectedId === "new") return;

    const selectedStillExists = gameConfigs.some(
      (game) => game.id === selectedId,
    );

    if (gameConfigs.length > 0 && !selectedStillExists) {
      setSelectedId(gameConfigs[0].id);
      setForm(toForm(gameConfigs[0]));
    }

    if (gameConfigs.length === 0) {
      setSelectedId("new");
      setForm({
        ...emptyGame,
        legacyId: nextLegacyId,
      });
    }
  }, [gameConfigs, nextLegacyId, selectedId]);

  // =====================================================
  // USO DE JUEGOS EN PARTIDAS
  // =====================================================
  //
  // Esto muestra cuántas partidas hay por juego.
  const gameUsage = useMemo(() => {
    return Object.fromEntries(
      gameConfigs.map((game) => [
        game.id,
        matches.filter((match) => match.gameId === game.id).length,
      ]),
    );
  }, [gameConfigs, matches]);

  // Seleccionar un juego existente.
  const selectGame = (game) => {
    setSelectedId(game.id);
    setForm(toForm(game));
  };

  // Iniciar creación de juego nuevo.
  const startNew = () => {
    setSelectedId("new");
    setForm({
      ...emptyGame,
      legacyId: nextLegacyId,
    });
  };

  // =====================================================
  // GUARDAR FORMULARIO
  // =====================================================
  //
  // Si selectedId === "new", hacemos POST /api/games.
  // Si selectedId es un id real, hacemos PATCH /api/games/:id.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("El nombre del juego es obligatorio");
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload(form, nextLegacyId);

      let ok = false;

      if (selectedId === "new") {
        ok = await createGame(payload);
      } else {
        // En edición no permitimos cambiar id ni legacyId,
        // porque pueden romper relaciones existentes.
        const { id, legacyId, ...updates } = payload;

        ok = await updateGame(selectedId, updates);
      }

      if (ok) {
        alert("Juego guardado correctamente");
      } else {
        alert("No se pudo guardar el juego. Revisa la consola.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // ELIMINAR JUEGO
  // =====================================================
  //
  // Confirmamos antes porque borrar un juego también puede
  // borrar inscripciones, equipos, partidas y rankings relacionados.
  const handleDelete = async () => {
    if (!selectedGame) return;

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${selectedGame.name}"? Esta acción puede borrar datos relacionados.`,
    );

    if (!confirmed) return;

    await deleteGame(selectedGame.id);
  };

  return (
    <div className="admin-page games-catalog">
      <div className="page-head">
        <div>
          <span className="eyebrow">Juegos permanentes</span>
          <h2>Catálogo gamer de la plataforma</h2>
          <p>
            Administra juegos base como Bomb Squad, Counter Strike, Soul Knight
            y futuros títulos. Las partidas temporales viven en una sección
            separada.
          </p>
        </div>

        <button className="primary-btn premium-action" onClick={startNew}>
          <Plus size={18} />
          Crear juego
        </button>
      </div>

      <section className="catalog-grid">
        {/* LISTA DE JUEGOS */}
        <div className="game-library">
          {gameConfigs.map((game) => (
            <article
              key={game.id}
              className={`library-card ${
                selectedId === game.id ? "active" : ""
              }`}
              onClick={() => selectGame(game)}
              style={{ "--accent": game.accent }}
            >
              <img src={game.image} alt={game.name} />

              <div>
                <span>{game.status}</span>
                <h3>{game.name}</h3>
                <p>
                  {game.format} · {game.teamSize}
                </p>
              </div>

              <strong>{gameUsage[game.id] ?? 0} partidas</strong>
            </article>
          ))}
        </div>

        {/* FORMULARIO DE EDICIÓN / CREACIÓN */}
        <form
          className="panel-card catalog-editor"
          onSubmit={handleSubmit}
          style={{ "--accent": form.accent }}
        >
          <div className="editor-head">
            <div>
              <span className="eyebrow">
                {selectedId === "new" ? "Nuevo juego" : "Editar juego"}
              </span>

              <h3>{form.name || "Juego sin nombre"}</h3>
            </div>

            <div className="editor-actions">
              {selectedGame && selectedId !== "new" && (
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => toggleGameStatus(selectedId)}
                >
                  <Power size={16} />
                  Activar/desactivar
                </button>
              )}

              {selectedGame && selectedId !== "new" && (
                <button
                  type="button"
                  className="danger-btn"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              )}
            </div>
          </div>

          <div className="banner-drop">
            {form.image ? (
              <img src={form.image} alt="Banner del juego" />
            ) : (
              <ImagePlus size={34} />
            )}

            <div>
              <strong>Imagen / banner</strong>
              <span>URL o asset importado del juego permanente.</span>
            </div>
          </div>

          <div className="editor-fields">
            <label>
              ID / slug
              <input
                value={form.id}
                disabled={selectedId !== "new"}
                placeholder="counter-strike-16"
                onChange={(event) =>
                  setForm({
                    ...form,
                    id: slugify(event.target.value),
                  })
                }
              />
            </label>

            <label>
              Legacy ID
              <input
                value={form.legacyId}
                disabled={selectedId !== "new"}
                placeholder="4"
                onChange={(event) =>
                  setForm({
                    ...form,
                    legacyId: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Nombre
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                    id:
                      selectedId === "new"
                        ? slugify(event.target.value)
                        : form.id,
                  })
                }
              />
            </label>

            <label>
              Short name
              <input
                value={form.shortName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    shortName: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Banner URL
              <input
                value={form.image}
                onChange={(event) =>
                  setForm({
                    ...form,
                    image: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Color neon
              <input
                type="color"
                value={form.accent}
                onChange={(event) =>
                  setForm({
                    ...form,
                    accent: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Jugadores máximos
              <input
                value={form.maxPlayers}
                onChange={(event) =>
                  setForm({
                    ...form,
                    maxPlayers: event.target.value,
                    teamSize: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Tipo de partida
              <input
                value={form.matchType}
                onChange={(event) =>
                  setForm({
                    ...form,
                    matchType: event.target.value,
                    format: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Duración
              <input
                value={form.duration}
                onChange={(event) =>
                  setForm({
                    ...form,
                    duration: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Estado
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value,
                  })
                }
              >
                <option>Activo</option>
                <option>Desactivado</option>
                <option>En bracket</option>
                <option>Clasificatorio</option>
              </select>
            </label>
          </div>

          <label>
            Descripción
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
            />
          </label>

          <label>
            Sistema de puntuación
            <input
              value={form.pointFormula}
              onChange={(event) =>
                setForm({
                  ...form,
                  pointFormula: event.target.value,
                })
              }
            />
          </label>

          <div className="editor-fields advanced">
            <label>
              <SlidersHorizontal size={15} />
              Reglas
              <textarea
                value={form.rulesText}
                onChange={(event) =>
                  setForm({
                    ...form,
                    rulesText: event.target.value,
                  })
                }
              />
            </label>

            <label>
              <Pencil size={15} />
              Métricas key:label
              <textarea
                value={form.metricsText}
                onChange={(event) =>
                  setForm({
                    ...form,
                    metricsText: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Mapas / modos
              <textarea
                value={form.mapsText}
                onChange={(event) =>
                  setForm({
                    ...form,
                    mapsText: event.target.value,
                  })
                }
              />
            </label>
          </div>

          <button className="primary-btn premium-action" disabled={saving}>
            <Save size={18} />
            {saving ? "Guardando..." : "Guardar juego permanente"}
          </button>
        </form>
      </section>
    </div>
  );
}
