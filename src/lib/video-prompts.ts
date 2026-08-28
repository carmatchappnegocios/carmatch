export type Hero = 'don-match' | 'car-mela' | 'matchy' | 'car-litos'
export type Villain = 'el-bache' | 'la-agencia' | 'mecanico-tranero' | 'estafa-odometro' | 'vendedor-informal' | 'perfiles-falsos' | 'gasolinazo' | 'multa-sorpresa' | 'robo-auto' | 'seguro-caro'
export type Scene = 'taller' | 'carretera' | 'gasolinera' | 'casa' | 'escuela' | 'centro' | 'playa' | 'montana' | 'ciudad' | 'mercado' | 'hospital' | 'estacionamiento'
export type Emotion = 'frustracion' | 'alivio' | 'sorpresa' | 'victoria' | 'enojo' | 'alegria'
export type Season = 'buen-fin' | 'hot-sale' | 'verano' | 'navidad' | 'ano-nuevo' | 'dia-del-padre' | 'dia-de-la-madre' | 'vacaciones'

export interface HeroData {
    name: string
    age: number
    personality: string
    phrase: string
    defeatMethod: string
    characterImage?: string
}

export interface VillainData {
    name: string
    villainName: string
    problem: string
    emotion: string
    heroDefeats: Hero
    viralHook: string
}

export interface SceneData {
    name: string
    description: string
    ambientSounds: string
}

export interface SeasonData {
    name: string
    theme: string
    promoAngle: string
}

export const heroes: Record<Hero, HeroData> = {
    'don-match': {
        name: 'Don Match',
        age: 45,
        personality: 'Emprendedor nato, trabajador incansable, conoce a todos en el barrio',
        phrase: 'Si existe, se publica en CarMatch',
        defeatMethod: 'Encuentra soluciones con talleres verificados',
        characterImage: '',
    },
    'car-mela': {
        name: 'Car-mela',
        age: 42,
        personality: 'La columna vertebral de la familia, organizada, detallista',
        phrase: 'Detras de gran negocio, hay una gran mujer organizandolo todo',
        defeatMethod: 'Compra directa sin intermediarios',
        characterImage: '',
    },
    'matchy': {
        name: 'Matchy',
        age: 20,
        personality: 'La influencer de la familia, creativa, conectada con la generacion Z',
        phrase: 'Si no esta en TikTok, no existe',
        defeatMethod: 'Verificacion digital y perfiles reales',
        characterImage: '',
    },
    'car-litos': {
        name: 'Car-litos',
        age: 18,
        personality: 'El mas joven y aventurero, le gustan los autos rapidos',
        phrase: 'Si tiene motor, lo revolucionamos',
        defeatMethod: 'Escapa con alternativas eficientes',
        characterImage: '',
    }
}

