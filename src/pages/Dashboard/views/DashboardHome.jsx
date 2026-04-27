import "./DashboardHome.css";

export default function DashboardHome() {
  return (
    <div className="dashboard-home">

      <h2>Dashboard</h2>

      {/* STATS */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Usuarios</h3>
          <p>24</p>
        </div>

        <div className="stat-card">
          <h3>Equipos</h3>
          <p>6</p>
        </div>

        <div className="stat-card">
          <h3>Juegos</h3>
          <p>4</p>
        </div>

        <div className="stat-card highlight">
          <h3>Top Player</h3>
          <p>Fernando 🏆</p>
        </div>

      </div>

      {/* ACCIONES */}
      <div className="quick-actions">

        <button>+ Crear juego</button>
        <button>+ Crear equipo</button>
        <button>+ Agregar puntos</button>

      </div>

    </div>
  );
}