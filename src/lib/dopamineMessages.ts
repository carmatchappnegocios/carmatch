
export const DOPAMINE_MESSAGE_TEMPLATES = {
    MAP_LIVE_ACTIVITY: [
        "🔥 ¡Actividad intensa! {count} personas buscando {category} en {city}",
        "📍 Alguien acaba de usar el radar MapStore cerca de tu ubicación",
        "🚀 Tu negocio está en el 'Hot Spot' de {city} ahora mismo",
        "🎯 Una búsqueda de emergencia coincidió con tu perfil de {category}",
        "📊 MapStore detectó un pico de interés en {category} en tu zona"
    ],

    AI_DIAGNOSTICS: [
        "🤖 Nuestra IA recomendó tu negocio para un problema de {category}",
        "✨ Un usuario recibió un diagnóstico y tú eres su mejor opción cercana",
        "🔍 Búsqueda inteligente: Alguien necesita {category} y te encontró",
        "💡 Tu especialidad en {category} fue resaltada por el buscador experto"
    ],

    MAP_VIEW: [
        "👀 Alguien escaneó tu ubicación exacta en MapStore",
        "📱 Tu perfil de negocio fue abierto desde el mapa en vivo",
        "🌟 Destacaste: Un usuario filtró por {category} y vio tu negocio",
        "📍 Visualización detectada: Alguien exploró tu zona en {city}"
    ],

    CATEGORY_SEARCH: [
        "🔍 Alguien buscó {category} específicamente en {city}",
        "⚡ Búsqueda rápida de {category} coincidió con tu negocio",
        "📱 Tu categoría {category} es tendencia en {city} hoy",
        "🏆 Eres el resultado #1 para una búsqueda local de {category}"
    ],

    NEARBY_ACTIVITY: [
        "📈 {count} personas están activas en MapStore cerca de ti",
        "🚗 Tráfico detectado: Usuarios buscando servicios en {city}",
        "🔔 El radar de CarMatch detectó movimiento en tu calle",
        "🌐 Tu zona ({city}) tiene {count} búsquedas activas en este momento"
    ],

    GENERAL: [
        "✨ Tu negocio llamó la atención en el ecosistema CarMatch",
        "🚀 Tienes un nuevo espectador interesado en tus servicios",
        "💪 ¡Sigue así! Tu visibilidad en el mapa está aumentando",
        "💎 Un cliente potencial revisó tus detalles hace un momento"
    ]
}

export function generateDopamineMessage(business: any): string {
    const categories = Object.keys(DOPAMINE_MESSAGE_TEMPLATES)
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const templates = DOPAMINE_MESSAGE_TEMPLATES[randomCategory as keyof typeof DOPAMINE_MESSAGE_TEMPLATES]
    const template = templates[Math.floor(Math.random() * templates.length)]

    // Reemplazar placeholders
    return template
        .replace('{category}', business.category || 'servicios automotrices')
        .replace('{city}', business.city || 'tu zona')
        .replace('{count}', String(Math.floor(Math.random() * 8) + 3)) // 3-10
}