export const villains: Record<Villain, VillainData> = {
    'el-bache': {
        name: 'El Bache',
        villainName: 'Don Bacho',
        problem: 'Destruye suspensiones, llantas, rins. Cada bache = $2,000-$5,000 de reparacion',
        emotion: 'Frustracion, impotencia',
        heroDefeats: 'don-match',
        viralHook: 'EL BACHE TE DESTRUYO EL AUTO'
    },
    'la-agencia': {
        name: 'La Agencia',
        villainName: 'Don Comision',
        problem: 'Comisiones del 15-30%, presion para comprar, financiamientos abusivos',
        emotion: 'Rabia, te estan robando',
        heroDefeats: 'car-mela',
        viralHook: 'LA AGENCIA TE COBRA DE MAS'
    },
    'mecanico-tranero': {
        name: 'El Mecanico Trantero',
        villainName: 'Don Trantero',
        problem: 'Cobra de mas, no arregla nada, repuestos usados por nuevos',
        emotion: 'Desconfianza, miedo',
        heroDefeats: 'don-match',
        viralHook: 'EL MECANICO TE ESTAFO'
    },
    'estafa-odometro': {
        name: 'La Estafa del Odometro',
        villainName: 'Don Kilometraje',
        problem: 'Autos con kilometraje falsificado, venden chatarra como seminuevo',
        emotion: 'Engano, perdida',
        heroDefeats: 'matchy',
        viralHook: 'TE VENDIERON KILOMETRAJE FALSO'
    },
    'vendedor-informal': {
        name: 'El Vendedor Informal',
        villainName: 'Don Informal',
        problem: 'Vende autos con problemas ocultos, no da garantia, desaparece',
        emotion: 'Miedo, incertidumbre',
        heroDefeats: 'car-mela',
        viralHook: 'EL VENDEDOR DESAPARECIO'
    },
    'perfiles-falsos': {
        name: 'Los Perfiles Falsos',
        villainName: 'Don Perfil',
        problem: 'Estafadores en Marketplace, perfiles inventados, fotos de stock',
        emotion: 'Inseguridad',
        heroDefeats: 'matchy',
        viralHook: 'PERFILES FALSOS EN MARKETPLACE'
    },
    'gasolinazo': {
        name: 'El Gasolinazo',
        villainName: 'Don Gasolina',
        problem: 'Gasolina cara + auto gaston = bolsillo vacio',
        emotion: 'Apenacion, estres financiero',
        heroDefeats: 'car-litos',
        viralHook: 'EL GASOLINAZO TE MATO'
    },
    'multa-sorpresa': {
        name: 'La Multa Sorpresa',
        villainName: 'Don Multa',
        problem: 'Multas que no esperabas, infracciones invisibles',
        emotion: 'Estres, sorpresa',
        heroDefeats: 'car-mela',
        viralHook: 'LA MULTA SORPRESA'
    },
    'robo-auto': {
        name: 'El Robo de Auto',
        villainName: 'Don Ratero',
        problem: 'Robo vehicular, inseguridad, perdida total',
        emotion: 'Panico, impotencia',
        heroDefeats: 'car-litos',
        viralHook: 'TE ROBARON EL AUTO'
    },
    'seguro-caro': {
        name: 'El Seguro Caro',
        villainName: 'Don Seguro',
        problem: 'Seguros abusivos, cobertura minima, papeles eternos',
        emotion: 'Molestia, pago mucho y no cubre nada',
        heroDefeats: 'car-mela',
        viralHook: 'EL SEGURO TE COBRA DEMASIADO'
    }
}

export const scenes: Record<Scene, SceneData> = {
    'taller': { name: 'Taller Mecanico', description: 'Un taller con herramientas, autos en elevador, grasa y aceite', ambientSounds: 'Herramientas, impactos neumaticos, motor' },
    'carretera': { name: 'Carretera', description: 'Una carretera con baches, semaforos,-trafico', ambientSounds: 'Bocinas, viento, llantas' },
    'gasolinera': { name: 'Gasolinera', description: 'Estacion de servicio con bombas, precios visibles', ambientSounds: 'Bombas de gasolina, caja registradora' },
    'casa': { name: 'Casa/Residencia', description: 'Cochera familiar,auto estacionado, familia', ambientSounds: 'Puerta de garage, niños, television' },
    'escuela': { name: 'Escuela', description: 'Frente a una escuela, padres llevando hijos', ambientSounds: 'Niños, campana, autos estacionados' },
    'centro': { name: 'Centro Comercial', description: 'Estacionamiento de centro comercial, multitudes', ambientSounds: 'Musica, gente, carritos' },
    'playa': { name: 'Playa', description: 'Costa, arena, autos playas, palmeras', ambientSounds: 'Olas, viento, gaviotas' },
    'montana': { name: 'Montana', description: 'Carretera de montana, curvas, paisaje', ambientSounds: 'Viento, naturaleza, motor' },
    'ciudad': { name: 'Ciudad', description: 'Calles urbanas, edificios, trafico', ambientSounds: 'Trafico, bocinas, peatones' },
    'mercado': { name: 'Mercado', description: 'Mercado publico, vendedores, multitudes', ambientSounds: 'Vendedores, gente, musica' },
    'hospital': { name: 'Hospital', description: 'Emergencias, ambulancias, doctores', ambientSounds: 'Ambulancia, monitores, pasos' },
    'estacionamiento': { name: 'Estacionamiento', description: 'Parking publico o privado, autos estacionados', ambientSounds: 'Llaves, puertas, alarmas' }
}

