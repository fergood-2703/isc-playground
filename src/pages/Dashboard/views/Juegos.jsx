import { useState } from "react";
import "./Juegos.css";

export default function Juegos() {
  const [games, setGames] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    modo: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddGame = (e) => {
    e.preventDefault();

    if (!form.nombre) return;

    const newGame = {
      id: Date.now(),
      ...form,
    };

    setGames([...games, newGame]);

    setForm({
      nombre: "",
      descripcion: "",
      modo: "",
    });
  };

  const handleDelete = (id) => {
    setGames(games.filter((g) => g.id !== id));
  };

  return (
    <div className="games">

      <h2>Gestión de Juegos</h2>

      {/* FORM */}
      <form className="game-form" onSubmit={handleAddGame}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del juego"
          value={form.nombre}
          onChange={handleChange}
        />

        <input
          type="text"
          name="modo"
          placeholder="Modo (Ej: 1v1, equipos)"
          value={form.modo}
          onChange={handleChange}
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />

        <button type="submit">Agregar Juego</button>
      </form>

      {/* LIST */}
      <div className="game-list">
        {games.length === 0 && <p>No hay juegos aún</p>}

        {games.map((game) => (
          <div className="game-card" key={game.id}>
            <h3>{game.nombre}</h3>
            <p>{game.descripcion}</p>
            <span>{game.modo}</span>

            <div className="actions">
              <button className="delete" onClick={() => handleDelete(game.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}