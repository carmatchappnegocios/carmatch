'use client'

import { useState, useMemo } from 'react'
import {
    Calendar, ChevronLeft, ChevronRight, Copy, Check, Clock, Target,
    ChevronDown, ChevronUp, X, BarChart3, Megaphone, Sparkles
} from 'lucide-react'

interface AdConfig {
    enabled: boolean
    objective: string
    audience: string
    budgetMXN: number
    placement: string
    durationDays: number
}

interface VideoMetrics {
    tiktok: { views: number; likes: number; shares: number; comments: number; clicks: number }
    instagram: { views: number; likes: number; shares: number; comments: number; saved: number }
    facebook: { reach: number; likes: number; shares: number; comments: number; clicks: number }
}

interface CalendarEntry {
    id: string
    date: string
    dayName: string
    dayNum: number
    month: string
    platform: string
    contentType: string
    title: string
    hook: string
    body: string
    cta: string
    caption: string
    gatillo: string
    gatilloIcon: string
    hashtags: string[]
    prompt: string
    tool: string
    postingTime: string
    adConfig: AdConfig
    adLink: string
    metrics: VideoMetrics
    status: string
    notes: string
    week: number
}

const GATILLOS: Record<string, { label: string; color: string }> = {
    'asombro': { label: 'Asombro', color: 'text-yellow-400' },
    'miedo': { label: 'Miedo', color: 'text-red-400' },
    'reciprocidad': { label: 'Reciprocidad', color: 'text-green-400' },
    'aversion-perdida': { label: 'Aversión a la Pérdida', color: 'text-orange-400' },
    'fomo': { label: 'FOMO', color: 'text-pink-400' },
    'escasez': { label: 'Escasez', color: 'text-purple-400' },
    'autoridad': { label: 'Autoridad', color: 'text-blue-400' },
    'prueba-social': { label: 'Prueba Social', color: 'text-cyan-400' },
    'urgencia': { label: 'Urgencia', color: 'text-red-500' },
    'utilidad': { label: 'Utilidad', color: 'text-emerald-400' },
    'entretenimiento': { label: 'Entretenimiento', color: 'text-violet-400' },
    'lista': { label: 'Lista', color: 'text-teal-400' },
    'tendencia': { label: 'Tendencia', color: 'text-fuchsia-400' },
    'comparacion': { label: 'Comparación', color: 'text-amber-400' },
    'personalizacion': { label: 'Personalización', color: 'text-rose-400' },
    'necesidad': { label: 'Necesidad', color: 'text-lime-400' },
    'seguridad': { label: 'Seguridad', color: 'text-sky-400' },
    'cariño': { label: 'Cariño', color: 'text-pink-300' },
    'curiosidad': { label: 'Curiosidad', color: 'text-indigo-400' },
    'temporada': { label: 'Temporada', color: 'text-orange-300' },
    'transformacion': { label: 'Transformación', color: 'text-green-300' },
    'proteccion': { label: 'Protección', color: 'text-blue-300' },
    'vigilancia': { label: 'Vigilancia', color: 'text-gray-400' },
    'alivio': { label: 'Alivio', color: 'text-green-200' },
    'anticipacion': { label: 'Anticipación', color: 'text-violet-300' },
    'expansion': { label: 'Expansión', color: 'text-cyan-300' },
    'gratitud': { label: 'Gratitud', color: 'text-amber-300' },
    'vision': { label: 'Visión', color: 'text-indigo-300' },
    'celebracion': { label: 'Celebración', color: 'text-yellow-300' },
    'historia': { label: 'Historia', color: 'text-amber-200' },
    'ahorro': { label: 'Ahorro', color: 'text-green-500' },
    'tranquilidad': { label: 'Tranquilidad', color: 'text-blue-200' },
    'comodidad': { label: 'Comodidad', color: 'text-teal-300' },
}