export const emotions: Record<Emotion, { name: string; description: string; musicStyle: string }> = {
    'frustracion': { name: 'Frustracion', description: 'El conductor sufre las consecuencias del villano', musicStyle: 'Tensa, suspenseful al inicio' },
    'alivio': { name: 'Alivio', description: 'El heroe llega y resuelve el problema', musicStyle: 'Optimista, triunfal' },
    'sorpresa': { name: 'Sorpresa', description: 'Descubrimiento inesperado del problema o solucion', musicStyle: 'Dramatica con giros' },
    'victoria': { name: 'Victoria', description: 'El villano es derrotado, happy ending', musicStyle: 'Celebracion, energia alta' },
    'enojo': { name: 'Enojo', description: 'Iracia contra el villano y su injusticia', musicStyle: 'Agresiva, hip-hop mexicano' },
    'alegria': { name: 'Alegria', description: 'Momento feliz de conexion con la comunidad', musicStyle: 'Pop alegre, reggaeton romantico' }
}

export const seasons: Record<Season, SeasonData> = {
    'buen-fin': { name: 'Buen Fin', theme: 'Descuentos y ofertas', promoAngle: 'Aprovecha el Buen Fin para vender tu auto' },
    'hot-sale': { name: 'Hot Sale', theme: 'Ofertas online', promoAngle: 'El Hot Sale automotriz esta en CarMatch' },
    'verano': { name: 'Verano', theme: 'Viajes y aventura', promoAngle: 'Prepara tu auto para el verano' },
    'navidad': { name: 'Navidad', theme: 'Familia y regalos', promoAngle: 'Dale un auto nuevo a tu familia' },
    'ano-nuevo': { name: 'Ano Nuevo', theme: 'Nuevos propositos', promoAngle: 'Empieza el ano con un auto nuevo' },
    'dia-del-padre': { name: 'Dia del Padre', theme: 'Homenaje a papas', promoAngle: 'Regala un auto a papá' },
    'dia-de-la-madre': { name: 'Dia de la Madre', theme: 'Homenaje a mamás', promoAngle: 'Mereces un auto seguro para tu mama' },
    'vacaciones': { name: 'Vacaciones', theme: 'Viajes y descanso', promoAngle: 'Tu auto ideal para vacaciones' }
}

