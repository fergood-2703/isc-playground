// =====================================================
// DASHBOARD > USUARIOS
// =====================================================
//
// Esta vista permite al administrador:
// - Ver usuarios registrados.
// - Buscar por nombre, username, email o rol.
// - Ver estado.
// - Ver inscripciones.
// - Ver ranking global.
// - Ver ranking por juego.
// - Eliminar usuarios.
//
// Importante:
// El botón anterior "DQ" era solo visual.
// Ahora el botón sí llama a DELETE /api/users/:id.

import { useMemo, useState } from "react";
import { Search, Shield, Trash2, Trophy, UserRound } from "lucide-react";

import { useApp } from "../../../context/AppContext";
import "./Usuarios.css";

export default function Usuarios() {
  const {
    currentUser,
    players,
    gameConfigs,
    rankingsByGame,
    globalLeaderboard,
    deleteUser,
  } = useApp();

  // Texto del buscador.
  const [query, setQuery] = useState("");

  // Usuario que se está eliminando.
  const [deletingUserId, setDeletingUserId] = useState(null);

  // =====================================================
  // RANKING GLOBAL POR USUARIO
  // =====================================================

  const globalByPlayerId = useMemo(() => {
    return Object.fromEntries(
      globalLeaderboard.map((row, index) => [
        row.player?.id,
        {
          ...row,
          rank: row.rank ?? index + 1,
        },
      ]),
    );
  }, [globalLeaderboard]);

  // =====================================================
  // JUEGOS POR ID
  // =====================================================

  const gamesById = useMemo(() => {
    return Object.fromEntries(gameConfigs.map((game) => [game.id, game]));
  }, [gameConfigs]);

  // =====================================================
  // FILTRO DE USUARIOS
  // =====================================================

  const filteredPlayers = players.filter((player) => {
    const searchText = `
      ${player.name}
      ${player.username}
      ${player.email}
      ${player.role}
      ${player.status}
    `.toLowerCase();

    return searchText.includes(query.toLowerCase());
  });

  // =====================================================
  // RANKING POR JUEGO
  // =====================================================

  const getGameRanks = (playerId) => {
    const ranks = gameConfigs
      .map((game) => {
        const row = rankingsByGame[game.id]?.find(
          (item) => item.player?.id === playerId,
        );

        return row ? `${game.shortName} #${row.rank}` : null;
      })
      .filter(Boolean);

    return ranks.length > 0 ? ranks.join(" · ") : "Sin ranking";
  };

  // =====================================================
  // INSCRIPCIONES
  // =====================================================

  const getRegisteredGames = (player) => {
    const games = player.games ?? [];

    if (games.length === 0) {
      return "Sin inscripciones";
    }

    return games
      .map((gameId) => gamesById[gameId]?.shortName ?? gameId)
      .join(" · ");
  };

  // =====================================================
  // ELIMINAR USUARIO
  // =====================================================

  const handleDeleteUser = async (player) => {
    if (currentUser?.id === player.id) {
      alert("No puedes eliminar tu propia cuenta administradora.");
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar a @${player.username}? Esta acción también eliminará sus inscripciones, resultados y participación en equipos.`,
    );

    if (!confirmed) return;

    setDeletingUserId(player.id);

    try {
      const result = await deleteUser(player.id);

      if (!result.ok) {
        alert(result.message || "No se pudo eliminar el usuario.");
        return;
      }

      alert("Usuario eliminado correctamente.");
    } finally {
      setDeletingUserId(null);
    }
  };

  // =====================================================
  // KPIS
  // =====================================================

  const activeUsers = players.filter(
    (player) => player.status === "Activo",
  ).length;

  const adminUsers = players.filter((player) => player.role === "admin").length;

  const topUser = globalLeaderboard[0];

  return (
    <div className="admin-page users-admin">
      <div className="page-head">
        <div>
          <span className="eyebrow">Usuarios · control del torneo</span>

          <h2>Jugadores, administradores e inscripciones</h2>

          <p>
            Controla usuarios registrados, revisa sus inscripciones,
            estadísticas globales y elimina cuentas de prueba cuando sea
            necesario.
          </p>
        </div>
      </div>

      {/* TARJETAS RESUMEN */}
      <div className="admin-kpi-grid">
        <section className="panel-card profile-summary">
          <span className="eyebrow">Ranking global</span>

          <h3>Top usuario</h3>

          <div className="summary-grid">
            <div>
              <strong>@{topUser?.player?.username ?? "-"}</strong>
              <span>Líder</span>
            </div>

            <div>
              <strong>{players.length}</strong>
              <span>Usuarios</span>
            </div>

            <div>
              <strong>
                {globalLeaderboard.reduce(
                  (acc, row) => acc + (row.matchesPlayed ?? 0),
                  0,
                )}
              </strong>
              <span>Partidas jugadas</span>
            </div>
          </div>
        </section>

        <section className="panel-card admin-actions-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Estado del sistema</span>
              <h3>Usuarios registrados</h3>
            </div>

            <Trophy size={20} />
          </div>

          <div className="action-chips">
            <span>Activos: {activeUsers}</span>
            <span>Admins: {adminUsers}</span>
            <span>Usuarios: {players.length - adminUsers}</span>
            <span>Juegos: {gameConfigs.length}</span>
          </div>
        </section>
      </div>

      {/* TABLA */}
      <section className="panel-card users-table-card">
        <div className="section-title user-tools">
          <div>
            <span className="eyebrow">Usuarios</span>
            <h3>Control de cuentas y actividad competitiva</h3>
          </div>

          <label className="search-box">
            <Search size={16} />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar nombre, username, email o rol"
            />
          </label>
        </div>

        <table className="modern-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Inscripciones</th>
              <th>Rank global</th>
              <th>Puntos</th>
              <th>Partidas</th>
              <th>Victorias</th>
              <th>Ranking por juego</th>
              <th>Acción admin</th>
            </tr>
          </thead>

          <tbody>
            {filteredPlayers.length === 0 && (
              <tr>
                <td colSpan="10">No se encontraron usuarios.</td>
              </tr>
            )}

            {filteredPlayers.map((player) => {
              const stats = globalByPlayerId[player.id] ?? {};
              const isSelf = currentUser?.id === player.id;

              return (
                <tr key={player.id}>
                  <td>
                    <div className="user-cell">
                      <span className="user-avatar-mini">
                        {player.role === "admin" ? (
                          <Shield size={16} />
                        ) : (
                          <UserRound size={16} />
                        )}
                      </span>

                      <div>
                        <strong>{player.name}</strong>

                        <small>
                          @{player.username}
                          {player.email ? ` · ${player.email}` : ""}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={
                        player.role === "admin"
                          ? "rank-mini admin-role"
                          : "rank-mini"
                      }
                    >
                      {player.role}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        player.status === "Activo"
                          ? "status-pill active"
                          : "status-pill inactive"
                      }
                    >
                      {player.status}
                    </span>
                  </td>

                  <td>{getRegisteredGames(player)}</td>

                  <td>
                    <span className="rank-mini">
                      {stats.rank ? `#${stats.rank}` : "-"}
                    </span>
                  </td>

                  <td>{Math.round(stats.score ?? 0)}</td>
                  <td>{stats.matchesPlayed ?? 0}</td>
                  <td>{stats.wins ?? 0}</td>
                  <td>{getGameRanks(player.id)}</td>

                  <td>
                    <button
                      className="danger-btn"
                      type="button"
                      disabled={isSelf || deletingUserId === player.id}
                      title={
                        isSelf
                          ? "No puedes eliminar tu propia cuenta"
                          : "Eliminar usuario"
                      }
                      onClick={() => handleDeleteUser(player)}
                    >
                      <Trash2 size={14} />
                      {deletingUserId === player.id
                        ? "Eliminando..."
                        : "Eliminar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
