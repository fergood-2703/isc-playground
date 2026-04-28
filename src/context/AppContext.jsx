import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: "Fernando", puntos: 0 },
    { id: 2, nombre: "Ana", puntos: 0 },
  ]);

  const [equipos, setEquipos] = useState([]);

  const [juegos, setJuegos] = useState([]);

  // 🔥 agregar puntos
  const agregarPuntos = (userId, puntos) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, puntos: u.puntos + puntos } : u
      )
    );
  };

  // 🔥 crear equipo
  const crearEquipo = (nombre) => {
    setEquipos((prev) => [
      ...prev,
      { id: Date.now(), nombre, jugadores: [] },
    ]);
  };

  // 🔥 agregar jugador a equipo
  const agregarJugadorAEquipo = (equipoId, userId) => {
    setEquipos((prev) =>
      prev.map((e) =>
        e.id === equipoId
          ? { ...e, jugadores: [...e.jugadores, userId] }
          : e
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        usuarios,
        equipos,
        juegos,
        agregarPuntos,
        crearEquipo,
        agregarJugadorAEquipo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// hook pro
export const useApp = () => useContext(AppContext);