export interface GeneratedPrompt {
    id: number
    title: string
    hero: Hero
    villain: Villain
    scene: Scene
    emotion: Emotion
    season: Season
    characterImage?: string
    hook: string
    voiceover: string
    escenas: string
    musica: string
    textoEnPantalla: string
    hashtags: string
    duration: '15-30s' | '30-60s'
    platform: string
    scheduledTime: string
    segmentacion: { edad: string; ubicacion: string; plataformas: string; intereses: string }
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function generateHook(hero: HeroData, villain: VillainData, scene: SceneData): string {
    const hooks = [
        `${villain.viralHook}! ${hero.name} tiene la solucion.`,
        `Cuidado! ${villain.villainName} ataca en la ${scene.name.toLowerCase()}.`,
        `${villain.problem}. ${hero.name} llega al rescate.`,
        `No dejes que ${villain.villainName} te arruine el dia.`,
        `${hero.name} contra ${villain.villainName}: la batalla por tu auto.`,
        `${villain.viralHook}! Abre CarMatch ahora.`,
        `${scene.name}: ${villain.villainName} esta causando problemas.`,
        `${hero.name} sabe como derrotar a ${villain.villainName}.`
    ]
    return pick(hooks)
}

function generateVoiceover(hero: Hero, heroData: HeroData, villain: VillainData, scene: SceneData, season: SeasonData): string {
    const characterRef = heroData.characterImage ? ` Usa la imagen de referencia del personaje: ${heroData.characterImage}.` : ''
    const voiceovers: Record<Hero, string[]> = {
        'don-match': [
            `Cuidado con ${villain.villainName}! Te esta causando problemas en la ${scene.name.toLowerCase()}. Pero no te preocupes, Don Match tiene la solucion. Abre CarMatch y encuentra lo que necesitas. ${heroData.phrase}.${characterRef} Descarga CarMatch ahora.`,
            `${villain.villainName} no perdona. ${villain.problem}. Pero Don Match llega con su experiencia. En CarMatch encuentras talleres verificados, precios justos. Sin estafas.${characterRef} Descarga CarMatch.`,
            `Otro dia, otro problema con ${villain.villainName}. Pero Don Match tiene la formula: CarMatch conecta con los mejores. ${heroData.phrase}.${characterRef} No sufras mas, descarga CarMatch.`
        ],
        'car-mela': [
            `${villain.villainName} te esta complicando la vida. ${villain.problem}. Pero Car-mela tiene el plan. En CarMatch todo es organizado, directo, sin intermediarios. ${heroData.phrase}.${characterRef} Descarga CarMatch.`,
            `No permitas que ${villain.villainName} te robe tu dinero. Car-mela te muestra como: CarMatch, compra directa, sin comisiones. ${heroData.phrase}.${characterRef} Descarga CarMatch ahora.`,
            `${villain.villainName} causa ${villain.emotion}. Pero Car-mela tiene la solucion organizada. En CarMatch encuentras todo verificado. ${heroData.phrase}.${characterRef} Descarga CarMatch.`
        ],
        'matchy': [
            `${villain.villainName} piensa que puede estafarte. Pero Matchy tiene la tecnologia. En CarMatch los perfiles son reales, los autos verificados. ${heroData.phrase}.${characterRef} Descarga CarMatch.`,
            `No mas sorpresas con ${villain.villainName}! Matchy te protege con verificacion digital. CarMatch tiene todo verificado. ${heroData.phrase}.${characterRef} Descarga CarMatch.`,
            `${villain.viralHook}! Pero Matchy tiene la app. CarMatch verifica todo: kilometraje, vendedor, auto. ${heroData.phrase}.${characterRef} No mas estafas, descarga CarMatch.`
        ],
        'car-litos': [
            `${villain.villainName} no sabe con quien se mete. Car-litos tiene la estrategia. En CarMatch encuentras alternativas que ${villain.villainName} no puede destruir. ${heroData.phrase}.${characterRef} Descarga CarMatch.`,
            `El gasolinazo, el robo, ${villain.villainName} ataca. Pero Car-litos escapa con soluciones inteligentes. CarMatch tiene autos eficientes y seguros. ${heroData.phrase}.${characterRef} Descarga CarMatch.`,
            `Car-litos contra ${villain.villainName}: la batalla final. En CarMatch encuentras lo que necesitas para ganar. ${heroData.phrase}.${characterRef} Descarga CarMatch ahora.`
        ]
    }
    return pick(voiceovers[hero])
}

function generateScenes(hero: HeroData, villain: VillainData, scene: SceneData): string {
    const characterRef = hero.characterImage ? ` Personaje de referencia: ${hero.characterImage}.` : ''
    return `ESCENA 1 (0-3s) HOOK: ${scene.description}. ${villain.villainName} aparece causando problemas. Texto: ${villain.viralHook}.${characterRef}\nESCENA 2 (3-8s) PROBLEMA: La victima sufre las consecuencias de ${villain.villainName}. ${villain.problem}. Emocion: ${villain.emotion}.\nESCENA 3 (8-15s) HEROE: ${hero.name} llega con su chaqueta azul de CarMatch. Muestra la app con la solucion.${characterRef}\nESCENA 4 (15-20s) DERROTA: ${villain.villainName} es vencido. ${hero.name} salva la situacion con CarMatch.\nESCENA 5 (20-25s) CTA: Logo CarMatch. Texto: Descarga CarMatch ahora.`
}

function generateMusic(emotion: Emotion, season: Season): string {
    const musicByEmotion: Record<Emotion, string[]> = {
        'frustracion': ['Electronica tensa con bass drops', 'Hip-hop mexicano suspenseful', 'Trap con ritmo de urgencia'],
        'alivio': ['Pop optimista con piano', 'Reggaeton suave celebrando', 'Electronica triunfal'],
        'sorpresa': ['Dramatica con giros inesperados', 'Cinematic suspense', 'Electronica con builds'],
        'victoria': ['Reggaeton de celebracion', 'Pop energetico victorioso', 'Electronica alta energia'],
        'enojo': ['Hip-hop mexicano agresivo', 'Trap con rage beats', 'Rock alternativo intenso'],
        'alegria': ['Pop alegre veraniego', 'Reggaeton romantico', 'Cumbia moderna']
    }
    const seasonAddon: Record<Season, string> = {
        'buen-fin': ' con elementos de ofertas',
        'hot-sale': ' estilo comercial digital',
        'verano': ' con ritmos tropicales',
        'navidad': ' con campanas navideñas',
        'ano-nuevo': ' de celebracion y nuevos comienzos',
        'dia-del-padre': ' emotiva y familiar',
        'dia-de-la-madre': ' emotiva y dulce',
        'vacaciones': ' aventurera y libre'
    }
    return pick(musicByEmotion[emotion]) + seasonAddon[season]
}

function generateHashtags(hero: Hero, villain: Villain, scene: Scene): string {
    const base = ['#CarMatch', '#FamiliaMatch', '#AutoSeguro']
    const heroTags: Record<Hero, string> = {
        'don-match': '#DonMatch',
        'car-mela': '#CarMela',
        'matchy': '#Matchy',
        'car-litos': '#CarLitos'
    }
    const villainTags: Record<Villain, string> = {
        'el-bache': '#Baches',
        'la-agencia': '#SinComisiones',
        'mecanico-tranero': '#MecanicosHonestos',
        'estafa-odometro': '#KilometrajeReal',
        'vendedor-informal': '#TratoSeguro',
        'perfiles-falsos': '#PerfilesVerificados',
        'gasolinazo': '#AhorroGasolina',
        'multa-sorpresa': '#Prevencion',
        'robo-auto': '#AutoProtegido',
        'seguro-caro': '#SeguroJusto'
    }
    const sceneTags: Record<Scene, string> = {
        'taller': '#TallerMecanico',
        'carretera': '#Carretera',
        'gasolinera': '#Gasolinera',
        'casa': '#CasaSegura',
        'escuela': '#Escuela',
        'centro': '#CentroComercial',
        'playa': '#Playa',
        'montana': '#Montana',
        'ciudad': '#Ciudad',
        'mercado': '#Mercado',
        'hospital': '#Hospital',
        'estacionamiento': '#Estacionamiento'
    }
    return `${base.join(' ')} ${heroTags[hero]} ${villainTags[villain]} ${sceneTags[scene]}`
}

function generateTextOverlay(villain: VillainData, hero: HeroData): string {
    return `${villain.viralHook} -> ${villain.villainName} ATACA -> ${hero.name.toUpperCase()} RESCATA -> CARMATCH: TU SOLUCION -> DESCARGA GRATIS`
}

function generateSegmentacion(scene: Scene, villain: Villain): { edad: string; ubicacion: string; plataformas: string; intereses: string } {
    const edadMap: Record<Scene, string> = {
        'taller': '25-55', 'carretera': '20-50', 'gasolinera': '20-55', 'casa': '28-55',
        'escuela': '28-55', 'centro': '18-45', 'playa': '20-45', 'montana': '22-50',
        'ciudad': '18-50', 'mercado': '25-55', 'hospital': '30-60', 'estacionamiento': '20-55'
    }
    const interesesMap: Record<Villain, string> = {
        'el-bache': 'Mecanica, suspension, llantas, carreteras',
        'la-agencia': 'Compra-venta, ahorro, agencia, negocios',
        'mecanico-tranero': 'Mecanica, reparacion, confianza, talleres',
        'estafa-odometro': 'Seminuevo, kilometraje, verificacion',
        'vendedor-informal': 'Compra-venta, segunda mano, confianza',
        'perfiles-falsos': 'Online, seguridad, verificacion',
        'gasolinazo': 'Gasolina, ahorro, eficiencia',
        'multa-sorpresa': 'Multas, prevencion, transito',
        'robo-auto': 'Seguridad, proteccion, vigilancia',
        'seguro-caro': 'Seguro, precio, cobertura'
    }
    return {
        edad: edadMap[scene],
        ubicacion: 'Mexico',
        plataformas: 'TikTok, Instagram Reels, YouTube Shorts, Facebook Reels',
        intereses: interesesMap[villain]
    }
}

let promptCounter = 0

export function generateVideoPrompt(
    forcedHero?: Hero,
    forcedVillain?: Villain,
    forcedScene?: Scene,
    forcedEmotion?: Emotion,
    forcedSeason?: Season
): GeneratedPrompt {
    promptCounter++
    const heroKey = forcedHero || pick(Object.keys(heroes) as Hero[])
    const villainKey = forcedVillain || pick(Object.keys(villains) as Villain[])
    const sceneKey = forcedScene || pick(Object.keys(scenes) as Scene[])
    const emotionKey = forcedEmotion || pick(Object.keys(emotions) as Emotion[])
    const seasonKey = forcedSeason || pick(Object.keys(seasons) as Season[])

    const heroData = heroes[heroKey]
    const villainData = villains[villainKey]
    const sceneData = scenes[sceneKey]
    const seasonData = seasons[seasonKey]

    const duration = pick(['15-30s', '30-60s'] as const)
    const platform = duration === '15-30s'
        ? 'TikTok + Instagram Reels'
        : 'YouTube Shorts + Facebook Reels'
    const scheduledTime = pick(['12:00 PM', '1:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'])

    return {
        id: Date.now() + promptCounter,
        title: `${villainData.name} vs ${heroData.name} - ${sceneData.name}`,
        hero: heroKey,
        villain: villainKey,
        scene: sceneKey,
        emotion: emotionKey,
        season: seasonKey,
        characterImage: heroData.characterImage,
        hook: generateHook(heroData, villainData, sceneData),
        voiceover: generateVoiceover(heroKey, heroData, villainData, sceneData, seasonData),
        escenas: generateScenes(heroData, villainData, sceneData),
        musica: generateMusic(emotionKey, seasonKey),
        textoEnPantalla: generateTextOverlay(villainData, heroData),
        hashtags: generateHashtags(heroKey, villainKey, sceneKey),
        duration,
        platform,
        scheduledTime,
        segmentacion: generateSegmentacion(sceneKey, villainKey)
    }
}

export function generateBatch(count: number): GeneratedPrompt[] {
    return Array.from({ length: count }, () => generateVideoPrompt())
}

export function generateCalendar(days: number = 30): Array<{
    day: number
    date: string
    prompt: GeneratedPrompt
    tips: string
}> {
    const now = new Date()
    return Array.from({ length: days }, (_, i) => {
        const date = new Date(now)
        date.setDate(date.getDate() + i)
        const dayName = date.toLocaleDateString('es-MX', { weekday: 'long' })
        const prompt = generateVideoPrompt()
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const tips = isWeekend
            ? 'Post en horario de tarde (7-9 PM) para maximo engagement'
            : 'Post en horario de almuerzo (12-2 PM) para alcance laboral'
        return {
            day: i + 1,
            date: `${dayName} ${date.toLocaleDateString('es-MX')}`,
            prompt,
            tips: `${tips} | Duracion: ${prompt.duration} | ${prompt.platform}`
        }
    })
}
