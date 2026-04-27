import { useState } from "react";
import "./Ranking.css";

export default function Ranking() {
  const [players] = useState([
    { id: 1, nombre: "Fernando", puntos: 150 },
    { id: 2, nombre: "Ana", puntos: 130 },
    { id: 3, nombre: "Carlos", puntos: 110 },
    { id: 4, nombre: "Luis", puntos: 90 },
    { id: 5, nombre: "María", puntos: 70 },
  ]);

  const sortedPlayers = [...players].sort((a, b) => b.puntos - a.puntos);

  return (
    <div className="ranking">

      <h2>🏆 Ranking General</h2>

      {/* TOP 3 */}
      <div className="top3">

        {sortedPlayers.slice(0, 3).map((p, i) => (
          <div key={p.id} className={`top-card pos-${i + 1}`}>
            <span className="position">#{i + 1}</span>
            <h3>{p.nombre}</h3>
            <p>{p.puntos} pts</p>
          </div>
        ))}

      </div>

      {/* LISTA */}
      <div className="ranking-list">

        {sortedPlayers.slice(3).map((p, i) => (
          <div className="ranking-row" key={p.id}>
            <span>#{i + 4}</span>
            <span>{p.nombre}</span>
            <span>{p.puntos} pts</span>
          </div>
        ))}

      </div>

    </div>
  );
}