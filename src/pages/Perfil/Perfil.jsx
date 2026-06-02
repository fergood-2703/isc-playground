// =====================================================
// PÁGINA: PERFIL
// =====================================================
//
// Esta pantalla muestra:
// - Datos del usuario logueado.
// - Configuración rápida de nombre y username.
// - Juegos inscritos.
// - Estadísticas globales.
// - Historial de partidas.
//
// Cambio importante:
// Antes la edición del perfil era local.
// Ahora usa updateProfile(), que hace PATCH /api/users/:id.

import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { useApp } from "../../context/AppContext";
import "./Perfil.css";

const trophies = ["MVP Neon", "Boss Hunter", "Clutch 1v3", "Top 3 Global"];

export default function Perfil() {
  const {
    currentUser,
    updateProfile,
    players,
    gameConfigs,
    rankingsByGame,
    globalLeaderboard,
    matches,
    registrations,
    cancelRegistration,
  } = useApp();

  // =====================================================
  // USUARIO SEGURO
  // =====================================================
  //
  // /perfil ya está protegido en App.jsx.
  // Aun así, usamos fallback para evitar errores mientras carga.
  const safeUser = currentUser ?? {
    id: "",
    name: "Invitado",
    username: "guest",
    role: "usuario",
  };

  // Formulario local del perfil.
  const [profile, setProfile] = useState({
    username: safeUser.username ?? "",
    name: safeUser.name ?? "",
    password: "",
  });

  // Estado visual para evitar doble click al guardar.
  const [saving, setSaving] = useState(false);

  // Cuando currentUser cambie, sincronizamos el formulario.
  useEffect(() => {
    setProfile({
      username: safeUser.username ?? "",
      name: safeUser.name ?? "",
      password: "",
    });
  }, [safeUser.id, safeUser.name, safeUser.username]);

  // =====================================================
  // DATOS DERIVADOS
  // =====================================================

  // Buscamos al jugador en la lista global.
  // Si no existe todavía, usamos currentUser.
  const player = players.find((item) => item.id === safeUser.id) ?? safeUser;

  // Estadísticas globales del usuario.
  const globalStats = useMemo(() => {
    return globalLeaderboard.find((row) => row.player?.id === player.id);
  }, [globalLeaderboard, player.id]);

  // Posición global.
  const globalRank = useMemo(() => {
    const index = globalLeaderboard.findIndex(
      (row) => row.player?.id === player.id,
    );

    return index >= 0 ? index + 1 : null;
  }, [globalLeaderboard, player.id]);

  // Historial de partidas donde aparece el usuario.
  const history = matches.filter((match) =>
    match.playerIds?.includes(player.id),
  );

  // Inscripciones del usuario actual.
  const userRegistrations = registrations.filter(
    (registration) => registration.userId === player.id,
  );

  // =====================================================
  // GUARDAR PERFIL
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!profile.name.trim() || !profile.username.trim()) {
      alert("Nombre y username son obligatorios.");
      return;
    }

    setSaving(true);

    try {
      const ok = await updateProfile({
        name: profile.name,
        username: profile.username,
      });

      if (ok) {
        setProfile((prev) => ({
          ...prev,
          password: "",
        }));

        alert("Perfil actualizado correctamente.");
      } else {
        alert("No se pudo actualizar el perfil. Revisa la consola.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCELAR INSCRIPCIÓN
  // =====================================================

  const handleCancelRegistration = async (gameId) => {
    const confirmed = window.confirm(
      "¿Seguro que quieres cancelar tu inscripción a este juego?",
    );

    if (!confirmed) return;

    const result = await cancelRegistration(gameId, player.id);

    if (!result.ok) {
      alert(result.message || "No se pudo cancelar la inscripción.");
    }
  };

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-container">
        {/* HERO DEL PERFIL */}
        <section className="profile-hero">
          <div className="profile-avatar">
            {safeUser.username?.slice(0, 2).toUpperCase() ?? "GG"}
          </div>

          <div className="profile-identity">
            <p>PERFIL DEL JUGADOR</p>

            <h1>{safeUser.name}</h1>

            <span>
              @{safeUser.username} · Ranking global #{globalRank ?? "—"}
            </span>
          </div>

          <div className="profile-rank">
            <strong>{Math.round(globalStats?.score ?? 0)}</strong>
            <span>power score</span>
          </div>
        </section>

        {/* CONFIGURACIÓN + ESTADÍSTICAS */}
        <section className="profile-grid">
          <form className="profile-panel" onSubmit={handleSubmit}>
            <h2>Configuración rápida</h2>

            <label>
              Nombre visible
              <input
                value={profile.name}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    name: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Username
              <input
                value={profile.username}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    username: event.target.value,
                  })
                }
              />
            </label>

            {/* 
              Todavía no conectamos cambio de contraseña.
              Lo dejamos deshabilitado para no confundir.
            */}
            <label>
              Nueva contraseña
              <input
                type="password"
                value={profile.password}
                disabled
                placeholder="Pendiente de implementar"
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    password: event.target.value,
                  })
                }
              />
            </label>

            <button disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>

          <section className="profile-panel stats-panel">
            <h2>Rendimiento competitivo</h2>

            <div className="profile-stats">
              <div>
                <strong>{globalStats?.matchesPlayed ?? 0}</strong>
                <span>Partidas</span>
              </div>

              <div>
                <strong>{globalStats?.wins ?? 0}</strong>
                <span>Victorias</span>
              </div>

              <div>
                <strong>{globalStats?.kills ?? 0}</strong>
                <span>Kills</span>
              </div>

              <div>
                <strong>{globalStats?.damage ?? 0}</strong>
                <span>Daño</span>
              </div>

              <div>
                <strong>{globalStats?.bossesDefeated ?? 0}</strong>
                <span>Bosses</span>
              </div>

              <div>
                <strong>
                  {Math.round(
                    ((globalStats?.wins ?? 0) * 100) /
                      Math.max(globalStats?.matchesPlayed ?? 1, 1),
                  )}
                  %
                </strong>
                <span>Win rate</span>
              </div>
            </div>
          </section>
        </section>

        {/* JUEGOS INSCRITOS */}
        <section className="profile-panel">
          <h2>Juegos inscritos</h2>

          <div className="profile-games">
            {userRegistrations.length === 0 && (
              <p>Todavía no estás inscrito en ningún juego.</p>
            )}

            {userRegistrations.map((registration) => {
              const game = gameConfigs.find(
                (item) => item.id === registration.gameId,
              );

              const row = rankingsByGame[registration.gameId]?.find(
                (item) => item.player?.id === player.id,
              );

              if (!game) return null;

              return (
                <article
                  key={registration.id}
                  style={{ "--accent": game.accent }}
                >
                  {game.image && <img src={game.image} alt={game.name} />}

                  <div>
                    <strong>{game.shortName}</strong>

                    <span>
                      {registration.status} ·{" "}
                      {row
                        ? `Ranking #${row.rank} · ${
                            row.totalPoints ?? row.score ?? 0
                          } pts`
                        : "sin partidas"}
                    </span>
                  </div>

                  {registration.status !== "en torneo" && (
                    <button
                      type="button"
                      onClick={() => handleCancelRegistration(game.id)}
                    >
                      Cancelar
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* HISTORIAL + TROFEOS */}
        <section className="profile-grid lower">
          <section className="profile-panel">
            <h2>Historial reciente</h2>

            <div className="profile-history">
              {history.length === 0 && (
                <p>No tienes partidas registradas todavía.</p>
              )}

              {history.map((match) => {
                const game = gameConfigs.find(
                  (item) => item.id === match.gameId,
                );

                return (
                  <article key={match.id}>
                    <strong>{game?.name ?? "Juego no encontrado"}</strong>
                    <span>
                      {match.phaseType} · {match.stage}
                    </span>
                    <em>{match.status}</em>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="profile-panel trophy-panel">
            <h2>Logros / trofeos</h2>

            <div className="trophy-grid">
              {trophies.map((trophy) => (
                <div key={trophy}>
                  <span>◆</span>
                  <strong>{trophy}</strong>
                  <small>Desbloqueado</small>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
