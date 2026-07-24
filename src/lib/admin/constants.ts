export const AD_PLATFORMS = [
    { id: 'instagram_feed', label: 'Instagram Feed', icon: '📸', color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500', w: 1080, h: 1080 },
    { id: 'instagram_stories', label: 'Instagram Stories', icon: '📱', color: 'bg-gradient-to-tr from-orange-400 to-pink-600', w: 1080, h: 1920 },
    { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'bg-black border border-white/20', w: 1080, h: 1920 },
    { id: 'facebook', label: 'Facebook', icon: '👤', color: 'bg-[#1877F2]', w: 1200, h: 628 },
    { id: 'x_twitter', label: 'X (Twitter)', icon: '𝕏', color: 'bg-black', w: 1600, h: 900 },
    { id: 'google_ads', label: 'Google Ads', icon: '🔍', color: 'bg-white text-blue-600', w: 1200, h: 628 },
    { id: 'snapchat', label: 'Snapchat', icon: '👻', color: 'bg-[#FFFC00] text-black', w: 1080, h: 1920 },
    { id: 'kwai', label: 'Kwai', icon: '🎬', color: 'bg-orange-500', w: 1080, h: 1920 },
    { id: 'threads', label: 'Threads', icon: '@', color: 'bg-black', w: 1080, h: 1080 },
] as const;

export type AdPlatformId = typeof AD_PLATFORMS[number]['id'];

export const CAMPAIGN_CATEGORIES = [
    { id: 'trivia', label: 'Trivia / Quiz', icon: '❓', description: 'Preguntas interactivas para generar engagement.' },
    { id: 'versus', label: 'Versus / Batalla', icon: '⚔️', description: 'Compara dos naves o marcas frente a frente.' },
    { id: 'meme', label: 'Meme Motorizado', icon: '😂', description: 'Humor de la cultura de los fierros.' },
    { id: 'storytelling', label: 'History / Storytelling', icon: '📖', description: 'La narrativa detrás de un modelo o marca.' },
    { id: 'tips', label: 'Tips / Educación', icon: '💡', description: 'Consejos de mantenimiento o hacks.' },
    { id: 'business', label: 'Spotlight de Negocio', icon: '🏪', description: 'Destaca un taller, detailer o refaccionaria.' },
    { id: 'news', label: 'Breaking News', icon: '🚨', description: 'Lanzamientos o noticias de último minuto.' },
    { id: 'myths', label: 'Mitos Desmentidos', icon: '🔍', description: 'Desmintiendo leyendas urbanas del motor.' },
    { id: 'reto', label: 'Reto de Diseño', icon: '🎨', description: "¿Qué pasaría si X marca diseñara un Y?" },
    { id: 'aspirational', label: 'Aspiracional / Dreams', icon: '✨', description: 'El sentimiento de alcanzar el auto soñado.' },
    { id: 'tech', label: 'Tech Insight', icon: '⚡', description: 'Explicación visual de tecnología automotriz.' },
    { id: 'culture', label: 'Vibe de Cultura', icon: '🏁', description: 'Enfocado en JDM, Euro, Muscle o Tuning.' },
    { id: 'safety', label: 'Seguridad / SOS', icon: '🛡️', description: 'Tips de seguridad y prevención de estafas.' },
    { id: 'before_after', label: 'Antes y Después', icon: '🔄', description: 'Restauraciones y modificaciones extremas.' },
    { id: 'event', label: 'Spotlight de Evento', icon: '🏟️', description: 'Car meets, carreras o exposiciones.' },
    { id: 'cinematic', label: 'Cinemática Pura', icon: '🎥', description: 'Visuales épicos sin mucho texto.' },
    { id: 'unboxing', label: 'Unboxing / Review', icon: '📦', description: 'Mostrando piezas o vehículos nuevos.' },
    { id: 'versus_brands', label: 'Marcas en Guerra', icon: '🔥', description: 'Rivalidades históricas (Mustang vs Camaro, etc).' },
    { id: 'lifestyle', label: 'Lifestyle / Ruta', icon: '🛣️', description: 'La libertad del camino y los road trips.' },
    { id: 'hidden_details', label: 'Detalles Ocultos', icon: '👀', description: 'Easter eggs y curiosidades de diseño.' },
    { id: 'garage_work', label: 'Garage & Spanner', icon: '🔧', description: 'Arte sucio de las manos en el motor.' },
    { id: 'abandoned', label: 'Barn Find / Olvidados', icon: '🕸️', description: 'La belleza de los autos clásicos abandonados.' },
    { id: 'b2b_recruitment', label: 'Unirse a CarMatch (B2B)', icon: '🤝', description: 'Atrae talleres, detailers y negocios a la red.' },
    { id: 'future_city', label: 'Ciudad Futurista', icon: '🚀', description: 'Conceptos en ciudades de neón y levitación.' },
    { id: 'weather', label: 'Clima Extremo', icon: '⛈️', description: 'Autos bajo lluvia, nieve o tormentas de arena.' },
    { id: 'curiosities', label: 'Datos Curiosos', icon: '🧠', description: 'Hechos sorprendentes y "¿Sabías que?".' },
    { id: 'comics', label: 'Historietas / Comics', icon: '🗯️', description: 'Narrativas cortas en formato de paneles visuales.' },
    { id: 'sound_visual', label: 'Visualización de Sonido', icon: '🔊', description: 'Representación visual del rugido del motor.' }
];

export const CAMPAIGN_NICHES = [
    'Autos de Lujo', 'JDM Underground', 'Muscle Cars', 'Off-Road / 4x4', 'Supercars / Hypercars',
    'Clásicos / Vintage', 'Motos de Pista', 'Café Racers', 'Camiones / Tractores', 'Taller Mecánico',
    'Detailing / Estética', 'Autolavado', 'Drift Culture', 'Drag Racing', 'Híbridos / Eléctricos',
    'Vehículos de Trabajo', 'Coches de Película', 'Prototipos / Concept', 'Tuning / Euro',
    'Exóticos / Raros', 'Fórmula 1 / Racing', 'Rally / WRC', 'Karts', 'SUV Familiar', 'Compactos / Daily',
    'Pickups / Trocas', 'Lowriders', 'Hot Rods', 'Motos Custom', 'Vans / Campers', 'Rat Rods',
    'Monster Trucks', 'Buses / Microbuses', 'Vehículos de Rescate', 'Maquinaria Pesada', 'Carros de Golf',
    'Patrullas de Policía', 'Ambulancias / SOS', 'Taxis del Mundo', 'Autos de Juguete / Hot Wheels',
    'Vehículos Militares', 'Limusinas / VIP', 'Quads / ATV', 'Snowmobiles', 'Refaccionaria', 
    'Llantera', 'Transmisiones', 'Frenos y Suspensión', 'Eléctrico Automotriz', 'Pintura y Hojalatería'
];

export const CAMPAIGN_AESTHETICS = [
    'Cinemática Hollywood', 'Minimalista / Apple style', 'Luxury Showroom / Clean',
    'Industrial Raw / Concrete', 'Vintage / 35mm Film', 'Noir / High Contrast', 
    'Anime / Studio Ghibli vibes', 'Street / Urban photography', 'Studio Art / Professional Light', 
    '90s JDM Nostalgia', 'Retro Futurism', 'B&W Classic', 'Dark / Moody', 
    'Blueprint / Technical', 'Dreamy / Golden Hour', 'High Octane / Motion Blur', 
    'Pop Art / Andy Warhol', 'Surrealista / Dalí style', 'Oil Painting / Classic Art', 
    'Vaporwave / Pastel 80s', 'Gothic / Dark Aesthetics', 'Hyper-Realistic Commercial',
    'Cyberpunk / Neon Night'
];
