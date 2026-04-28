import cs from "../assets/images/juegos/cs.jpg";
import bombsquad from "../assets/images/juegos/bombsquad.jpg";
import soulknight from "../assets/images/juegos/soulknight.jpg";

export const games = [
  {
    id: 1,
    nombre: "Counter Strike",
    jugadores: 11,
    desc: "FPS táctico por equipos",
    img: cs,
    color: "#7c4dff",
    tags: ["PC", "5v5", "Competitivo"],
  },
  {
    id: 2,
    nombre: "BombSquad",
    jugadores: 10,
    desc: "Acción caótica con bombas",
    img: bombsquad,
    color: "#06b6d4",
    tags: ["Móvil", "Party", "Rápido"],
  },
  {
    id: 3,
    nombre: "Soul Knight",
    jugadores: 8,
    desc: "Roguelike de mazmorras",
    img: soulknight,
    color: "#22c55e",
    tags: ["Móvil", "Co-op", "Roguelike"],
  },
];
