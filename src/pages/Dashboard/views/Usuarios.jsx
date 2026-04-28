import { useState } from "react";
import "./Usuarios.css";

export default function Usuarios() {


  const [users, setUsers] = useState([
    { id: 1, nombre: "Fernando", username: "fergood", puntos: 120, partidas: 8 },
    { id: 2, nombre: "Carlos", username: "carlitos", puntos: 90, partidas: 6 },
    { id: 3, nombre: "Ana", username: "ana_dev", puntos: 150, partidas: 10 },
  ]);

  const handleAddPoints = (id) => {
    const puntos = prompt("¿Cuántos puntos agregar?");

    if (!puntos || isNaN(puntos)) return;

    setUsers(
      users.map((u) =>
        u.id === id
          ? {
              ...u,
              puntos: u.puntos + Number(puntos),
            }
          : u
      )
    );
  };

  return (
    <div className="users">

      <h2>Jugadores / Ranking</h2>

      {/* TABLA */}
      <div className="table">

        <div className="table-header">
          <span>#</span>
          <span>Nombre</span>
          <span>Username</span>
          <span>Puntos</span>
          <span>Partidas</span>
          <span>Acciones</span>
        </div>

        {users
          .sort((a, b) => b.puntos - a.puntos)
          .map((user, index) => (
            <div className="table-row" key={user.id}>
              <span className="rank">{index + 1}</span>
              <span>{user.nombre}</span>
              <span>@{user.username}</span>
              <span className="points">{user.puntos}</span>
              <span>{user.partidas}</span>

              <div className="actions">
                <button onClick={() => handleAddPoints(user.id)}>
                  + Puntos
                </button>
              </div>
            </div>
          ))}

      </div>

    </div>
  );
}