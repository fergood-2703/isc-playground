// =====================================================
// DETALLES OFICIALES DE LOS JUEGOS
// =====================================================
//
// Esta información viene del front original.
// La mantenemos aquí porque es contenido oficial del torneo,
// no datos operativos.
//
// El backend maneja datos dinámicos:
// - inscritos
// - ranking
// - estado
// - métricas
// - imagen
//
// Este archivo conserva contenido descriptivo:
// - mecánicas
// - modos
// - torneo
// - requisitos
// - reglas

export const officialGameDetails = [
  {
    legacyId: 1,
    slug: "counter-strike-16",
    nombre: "Counter-Strike 1.6",
    jugadores: 20,
    formato: "5vs5",
    dispositivo: "PC/Laptop",

    download: {
      label: "Descargar Counter-Strike 1.6",
      url: "/downloads/counter-strike-16.zip",
      type: "file",
    },

    manuals: [
      {
        title: "Manual oficial de Counter-Strike 1.6",
        url: "/manuales/manual-counter-strike-16.pdf",
      },
    ],

    descripcion:
      "Counter-Strike 1.6 es un videojuego de disparos en primera persona (FPS) táctico por equipos. Enfrenta a dos bandos: Terroristas (T) y Counter-Terrorists (CT), quienes deben cumplir objetivos específicos o eliminar al equipo rival para ganar la ronda. Se caracteriza por su alta exigencia de precisión, manejo estratégico de la economía y la importancia del trabajo en equipo.",
    mecanicas: [
      {
        icon: "💰",
        titulo: "Sistema Económico",
        desc: "Los jugadores ganan dinero al ganar rondas, eliminar enemigos o cumplir objetivos. Se usa para comprar armas, blindaje y granadas al inicio de cada ronda.",
      },
      {
        icon: "🎯",
        titulo: "Precisión y Retroceso",
        desc: "Las armas tienen recoil o retroceso, por lo que los jugadores deben controlar sus ráfagas y quedarse quietos para mejorar la puntería.",
      },
      {
        icon: "🧨",
        titulo: "Equipamiento Táctico",
        desc: "Granadas de humo, flashbang y de daño explosivo. Los CT pueden comprar Defuse Kit para desactivar la bomba más rápido.",
      },
      {
        icon: "👟",
        titulo: "Movimiento y Sonido",
        desc: "El sonido de los pasos es fundamental para detectar enemigos. Caminar lento permite moverse en silencio.",
      },
      {
        icon: "❤️",
        titulo: "Salud No Regenerable",
        desc: "Una vez que pierdes vida, no puedes recuperarla durante la ronda. La supervivencia depende de la estrategia y la cobertura.",
      },
      {
        icon: "🛡️",
        titulo: "Chaleco y Casco",
        desc: "Equipamiento vital para reducir el daño recibido. Recomendados en cada ronda para aumentar la sobrevivencia.",
      },
    ],
    modos: [
      {
        titulo: "Desactivación de Bomba",
        items: [
          "Terroristas: plantar la bomba C4 en sitio A o B y protegerla.",
          "Counter-Terrorists: evitar que planten la bomba o desactivarla.",
          "Gana quien logre su objetivo o elimine a todos los rivales.",
          "Mapas: de_dust2, de_inferno, de_mirage.",
        ],
      },
      {
        titulo: "Rescate de Rehenes",
        items: [
          "CT: escoltar al menos un rehén a la zona de rescate.",
          "Terroristas: evitar que los CT se lleven a los rehenes.",
          "Gana quien rescate a los rehenes o elimine al equipo contrario.",
        ],
      },
    ],
    torneo: {
      modalidad: "Eliminación directa",
      formato: "4 equipos de 5",
      mapas: "de_dust2, de_inferno, de_mirage",
      fases: [
        {
          num: "1",
          titulo: "Fase Clasificatoria",
          desc: "Partidas cortas de 10 rondas. Los ganadores avanzan.",
        },
        {
          num: "2",
          titulo: "Semifinal",
          desc: "Partidas a 15 rondas por bando. Los 2 mejores equipos pasan a la final.",
        },
        {
          num: "3",
          titulo: "Final",
          desc: "El encuentro definitivo a 15 rondas para decidir al campeón.",
        },
      ],
    },
    requisitos: [
      { icon: "💻", texto: "Computadora PC/Laptop" },
      { icon: "🖱️", texto: "Tener mouse" },
      { icon: "🎮", texto: "Counter-Strike 1.6 instalado" },
      { icon: "💾", texto: "Espacio disponible: 300 MB - 400 MB" },
    ],
    reglas: [
      { texto: "Tiempo de ronda: 1:45 o 2:00 minutos", prohibida: false },
      { texto: "Dinero inicial: $800", prohibida: false },
      {
        texto:
          "Fuego amigo: desactivado, activado en la final si así se define.",
        prohibida: false,
      },
      {
        texto:
          "Prohibido: uso de hacks, scripts o trampas como aimbot o wallhack.",
        prohibida: true,
      },
      {
        texto: "Prohibido: insultar o mostrar conducta antideportiva.",
        prohibida: true,
      },
      {
        texto: "Prohibido: aprovechar bugs del mapa para salir de los límites.",
        prohibida: true,
      },
    ],
  },
  {
    legacyId: 2,
    slug: "bomb-squad",
    nombre: "BombSquad",
    jugadores: 10,
    formato: "2-4 por equipo",
    dispositivo: "Teléfono móvil",

    download: {
      label: "Abrir BombSquad en Play Store",
      url: "https://play.google.com/store/apps/details?id=net.froemling.bombsquad",
      type: "external",
    },

    manuals: [
      {
        title: "Manual oficial de BombSquad",
        url: "/manuales/manual-bombsquad.pdf",
      },
    ],

    descripcion:
      "BombSquad es un videojuego multijugador de acción y fiesta donde los jugadores controlan personajes que luchan entre sí utilizando bombas, puñetazos y habilidades en diferentes arenas. Se caracteriza por su estilo caótico, físico tipo ragdoll, partidas rápidas y modos cooperativos o competitivos tanto local como en línea.",
    mecanicas: [
      {
        icon: "💣",
        titulo: "Uso de bombas",
        desc: "Los jugadores pueden lanzar distintos tipos de bombas normales, pegajosas o de impacto para eliminar o empujar enemigos.",
      },
      {
        icon: "👊",
        titulo: "Combate físico",
        desc: "Se puede golpear, agarrar y lanzar a los rivales fuera del mapa o hacia peligros del escenario.",
      },
      {
        icon: "🌀",
        titulo: "Movimiento y física",
        desc: "El movimiento es dinámico y algo impredecible, lo que hace el juego más divertido y caótico.",
      },
      {
        icon: "❤️",
        titulo: "Sistema de vidas",
        desc: "Dependiendo del modo, tienes varias vidas o mueres al caer del escenario o explotar.",
      },
      {
        icon: "🤝",
        titulo: "Reanimación",
        desc: "En cooperativo, los compañeros pueden ayudarte o protegerte mientras reapareces.",
      },
      {
        icon: "⚡",
        titulo: "Power-ups",
        desc: "Durante la partida aparecen cajas con ventajas: bombas más fuertes, guantes de boxeo, velocidad y escudos.",
      },
    ],
    modos: [
      {
        titulo: "Modo Clásico",
        items: [
          "Ser el último jugador o equipo con vida.",
          "Cada jugador tiene varias vidas.",
          "Pierdes una vida al explotar o caer del mapa.",
          "Gana quien sobreviva más tiempo.",
        ],
      },
      {
        titulo: "Captura la Bandera",
        items: [
          "Robar la bandera del enemigo y llevarla a tu base.",
          "Se juega por equipos.",
          "Gana el equipo con más capturas.",
        ],
      },
      {
        titulo: "Rey de la Colina",
        items: [
          "Mantenerse dentro de una zona el mayor tiempo posible.",
          "La zona da puntos al equipo.",
          "Gana quien acumule más tiempo en la zona.",
        ],
      },
      {
        titulo: "Modo Fútbol",
        items: [
          "Meter goles usando una pelota.",
          "Puedes empujar o golpear a los rivales.",
          "También puedes usar bombas.",
          "Gana el equipo con más goles.",
        ],
      },
    ],
    torneo: {
      modalidad: "Eliminación por rondas",
      formato: "4 equipos de 2-4 jugadores",
      mapas: "Arenas del juego",
      fases: [
        {
          num: "1",
          titulo: "Fase Clasificatoria",
          desc: "Todos los equipos jugarán partidas de 5 minutos. Clasifican los 4 mejores equipos.",
        },
        {
          num: "2",
          titulo: "Semifinal",
          desc: "Se enfrentan los mejores equipos en eliminación directa.",
        },
        {
          num: "3",
          titulo: "Final",
          desc: "Última partida entre los finalistas. Se define al equipo campeón.",
        },
      ],
    },
    requisitos: [
      { icon: "📱", texto: "Teléfono móvil" },
      { icon: "🎮", texto: "Tener instalado BombSquad" },
      { icon: "💾", texto: "Espacio disponible aproximado: 300 MB" },
    ],
    reglas: [
      { texto: "Duración por partida: 5 minutos", prohibida: false },
      {
        texto: "Modo sugerido: Último en pie o combate por equipos.",
        prohibida: false,
      },
      {
        texto: "Todos los equipos jugarán el mismo modo de juego.",
        prohibida: false,
      },
      {
        texto: "Prohibido: cambiar reglas durante la partida.",
        prohibida: true,
      },
      {
        texto: "Prohibido: obtener ventajas externas.",
        prohibida: true,
      },
      {
        texto: "Prohibido: interferir con otros equipos.",
        prohibida: true,
      },
    ],
  },
  {
    legacyId: 3,
    slug: "soul-knight",
    nombre: "Soul Knight",
    jugadores: 20,
    formato: "4 por equipo",
    dispositivo: "Teléfono móvil",

    download: {
      label: "Abrir Soul Knight en Play Store",
      url: "https://play.google.com/store/apps/details?id=com.ChillyRoom.DungeonShooter",
      type: "external",
    },

    manuals: [
      {
        title: "Manual oficial de Soul Knight",
        url: "/manuales/manual-soul-knight.pdf",
      },
    ],

    descripcion:
      "Soul Knight es un videojuego de acción tipo roguelike con vista cenital, donde los jugadores exploran mazmorras generadas aleatoriamente, enfrentan enemigos y jefes, y recolectan armas y mejoras para avanzar. Se caracteriza por su ritmo rápido, gran variedad de armas, personajes con habilidades únicas y modos tanto individuales como cooperativos.",
    mecanicas: [
      {
        icon: "⚡",
        titulo: "Gestión de energía",
        desc: "Las armas consumen energía. Se recupera al eliminar enemigos o con cofres. Es recomendable usar armas cuerpo a cuerpo para ahorrar energía.",
      },
      {
        icon: "🤝",
        titulo: "Reanimación",
        desc: "En modo cooperativo, los compañeros pueden revivir a un jugador caído colocándose sobre él.",
      },
      {
        icon: "⬆️",
        titulo: "Selección de buffs",
        desc: "Al finalizar cada nivel, se elige una mejora pasiva que afecta toda la partida.",
      },
      {
        icon: "🦸",
        titulo: "Habilidades especiales",
        desc: "Cada personaje posee una habilidad única que debe usarse estratégicamente.",
      },
      {
        icon: "💰",
        titulo: "Economía de mazmorra",
        desc: "Se recolecta oro para comprar armas, mejoras o interactuar con estatuas dentro de la mazmorra.",
      },
      {
        icon: "🌀",
        titulo: "Modo Cooperativo LAN",
        desc: "Multijugador cooperativo por LAN. Hasta 4 jugadores por equipo, 20 jugadores en total.",
      },
    ],
    modos: [
      {
        titulo: "Modo Clásico",
        items: [
          "Superar 15 niveles: 3 biomas con 5 subniveles cada uno.",
          "Derrotar al jefe final en el nivel 3-5.",
          "Recuperar la Piedra Mágica para completar la misión.",
        ],
      },
      {
        titulo: "Modo Boss Rush",
        items: [
          "Solo jefes consecutivos, sin niveles normales.",
          "Vencer a todos los jefes uno tras otro.",
          "Completarlo en el menor tiempo posible.",
          "Es mucho más difícil que el modo clásico.",
        ],
      },
      {
        titulo: "Modo Matriz del Señor del Mal",
        items: [
          "La mazmorra continúa en ciclos sin un final real.",
          "Cada ciclo los enemigos tienen más vida y hacen más daño.",
          "Objetivo: sobrevivir el mayor tiempo y alcanzar el nivel más alto.",
        ],
      },
    ],
    torneo: {
      modalidad: "Boss Rush - Eliminación por rondas",
      formato: "5 equipos de 4 jugadores",
      mapas: "Modo Boss Rush",
      fases: [
        {
          num: "1",
          titulo: "Fase Clasificatoria",
          desc: "Todos los equipos jugarán una partida en modo Boss Rush. Clasifican los 4 mejores equipos.",
        },
        {
          num: "2",
          titulo: "Semifinal",
          desc: "Los equipos clasificados jugarán una nueva partida. Clasifican los 2 mejores equipos.",
        },
        {
          num: "3",
          titulo: "Final",
          desc: "Los dos mejores equipos competirán en una última partida. Se define el equipo ganador.",
        },
      ],
    },
    requisitos: [
      { icon: "📱", texto: "Teléfono móvil" },
      { icon: "🎮", texto: "Soul Knight instalado" },
      { icon: "👥", texto: "Equipos de 3-4 jugadores" },
      { icon: "⏱️", texto: "Duración máxima por partida: 10 minutos" },
    ],
    reglas: [
      {
        texto: "Todos los equipos jugarán en la misma dificultad.",
        prohibida: false,
      },
      {
        texto: "El tiempo inicia al entrar al modo Boss Rush.",
        prohibida: false,
      },
      {
        texto: "Personajes libres: cada jugador elige el suyo.",
        prohibida: false,
      },
      {
        texto: "Prohibido: pausar el juego para obtener ventaja.",
        prohibida: true,
      },
      {
        texto: "Prohibido: modificar reglas durante la partida.",
        prohibida: true,
      },
      {
        texto: "Prohibido: uso de ventajas externas o modificaciones.",
        prohibida: true,
      },
    ],
  },
];

// Busca detalle oficial por legacyId, slug o id del backend.
export const getOfficialGameDetail = (gameOrId) => {
  const value =
    typeof gameOrId === "object"
      ? gameOrId
      : { id: gameOrId, legacyId: gameOrId };

  return officialGameDetails.find((item) => {
    return (
      String(item.legacyId) === String(value.legacyId) ||
      String(item.legacyId) === String(value.id) ||
      String(item.slug) === String(value.id)
    );
  });
};