const PLATFORM_CONFIG: Record<string, { label: string; bgColor: string }> = {
    tiktok: { label: 'TikTok', bgColor: 'bg-black border border-white/20' },
    instagram: { label: 'Instagram', bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    facebook: { label: 'Facebook', bgColor: 'bg-blue-600' },
    youtube: { label: 'YouTube', bgColor: 'bg-red-600' },
    x: { label: 'X', bgColor: 'bg-black border border-white/20' },
    linkedin: { label: 'LinkedIn', bgColor: 'bg-blue-700' },
}

const WEEK_THEMES: Record<number, { title: string; gradient: string }> = {
    1: { title: 'Foundation: Cd. Juárez', gradient: 'from-blue-500 to-cyan-500' },
    2: { title: 'Foundation: Cd. Juárez', gradient: 'from-blue-500 to-cyan-500' },
    3: { title: 'Vendedores: Publicar Gratis', gradient: 'from-green-500 to-emerald-500' },
    4: { title: 'Vendedores: Crecimiento', gradient: 'from-green-500 to-emerald-500' },
    5: { title: 'Compradores: Swipe de Autos', gradient: 'from-purple-500 to-pink-500' },
    6: { title: 'Compradores: Decisión', gradient: 'from-purple-500 to-pink-500' },
    7: { title: 'Talleres: MiniWeb Gratis', gradient: 'from-orange-500 to-red-500' },
    8: { title: 'Talleres: Crecimiento', gradient: 'from-orange-500 to-red-500' },
    9: { title: 'Seguridad: SOS + GPS', gradient: 'from-red-500 to-rose-500' },
    10: { title: 'Seguridad: Confianza Total', gradient: 'from-red-500 to-rose-500' },
    11: { title: 'Expansión: Chihuahua → Monterrey', gradient: 'from-yellow-500 to-orange-500' },
    12: { title: 'Expansión: Guadalajara → CDMX', gradient: 'from-yellow-500 to-orange-500' },
}

const EMPTY_METRICS: VideoMetrics = {
    tiktok: { views: 0, likes: 0, shares: 0, comments: 0, clicks: 0 },
    instagram: { views: 0, likes: 0, shares: 0, comments: 0, saved: 0 },
    facebook: { reach: 0, likes: 0, shares: 0, comments: 0, clicks: 0 },
}

function makeEntry(week: number, dayOffset: number, platform: string, title: string, hook: string, body: string, cta: string, gatillo: string, hashtags: string[], prompt: string, adConfig: AdConfig, time?: string, customCaption?: string): CalendarEntry {
    const baseDate = new Date(2026, 8, 14 + ((week - 1) * 7) + dayOffset)
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const gatilloData = GATILLOS[gatillo] || { label: gatillo, color: 'text-white' }
    const contentType = platform === 'tiktok' ? 'video' : platform === 'instagram' ? (dayOffset % 2 === 0 ? 'reel' : 'carousel') : (dayOffset % 3 === 0 ? 'video' : 'image')
    const tool = contentType === 'video' || contentType === 'reel' ? 'CapCut AI' : 'Gemini'
    
    // Optimize hashtags by platform
    const optimizeHashtags = (): string[] => {
        if (platform === 'facebook') {
            return hashtags.slice(0, 2)
        } else if (platform === 'tiktok') {
            return hashtags.slice(0, 4)
        } else {
            return hashtags
        }
    }
    
    // Optimized posting times based on Sprout Social 2026 data
    const getOptimalTime = (): string => {
        if (time) return time
        const day = baseDate.getDay()
        // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        
        if (platform === 'tiktok') {
            // TikTok: 2-6pm peak, best Tue-Fri
            if (day === 2 || day === 3) return '3:00 PM'
            if (day === 4 || day === 5) return '4:00 PM'
            return '3:00 PM'
        } else if (platform === 'instagram') {
            // Instagram: 1-7pm peak, best Tue-Thu
            if (day === 2 || day === 3) return '2:00 PM'
            if (day === 4) return '1:00 PM'
            return '2:00 PM'
        } else {
            // Facebook: 12-8pm peak, best Tue-Wed
            if (day === 2 || day === 3) return '1:00 PM'
            return '12:00 PM'
        }
    }
    
    // Generate caption based on platform
    const generateCaption = (): string => {
        if (customCaption) return customCaption
        const optimizedTags = optimizeHashtags()
        const hashtagsStr = optimizedTags.join(' ')
        
        if (platform === 'tiktok') {
            return `${hook}\n\n${body}\n\n${cta}\n\n${hashtagsStr}\n\n🔗 carmatchapp.net`
        } else if (platform === 'instagram') {
            return `${hook}\n\n${body}\n\n${cta}\n\n${hashtagsStr}\n\n🔗 carmatchapp.net`
        } else {
            return `${hook}\n\n${body}\n\n${cta}\n\n${hashtagsStr}\n\ncarmatchapp.net`
        }
    }

    // Auto-calculate ad link based on content type
    const getAdLink = (): string => {
        const combined = `${prompt} ${cta} ${title} ${body}`.toLowerCase()
        const isBusiness = combined.includes('taller') || combined.includes('servicio') || combined.includes('negocio') || combined.includes('minweb') || combined.includes('citas')
        const baseUrl = isBusiness ? 'carmatchapp.net/map' : 'carmatchapp.net'
        return `carmatchapp.net/open?url=https://${baseUrl}`
    }

    return {
        id: `w${week}-d${dayOffset}-${platform}`,
        date: baseDate.toISOString().split('T')[0],
        dayName: dayNames[baseDate.getDay()],
        dayNum: baseDate.getDate(),
        month: months[baseDate.getMonth()],
        platform,
        contentType,
        title, hook, body, cta,
        caption: generateCaption(),
        gatillo,
        gatilloIcon: gatilloData.label,
        hashtags: optimizeHashtags(),
        prompt,
        tool,
        postingTime: getOptimalTime(),
        adConfig,
        adLink: getAdLink(),
        metrics: { ...EMPTY_METRICS },
        status: 'pending',
        notes: '',
        week,
    }
}

function ad(objective: string, audience: string, budget: number, placement: string, days: number): AdConfig {
    return { enabled: true, objective, audience, budgetMXN: budget, placement, durationDays: days }
}

// ═══════════════════════════════════════════════════════════════
// ALL 72 ENTRIES - 12 WEEKS
// ═══════════════════════════════════════════════════════════════

const ALL_ENTRIES: CalendarEntry[] = [
    // ═══ SEMANA 1: Foundation ═══
    makeEntry(1, 0, 'tiktok', 'Sube una foto. La IA llena 25 datos.', 'Mano tomando foto → interfaz IA llenando datos en 3s', 'La IA de CarMatch detecta marca, modelo, año y llena 25 campos. Sin escribir nada.', 'Descarga CarMatch y prueba gratis', 'asombro', ['#CarMatch','#AutosUsados','#IA','#CdJuarez','#ComprarAuto'], `Close-up smartphone, AI scanning Honda Civic, holographic data fields auto-filled, blue neon UI, Mexican city golden hour, Sony A7R IV 85mm f/1.4`, ad('trafico', 'Cd. Juárez +50km, 21-55 años, autos, tecnología', 21, 'Feed + Reels + Stories', 2), '12:00 PM'),

    makeEntry(1, 1, 'instagram', 'Ella se protege. Tú también.', 'Mujer nerviosa en estacionamiento oscuro, recibe notificación CarMatch', 'Activa CarMatch SOS. Su papá recibe ubicación en tiempo real. Ella llega segura.', 'Activa CarMatch SOS. Tu seguridad no es opcional.', 'miedo', ['#CarMatch','#SOS','#SeguridadMujer','#CdJuarez','#Proteccion'], `Young Mexican woman in car at night, phone glows CarMatch SOS interface, red emergency button, dark parking, cinematic blue/red lighting`, ad('interaccion', 'Mujeres 21-45, Cd. Juárez, seguridad, tecnología', 21, 'Feed + Reels + Stories', 2), '1:00 PM'),

    makeEntry(1, 2, 'facebook', 'Tu taller mecánico necesita web. Gratis.', 'Carrusel: talleres mexicanos before/after con MiniWeb', 'El 90% de talleres NO tienen web. CarMatch les da una GRATIS con chatbot 24/7.', 'Registra tu taller gratis en CarMatch', 'reciprocidad', ['#CarMatch','#Talleres','#Negocios','#CdJuarez'], `Split: LEFT dusty workshop no sign. RIGHT same workshop with CarMatch MiniWeb display, appointments, chatbot, Google Maps pin`, ad('leads', 'Dueños de talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Feed + Groups', 3), '1:00 PM'),

    makeEntry(1, 3, 'tiktok', 'El error #1 al comprar auto usado', 'Persona con motor dañado, cara de decepción, $50,000 aparece', 'El 60% de autos en Facebook tienen fraude oculto. CarMatch verifica todo.', 'No cometas este error. Descarga CarMatch.', 'aversion-perdida', ['#CarMatch','#AutoUsado','#Fraude','#Estafa','#CdJuarez'], `Frustrated man next to car with hood open, engine problems, holding phone showing Facebook listing that looked perfect, Mexican residential street`, ad('trafico', 'Cd. Juárez +50km, 21-45, autos usados', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(1, 4, 'instagram', '100 autos cerca de ti. Ahora.', 'Deslizando autos en CarMatch como Tinder', 'Abre CarMatch. Activa ubicación. Descubre 100+ autos verificados cerca de ti.', 'Desliza ahora en carmatchapp.net/swipe', 'fomo', ['#CarMatch','#Swipe','#AutosCerca','#CdJuarez','#ComprarAuto'], `Smartphone Tinder-like interface with cars, swiping right on red Volkswagen Jetta, multiple car cards fading, Mexican cityscape reflected`, ad('trafico', 'Cd. Juárez +50km, 21-35, autos, tecnología', 21, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(1, 5, 'facebook', 'AUTO DE LA SEMANA: Honda Civic 2020', 'Foto profesional Honda Civic 2020 plateado, ángulo bajo cinematográfico', '🚗 Honda Civic 2020 - $180,000 MXN. 📍 Cd. Juárez. ✅ Verificado CarMatch. 🔥 15 personas lo han visto hoy.', 'Ver más autos en CarMatch', 'escasez', ['#CarMatch','#HondaCivic','#AutoDeLaSemana','#CdJuarez'], `Silver 2020 Honda Civic in clean parking lot, low angle powerful look, golden hour long shadows, mountains background, professional automotive photography`, ad('alcance', 'Cd. Juárez +100km, 21-55, Honda, seminuevos', 21, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 2: Foundation ═══
    makeEntry(2, 0, 'tiktok', 'Compara 5 talleres antes de ir', '5 talleres con precios, calificaciones, distancias', 'No vayas al primero que encuentres. Compara precios, reseñas, y distancias.', 'Compara ahora en CarMatch', 'utilidad', ['#CarMatch','#Talleres','#Compara','#Mecanico','#CdJuarez'], `Smartphone 5 workshops comparison grid, star ratings, prices, distances, clean CarMatch UI, blurred Mexican street`, ad('trafico', 'Cd. Juárez +50km, 25-55, mecánica, autos', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(2, 1, 'instagram', 'Tu auto aparece en Google. Gratis.', 'Búsqueda Google mostrando resultado con foto profesional CarMatch', 'Publica tu auto en CarMatch y aparece en Google SIN pagar publicidad.', 'Publica tu auto gratis en CarMatch', 'autoridad', ['#CarMatch','#Google','#VenderAuto','#Gratis','#CdJuarez'], `Google search results on laptop showing CarMatch listing, professional photo, 25 fields, #1 ranking "Honda Civic 2020 Cd Juarez"`, ad('leads', 'Cd. Juárez +100km, vendedores, 25-55', 21, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(2, 2, 'facebook', '500+ personas ya confían en CarMatch', 'Infografía: 500+ usuarios, 200+ autos, 50+ talleres, 4.8 calificación', '🚀 En 2 semanas: 500+ usuarios, 200+ autos, 50+ talleres, 4.8 estrellas.', 'Únete gratis en carmatchapp.net', 'prueba-social', ['#CarMatch','#Confianza','#CdJuarez','#500Usuarios'], `Modern infographic: 500+ users, 200+ vehicles, 50+ workshops, 4.8 rating, dark background blue/orange glow, professional data viz`, ad('alcance', 'Cd. Juárez +100km, 21-65', 21, 'Feed', 3), '1:00 PM'),

    makeEntry(2, 3, 'tiktok', '¿Tu taller no tiene web? Perdiendo dinero.', 'Taller vacío vs taller con cola de clientes', 'El 90% buscan talleres en Google. Si no estás ahí, van al de al lado.', 'Registra tu taller gratis HOY', 'aversion-perdida', ['#CarMatch','#Talleres','#Negocio','#Dinero','#CdJuarez'], `Split: LEFT empty workshop idle owner. RIGHT same workshop packed customers, glowing "CarMatch MiniWeb" notification`, ad('leads', 'Dueños de talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(2, 4, 'instagram', 'Compara precios de 5 talleres en 10s', 'Timelapse: 5 presupuestos apareciendo y comparándose', 'Aceite + filtro: $800, $650, $900, $580, $720. ¿Cuál eliges?', 'Compara precios en CarMatch', 'utilidad', ['#CarMatch','#Precios','#Mecanico','#Ahorro','#CdJuarez'], `Smartphone 5 price quotes, green highlight best deal, clean UI, phone on mechanic workbench with tools`, ad('trafico', 'Cd. Juárez +50km, 25-55, ahorro, mecánica', 21, 'Reels + Stories', 2), '8:30 PM'),

    makeEntry(2, 5, 'facebook', 'Último Volkswagen Jetta a este precio', 'Foto profesional VW Jetta negro con precio tachado', '🚗 VW Jetta 2019 - Antes: $220,000 → Ahora: $175,000 MXN. ⚠️ Solo queda 1.', 'Contacta al vendedor ahora', 'escasez', ['#CarMatch','#VolkswagenJetta','#UltimaUnidad','#CdJuarez'], `Black 2019 VW Jetta in front of modern Mexican house, dramatic side lighting, price "$175,000" with "$220,000" crossed out`, ad('trafico', 'Cd. Juárez +100km, 25-55, Volkswagen', 21, 'Feed', 2), '7:00 PM'),

    // ═══ SEMANA 3: Vendedores ═══
    makeEntry(3, 0, 'tiktok', 'Vendes tu auto? Publícalo gratis.', 'Mano presionando "Publicar", auto aparece con datos', 'Sube una foto. La IA llena 25 datos. Tu auto en Google SIN pagar.', 'Publica tu auto gratis ahora', 'reciprocidad', ['#CarMatch','#VenderAuto','#Gratis','#CdJuarez'], `Hand tapping "PUBLICAR" button, car published with auto-filled data, confetti, car for sale sign on Mexican street`, ad('leads', 'Cd. Juárez +100km, vendedores, 25-65', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(3, 1, 'instagram', 'Tu auto en 25 datos profesionales', 'Lado a lado: listing informal Facebook vs listing CarMatch', 'Facebook: "Vendo Honda Civic, sin choques." CarMatch: 25 datos verificados, fotos profesionales.', 'Mira la diferencia en CarMatch', 'asombro', ['#CarMatch','#Profesional','#VenderAuto','#Datos','#CdJuarez'], `Split: LEFT blurry photo "Vendo Honda Civic". RIGHT professional CarMatch listing 25 fields, badge`, ad('trafico', 'Cd. Juárez +100km, vendedores, 25-55', 21, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(3, 2, 'facebook', '1,234 autos ya están publicados', 'Counter animándose de 0 a 1,234 con fotos', '📊 1,234 autos, 89 talleres, 2,100+ usuarios, 4.8 estrellas. ¿Ya publicaste el tuyo?', 'Publica tu auto gratis', 'prueba-social', ['#CarMatch','#CdJuarez','#1234Autos','#Crecimiento'], `Large counter "1,234 AUTOS" with car icons, dark background blue/orange glow, modern dashboard`, ad('alcance', 'Cd. Juárez +100km, 21-65', 21, 'Feed', 3), '1:00 PM'),

    makeEntry(3, 3, 'tiktok', '¿Por qué no se vende tu auto?', 'Auto con letrero "SE VENDE" polvoriento, dueño frustrado', 'Sin fotos profesionales, sin 25 datos, sin Google. CarMatch resuelve TODO.', 'Resuelve esto en CarMatch', 'urgencia', ['#CarMatch','#VenderAuto','#Problema','#Solucion','#CdJuarez'], `Frustrated man with dusty "SE VENDE" sign, no calls on phone, car looks nice but poor presentation`, ad('trafico', 'Cd. Juárez +100km, vendedores frustrados, 25-65', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(3, 4, 'instagram', 'Foto profesional de tu auto. Gratis.', 'Transformación: foto amateur → foto profesional IA en 3s', 'La IA convierte tu foto amateur en imagen profesional con fondo de estudio.', 'Prueba la IA de CarMatch gratis', 'reciprocidad', ['#CarMatch','#IA','#Fotografia','#Gratis','#CdJuarez'], `Before/after: LEFT blurry amateur car photo. RIGHT same car professional studio perfect lighting`, ad('trafico', 'Cd. Juárez +100km, vendedores, 25-55', 21, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(3, 5, 'facebook', 'Este auto se vendió en 3 días con CarMatch', 'Foto auto con badge "VENDIDO EN 3 DÍAS" y testimonio', '🎉 "Mi Golf se vendió en 3 días. Antes llevaba 2 meses en Facebook." - Carlos', 'Publica tu auto gratis', 'fomo', ['#CarMatch','#Vendido','#Exito','#CdJuarez'], `Volkswagen Golf with "VENDIDO EN 3 DÍAS" stamp, testimonial 5 stars, clean delivery setting, confetti`, ad('alcance', 'Cd. Juárez +100km, vendedores, 25-65', 21, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 4: Vendedores ═══
    makeEntry(4, 0, 'tiktok', 'Sin esto, no vendes tu auto', 'Checklist: 3 cosas que NECESITAS para vender', '✅ Fotos profesionales. ✅ 25 datos. ✅ Google. CarMatch las 3 GRATIS.', 'Activa las 3 gratis en CarMatch', 'aversion-perdida', ['#CarMatch','#VenderAuto','#Checklist','#Gratis','#CdJuarez'], `Smartphone checklist 3 items checked off, each reveals feature, "SE VENDE" turns "VENDIDO"`, ad('leads', 'Cd. Juárez +100km, vendedores, 25-65', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(4, 1, 'instagram', 'Tu competencia ya está en CarMatch', 'Vendedor frustrado (Facebook) vs vendedor exitoso (CarMatch)', 'Mientras tú en Facebook, tu competencia ya publicó 50 autos y se vendieron.', 'Únete antes de que sea tarde', 'fomo', ['#CarMatch','#Competencia','#NoTeQuedes','#CdJuarez'], `Two men: LEFT frustrated 0 calls (Facebook). RIGHT celebrating 10+ inquiries (CarMatch)`, ad('leads', 'Cd. Juárez +100km, vendedores activos, 25-55', 21, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(4, 2, 'facebook', 'Auto verificado se vende 3x más rápido', 'Gráfica: auto verificado vs sin verificar', '📊 Sin verificar: 45 días. Verificado CarMatch: 15 días. 3x más rápido.', 'Verifica tu auto gratis', 'autoridad', ['#CarMatch','#Verificado','#Datos','#Rapido','#CdJuarez'], `Infographic: red bar "45 días" vs green "15 días", dramatic difference, professional data viz`, ad('alcance', 'Cd. Juárez +100km, vendedores, 25-65', 21, 'Feed', 3), '1:00 PM'),

    makeEntry(4, 3, 'tiktok', 'El secreto para vender rápido', 'Persona compartiendo "secreto" al oído', 'El secreto: publica en 3 plataformas a la vez. CarMatch lo hace AUTOMÁTICO.', 'Activa publicación multi-plataforma gratis', 'curiosidad', ['#CarMatch','#Secreto','#VenderRapido','#Tips','#CdJuarez'], `Person whispering secret, "3 plataformas a la vez" floating text, mysterious blue lighting`, ad('trafico', 'Cd. Juárez +100km, vendedores, 25-55', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(4, 4, 'instagram', 'Vendedor top: 12 autos vendidos', 'Montaje 12 autos con badge "VENDIDO"', '🏆 Roberto vendió 12 autos en octubre. "Sin CarMatch no hubiera sido posible."', 'Sé el próximo vendedor top', 'prueba-social', ['#CarMatch','#VendedorTop','#Exito','#CdJuarez'], `Proud dealer in front of 12 "VENDIDO" cars, CarMatch award, professional dealership golden light`, ad('alcance', 'Cd. Juárez +100km, dealers, 25-55', 21, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(4, 5, 'facebook', 'Último día: publica tu auto gratis', 'Reloj countdown "ÚLTIMO DÍA"', '⏰ HOY ES EL ÚLTIMO DÍA gratis. Mañana $20 MXN/mes.', 'Publica gratis ANTES de medianoche', 'urgencia', ['#CarMatch','#ÚltimoDía','#Gratis','#Urgencia','#CdJuarez'], `Dramatic countdown clock "00:04:59:59", red urgent, car silhouettes fading`, ad('leads', 'Cd. Juárez +100km, vendedores, 25-65', 21, 'Feed', 1), '7:00 PM'),

    // ═══ SEMANA 5: Compradores ═══
    makeEntry(5, 0, 'tiktok', 'Swipe de autos como Tinder', 'Interfaz Tinder con autos', 'Desliza para descubrir. Swipe right si te gusta. Auto ideal en segundos.', 'Descarga y desliza ahora', 'entretenimiento', ['#CarMatch','#Swipe','#TinderDeAutos','#CdJuarez'], `Smartphone Tinder interface with car cards, about to swipe red sports car, clean CarMatch UI`, ad('trafico', 'Cd. Juárez +50km, 21-35, autos, dating apps', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(5, 1, 'instagram', '5 autos con menos de $100K', 'Countdown 5 autos baratos con precios', '💰 Spark $65K, March $72K, i10 $78K, Picanto $85K, Beat $88K. Sí se puede.', 'Más autos baratos en CarMatch', 'lista', ['#CarMatch','#AutosBaratos','#Menos100K','#CdJuarez'], `Five affordable cars with price tags under $100K, clean attractive cars, modern dealership`, ad('trafico', 'Cd. Juárez +100km, 18-35, primer auto', 21, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(5, 2, 'facebook', 'El futuro es eléctrico', 'Foto auto eléctrico cargando', '⚡ Los EVs llegan a México. 🔋 CarMatch ya tiene sección de EVs.', 'Explora autos eléctricos', 'tendencia', ['#CarMatch','#Electrico','#EV','#Futuro','#CdJuarez'], `Modern EV at charging station sunset, futuristic premium, Mexico City skyline mountains`, ad('alcance', 'Cd. Juárez +100km, 25-55, tecnología', 21, 'Feed', 3), '1:00 PM'),

    makeEntry(5, 3, 'tiktok', 'Este error te cuesta $50,000', 'Persona descubriendo problema oculto, horror, $50,000', 'No checar historial. Ese "buen deal" puede costarte $50K en reparaciones.', 'Checa el historial antes de comprar', 'aversion-perdida', ['#CarMatch','#Error','#Historial','#Estafa','#CdJuarez'], `Person shocked at $50,000 mechanic bill, car hood open engine problems, holding head`, ad('trafico', 'Cd. Juárez +100km, 21-45, compradores', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(5, 4, 'instagram', 'Civic vs Corolla: ¿cuál gana?', 'Split screen Honda Civic vs Toyota Corolla', '⚖️ Precio: similar. Confiabilidad: similar. Potencia: Civic. Comodidad: Corolla.', 'Compara y decide en CarMatch', 'comparacion', ['#CarMatch','#CivicVsCorolla','#Comparacion','#CdJuarez'], `Dramatic split: Honda Civic left, Toyota Corolla right, lightning bolt middle`, ad('interaccion', 'Cd. Juárez +100km, 21-45, Honda, Toyota', 21, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(5, 5, 'facebook', 'El auto perfecto para ti. La IA lo sabe.', 'Persona respondiendo preguntas IA, recibe recomendación', '🤖 IA pregunta: ¿cuánto? ¿cuántas personas? ¿urbano? En 30s: tu auto ideal.', 'Prueba la IA de CarMatch', 'personalizacion', ['#CarMatch','#IA','#AutoIdeal','#Personalizado','#CdJuarez'], `Person chatting with AI on phone, questions with icons, perfect car recommendation confetti`, ad('trafico', 'Cd. Juárez +100km, 21-45, IA, tecnología', 21, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 5 EVERGREEN: Tips de compra ═══
    makeEntry(5, 6, 'tiktok', '5 señales de que un auto tiene problemas', 'Mecánico señalando 5 problemas comunes', '🔧 Aceite en el piso. 🔴 Luces del dashboard. 🔊 Ruidos extraños. 💨 Humo. ⚠️ Frenos blandos.', 'Aprende más en carmatchapp.net', 'utilidad', ['#AutoTips','#ComprarAuto','#Problemas','#Mecanico','#CdJuarez'], `Mechanic pointing at 5 car problems: oil leak, dashboard lights, strange noises, smoke, soft brakes`, ad('trafico', 'Cd. Juárez +100km, 21-45, compradores', 21, 'Feed + Reels', 2), '4:00 PM'),

    makeEntry(5, 7, 'instagram', 'Checklist: 10 cosas antes de comprar auto usado', 'Lista visual con checkboxes', '📋 Historial. 📸 Fotos reales. 🔍 Verificación. 💰 Precio vs mercado. 📝 Contrato.', 'Guarda este post para tu compra', 'lista', ['#AutoTips','#Checklist','#CompraSegura','#CdJuarez'], `Visual checklist with 10 items: history, photos, verification, price, contract, etc.`, ad('alcance', 'Cd. Juárez +100km, 21-45, compradores', 21, 'Reels + Stories', 2), '2:00 PM'),

    // ═══ SEMANA 6 EVERGREEN: Tips de compra ═══
    makeEntry(6, 6, 'tiktok', '¿Cuánto vale tu auto? Descúbrelo en 30s', 'Persona usando calculadora de valor', '💰 Ingresa marca, modelo, año. La IA calcula el precio justo. Sin compromiso.', 'Calcula tu precio en carmatchapp.net', 'utilidad', ['#ValorAuto','#PrecioJusto','#IA','#CdJuarez'], `Person using phone to calculate car value, AI interface showing price estimate`, ad('trafico', 'Cd. Juárez +100km, 21-55, vendedores', 21, 'Feed + Reels', 2), '3:00 PM'),

    makeEntry(6, 7, 'facebook', 'Tips: Cómo mantener tu auto como nuevo', 'Infografía de mantenimiento básico', '🔧 Aceite cada 5,000km. 🛞 Rotación cada 10,000km. 🧹 Limpieza mensual. 📅 Servicio a tiempo.', 'Guarda este post importante', 'utilidad', ['#MantenimientoAuto','#Tips','#Cuidado','#CdJuarez'], `Infographic showing basic car maintenance tips: oil change, tire rotation, cleaning, service schedule`, ad('alcance', 'Cd. Juárez +100km, 21-55, dueños de autos', 21, 'Feed', 3), '1:00 PM'),

    // ═══ SEMANA 7 EVERGREEN: Tips de talleres ═══
    makeEntry(7, 6, 'tiktok', '¿Sabías que tu taller puede tener web gratis?', 'Taller vacío vs taller lleno con web', '📱 Web profesional gratis. 📞 Chatbot 24/7. ⭐ Reseñas en Google. Los clientes te encuentran.', 'Registra tu taller gratis en carmatchapp.net', 'asombro', ['#Talleres','#WebGratis','#Negocio','#CdJuarez'], `Split: empty workshop vs packed workshop with digital display, CarMatch MiniWeb notifications`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Feed + Reels', 2), '4:00 PM'),

    makeEntry(7, 7, 'instagram', 'Checklist: Tu taller necesita esto', 'Lista de features que necesitas', '✅ MiniWeb gratis. ✅ Chatbot 24/7. ✅ Citas en línea. ✅ Google Maps. Todo GRATIS.', 'Registra tu taller ahora', 'lista', ['#Talleres','#Checklist','#Gratis','#CdJuarez'], `Visual checklist: MiniWeb, chatbot, online appointments, Google Maps - all free`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Reels + Stories', 2), '2:00 PM'),

    // ═══ SEMANA 6: Compradores ═══
    makeEntry(6, 0, 'tiktok', 'No compres sin ver esto', 'Lista 5 cosas verificar ANTES de comprar', '⚠️ Historial, vendedor verificado, punto seguro, fotos reales, precio. Todo GRATIS.', 'Verifica antes de comprar', 'miedo', ['#CarMatch','#Verifica','#CompraSegura','#CdJuarez'], `Warning checklist with red alert icons, shadowy scammer in background, dramatic red lighting`, ad('trafico', 'Cd. Juárez +100km, 21-45, compradores primerizos', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(6, 1, 'instagram', 'Tu auto ideal te espera', 'Montaje 10 autos con comprador sonriente', 'SUV para familia. Deportivo para ti. Eléctrico para el futuro.', 'Encuentra el tuyo en CarMatch', 'cariño', ['#CarMatch','#AutoIdeal','#TuAuto','#CdJuarez'], `Montage: family+SUV, young+sports, eco+EV, professional+sedan, all smiling Mexican backgrounds`, ad('alcance', 'Cd. Juárez +100km, 21-55', 21, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(6, 2, 'facebook', '15 personas buscan este auto AHORA', 'Listing con contador de vistas tiempo real', '🔥 Honda CR-V 2021. 👁️ 15 viendo. 💬 8 mensajes. ⏰ Último a este precio.', 'Ver antes de que se vaya', 'fomo', ['#CarMatch','#FOMO','#ÚltimaOportunidad','#CdJuarez'], `Car listing with live counter "15 viendo AHORA", notifications popping, dark red accents`, ad('trafico', 'Cd. Juárez +100km, 25-55, compradores activos', 21, 'Feed', 2), '1:00 PM'),

    makeEntry(6, 3, 'tiktok', 'Compara antes de comprar. Siempre.', 'Tres personas: triste, neutral, feliz (CarMatch)', 'Sin comparar: pagas de más. Google: pierdes tiempo. CarMatch: ahorras.', 'Compara en CarMatch', 'utilidad', ['#CarMatch','#Compara','#Ahorra','#Tiempo','#CdJuarez'], `Three people: LEFT overpriced car (sad), MIDDLE Google (frustrated), RIGHT CarMatch (happy)`, ad('trafico', 'Cd. Juárez +100km, 25-55, compradores', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(6, 4, 'instagram', 'Prueba de manejo segura con CarMatch', 'Persona en prueba con GPS y trusted contacts', '🔒 GPS en tiempo real. 👥 Contactos notificados. ⏰ Check-in 20 min. 🚨 SOS.', 'Activa CarMatch para tu prueba', 'seguridad', ['#CarMatch','#PruebaDeManejo','#Seguridad','#GPS','#CdJuarez'], `Person test-driving, phone dashboard showing CarMatch GPS, green route, notification "Papá monitoreando"`, ad('interaccion', 'Cd. Juárez +100km, 18-35, compradores primerizos', 21, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(6, 5, 'facebook', 'Auto verificado = confianza total', 'Badge verificación premium', '✅ Historial. Fotos reales. Precio vs mercado. Vendedor verificado. Documentos.', 'Busca autos verificados', 'autoridad', ['#CarMatch','#Verificado','#Confianza','#CdJuarez'], `Car with large CarMatch verification badge glowing, premium showroom, "100% VERIFICADO"`, ad('alcance', 'Cd. Juárez +100km, 25-55, compradores cautelosos', 21, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 7: Talleres ═══
    makeEntry(7, 0, 'tiktok', 'Tu taller necesita esto HOY', 'Taller estresado vs con sistema CarMatch', '📞 Llamadas perdidas. 📅 Citas en papel. vs 📱 Citas automáticas. 🤖 Chatbot 24/7.', 'Registra tu taller gratis', 'necesidad', ['#CarMatch','#Talleres','#Negocio','#Transformacion','#CdJuarez'], `Split: chaotic workshop papers everywhere. Right: organized with digital display, calm owner`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(7, 1, 'instagram', 'Chatbot que responde 24/7. Gratis.', 'Simulación chatbot respondiendo a 3AM', 'Cliente: "¿Cuánto aceite?" CarMatch: "$650. ¿Agenda cita?" Cliente: "Sí, mañana 10"', 'Activa tu chatbot gratis', 'asombro', ['#CarMatch','#Chatbot','#IA','#24/7','#CdJuarez'], `Phone chat at 3AM, chatbot responds instantly professional answers, clean interface`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(7, 2, 'facebook', 'Citas en línea. Sin llamadas. Sin papel.', 'Demo: cliente agenda en 3 taps', '📱 1. Servicio. 2. Fecha/hora. 3. Confirma. 📅 Taller recibe notificación + datos + historial.', 'Activa citas en línea gratis', 'comodidad', ['#CarMatch','#CitasEnLinea','#SinLlamadas','#CdJuarez'], `Customer booking on phone, time slots, workshop owner receives notification on tablet, both satisfied`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Feed', 3), '1:00 PM'),

    makeEntry(7, 3, 'tiktok', '¿Cuándo fue tu último servicio?', 'Dashboard recordatorios de servicio', 'Tu auto: "Mi último aceite fue hace 8,000 km." CarMatch te avisa.', 'Registra tu auto en CarMatch', 'urgencia', ['#CarMatch','#ServicioAuto','#Recordatorio','#CdJuarez'], `Car dashboard "ALERTA: Servicio vencido 500 km", phone shows CarMatch timeline`, ad('trafico', 'Cd. Juárez +100km, dueños autos, 25-55', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(7, 4, 'instagram', 'Tu taller en Google Maps. Sin pagar.', 'Búsqueda Google Maps con pin CarMatch', 'Tu taller aparece en Google Maps SIN pagar. Solo registra en CarMatch.', 'Registra tu taller gratis', 'autoridad', ['#CarMatch','#GoogleMaps','#Talleres','#Gratis','#CdJuarez'], `Google Maps workshop with CarMatch badge, 4.8 stars, photos, others without badge`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(7, 5, 'facebook', 'Halloween: tu auto te necesita', 'Auto disfrazado Halloween con checklist', '🎃 Luces ✓ (fantasmas). Frenos ✓ (zombis). Batería ✓ (huir rápido).', 'Registra tu auto gratis', 'temporada', ['#CarMatch','#Halloween','#Auto','#Servicio','#CdJuarez'], `Car decorated Halloween spooky lights, jack-o-lanterns, CarMatch checklist overlay`, ad('interaccion', 'Cd. Juárez +100km, 21-45', 21, 'Feed', 2), '7:00 PM'),

    // ═══ SEMANA 8: Talleres ═══
    makeEntry(8, 0, 'tiktok', 'Taller sin citas = caos', 'Taller abrumado con clientes sin cita', 'Sin sistema: esperan horas, se enojan, no regresan. Con CarMatch: todo organizado.', 'Organiza tu taller gratis', 'aversion-perdida', ['#CarMatch','#Talleres','#Caos','#Organizacion','#CdJuarez'], `Chaotic workshop multiple waiting customers, frustrated overwhelmed owner`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(8, 1, 'instagram', 'Antes vs Después de CarMatch', 'Timelapse: desordenado → sistema brillando', '📱 Antes: Llamadas, papel. Después: Chatbot, citas online, clientes felices.', 'Transforma tu taller hoy', 'transformacion', ['#CarMatch','#AntesDespues','#Transformacion','#CdJuarez'], `Dramatic before/after: LEFT dark chaotic. RIGHT bright organized dashboard`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(8, 2, 'facebook', '200 talleres ya tienen MiniWeb', 'Mapa Cd. Juárez con 200 pins', '🏪 200 talleres: Chatbot, Citas, Google, Dashboard. ¿Tu taller es el próximo?', 'Registra tu taller gratis', 'prueba-social', ['#CarMatch','#Talleres','#200Talleres','#CdJuarez'], `Map Cd. Juárez 200 glowing pins, CarMatch badge each, city lit up`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Feed', 3), '1:00 PM'),

    makeEntry(8, 3, 'tiktok', 'Tu cliente te busca 24/7', 'Reloj girando con búsquedas a todas horas', '3AM: "Taller cerca". 6AM: "¿Aceite?". 11PM: "Taller abierto". Sin CarMatch van al de al lado.', 'Está ahí cuando te busquen', 'necesidad', ['#CarMatch','#Clientes','#24/7','#Negocio','#CdJuarez'], `Clock spinning, phone notifications at each time customer searches`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(8, 4, 'instagram', '"Mis ventas subieron 40%"', 'Testimonial con gráfica de ventas', '⭐ "Desde CarMatch, mis ventas subieron 40%. El chatbot responde lo que yo no podía."', 'Únete a los talleres exitosos', 'prueba-social', ['#CarMatch','#Testimonial','#Exito','#Talleres','#CdJuarez'], `Happy workshop owner testimonial, 40% sales graph behind, busy successful workshop`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(8, 5, 'facebook', 'Registra tu taller gratis. Sin compromiso.', 'Formulario 3 campos', '📝 30 segundos: Nombre, Dirección, Teléfono. ✅ Chatbot, MiniWeb, Google Maps. Sin tarjeta.', 'Registra tu taller AHORA', 'reciprocidad', ['#CarMatch','#Gratis','#Talleres','#SinCompromiso','#CdJuarez'], `Simple registration form 3 fields, icons: chatbot, miniweb, Google Maps with checkmarks`, ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 21, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 9: Seguridad ═══
    makeEntry(9, 0, 'tiktok', 'Va a verse con un desconocido. Sin CarMatch.', 'Mujer nerviosa hacia estacionamiento oscuro', 'Sin CarMatch: nadie sabe dónde estás. Sin GPS. Sin SOS. Estás sola.', 'No vayas sin CarMatch', 'miedo', ['#CarMatch','#SOS','#Seguridad','#Desconocido','#CdJuarez'], `Young woman walking alone dark parking lot, nervous, no one knows where she is, cinematic horror lighting`, ad('interaccion', 'Mujeres 21-45, Cd. Juárez', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(9, 1, 'instagram', 'Ella activó SOS. Llegó su papá.', 'Secuencia: SOS → alerta → llega → abrazo', '🚨 SOS activado. 📱 Papá notificado. 📍 Ubicación real. 🚗 Llega en 5 min. 😌 Segura.', 'Activa SOS para tu familia', 'alivio', ['#CarMatch','#SOS','#Familia','#Proteccion','#CdJuarez'], `Father rushing to daughter, arrives, she hugs him, both relieved, CarMatch app showing SOS`, ad('interaccion', 'Familias, 30-55, Cd. Juárez', 21, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(9, 2, 'facebook', '12 personas buscan este auto AHORA', 'Listing con contador tiempo real', '🔥 Toyota Camry 2021. 👁️ 12 viendo. 💬 5 mensajes. ⏰ Actualizado hace 2 min.', 'Ver antes de que se vaya', 'fomo', ['#CarMatch','#FOMO','#ÚltimaOportunidad','#CdJuarez'], `Car listing live counter "12 viendo AHORA", notifications, urgency countdown`, ad('trafico', 'Cd. Juárez +100km, compradores, 25-55', 21, 'Feed', 2), '1:00 PM'),

    makeEntry(9, 3, 'tiktok', 'Ubicación en tiempo real', 'Persona en ruta + familia monitoreando', '📍 Tiempo real. 👥 Familia te ve. ⏰ Check-in 20 min. 🚨 SOS.', 'Activa GPS tracking gratis', 'seguridad', ['#CarMatch','#GPS','#TiempoReal','#Familia','#CdJuarez'], `Split: LEFT person driving. RIGHT family watching location on map real time, glowing line`, ad('interaccion', 'Familias, 25-55, Cd. Juárez', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(9, 4, 'instagram', 'Trusted Contacts: tu red de seguridad', 'Persona agregando contactos, cada uno notificado', '👥 Agrega familia. 📱 Ellos reciben tu ubicación. 🚨 Si SOS, ellos saben.', 'Configura tus contactos ahora', 'proteccion', ['#CarMatch','#TrustedContacts','#RedDeSeguridad','#CdJuarez'], `Phone Trusted Contacts setup, 3 family members added, each gets notification`, ad('interaccion', 'Familias, 25-55, Cd. Juárez', 21, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(9, 5, 'facebook', 'Check-in cada 20 minutos', 'Timeline check-ins automáticos', '📍 8:00 Casa. 📍 8:20 Ruta. 📍 8:40 Trabajo. 📍 9:00 Trabajo. Siempre saben.', 'Activa check-ins automáticos', 'vigilancia', ['#CarMatch','#CheckIn','#Automatico','#Familia','#CdJuarez'], `Timeline automatic check-ins every 20min, location pins timestamps, modern CarMatch branding`, ad('interaccion', 'Familias, 25-55, Cd. Juárez', 21, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 10: Seguridad ═══
    makeEntry(10, 0, 'tiktok', 'GPS tracking mientras manejas', 'Vista aérea ciudad con GPS moviéndose', 'Tu ubicación cada segundo. Tu familia te ve. Si algo pasa, ellos saben.', 'Activa GPS tracking gratis', 'seguridad', ['#CarMatch','#GPS','#Tracking','#Seguridad','#CdJuarez'], `Aerial city view GPS dot moving real time, connected to family watching phones, glowing line`, ad('interaccion', 'Familias, 25-55, Cd. Juárez', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(10, 1, 'instagram', 'Tu familia sabe dónde estás', 'Madre mirando celular, ve ubicación de hijo, sonríe', '📍 Madre ve hijo en camino. 😌 Sabe que está seguro. 📱 Paz mental.', 'Activa para tu familia', 'tranquilidad', ['#CarMatch','#Familia','#Tranquilidad','#Seguridad','#CdJuarez'], `Mother looking at phone showing son's location map, smiling relieved, warm home soft lighting`, ad('interaccion', 'Familias, 30-55, Cd. Juárez', 21, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(10, 2, 'facebook', 'Buen Fin: ofertas que no puedes perder', 'Reloj countdown Buen Fin con ofertas', '🔥 Solo 3 días. 🚗 Autos con hasta 30% OFF. 🏪 Talleres con servicios gratis. ⏰ No te quedes.', 'Aprovecha el Buen Fin en carmatchapp.net', 'urgencia', ['#CarMatch','#BuenFin','#Ofertas','#Descuentos','#CdJuarez'], `Buen Fin countdown clock, car deals, workshop promotions, red urgent accents, sale badges`, ad('alcance', 'Cd. Juárez +200km, 21-65', 21, 'Feed', 2), '1:00 PM'),

    makeEntry(10, 3, 'tiktok', 'Botón de pánico en tu celular', 'Mano presionando botón SOS, animación dramática', 'Un toque. SOS activado. Tu familia sabe. La ayuda viene.', 'Descarga CarMatch ahora', 'urgencia', ['#CarMatch','#SOS','#BotonDePanico','#Emergencia','#CdJuarez'], `Close-up finger pressing red SOS button, dramatic pulse animation, emergency contacts highlighted`, ad('interaccion', 'Cd. Juárez +100km, 18-45', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(10, 4, 'instagram', 'Test drive seguro con CarMatch', 'Pareja en prueba con GPS y contactos', '🔒 GPS activo. 👥 Contactos notificados. ⏰ Check-in 20 min. 🚨 SOS.', 'Activa CarMatch para tu prueba', 'seguridad', ['#CarMatch','#TestDrive','#PruebaSegura','#GPS','#CdJuarez'], `Couple test-driving, phone showing CarMatch GPS, green route, trusted contacts notified`, ad('interaccion', 'Cd. Juárez +100km, parejas 25-45', 21, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(10, 5, 'facebook', 'La app más segura de México', 'Badge "LA MÁS SEGURA" shield dorado', '🛡️ SOS + GPS. Trusted Contacts. Check-ins 20 min. Test drive seguro. Punto seguro.', 'Descarga la app más segura', 'autoridad', ['#CarMatch','#LaMásSegura','#SOS','#GPS','#CdJuarez'], `Golden shield badge "LA MÁS SEGURA DE MÉXICO" CarMatch logo, premium metallic, dark dramatic`, ad('alcance', 'Cd. Juárez +100km, 21-65', 21, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 11: Expansión ═══
    makeEntry(11, 0, 'tiktok', 'CarMatch llega a Chihuahua', 'Animación expansión Juárez → Chihuahua', '🚀 Cd. Juárez fue primero. Ahora: Chihuahua. Después: Monterrey, Gdl, CDMX.', 'Únete antes de que llegue a tu ciudad', 'expansion', ['#CarMatch','#Chihuahua','#Expansion','#Mexico'], `Animated map CarMatch expanding Juárez→Chihuahua, glowing expansion wave, Mexican territory`, ad('alcance', 'Chihuahua capital +100km, 21-55', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(11, 1, 'instagram', 'Monterrey, ¿listos?', 'Skyline Monterrey con logo CarMatch', '🏙️ Monterrey: 5M+ personas. El mercado más grande del norte. CarMatch viene.', 'Sé de los primeros en Monterrey', 'anticipacion', ['#CarMatch','#Monterrey','#Expansion','#Listos'], `Monterrey skyline sunset, CarMatch logo floating above, anticipation excitement mood`, ad('alcance', 'Monterrey +100km, 21-55', 21, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(11, 2, 'facebook', 'Buen Fin: los mejores deals en autos', 'Los autos más buscados con descuento', '🏷️ Honda Civic: -15%. Toyota Corolla: -20%. VW Jetta: -25%. Solo en CarMatch.', 'Encuentra tu deal en carmatchapp.net', 'fomo', ['#CarMatch','#BuenFin','#Deals','#Descuentos','#AutosBaratos'], `Top car deals with discount badges, percentage off, clean professional CarMatch branding`, ad('trafico', 'Cd. Juárez +200km, compradores, 21-55', 21, 'Feed', 2), '1:00 PM'),

    makeEntry(11, 3, 'tiktok', 'Guadalajara, te esperamos', 'Expansión: Chihuahua → Monterrey → Guadalajara', '📍 Chihuahua ✓. 📍 Monterrey ✓. 📍 Guadalajara: PRÓXIMAMENTE.', 'Regístrate para ser notificado', 'anticipacion', ['#CarMatch','#Guadalajara','#Expansion','#Proximamente'], `Map expansion: Chihuahua ✓ → Monterrey ✓ → Guadalajara pulsing "PRÓXIMAMENTE"`, ad('alcance', 'Guadalajara +100km, 21-55', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(11, 4, 'instagram', 'CDMX: la gran ciudad', 'Torres Reforma con logo CarMatch', '🏙️ CDMX: 22M personas. El mercado más grande. CarMatch va a llegar.', 'Regístrate para CDMX', 'anticipacion', ['#CarMatch','#CDMX','#Expansion','#GranCiudad'], `CDMX skyline Reforma towers, CarMatch logo floating grand ambitious, sunset`, ad('alcance', 'CDMX +100km, 21-55', 21, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(11, 5, 'facebook', 'Ya somos 10,000 usuarios', 'Counter celebrando 10K con confeti', '🎉 10,000 USUARIOS! 🚗 5,000+ autos. 🏪 500+ talleres. ⭐ 4.9 estrellas.', 'Únete a los 10,000', 'prueba-social', ['#CarMatch','#10000Usuarios','#Gracias','#Crecimiento'], `Counter hitting 10,000 with confetti explosion, celebration, CarMatch branding, user icons`, ad('alcance', 'México, 21-65', 21, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 12: Expansión ═══
    makeEntry(12, 0, 'tiktok', 'Navidad: viaja seguro con tu familia', 'Familia en auto navideño con CarMatch', '🎄 Navidad: viaja seguro. 🚗 GPS activo. 👥 Familia conectada. 🚨 SOS listo.', 'Activa CarMatch para las fiestas', 'proteccion', ['#CarMatch','#Navidad','#ViajaSeguro','#Familia','#CdJuarez'], `Family in car Christmas decorations, CarMatch GPS active, warm festive lighting, safe travel`, ad('interaccion', 'Cd. Juárez +100km, familias, 25-55', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(12, 1, 'instagram', 'Año Nuevo: tu meta es un auto', 'Persona soñando con su auto nuevo', '🚗 Meta 2027: tu primer auto. 📱 CarMatch te ayuda. 🎯 IA encuentra el ideal.', 'Empieza tu meta en carmatchapp.net', 'vision', ['#CarMatch','#AñoNuevo','#Meta2027','#PrimerAuto','#CdJuarez'], `Person looking at new year fireworks, phone showing CarMatch, dream car silhouette, hopeful`, ad('alcance', 'Cd. Juárez +100km, 18-35, primer auto', 21, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(12, 2, 'facebook', 'Regalo perfecto: seguridad para tu familia', 'CarMatch SOS como regalo navideño', '🎁 Regala seguridad. 🚨 SOS + GPS. 👥 Trusted Contacts. 📱 Gratis para siempre.', 'Descarga CarMatch como regalo', 'gratitud', ['#CarMatch','#RegaloNavidad','#Seguridad','#Familia','#Gratis'], `Gift box opening CarMatch app, family happy, security features as presents, warm Christmas`, ad('interaccion', 'Cd. Juárez +100km, familias, 25-55', 21, 'Feed', 3), '7:00 PM'),

    makeEntry(12, 3, 'tiktok', 'Vacaciones de invierno: CarMatch SOS', 'Viajeros en carretera con CarMatch', '❄️ Invierno: carreteras peligrosas. 🚗 CarMatch SOS activo. 👥 Familia te monitorea.', 'Viaja seguro estas vacaciones', 'seguridad', ['#CarMatch','#Invierno','#Vacaciones','#Carretera','#Seguridad'], `Winter road trip, snowy mountains, CarMatch GPS active, family monitoring, safe travel vibes`, ad('interaccion', 'Cd. Juárez +100km, viajeros, 21-55', 21, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(12, 4, 'instagram', 'Gracias por este año increíble', 'Montaje de logros del año', '🎉 De 0 a 15,000 usuarios. 🚗 5,000 autos. 🏪 500 talleres. Gracias Cd. Juárez.', 'Gracias por confiar en CarMatch', 'celebracion', ['#CarMatch','#Gracias','#AñoIncreíble','#CdJuarez'], `Year highlight reel, milestones, confetti, community photos, warm grateful tone`, ad('alcance', 'Cd. Juárez +100km, 21-65', 21, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(12, 5, 'facebook', '2027: viene algo grande', 'Preview de features nuevos', '🔮 2027: Seguro integrado. Financiamiento. Roadside assistance. La app completa.', 'Sé el primero en enterarte', 'anticipacion', ['#CarMatch','#2027','#VieneAlgoGrande','#Futuro'], `2027 roadmap teaser: insurance, financing, roadside assistance icons, mysterious dark mood`, ad('alcance', 'Cd. Juárez +100km, 21-55', 21, 'Feed', 3), '7:00 PM'),
]

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CalendarTab() {
    const [activeWeek, setActiveWeek] = useState(1)
    const [expandedDay, setExpandedDay] = useState<string | null>(null)
    const [editingMetrics, setEditingMetrics] = useState<string | null>(null)
    const [showPrompt, setShowPrompt] = useState<CalendarEntry | null>(null)
    const [showAdConfig, setShowAdConfig] = useState<CalendarEntry | null>(null)
    const [filterPlatform, setFilterPlatform] = useState('all')
    const [filterGatillo, setFilterGatillo] = useState('all')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [entryStatuses, setEntryStatuses] = useState<Record<string, string>>({})

    // Queue state - persisted in localStorage
    const [publishedIds, setPublishedIds] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            return JSON.parse(localStorage.getItem('carmatch-published') || '[]')
        }
        return []
    })
    const [skippedIds, setSkippedIds] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            return JSON.parse(localStorage.getItem('carmatch-skipped') || '[]')
        }
        return []
    })

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('carmatch-published', JSON.stringify(publishedIds))
    }, [publishedIds])
    useEffect(() => {
        localStorage.setItem('carmatch-skipped', JSON.stringify(skippedIds))
    }, [skippedIds])

    // Dynamic date calculation - queue system
    const getEntryDate = (entryIndex: number): Date => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const completedBefore = ALL_ENTRIES.slice(0, entryIndex).filter(
            e => publishedIds.includes(e.id) || skippedIds.includes(e.id)
        ).length
        const date = new Date(today)
        date.setDate(date.getDate() + entryIndex - completedBefore)
        return date
    }

    // Get today's entry (first pending one)
    const todayEntry = ALL_ENTRIES.find(
        e => !publishedIds.includes(e.id) && !skippedIds.includes(e.id)
    ) || null

    // Mark as published
    const markPublished = (id: string) => {
        setPublishedIds(prev => prev.includes(id) ? prev : [...prev, id])
        setSkippedIds(prev => prev.filter(x => x !== id))
    }

    // Mark as skipped
    const markSkipped = (id: string) => {
        setSkippedIds(prev => prev.includes(id) ? prev : [...prev, id])
        setPublishedIds(prev => prev.filter(x => x !== id))
    }

    // Restore to pending
    const restoreEntry = (id: string) => {
        setPublishedIds(prev => prev.filter(x => x !== id))
        setSkippedIds(prev => prev.filter(x => x !== id))
    }

    // Queue stats
    const queueStats = useMemo(() => {
        const published = publishedIds.length
        const skipped = skippedIds.length
        const pending = ALL_ENTRIES.length - published - skipped
        const totalBudget = ALL_ENTRIES.reduce((sum, e) => sum + (e.adConfig.enabled ? e.adConfig.budgetMXN : 0), 0)
        return { published, skipped, pending, total: ALL_ENTRIES.length, totalBudget }
    }, [publishedIds, skippedIds])

    const weekEntries = useMemo(() => {
        let entries = ALL_ENTRIES.filter(e => e.week === activeWeek).map((entry, idx) => {
            const globalIdx = ALL_ENTRIES.findIndex(e => e.id === entry.id)
            const dynamicDate = getEntryDate(globalIdx)
            const isPublished = publishedIds.includes(entry.id)
            const isSkipped = skippedIds.includes(entry.id)
            const isToday = todayEntry?.id === entry.id
            return { ...entry, dynamicDate, isPublished, isSkipped, isToday }
        })
        if (filterPlatform !== 'all') entries = entries.filter(e => e.platform === filterPlatform)
        if (filterGatillo !== 'all') entries = entries.filter(e => e.gatillo === filterGatillo)
        return entries
    }, [activeWeek, filterPlatform, filterGatillo, publishedIds, skippedIds, todayEntry])

    const weekStats = useMemo(() => {
        const entries = ALL_ENTRIES.filter(e => e.week === activeWeek)
        const totalBudget = entries.reduce((sum, e) => sum + (e.adConfig.enabled ? e.adConfig.budgetMXN : 0), 0)
        const platforms = [...new Set(entries.map(e => e.platform))]
        const gatillos = [...new Set(entries.map(e => e.gatillo))]
        return { total: entries.length, totalBudget, platforms, gatillos }
    }, [activeWeek])

    const overallStats = useMemo(() => {
        const total = ALL_ENTRIES.length
        const totalBudget = ALL_ENTRIES.reduce((sum, e) => sum + (e.adConfig.enabled ? e.adConfig.budgetMXN : 0), 0)
        const published = ALL_ENTRIES.filter(e => e.status === 'published').length
        return { total, totalBudget, published }
    }, [])

    const copyText = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const theme = WEEK_THEMES[activeWeek] || WEEK_THEMES[1]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-primary-500" />
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase">Calendario</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/50">
                    <span>📅 {queueStats.pending} pendientes</span>
                    <span>💰 ${(queueStats.totalBudget * 7).toLocaleString()} MXN total (12 sem)</span>
                    <span>✅ {queueStats.published}/{queueStats.total} publicados</span>
                    {queueStats.skipped > 0 && <span>⏭️ {queueStats.skipped} saltados</span>}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={filterPlatform}
                    onChange={(e) => setFilterPlatform(e.target.value)}
                    className="bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500"
                >
                    <option value="all">Todas las plataformas</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                </select>
                <select
                    value={filterGatillo}
                    onChange={(e) => setFilterGatillo(e.target.value)}
                    className="bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500"
                >
                    <option value="all">Todos los gatillos</option>
                    {Object.entries(GATILLOS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                    ))}
                </select>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                    onClick={() => setActiveWeek(w => Math.max(1, w - 1))}
                    disabled={activeWeek === 1}
                    className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(w => (
                    <button
                        key={w}
                        onClick={() => setActiveWeek(w)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            activeWeek === w
                                ? `bg-gradient-to-r ${WEEK_THEMES[w]?.gradient || 'from-blue-500 to-cyan-500'} text-white shadow-lg`
                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        S{w}
                    </button>
                ))}
                <button
                    onClick={() => setActiveWeek(w => Math.min(12, w + 1))}
                    disabled={activeWeek === 12}
                    className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Week Summary */}
            <div className={`bg-gradient-to-r ${theme.gradient} bg-opacity-10 rounded-xl p-4 border border-white/10`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h4 className="text-lg font-black text-white">Semana {activeWeek}: {theme.title}</h4>
                        <p className="text-sm text-white/70">{weekStats.total} posts • {weekStats.platforms.map(p => PLATFORM_CONFIG[p]?.label || p).join(', ')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-white">${weekStats.totalBudget * 7} MXN</p>
                        <p className="text-xs text-white/50">${weekStats.totalBudget}/día × 7 días</p>
                        <p className="text-xs text-white/40 mt-1">Total 12 semanas: ${(overallStats.totalBudget * 7).toLocaleString()} MXN</p>
                    </div>
                </div>
            </div>

            {/* Days */}
            <div className="space-y-3">
                {weekEntries.map(entry => {
                    const isExpanded = expandedDay === entry.id
                    const platformConf = PLATFORM_CONFIG[entry.platform] || { label: entry.platform, bgColor: 'bg-gray-600' }
                    const gatilloData = GATILLOS[entry.gatillo] || { label: entry.gatillo, color: 'text-white' }

                    return (
                        <div key={entry.id} className={`bg-surface-dark border rounded-xl overflow-hidden ${entry.isToday ? 'border-green-500/50 shadow-lg shadow-green-500/10' : entry.isPublished ? 'border-green-500/20 opacity-70' : entry.isSkipped ? 'border-yellow-500/20 opacity-50' : 'border-white/10'}`}>
                            {/* Day Header */}
                            <button
                                onClick={() => setExpandedDay(isExpanded ? null : entry.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* HOY indicator */}
                                    {entry.isToday && (
                                        <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold animate-pulse">
                                            🟢 HOY
                                        </span>
                                    )}
                                    {/* Published badge */}
                                    {entry.isPublished && (
                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                            ✅ Publicado
                                        </span>
                                    )}
                                    {/* Skipped badge */}
                                    {entry.isSkipped && (
                                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                                            ⏭️ Saltado
                                        </span>
                                    )}
                                    {/* Dynamic date */}
                                    <span className="text-xs text-white/40 font-mono">
                                        {entry.dynamicDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${platformConf.bgColor}`}>
                                        {platformConf.label}
                                    </span>
                                    {entry.contentType === 'video' && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Video</span>}
                                    {entry.contentType === 'reel' && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold">Reel</span>}
                                    {entry.contentType === 'carousel' && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">Carrusel</span>}
                                    {entry.contentType === 'image' && <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold">Imagen</span>}
                                    <span className="text-sm font-bold text-white">{entry.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs ${gatilloData.color}`}>{entry.gatilloIcon} {gatilloData.label}</span>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="p-4 border-t border-white/10 space-y-4">
                                    {/* Hook + Body */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold text-white/40 uppercase">Hook (0-3s)</h5>
                                            <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">{entry.hook}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold text-white/40 uppercase">Cuerpo</h5>
                                            <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">{entry.body}</p>
                                        </div>
                                    </div>

                                    {/* CTA + Hashtags */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold text-white/40 uppercase">CTA</h5>
                                            <p className="text-sm text-green-400 bg-green-400/10 rounded-lg p-3 font-bold">{entry.cta}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold text-white/40 uppercase">Hashtags</h5>
                                            <div className="flex flex-wrap gap-1">
                                                {entry.hashtags.map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-full text-xs">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Caption Preview */}
                                    <div className="space-y-2">
                                        <h5 className="text-xs font-bold text-white/40 uppercase">Caption (copia y pega)</h5>
                                        <div className="bg-black/30 rounded-lg p-3 text-sm text-white/70 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                                            {entry.caption}
                                        </div>
                                        <p className="text-[10px] text-white/30 italic">🔗 carmatchapp.net se incluye automáticamente en el caption</p>
                                    </div>

                                    {/* Ad Link for Meta Ads */}
                                    {entry.adConfig.enabled && (
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold text-yellow-400 uppercase">🔗 Link de anuncio (Meta Ads)</h5>
                                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                                <p className="text-sm text-yellow-300 font-mono break-all">{entry.adLink}</p>
                                            </div>
                                            <button
                                                onClick={() => copyText(entry.adLink, `adlink-${entry.id}`)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-500/30 transition-colors"
                                            >
                                                {copiedId === `adlink-${entry.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                {copiedId === `adlink-${entry.id}` ? '¡Copiado!' : 'Copiar link de anuncio'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Time + Ad Config */}
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-sm text-white/60">
                                            <Clock className="w-4 h-4" />
                                            <span>{entry.postingTime}</span>
                                        </div>
                                        {entry.adConfig.enabled && (
                                            <div className="flex items-center gap-2 text-sm text-white/60">
                                                <Target className="w-4 h-4" />
                                                <span>${entry.adConfig.budgetMXN}/día • {entry.adConfig.durationDays} días</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setShowPrompt(entry)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                entry.tool === 'CapCut AI'
                                                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                                    : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                            }`}
                                        >
                                            <Sparkles className="w-3.5 h-3.5" /> Prompt {entry.tool}
                                        </button>
                                        <button
                                            onClick={() => setShowAdConfig(entry)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold hover:bg-orange-500/30 transition-colors"
                                        >
                                            <Megaphone className="w-3.5 h-3.5" /> Configurar Anuncio Meta
                                        </button>
                                        <button
                                            onClick={() => setEditingMetrics(editingMetrics === entry.id ? null : entry.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                                        >
                                            <BarChart3 className="w-3.5 h-3.5" /> Métricas
                                        </button>
                                        <button
                                            onClick={() => copyText(entry.caption, entry.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/60 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors"
                                        >
                                            {copiedId === entry.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copiedId === entry.id ? '¡Copiado!' : 'Copiar caption'}
                                        </button>

                                        {/* Queue buttons */}
                                        {!entry.isPublished && !entry.isSkipped && (
                                            <>
                                                <button
                                                    onClick={() => markPublished(entry.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition-colors"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Publicado
                                                </button>
                                                <button
                                                    onClick={() => markSkipped(entry.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-500/30 transition-colors"
                                                >
                                                    ⏭️ Saltado
                                                </button>
                                            </>
                                        )}
                                        {(entry.isPublished || entry.isSkipped) && (
                                            <button
                                                onClick={() => restoreEntry(entry.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/60 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors"
                                            >
                                                ↩️ Restaurar
                                            </button>
                                        )}
                                    </div>

                                    {/* Metrics Panel */}
                                    {editingMetrics === entry.id && (
                                        <div className="bg-black/30 rounded-xl p-4 space-y-4">
                                            <h5 className="text-sm font-bold text-white/60 uppercase flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4" /> Métricas Manuales
                                            </h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {(['tiktok', 'instagram', 'facebook'] as const).map(platform => (
                                                    <div key={platform} className="space-y-2">
                                                        <h6 className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${PLATFORM_CONFIG[platform]?.bgColor || 'bg-gray-600'}`}>
                                                            {PLATFORM_CONFIG[platform]?.label || platform}
                                                        </h6>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {Object.entries(entry.metrics[platform]).map(([key, val]) => (
                                                                <div key={key} className="flex items-center gap-1">
                                                                    <span className="text-[10px] text-white/40 w-12">{key}:</span>
                                                                    <input
                                                                        type="number"
                                                                        defaultValue={val}
                                                                        className="w-full bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-white"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-white/30 italic">Edita estas métricas manualmente desde las plataformas. Actualiza una vez por semana.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Prompt Modal */}
            {showPrompt && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPrompt(null)}>
                    <div className="bg-surface-dark border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-white">
                                Prompt para {showPrompt.tool}
                            </h3>
                            <button onClick={() => setShowPrompt(null)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white" /></button>
                        </div>
                        <p className="text-sm text-white/60">{showPrompt.title}</p>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${showPrompt.tool === 'CapCut AI' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                {showPrompt.tool}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-bold bg-white/10 text-white/60">
                                {showPrompt.contentType}
                            </span>
                        </div>

                        {/* Usage Instructions */}
                        <div className={`rounded-lg p-3 space-y-2 text-sm ${showPrompt.tool === 'CapCut AI' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-purple-500/10 border border-purple-500/20'}`}>
                            <p className="font-bold text-white">Cómo usar este prompt:</p>
                            {showPrompt.tool === 'CapCut AI' ? (
                                <>
                                    <p><span className="font-bold text-blue-400">1.</span> Abre CapCut → Click <span className="font-bold text-white">"AI Video"</span> o <span className="font-bold text-white">"Dream Machine"</span></p>
                                    <p><span className="font-bold text-blue-400">2.</span> Copia el prompt de abajo y pégalo en CapCut</p>
                                    <p><span className="font-bold text-blue-400">3.</span> Selecciona formato <span className="font-bold text-white">9:16</span> → Click <span className="font-bold text-white">"Create"</span> → Exporta en 1080p</p>
                                </>
                            ) : (
                                <>
                                    <p><span className="font-bold text-purple-400">1.</span> Ve a <span className="font-bold text-white">gemini.google.com</span></p>
                                    <p><span className="font-bold text-purple-400">2.</span> Copia el prompt de abajo y pégalo en Gemini</p>
                                    <p><span className="font-bold text-purple-400">3.</span> Descarga la imagen generada → Úsala en tu publicación</p>
                                </>
                            )}
                        </div>

                        <div className="bg-black/40 rounded-xl p-4 text-sm text-white/80 font-mono whitespace-pre-wrap">
                            {showPrompt.prompt}
                        </div>
                        <button
                            onClick={() => copyText(showPrompt.prompt, `prompt-${showPrompt.id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-bold hover:bg-primary-500/30 transition-colors"
                        >
                            {copiedId === `prompt-${showPrompt.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiedId === `prompt-${showPrompt.id}` ? 'Copiado!' : 'Copiar Prompt'}
                        </button>
                    </div>
                </div>
            )}

            {/* CapCut AI Video Modal - REMOVED: Prompt modal now shows tool instructions */}

            {/* Ad Config Modal - Meta Ads Instructions */}
            {showAdConfig && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdConfig(null)}>
                    <div className="bg-surface-dark border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-white">Configurar Anuncio en Meta Ads</h3>
                            <button onClick={() => setShowAdConfig(null)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white" /></button>
                        </div>
                        <p className="text-sm text-white/60">{showAdConfig.title}</p>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-yellow-400 uppercase">Setup Inicial (solo una vez)</h4>
                            <div className="bg-white/5 rounded-lg p-3 space-y-1 text-sm text-white/70">
                                <p>1. Ve a business.facebook.com</p>
                                <p>2. Crea cuenta Business Manager</p>
                                <p>3. Vincula tu pagina de Facebook e Instagram</p>
                                <p>4. Ve a "Origenes de datos" y crea Pixel de Meta</p>
                                <p>5. Instala pixel en carmatchapp.net (header)</p>
                                <p>6. Configura eventos: ViewContent, Lead</p>
                                <p>7. Verifica con extension "Meta Pixel Helper"</p>
                                <p>8. Agrega metodo de pago (tarjeta)</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-green-400 uppercase">Crear Anuncio</h4>
                            <div className="bg-white/5 rounded-lg p-3 space-y-1 text-sm text-white/70">
                                <p><span className="font-bold text-white">PASO 1:</span> business.facebook.com ygt; Administrador de Anuncios</p>
                                <p><span className="font-bold text-white">PASO 2:</span> Click "+ Crear"</p>
                                <p><span className="font-bold text-white">PASO 3:</span> Objetivo: <span className="text-green-400 font-bold">{showAdConfig.adConfig.objective}</span></p>
                                <p><span className="font-bold text-white">PASO 4:</span> Nombre: "CarMatch - {showAdConfig.title}"</p>
                                <p><span className="font-bold text-white">PASO 5:</span> Presupuesto diario: <span className="text-green-400 font-bold">${showAdConfig.adConfig.budgetMXN} MXN</span></p>
                                <p><span className="font-bold text-white">PASO 6:</span> Audiencia: <span className="text-yellow-400">{showAdConfig.adConfig.audience}</span></p>
                                <p><span className="font-bold text-white">PASO 7:</span> Ubicaciones: <span className="text-yellow-400">{showAdConfig.adConfig.placement}</span></p>
                                <p><span className="font-bold text-white">PASO 8:</span> Sube el video de CapCut (formato 9:16)</p>
                                <p><span className="font-bold text-white">PASO 9:</span> Texto del anuncio: "{showAdConfig.hook}"</p>
                                <p><span className="font-bold text-white">PASO 10:</span> CTA button: "Mas informacion"</p>
                                <p><span className="font-bold text-white">PASO 11:</span> URL: <span className="text-yellow-400">{showAdConfig.adLink || 'carmatchapp.net'}</span></p>
                                <p><span className="font-bold text-white">PASO 12:</span> Click "Publicar"</p>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3 grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-white/40">Duracion:</span> <span className="text-white font-bold">{showAdConfig.adConfig.durationDays} dias</span></div>
                            <div><span className="text-white/40">Costo total:</span> <span className="text-green-400 font-bold">${showAdConfig.adConfig.budgetMXN * showAdConfig.adConfig.durationDays} MXN</span></div>
                        </div>

                        <div className="space-y-1 text-xs text-white/40 italic">
                            <p>Espera 24-48h para aprobacion de Meta</p>
                            <p>NO toques la campana durante 7 dias (fase de aprendizaje)</p>
                            <p>Escala 20% cada 3 dias si los resultados son buenos</p>
                            <p>Revisa metricas en Dashboard cada lunes</p>
                        </div>

                        <button
                            onClick={() => copyText('CarMatch - ' + showAdConfig.title + '\nObjetivo: ' + showAdConfig.adConfig.objective + '\nAudiencia: ' + showAdConfig.adConfig.audience + '\nBudget: $' + showAdConfig.adConfig.budgetMXN + '/dia\nDuracion: ' + showAdConfig.adConfig.durationDays + ' dias\nHook: ' + showAdConfig.hook, 'adconfig-' + showAdConfig.id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-bold hover:bg-primary-500/30 transition-colors"
                        >
                            {copiedId === 'adconfig-' + showAdConfig.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiedId === 'adconfig-' + showAdConfig.id ? 'Copiado!' : 'Copiar configuracion'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
