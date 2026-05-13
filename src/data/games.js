import { gameConfigs } from "./tournament";

export const games = gameConfigs.map((game) => ({
  id: game.legacyId,
  slug: game.id,
  nombre: game.name,
  jugadores: game.teamSize,
  desc: game.description,
  img: game.image,
  color: game.accent,
  tags: [game.format, game.teamSize, game.status],
}));

export { gameConfigs };
