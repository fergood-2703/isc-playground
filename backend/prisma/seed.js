// =============================
// SEED: DATOS INICIALES
// =============================
// Crea el admin inicial y los 3 juegos del torneo.
// Ejecutar UNA SOLA VEZ: npm run seed
//
// IMPORTANTE: Este archivo está en .gitignore
// porque puede contener credenciales del admin inicial.

import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// ─────────────────────────────
// ADMIN INICIAL
// ─────────────────────────────
const seedAdmin = async () => {
  const email = 'admin@isc.edu'
  const username = 'admin'
  const password = 'Admin1234!'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('⚠️  Admin ya existe, se omite')
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const admin = await prisma.user.create({
    data: {
      nombres: 'Admin',
      apellidos: 'Sistema',
      name: 'Admin Sistema',
      email,
      username,
      password: hashedPassword,
      role: 'admin',
      status: 'Activo',
    },
  })

  console.log('✅ Admin creado')
  console.log(`   Email:    ${email}`)
  console.log(`   Username: ${username}`)
  console.log(`   Password: ${password}`)
  console.log(`   ID:       u-${admin.id}`)
  console.log('   ⚠️  Cambia la contraseña después del primer login')
}

// ─────────────────────────────
// JUEGOS DEL TORNEO
// ─────────────────────────────
// Datos extraídos de los instructivos oficiales del torneo
const games = [
  {
    id: 'counter-strike-16',
    legacyId: 1,
    name: 'Counter Strike 1.6',
    shortName: 'CS 1.6',
    // Imagen local del proyecto
    image: '/src/assets/images/juegos/cs.jpg',
    accent: '#8b5cf6',
    teamSize: '5v5',
    // Según instructivo: rondas de 5 min, hasta 10 rondas ganadas
    duration: 'MR10 · 5 min/ronda',
    format: 'Mapas competitivos',
    status: 'Activo',
    description: 'FPS táctico donde Terroristas y Counter-Terrorists compiten por plantar o desactivar la bomba C4. Se juega en de_dust2 por LAN. El primer equipo en ganar 10 rondas gana el mapa.',
    pointFormula: 'rondas*8 + kills*6 + mapas*50',
    winCondition: 'Gana el jugador con mejor puntuación individual. Rondas ganadas y kills desempatan.',
    maxPlayers: '10',
    matchType: '5v5 equipos temporales',
    // Según instructivo del torneo
    maps: ['de_dust2'],
    visualMetrics: ['roundsWon', 'kills', 'maps'],
    scoringRules: {
      create: [
        { key: 'roundsWon', label: 'Mayor número de rondas ganadas', direction: 'desc', order: 0 },
        { key: 'kills', label: 'Mayor número de kills', direction: 'desc', order: 1 },
      ],
    },
    metrics: {
      create: [
        { key: 'roundsWon', label: 'Rondas ganadas', type: 'number', defaultValue: 0 },
        { key: 'kills', label: 'Kills', type: 'number', defaultValue: 0 },
        { key: 'maps', label: 'Mapas ganados', type: 'number', defaultValue: 0 },
      ],
    },
  },
  {
    id: 'bomb-squad',
    legacyId: 2,
    name: 'Bomb Squad',
    shortName: 'BombSquad',
    image: '/src/assets/images/juegos/bombsquad.jpg',
    accent: '#06b6d4',
    // Según instructivo: 2-4 jugadores por equipo
    teamSize: '2-4 jugadores',
    // Según instructivo: serie de 3 rondas, 10 min límite por ronda
    duration: 'Serie al mejor de 3 · 10 min',
    // Según instructivo: modo Captura de Banderas
    format: 'Captura de Banderas',
    status: 'Activo',
    description: 'Juego multijugador de acción caótica por equipos. Se juega en modo Captura de Banderas por LAN. El primer equipo en capturar la bandera enemiga 3 veces gana la ronda. Gana quien gane 3 rondas de la serie.',
    pointFormula: 'victorias*100 + kills*5 - muertes*2',
    winCondition: 'Gana el usuario con más puntos individuales. El equipo solo organiza la partida.',
    maxPlayers: '8',
    matchType: 'Equipos temporales por ronda',
    maps: ['Doom Shroom', 'Football Stadium', 'Hockey Stadium', 'Lake Fortress'],
    visualMetrics: ['wins', 'kills', 'deaths', 'rounds'],
    scoringRules: {
      create: [
        { key: 'wins', label: 'Mayor número de victorias', direction: 'desc', order: 0 },
        { key: 'kills', label: 'Mayor número de eliminaciones', direction: 'desc', order: 1 },
        { key: 'deaths', label: 'Menor número de muertes', direction: 'asc', order: 2 },
      ],
    },
    metrics: {
      create: [
        { key: 'wins', label: 'Victorias', type: 'number', defaultValue: 0 },
        { key: 'losses', label: 'Derrotas', type: 'number', defaultValue: 0 },
        { key: 'kills', label: 'Kills', type: 'number', defaultValue: 0 },
        { key: 'deaths', label: 'Muertes', type: 'number', defaultValue: 0 },
        { key: 'rounds', label: 'Rondas jugadas', type: 'number', defaultValue: 1 },
        { key: 'matchTime', label: 'Tiempo (min)', type: 'number', defaultValue: 10 },
      ],
    },
  },
  {
    id: 'soul-knight',
    legacyId: 3,
    name: 'Soul Knight',
    shortName: 'Soul Knight',
    image: '/src/assets/images/juegos/soulknight.jpg',
    accent: '#22c55e',
    // Según instructivo: hasta 4 jugadores cooperativo LAN
    teamSize: '4 jugadores',
    // Según instructivo: modo Boss Rush cronometrado
    duration: 'Boss Rush cronometrado',
    format: 'Co-op roguelike LAN',
    status: 'Activo',
    description: 'Roguelike cooperativo por LAN de hasta 4 jugadores. Se juega en modo Boss Rush donde el objetivo es derrotar al mayor número de jefes en el menor tiempo. Los compañeros pueden reanimarse entre sí.',
    pointFormula: 'bosses*120 + daño/1000 - tiempo*2',
    winCondition: 'Gana el usuario con más aporte individual. Bosses derrotados, tiempo total y daño infligido desempatan.',
    maxPlayers: '4',
    matchType: 'Co-op 4 jugadores',
    // Según instructivo: modo Boss Rush
    maps: ['Boss Rush'],
    visualMetrics: ['bossesDefeated', 'totalDamage', 'monstersKilled', 'rescuedPartners'],
    scoringRules: {
      create: [
        { key: 'bossesDefeated', label: 'Mayor número de jefes derrotados', direction: 'desc', order: 0 },
        { key: 'totalTime', label: 'Menor tiempo total', direction: 'asc', order: 1 },
        { key: 'totalDamage', label: 'Mayor daño total infligido', direction: 'desc', order: 2 },
      ],
    },
    metrics: {
      create: [
        { key: 'bossesDefeated', label: 'Bosses', type: 'number', defaultValue: 0 },
        { key: 'totalTime', label: 'Tiempo (min)', type: 'number', defaultValue: 0 },
        { key: 'totalDamage', label: 'Damage total', type: 'number', defaultValue: 0 },
        { key: 'monstersKilled', label: 'Monstruos eliminados', type: 'number', defaultValue: 0 },
        { key: 'rescuedPartners', label: 'Compañeros reanimados', type: 'number', defaultValue: 0 },
        { key: 'deaths', label: 'Muertes', type: 'number', defaultValue: 0 },
      ],
    },
  },
]

// ─────────────────────────────
// SEMBRAR JUEGOS
// ─────────────────────────────
const seedGames = async () => {
  for (const game of games) {
    const existing = await prisma.game.findUnique({ where: { id: game.id } })
    if (existing) {
      console.log(`⚠️  Juego "${game.name}" ya existe, se omite`)
      continue
    }

    const { scoringRules, metrics, ...gameData } = game
    await prisma.game.create({
      data: {
        ...gameData,
        scoringRules,
        metrics,
      },
    })
    console.log(`✅ Juego creado: ${game.name}`)
  }
}

// ─────────────────────────────
// EJECUTAR SEED
// ─────────────────────────────
const main = async () => {
  console.log('\n🌱 Iniciando seed...\n')
  await seedAdmin()
  console.log('')
  await seedGames()
  console.log('\n✅ Seed completado\n')
}

main()
  .catch((err) => {
    console.error('❌ Error en seed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())