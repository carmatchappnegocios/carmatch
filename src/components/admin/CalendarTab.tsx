'use client'

import { useState, useMemo } from 'react'
import {
    Calendar, ChevronLeft, ChevronRight, Copy, Check, Clock, Target, Zap,
    TrendingUp, Pencil, Save, Filter, ChevronDown, ChevronUp, X, Eye,
    BarChart3, Megaphone, Sparkles, Users, Car
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
    gatillo: string
    gatilloIcon: string
    hashtags: string[]
    aiPromptGemini: string
    aiPromptKling: string
    postingTime: string
    adConfig: AdConfig
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

function makeEntry(week: number, dayOffset: number, platform: string, title: string, hook: string, body: string, cta: string, gatillo: string, hashtags: string[], midjourney: string, kling: string, adConfig: AdConfig, time?: string): CalendarEntry {
    const baseDate = new Date(2026, 8, 14 + ((week - 1) * 7) + dayOffset)
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const gatilloData = GATILLOS[gatillo] || { label: gatillo, color: 'text-white' }
    return {
        id: `w${week}-d${dayOffset}-${platform}`,
        date: baseDate.toISOString().split('T')[0],
        dayName: dayNames[baseDate.getDay()],
        dayNum: baseDate.getDate(),
        month: months[baseDate.getMonth()],
        platform,
        contentType: platform === 'tiktok' ? 'video' : platform === 'instagram' ? (dayOffset % 2 === 0 ? 'reel' : 'carousel') : (dayOffset % 3 === 0 ? 'video' : 'image'),
        title, hook, body, cta,
        gatillo,
        gatilloIcon: gatilloData.label,
        hashtags,
        aiPromptGemini: midjourney,
        aiPromptKling: kling,
        postingTime: time || '12:00 PM',
        adConfig,
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
// ALL 86 ENTRIES - 12 WEEKS
// ═══════════════════════════════════════════════════════════════

const ALL_ENTRIES: CalendarEntry[] = [
    // ═══ SEMANA 1: Foundation ═══
    makeEntry(1, 0, 'tiktok', 'Sube una foto. La IA llena 25 datos.', 'Mano tomando foto → interfaz IA llenando datos en 3s', 'La IA de CarMatch detecta marca, modelo, año y llena 25 campos. Sin escribir nada.', 'Descarga CarMatch y prueba gratis', 'asombro', ['#CarMatch','#AutosUsados','#IA','#CdJuarez','#ComprarAuto'], 'Close-up smartphone, AI scanning Honda Civic, holographic data fields auto-filled, blue neon UI, Mexican city golden hour, Sony A7R IV 85mm f/1.4 --ar 9:16 --v 6.1 --style raw', 'Phone screen: car photo → AI fills data fields with clicks → holographic particles → person smiles → CarMatch logo. 15s 9:16.', ad('trafico', 'Cd. Juárez +50km, 21-55 años, autos, tecnología', 50, 'Feed + Reels + Stories', 2), '12:00 PM'),

    makeEntry(1, 1, 'instagram', 'Ella se protege. Tú también.', 'Mujer nerviosa en estacionamiento oscuro, recibe notificación CarMatch', 'Activa CarMatch SOS. Su papá recibe ubicación en tiempo real. Ella llega segura.', 'Activa CarMatch SOS. Tu seguridad no es opcional.', 'miedo', ['#CarMatch','#SOS','#SeguridadMujer','#CdJuarez','#Proteccion'], 'Young Mexican woman in car at night, phone glows CarMatch SOS interface, red emergency button, dark parking, cinematic blue/red lighting --ar 9:16 --v 6.1 --style raw', 'Woman walks nervously → taps SOS → red glow → father notified with map → woman smiles safe. Text: "ELLA SE PROTEGE. TÚ TAMBIÉN." 20s 9:16.', ad('interaccion', 'Mujeres 21-45, Cd. Juárez, seguridad, tecnología', 50, 'Feed + Reels + Stories', 2), '1:00 PM'),

    makeEntry(1, 2, 'facebook', 'Tu taller mecánico necesita web. Gratis.', 'Carrusel: talleres mexicanos before/after con MiniWeb', 'El 90% de talleres NO tienen web. CarMatch les da una GRATIS con chatbot 24/7.', 'Registra tu taller gratis en CarMatch', 'reciprocidad', ['#CarMatch','#Talleres','#Negocios','#CdJuarez'], 'Split: LEFT dusty workshop no sign. RIGHT same workshop with CarMatch MiniWeb display, appointments, chatbot, Google Maps pin --ar 16:9 --v 6.1 --style raw', 'Before/after: dusty workshop → CarMatch digital display, appointments pop up, chatbot responds. "TU TALLER NECESITA ESTO. GRATIS." 15s 1:1.', ad('leads', 'Dueños de talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Feed + Groups', 3), '1:00 PM'),

    makeEntry(1, 3, 'tiktok', 'El error #1 al comprar auto usado', 'Persona con motor dañado, cara de decepción, $50,000 aparece', 'El 60% de autos en Facebook tienen fraude oculto. CarMatch verifica todo.', 'No cometas este error. Descarga CarMatch.', 'aversion-perdida', ['#CarMatch','#AutoUsado','#Fraude','#Estafa','#CdJuarez'], 'Frustrated man next to car with hood open, engine problems, holding phone showing Facebook listing that looked perfect, Mexican residential street --ar 9:16 --v 6.1 --style raw', 'Perfect listing on phone → person arrives → car damaged, check engine light → facepalm. "EL ERROR #1 AL COMPRAR AUTO USADO." 18s 9:16.', ad('trafico', 'Cd. Juárez +50km, 21-45, autos usados', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(1, 4, 'instagram', '100 autos cerca de ti. Ahora.', 'Deslizando autos en CarMatch como Tinder', 'Abre CarMatch. Activa ubicación. Descubre 100+ autos verificados cerca de ti.', 'Desliza ahora en carmatchapp.com/swipe', 'fomo', ['#CarMatch','#Swipe','#AutosCerca','#CdJuarez','#ComprarAuto'], 'Smartphone Tinder-like interface with cars, swiping right on red Volkswagen Jetta, multiple car cards fading, Mexican cityscape reflected --ar 9:16 --v 6.1 --style raw', 'POV swipe: Honda Civic → right, VW Jetta → right, Toyota → left. Counter: "100 AUTOS CERCA DE TI." 15s 9:16.', ad('trafico', 'Cd. Juárez +50km, 21-35, autos, tecnología', 50, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(1, 5, 'facebook', 'AUTO DE LA SEMANA: Honda Civic 2020', 'Foto profesional Honda Civic 2020 plateado, ángulo bajo cinematográfico', '🚗 Honda Civic 2020 - $180,000 MXN. 📍 Cd. Juárez. ✅ Verificado CarMatch. 🔥 15 personas lo han visto hoy.', 'Ver más autos en CarMatch', 'escasez', ['#CarMatch','#HondaCivic','#AutoDeLaSemana','#CdJuarez'], 'Silver 2020 Honda Civic in clean parking lot, low angle powerful look, golden hour long shadows, mountains background, professional automotive photography --ar 16:9 --v 6.1 --style raw', 'Camera orbits silver Civic, golden hour, text overlays: "$180,000", "Verificado CarMatch", "15 personas ven AHORA". 15s 1:1.', ad('alcance', 'Cd. Juárez +100km, 21-55, Honda, seminuevos', 50, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 2: Foundation ═══
    makeEntry(2, 0, 'tiktok', 'Compara 5 talleres antes de ir', '5 talleres con precios, calificaciones, distancias', 'No vayas al primero que encuentres. Compara precios, reseñas, y distancias.', 'Compara ahora en CarMatch', 'utilidad', ['#CarMatch','#Talleres','#Compara','#Mecanico','#CdJuarez'], 'Smartphone 5 workshops comparison grid, star ratings, prices, distances, clean CarMatch UI, blurred Mexican street --ar 9:16 --v 6.1 --style raw', '5 workshop cards appear with photo/name/stars/price/distance. Tap "COMPARAR" → all align. "COMPARA ANTES DE IR." 12s 9:16.', ad('trafico', 'Cd. Juárez +50km, 25-55, mecánica, autos', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(2, 1, 'instagram', 'Tu auto aparece en Google. Gratis.', 'Búsqueda Google mostrando resultado con foto profesional CarMatch', 'Publica tu auto en CarMatch y aparece en Google SIN pagar publicidad.', 'Publica tu auto gratis en CarMatch', 'autoridad', ['#CarMatch','#Google','#VenderAuto','#Gratis','#CdJuarez'], 'Google search results on laptop showing CarMatch listing, professional photo, 25 fields, #1 ranking "Honda Civic 2020 Cd Juarez" --ar 16:9 --v 6.1 --style raw', 'Google search → CarMatch at top → click → full listing → contact. "TU AUTO EN GOOGLE. GRATIS." 15s 9:16.', ad('leads', 'Cd. Juárez +100km, vendedores, 25-55', 50, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(2, 2, 'facebook', '500+ personas ya confían en CarMatch', 'Infografía: 500+ usuarios, 200+ autos, 50+ talleres, 4.8 calificación', '🚀 En 2 semanas: 500+ usuarios, 200+ autos, 50+ talleres, 4.8 estrellas.', 'Únete gratis en carmatchapp.com', 'prueba-social', ['#CarMatch','#Confianza','#CdJuarez','#500Usuarios'], 'Modern infographic: 500+ users, 200+ vehicles, 50+ workshops, 4.8 rating, dark background blue/orange glow, professional data viz --ar 1:1 --v 6.1 --style raw', 'Numbers animate: "500+", "200+", "50+", "4.8". Confetti. "CD. JUÁREZ YA CONFÍA EN CARMATCH." 15s 1:1.', ad('alcance', 'Cd. Juárez +100km, 21-65', 50, 'Feed', 3), '1:00 PM'),

    makeEntry(2, 3, 'tiktok', '¿Tu taller no tiene web? Perdiendo dinero.', 'Taller vacío vs taller con cola de clientes', 'El 90% buscan talleres en Google. Si no estás ahí, van al de al lado.', 'Registra tu taller gratis HOY', 'aversion-perdida', ['#CarMatch','#Talleres','#Negocio','#Dinero','#CdJuarez'], 'Split: LEFT empty workshop idle owner. RIGHT same workshop packed customers, glowing "CarMatch MiniWeb" notification --ar 9:16 --v 6.1 --style raw', 'Empty workshop → organized with appointments. "SIN WEB = SIN CLIENTES." 15s 9:16.', ad('leads', 'Dueños de talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(2, 4, 'instagram', 'Compara precios de 5 talleres en 10s', 'Timelapse: 5 presupuestos apareciendo y comparándose', 'Aceite + filtro: $800, $650, $900, $580, $720. ¿Cuál eliges?', 'Compara precios en CarMatch', 'utilidad', ['#CarMatch','#Precios','#Mecanico','#Ahorro','#CdJuarez'], 'Smartphone 5 price quotes, green highlight best deal, clean UI, phone on mechanic workbench with tools --ar 9:16 --v 6.1 --style raw', '5 quotes appear colored green=best red=worst, "MEJOR OPCIÓN" badge. "COMPARA ANTES DE IR." 12s 9:16.', ad('trafico', 'Cd. Juárez +50km, 25-55, ahorro, mecánica', 50, 'Reels + Stories', 2), '8:30 PM'),

    makeEntry(2, 5, 'facebook', 'Último Volkswagen Jetta a este precio', 'Foto profesional VW Jetta negro con precio tachado', '🚗 VW Jetta 2019 - Antes: $220,000 → Ahora: $175,000 MXN. ⚠️ Solo queda 1.', 'Contacta al vendedor ahora', 'escasez', ['#CarMatch','#VolkswagenJetta','#UltimaUnidad','#CdJuarez'], 'Black 2019 VW Jetta in front of modern Mexican house, dramatic side lighting, price "$175,000" with "$220,000" crossed out --ar 16:9 --v 6.1 --style raw', 'Camera reveals Jetta from darkness, price animates $220K→$175K. "ÚLTIMO. SOLO QUEDA 1." 15s 1:1.', ad('trafico', 'Cd. Juárez +100km, 25-55, Volkswagen', 50, 'Feed', 2), '7:00 PM'),

    // ═══ SEMANA 3: Vendedores ═══
    makeEntry(3, 0, 'tiktok', 'Vendes tu auto? Publícalo gratis.', 'Mano presionando "Publicar", auto aparece con datos', 'Sube una foto. La IA llena 25 datos. Tu auto en Google SIN pagar.', 'Publica tu auto gratis ahora', 'reciprocidad', ['#CarMatch','#VenderAuto','#Gratis','#CdJuarez'], 'Hand tapping "PUBLICAR" button, car published with auto-filled data, confetti, car for sale sign on Mexican street --ar 9:16 --v 6.1 --style raw', 'Tap "PUBLICAR" → car photo animates → 25 fields fill → confetti → Google. "PUBLICA TU AUTO GRATIS." 15s 9:16.', ad('leads', 'Cd. Juárez +100km, vendedores, 25-65', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(3, 1, 'instagram', 'Tu auto en 25 datos profesionales', 'Lado a lado: listing informal Facebook vs listing CarMatch', 'Facebook: "Vendo Honda Civic, sin choques." CarMatch: 25 datos verificados, fotos profesionales.', 'Mira la diferencia en CarMatch', 'asombro', ['#CarMatch','#Profesional','#VenderAuto','#Datos','#CdJuarez'], 'Split: LEFT blurry photo "Vendo Honda Civic". RIGHT professional CarMatch listing 25 fields, badge --ar 9:16 --v 6.1 --style raw', 'Left shrinks (amateur), right grows (professional). "25 DATOS PROFESIONALES." 15s 9:16.', ad('trafico', 'Cd. Juárez +100km, vendedores, 25-55', 50, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(3, 2, 'facebook', '1,234 autos ya están publicados', 'Counter animándose de 0 a 1,234 con fotos', '📊 1,234 autos, 89 talleres, 2,100+ usuarios, 4.8 estrellas. ¿Ya publicaste el tuyo?', 'Publica tu auto gratis', 'prueba-social', ['#CarMatch','#CdJuarez','#1234Autos','#Crecimiento'], 'Large counter "1,234 AUTOS" with car icons, dark background blue/orange glow, modern dashboard --ar 1:1 --v 6.1 --style raw', 'Counter 0→1,234, stats animate. "¿YA PUBLICASTE EL TUYO?" 15s 1:1.', ad('alcance', 'Cd. Juárez +100km, 21-65', 50, 'Feed', 3), '1:00 PM'),

    makeEntry(3, 3, 'tiktok', '¿Por qué no se vende tu auto?', 'Auto con letrero "SE VENDE" polvoriento, dueño frustrado', 'Sin fotos profesionales, sin 25 datos, sin Google. CarMatch resuelve TODO.', 'Resuelve esto en CarMatch', 'urgencia', ['#CarMatch','#VenderAuto','#Problema','#Solucion','#CdJuarez'], 'Frustrated man with dusty "SE VENDE" sign, no calls on phone, car looks nice but poor presentation --ar 9:16 --v 6.1 --style raw', 'Frustrated with old sign → cut to CarMatch listing → phone rings! "CARMATCH CAMBIA TODO." 18s 9:16.', ad('trafico', 'Cd. Juárez +100km, vendedores frustrados, 25-65', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(3, 4, 'instagram', 'Foto profesional de tu auto. Gratis.', 'Transformación: foto amateur → foto profesional IA en 3s', 'La IA convierte tu foto amateur en imagen profesional con fondo de estudio.', 'Prueba la IA de CarMatch gratis', 'reciprocidad', ['#CarMatch','#IA','#Fotografia','#Gratis','#CdJuarez'], 'Before/after: LEFT blurry amateur car photo. RIGHT same car professional studio perfect lighting --ar 9:16 --v 6.1 --style raw', 'Amateur photo → AI scanning → professional photo emerges. "FOTO PROFESIONAL. GRATIS." 12s 9:16.', ad('trafico', 'Cd. Juárez +100km, vendedores, 25-55', 50, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(3, 5, 'facebook', 'Este auto se vendió en 3 días con CarMatch', 'Foto auto con badge "VENDIDO EN 3 DÍAS" y testimonio', '🎉 "Mi Golf se vendió en 3 días. Antes llevaba 2 meses en Facebook." - Carlos', 'Publica tu auto gratis', 'fomo', ['#CarMatch','#Vendido','#Exito','#CdJuarez'], 'Volkswagen Golf with "VENDIDO EN 3 DÍAS" stamp, testimonial 5 stars, clean delivery setting, confetti --ar 16:9 --v 6.1 --style raw', 'Car with "VENDIDO" stamp, testimonial, 5 stars, confetti. Next car: "¿EL TUYO?" 15s 1:1.', ad('alcance', 'Cd. Juárez +100km, vendedores, 25-65', 50, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 4: Vendedores ═══
    makeEntry(4, 0, 'tiktok', 'Sin esto, no vendes tu auto', 'Checklist: 3 cosas que NECESITAS para vender', '✅ Fotos profesionales. ✅ 25 datos. ✅ Google. CarMatch las 3 GRATIS.', 'Activa las 3 gratis en CarMatch', 'aversion-perdida', ['#CarMatch','#VenderAuto','#Checklist','#Gratis','#CdJuarez'], 'Smartphone checklist 3 items checked off, each reveals feature, "SE VENDE" turns "VENDIDO" --ar 9:16 --v 6.1 --style raw', 'Checklist: Fotos ✅, 25 datos ✅, Google ✅. "CARMATCH TE DA LAS 3 GRATIS." 15s 9:16.', ad('leads', 'Cd. Juárez +100km, vendedores, 25-65', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(4, 1, 'instagram', 'Tu competencia ya está en CarMatch', 'Vendedor frustrado (Facebook) vs vendedor exitoso (CarMatch)', 'Mientras tú en Facebook, tu competencia ya publicó 50 autos y se vendieron.', 'Únete antes de que sea tarde', 'fomo', ['#CarMatch','#Competencia','#NoTeQuedes','#CdJuarez'], 'Two men: LEFT frustrated 0 calls (Facebook). RIGHT celebrating 10+ inquiries (CarMatch) --ar 9:16 --v 6.1 --style raw', 'Frustrated (Facebook) vs Happy (CarMatch notifications). "TU COMPETENCIA YA ESTÁ AQUÍ." 15s 9:16.', ad('leads', 'Cd. Juárez +100km, vendedores activos, 25-55', 50, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(4, 2, 'facebook', 'Auto verificado se vende 3x más rápido', 'Gráfica: auto verificado vs sin verificar', '📊 Sin verificar: 45 días. Verificado CarMatch: 15 días. 3x más rápido.', 'Verifica tu auto gratis', 'autoridad', ['#CarMatch','#Verificado','#Datos','#Rapido','#CdJuarez'], 'Infographic: red bar "45 días" vs green "15 días", dramatic difference, professional data viz --ar 1:1 --v 6.1 --style raw', 'Bar chart: Red "45 días" → Green "15 días". "3x MÁS RÁPIDO." 12s 1:1.', ad('alcance', 'Cd. Juárez +100km, vendedores, 25-65', 50, 'Feed', 3), '1:00 PM'),

    makeEntry(4, 3, 'tiktok', 'El secreto para vender rápido', 'Persona compartiendo "secreto" al oído', 'El secreto: publica en 3 plataformas a la vez. CarMatch lo hace AUTOMÁTICO.', 'Activa publicación multi-plataforma gratis', 'curiosidad', ['#CarMatch','#Secreto','#VenderRapido','#Tips','#CdJuarez'], 'Person whispering secret, "3 plataformas a la vez" floating text, mysterious blue lighting --ar 9:16 --v 6.1 --style raw', 'Whisper → text "E-L S-E-C-R-E-T-O" → auto publishes to 3 platforms. "CARMATCH LO HACE AUTOMÁTICO." 15s 9:16.', ad('trafico', 'Cd. Juárez +100km, vendedores, 25-55', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(4, 4, 'instagram', 'Vendedor top: 12 autos vendidos', 'Montaje 12 autos con badge "VENDIDO"', '🏆 Roberto vendió 12 autos en octubre. "Sin CarMatch no hubiera sido posible."', 'Sé el próximo vendedor top', 'prueba-social', ['#CarMatch','#VendedorTop','#Exito','#CdJuarez'], 'Proud dealer in front of 12 "VENDIDO" cars, CarMatch award, professional dealership golden light --ar 9:16 --v 6.1 --style raw', '12 cars appear with "VENDIDO" stamps. Counter: "12 AUTOS". "SÉ EL PRÓXIMO TOP." 15s 9:16.', ad('alcance', 'Cd. Juárez +100km, dealers, 25-55', 50, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(4, 5, 'facebook', 'Último día: publica tu auto gratis', 'Reloj countdown "ÚLTIMO DÍA"', '⏰ HOY ES EL ÚLTIMO DÍA gratis. Mañana $20 MXN/mes.', 'Publica gratis ANTES de medianoche', 'urgencia', ['#CarMatch','#ÚltimoDía','#Gratis','#Urgencia','#CdJuarez'], 'Dramatic countdown clock "00:04:59:59", red urgent, car silhouettes fading --ar 1:1 --v 6.1 --style raw', 'Countdown 4:00→0:00:01→0:00:00. Flash red. "ÚLTIMO DÍA. PUBLICA GRATIS." 12s 1:1.', ad('leads', 'Cd. Juárez +100km, vendedores, 25-65', 50, 'Feed', 1), '7:00 PM'),

    // ═══ SEMANA 5: Compradores ═══
    makeEntry(5, 0, 'tiktok', 'Swipe de autos como Tinder', 'Interfaz Tinder con autos', 'Desliza para descubrir. Swipe right si te gusta. Auto ideal en segundos.', 'Descarga y desliza ahora', 'entretenimiento', ['#CarMatch','#Swipe','#TinderDeAutos','#CdJuarez'], 'Smartphone Tinder interface with car cards, about to swipe red sports car, clean CarMatch UI --ar 9:16 --v 6.1 --style raw', 'POV: Civic→right (heart), Jetta→right, old car→left (X). "3 AUTOS QUE TE GUSTAN." 15s 9:16.', ad('trafico', 'Cd. Juárez +50km, 21-35, autos, dating apps', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(5, 1, 'instagram', '5 autos con menos de $100K', 'Countdown 5 autos baratos con precios', '💰 Spark $65K, March $72K, i10 $78K, Picanto $85K, Beat $88K. Sí se puede.', 'Más autos baratos en CarMatch', 'lista', ['#CarMatch','#AutosBaratos','#Menos100K','#CdJuarez'], 'Five affordable cars with price tags under $100K, clean attractive cars, modern dealership --ar 9:16 --v 6.1 --style raw', 'Countdown 5→1 each with price. "SÍ SE PUEDE CON $100K." 18s 9:16.', ad('trafico', 'Cd. Juárez +100km, 18-35, primer auto', 50, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(5, 2, 'facebook', 'El futuro es eléctrico', 'Foto auto eléctrico cargando', '⚡ Los EVs llegan a México. 🔋 CarMatch ya tiene sección de EVs.', 'Explora autos eléctricos', 'tendencia', ['#CarMatch','#Electrico','#EV','#Futuro','#CdJuarez'], 'Modern EV at charging station sunset, futuristic premium, Mexico City skyline mountains --ar 16:9 --v 6.1 --style raw', 'EV battery: 20%→50%→80%→100%. Drives off. "EL FUTURO ES ELÉCTRICO." 15s 1:1.', ad('alcance', 'Cd. Juárez +100km, 25-55, tecnología', 50, 'Feed', 3), '1:00 PM'),

    makeEntry(5, 3, 'tiktok', 'Este error te cuesta $50,000', 'Persona descubriendo problema oculto, horror, $50,000', 'No checar historial. Ese "buen deal" puede costarte $50K en reparaciones.', 'Checa el historial antes de comprar', 'aversion-perdida', ['#CarMatch','#Error','#Historial','#Estafa','#CdJuarez'], 'Person shocked at $50,000 mechanic bill, car hood open engine problems, holding head --ar 9:16 --v 6.1 --style raw', 'Happy buy → mechanic problems → bill $50K → devastated. "HISTORIAL GRATIS." 18s 9:16.', ad('trafico', 'Cd. Juárez +100km, 21-45, compradores', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(5, 4, 'instagram', 'Civic vs Corolla: ¿cuál gana?', 'Split screen Honda Civic vs Toyota Corolla', '⚖️ Precio: similar. Confiabilidad: similar. Potencia: Civic. Comodidad: Corolla.', 'Compara y decide en CarMatch', 'comparacion', ['#CarMatch','#CivicVsCorolla','#Comparacion','#CdJuarez'], 'Dramatic split: Honda Civic left, Toyota Corolla right, lightning bolt middle --ar 9:16 --v 6.1 --style raw', 'Stats: "Precio: Empate", "Potencia: Civic", "Comodidad: Corolla". "¿CUÁL ELIGES?" 15s 9:16.', ad('interaccion', 'Cd. Juárez +100km, 21-45, Honda, Toyota', 50, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(5, 5, 'facebook', 'El auto perfecto para ti. La IA lo sabe.', 'Persona respondiendo preguntas IA, recibe recomendación', '🤖 IA pregunta: ¿cuánto? ¿cuántas personas? ¿urbano? En 30s: tu auto ideal.', 'Prueba la IA de CarMatch', 'personalizacion', ['#CarMatch','#IA','#AutoIdeal','#Personalizado','#CdJuarez'], 'Person chatting with AI on phone, questions with icons, perfect car recommendation confetti --ar 16:9 --v 6.1 --style raw', 'AI chat → questions → answers → result "TU AUTO IDEAL: Civic 2021". "LA IA LO SABE." 15s 1:1.', ad('trafico', 'Cd. Juárez +100km, 21-45, IA, tecnología', 50, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 6: Compradores ═══
    makeEntry(6, 0, 'tiktok', 'No compres sin ver esto', 'Lista 5 cosas verificar ANTES de comprar', '⚠️ Historial, vendedor verificado, punto seguro, fotos reales, precio. Todo GRATIS.', 'Verifica antes de comprar', 'miedo', ['#CarMatch','#Verifica','#CompraSegura','#CdJuarez'], 'Warning checklist with red alert icons, shadowy scammer in background, dramatic red lighting --ar 9:16 --v 6.1 --style raw', '5 items appear with alerts → each gets green check. "VERIFICA ANTES DE COMPRAR." 15s 9:16.', ad('trafico', 'Cd. Juárez +100km, 21-45, compradores primerizos', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(6, 1, 'instagram', 'Tu auto ideal te espera', 'Montaje 10 autos con comprador sonriente', 'SUV para familia. Deportivo para ti. Eléctrico para el futuro.', 'Encuentra el tuyo en CarMatch', 'cariño', ['#CarMatch','#AutoIdeal','#TuAuto','#CdJuarez'], 'Montage: family+SUV, young+sports, eco+EV, professional+sedan, all smiling Mexican backgrounds --ar 9:16 --v 6.1 --style raw', 'Rapid montage: Family+SUV → Young+sports → Eco+EV → Professional. "TU AUTO IDEAL TE ESPERA." 15s 9:16.', ad('alcance', 'Cd. Juárez +100km, 21-55', 50, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(6, 2, 'facebook', '15 personas buscan este auto AHORA', 'Listing con contador de vistas tiempo real', '🔥 Honda CR-V 2021. 👁️ 15 viendo. 💬 8 mensajes. ⏰ Último a este precio.', 'Ver antes de que se vaya', 'fomo', ['#CarMatch','#FOMO','#ÚltimaOportunidad','#CdJuarez'], 'Car listing with live counter "15 viendo AHORA", notifications popping, dark red accents --ar 1:1 --v 6.1 --style raw', 'Counter "15 viendo" increments. Notifications flood. "¿QUIERES SER EL PRÓXIMO?" 12s 1:1.', ad('trafico', 'Cd. Juárez +100km, 25-55, compradores activos', 50, 'Feed', 2), '1:00 PM'),

    makeEntry(6, 3, 'tiktok', 'Compara antes de comprar. Siempre.', 'Tres personas: triste, neutral, feliz (CarMatch)', 'Sin comparar: pagas de más. Google: pierdes tiempo. CarMatch: ahorras.', 'Compara en CarMatch', 'utilidad', ['#CarMatch','#Compara','#Ahorra','#Tiempo','#CdJuarez'], 'Three people: LEFT overpriced car (sad), MIDDLE Google (frustrated), RIGHT CarMatch (happy) --ar 9:16 --v 6.1 --style raw', 'Person 1 sad, Person 2 frustrated, Person 3 happy with CarMatch. "COMPARA. SIEMPRE." 15s 9:16.', ad('trafico', 'Cd. Juárez +100km, 25-55, compradores', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(6, 4, 'instagram', 'Prueba de manejo segura con CarMatch', 'Persona en prueba con GPS y trusted contacts', '🔒 GPS en tiempo real. 👥 Contactos notificados. ⏰ Check-in 20 min. 🚨 SOS.', 'Activa CarMatch para tu prueba', 'seguridad', ['#CarMatch','#PruebaDeManejo','#Seguridad','#GPS','#CdJuarez'], 'Person test-driving, phone dashboard showing CarMatch GPS, green route, notification "Papá monitoreando" --ar 9:16 --v 6.1 --style raw', 'Activates CarMatch → GPS starts → family notified → check-in at 20min. "PRUEBA SEGURA." 15s 9:16.', ad('interaccion', 'Cd. Juárez +100km, 18-35, compradores primerizos', 50, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(6, 5, 'facebook', 'Auto verificado = confianza total', 'Badge verificación premium', '✅ Historial. Fotos reales. Precio vs mercado. Vendedor verificado. Documentos.', 'Busca autos verificados', 'autoridad', ['#CarMatch','#Verificado','#Confianza','#CdJuarez'], 'Car with large CarMatch verification badge glowing, premium showroom, "100% VERIFICADO" --ar 16:9 --v 6.1 --style raw', 'Badge animates with glow. Checklist: "Historial ✓", "Fotos ✓", "Precio ✓". "CONFIANZA TOTAL." 15s 1:1.', ad('alcance', 'Cd. Juárez +100km, 25-55, compradores cautelosos', 50, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 7: Talleres ═══
    makeEntry(7, 0, 'tiktok', 'Tu taller necesita esto HOY', 'Taller estresado vs con sistema CarMatch', '📞 Llamadas perdidas. 📅 Citas en papel. vs 📱 Citas automáticas. 🤖 Chatbot 24/7.', 'Registra tu taller gratis', 'necesidad', ['#CarMatch','#Talleres','#Negocio','#Transformacion','#CdJuarez'], 'Split: chaotic workshop papers everywhere. Right: organized with digital display, calm owner --ar 9:16 --v 6.1 --style raw', 'Chaos → order: papers→digital, calls→chatbot, stressed→calm. "CARMATCH TRANSFORMA TU TALLER." 15s 9:16.', ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(7, 1, 'instagram', 'Chatbot que responde 24/7. Gratis.', 'Simulación chatbot respondiendo a 3AM', 'Cliente: "¿Cuánto aceite?" CarMatch: "$650. ¿Agenda cita?" Cliente: "Sí, mañana 10"', 'Activa tu chatbot gratis', 'asombro', ['#CarMatch','#Chatbot','#IA','#24/7','#CdJuarez'], 'Phone chat at 3AM, chatbot responds instantly professional answers, clean interface --ar 9:16 --v 6.1 --style raw', 'Chat 3AM: question→response→booking→confirmation. "RESPONDE 24/7. GRATIS." 15s 9:16.', ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(7, 2, 'facebook', 'Citas en línea. Sin llamadas. Sin papel.', 'Demo: cliente agenda en 3 taps', '📱 1. Servicio. 2. Fecha/hora. 3. Confirma. 📅 Taller recibe notificación + datos + historial.', 'Activa citas en línea gratis', 'comodidad', ['#CarMatch','#CitasEnLinea','#SinLlamadas','#CdJuarez'], 'Customer booking on phone, time slots, workshop owner receives notification on tablet, both satisfied --ar 16:9 --v 6.1 --style raw', '3 taps: service→time→confirm. Workshop: "NUEVA CITA". "SIN LLAMADAS. SIN PAPEL." 12s 1:1.', ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Feed', 3), '1:00 PM'),

    makeEntry(7, 3, 'tiktok', '¿Cuándo fue tu último servicio?', 'Dashboard recordatorios de servicio', 'Tu auto: "Mi último aceite fue hace 8,000 km." CarMatch te avisa.', 'Registra tu auto en CarMatch', 'urgencia', ['#CarMatch','#ServicioAuto','#Recordatorio','#CdJuarez'], 'Car dashboard "ALERTA: Servicio vencido 500 km", phone shows CarMatch timeline --ar 9:16 --v 6.1 --style raw', 'Car alert → CarMatch timeline → overdue red → notification. "NUNCA OLVIDES UN SERVICIO." 12s 9:16.', ad('trafico', 'Cd. Juárez +100km, dueños autos, 25-55', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(7, 4, 'instagram', 'Tu taller en Google Maps. Sin pagar.', 'Búsqueda Google Maps con pin CarMatch', 'Tu taller aparece en Google Maps SIN pagar. Solo registra en CarMatch.', 'Registra tu taller gratis', 'autoridad', ['#CarMatch','#GoogleMaps','#Talleres','#Gratis','#CdJuarez'], 'Google Maps workshop with CarMatch badge, 4.8 stars, photos, others without badge --ar 9:16 --v 6.1 --style raw', 'Google Maps "taller cerca" → CarMatch at top with badge. "EN GOOGLE MAPS. SIN PAGAR." 12s 9:16.', ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(7, 5, 'facebook', 'Halloween: tu auto te necesita', 'Auto disfrazado Halloween con checklist', '🎃 Luces ✓ (fantasmas). Frenos ✓ (zombis). Batería ✓ (huir rápido).', 'Registra tu auto gratis', 'temporada', ['#CarMatch','#Halloween','#Auto','#Servicio','#CdJuarez'], 'Car decorated Halloween spooky lights, jack-o-lanterns, CarMatch checklist overlay --ar 16:9 --v 6.1 --style raw', 'Halloween car, checklist: "Luces ✓", "Frenos ✓", "Batería ✓". "TU AUTO TE NECESITA." 12s 1:1.', ad('interaccion', 'Cd. Juárez +100km, 21-45', 50, 'Feed', 2), '7:00 PM'),

    // ═══ SEMANA 8: Talleres ═══
    makeEntry(8, 0, 'tiktok', 'Taller sin citas = caos', 'Taller abrumado con clientes sin cita', 'Sin sistema: esperan horas, se enojan, no regresan. Con CarMatch: todo organizado.', 'Organiza tu taller gratis', 'aversion-perdida', ['#CarMatch','#Talleres','#Caos','#Organizacion','#CdJuarez'], 'Chaotic workshop multiple waiting customers, frustrated overwhelmed owner --ar 9:16 --v 6.1 --style raw', 'Chaos: no appointments, long wait, angry → organized system, happy. "SIN CITAS = CAOS." 15s 9:16.', ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(8, 1, 'instagram', 'Antes vs Después de CarMatch', 'Timelapse: desordenado → sistema brillando', '📱 Antes: Llamadas, papel. Después: Chatbot, citas online, clientes felices.', 'Transforma tu taller hoy', 'transformacion', ['#CarMatch','#AntesDespues','#Transformacion','#CdJuarez'], 'Dramatic before/after: LEFT dark chaotic. RIGHT bright organized dashboard --ar 9:16 --v 6.1 --style raw', 'Before dark chaos → After bright organized. "CARMATCH CAMBIA TODO." 15s 9:16.', ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Reels + Stories', 2), '1:0 PM'),

    makeEntry(8, 2, 'facebook', '200 talleres ya tienen MiniWeb', 'Mapa Cd. Juárez con 200 pins', '🏪 200 talleres: Chatbot, Citas, Google, Dashboard. ¿Tu taller es el próximo?', 'Registra tu taller gratis', 'prueba-social', ['#CarMatch','#Talleres','#200Talleres','#CdJuarez'], 'Map Cd. Juárez 200 glowing pins, CarMatch badge each, city lit up --ar 1:1 --v 6.1 --style raw', 'Map: 200 pins appear, each glows. "200 TALLERES". "¿EL TUYO ES EL PRÓXIMO?" 15s 1:1.', ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Feed', 3), '1:00 PM'),

    makeEntry(8, 3, 'tiktok', 'Tu cliente te busca 24/7', 'Reloj girando con búsquedas a todas horas', '3AM: "Taller cerca". 6AM: "¿Aceite?". 11PM: "Taller abierto". Sin CarMatch van al de al lado.', 'Está ahí cuando te busquen', 'necesidad', ['#CarMatch','#Clientes','#24/7','#Negocio','#CdJuarez'], 'Clock spinning, phone notifications at each time customer searches --ar 9:16 --v 6.1 --style raw', 'Clock: 3AM→6AM→11PM, each search goes to CarMatch workshop. "ESTÁ AHÍ CUANDO TE BUSQUEN." 15s 9:16.', ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(8, 4, 'instagram', '"Mis ventas subieron 40%"', 'Testimonial con gráfica de ventas', '⭐ "Desde CarMatch, mis ventas subieron 40%. El chatbot responde lo que yo no podía."', 'Únete a los talleres exitosos', 'prueba-social', ['#CarMatch','#Testimonial','#Exito','#Talleres','#CdJuarez'], 'Happy workshop owner testimonial, 40% sales graph behind, busy successful workshop --ar 9:16 --v 6.1 --style raw', 'Don Pedro: "Mis ventas subieron 40%". Graph animates up. "CARMATCH CAMBIA NEGOCIOS." 15s 9:16.', ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(8, 5, 'facebook', 'Registra tu taller gratis. Sin compromiso.', 'Formulario 3 campos', '📝 30 segundos: Nombre, Dirección, Teléfono. ✅ Chatbot, MiniWeb, Google Maps. Sin tarjeta.', 'Registra tu taller AHORA', 'reciprocidad', ['#CarMatch','#Gratis','#Talleres','#SinCompromiso','#CdJuarez'], 'Simple registration form 3 fields, icons: chatbot, miniweb, Google Maps with checkmarks --ar 16:9 --v 6.1 --style raw', 'Form: Name→Address→Phone→SUBMIT. Benefits animate. "GRATIS. SIN COMPROMISO." 12s 1:1.', ad('leads', 'Dueños talleres, 25-55, Cd. Juárez + Chihuahua', 50, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 9: Seguridad ═══
    makeEntry(9, 0, 'tiktok', 'Va a verse con un desconocido. Sin CarMatch.', 'Mujer nerviosa hacia estacionamiento oscuro', 'Sin CarMatch: nadie sabe dónde estás. Sin GPS. Sin SOS. Estás sola.', 'No vayas sin CarMatch', 'miedo', ['#CarMatch','#SOS','#Seguridad','#Desconocido','#CdJuarez'], 'Young woman walking alone dark parking lot, nervous, no one knows where she is, cinematic horror lighting --ar 9:16 --v 6.1 --style raw', 'SIN: dark, alone. CON: GPS active, family notified, SOS ready. "ESTÁS PROTEGIDA." 20s 9:16.', ad('interaccion', 'Mujeres 21-45, Cd. Juárez', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(9, 1, 'instagram', 'Ella activó SOS. Llegó su papá.', 'Secuencia: SOS → alerta → llega → abrazo', '🚨 SOS activado. 📱 Papá notificado. 📍 Ubicación real. 🚗 Llega en 5 min. 😌 Segura.', 'Activa SOS para tu familia', 'alivio', ['#CarMatch','#SOS','#Familia','#Proteccion','#CdJuarez'], 'Father rushing to daughter, arrives, she hugs him, both relieved, CarMatch app showing SOS --ar 9:16 --v 6.1 --style raw', 'SOS → Dad notified → Dad rushes → hug → relieved. "CARMATCH SALVA VIDAS." 20s 9:16.', ad('interaccion', 'Familias, 30-55, Cd. Juárez', 50, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(9, 2, 'facebook', '12 personas buscan este auto AHORA', 'Listing con contador tiempo real', '🔥 Toyota Camry 2021. 👁️ 12 viendo. 💬 5 mensajes. ⏰ Actualizado hace 2 min.', 'Ver antes de que se vaya', 'fomo', ['#CarMatch','#FOMO','#ÚltimaOportunidad','#CdJuarez'], 'Car listing live counter "12 viendo AHORA", notifications, urgency countdown --ar 1:1 --v 6.1 --style raw', 'Counter "12 viendo" → notifications flood. "¿TE LO LLEVAS?" 12s 1:1.', ad('trafico', 'Cd. Juárez +100km, compradores, 25-55', 50, 'Feed', 2), '1:00 PM'),

    makeEntry(9, 3, 'tiktok', 'Ubicación en tiempo real', 'Persona en ruta + familia monitoreando', '📍 Tiempo real. 👥 Familia te ve. ⏰ Check-in 20 min. 🚨 SOS.', 'Activa GPS tracking gratis', 'seguridad', ['#CarMatch','#GPS','#TiempoReal','#Familia','#CdJuarez'], 'Split: LEFT person driving. RIGHT family watching location on map real time, glowing line --ar 9:16 --v 6.1 --style raw', 'Driving (left) + Family map (right). Dot moves. Check-in 20min. "TU FAMILIA LO SABE." 15s 9:16.', ad('interaccion', 'Familias, 25-55, Cd. Juárez', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(9, 4, 'instagram', 'Trusted Contacts: tu red de seguridad', 'Persona agregando contactos, cada uno notificado', '👥 Agrega familia. 📱 Ellos reciben tu ubicación. 🚨 Si SOS, ellos saben.', 'Configura tus contactos ahora', 'proteccion', ['#CarMatch','#TrustedContacts','#RedDeSeguridad','#CdJuarez'], 'Phone Trusted Contacts setup, 3 family members added, each gets notification --ar 9:16 --v 6.1 --style raw', 'Add 3 contacts → each notified → family as trusted. "TU RED DE SEGURIDAD." 12s 9:16.', ad('interaccion', 'Familias, 25-55, Cd. Juárez', 50, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(9, 5, 'facebook', 'Check-in cada 20 minutos', 'Timeline check-ins automáticos', '📍 8:00 Casa. 📍 8:20 Ruta. 📍 8:40 Trabajo. 📍 9:00 Trabajo. Siempre saben.', 'Activa check-ins automáticos', 'vigilancia', ['#CarMatch','#CheckIn','#Automatico','#Familia','#CdJuarez'], 'Timeline automatic check-ins every 20min, location pins timestamps, modern CarMatch branding --ar 16:9 --v 6.1 --style raw', 'Timeline: "8:00 Saliste", "8:20 Ruta", "8:40 Llegaste". Pins on map. "SIEMPRE SABEN." 12s 16:9.', ad('interaccion', 'Familias, 25-55, Cd. Juárez', 50, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 10: Seguridad ═══
    makeEntry(10, 0, 'tiktok', 'GPS tracking mientras manejas', 'Vista aérea ciudad con GPS moviéndose', 'Tu ubicación cada segundo. Tu familia te ve. Si algo pasa, ellos saben.', 'Activa GPS tracking gratis', 'seguridad', ['#CarMatch','#GPS','#Tracking','#Seguridad','#CdJuarez'], 'Aerial city view GPS dot moving real time, connected to family watching phones, glowing line --ar 9:16 --v 6.1 --style raw', 'Aerial GPS dot → family watching phone. "TU FAMILIA TE VE EN TIEMPO REAL." 15s 9:16.', ad('interaccion', 'Familias, 25-55, Cd. Juárez', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(10, 1, 'instagram', 'Tu familia sabe dónde estás', 'Madre mirando celular, ve ubicación de hijo, sonríe', '📍 Madre ve hijo en camino. 😌 Sabe que está seguro. 📱 Paz mental.', 'Activa para tu familia', 'tranquilidad', ['#CarMatch','#Familia','#Tranquilidad','#Seguridad','#CdJuarez'], 'Mother looking at phone showing son\'s location map, smiling relieved, warm home soft lighting --ar 9:16 --v 6.1 --style raw', 'Mother checks phone, sees son\'s dot moving home, smiles. "PAZ MENTAL PARA TU FAMILIA." 15s 9:16.', ad('interaccion', 'Familias, 30-55, Cd. Juárez', 50, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(10, 2, 'facebook', 'Emergencia: ¿qué haces?', 'Pregunta directa sobre plan de emergencia', '🚨 Si te pasa algo: ¿Quién sabe dónde estás? ¿Quién ayuda? CarMatch es tu plan.', 'Configura tu plan de emergencia', 'miedo', ['#CarMatch','#Emergencia','#PlanDeSeguridad','#CdJuarez'], 'Emergency: car stopped dark road, phone showing CarMatch SOS button ready, contacts listed --ar 16:9 --v 6.1 --style raw', 'Emergency scenario → SOS ready → contacts listed. "¿TU PLAN DE EMERGENCIA?" 15s 1:1.', ad('interaccion', 'Cd. Juárez +100km, 25-55', 50, 'Feed', 3), '1:00 PM'),

    makeEntry(10, 3, 'tiktok', 'Botón de pánico en tu celular', 'Mano presionando botón SOS, animación dramática', 'Un toque. SOS activado. Tu familia sabe. La ayuda viene.', 'Descarga CarMatch ahora', 'urgencia', ['#CarMatch','#SOS','#BotonDePanico','#Emergencia','#CdJuarez'], 'Close-up finger pressing red SOS button, dramatic pulse animation, emergency contacts highlighted --ar 9:16 --v 6.1 --style raw', 'Finger presses SOS → RED PULSE → contacts alerted. "UN TOQUE. EMERGENCIA ACTIVADA." 12s 9:16.', ad('interaccion', 'Cd. Juárez +100km, 18-45', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(10, 4, 'instagram', 'Test drive seguro con CarMatch', 'Pareja en prueba con GPS y contactos', '🔒 GPS activo. 👥 Contactos notificados. ⏰ Check-in 20 min. 🚨 SOS.', 'Activa CarMatch para tu prueba', 'seguridad', ['#CarMatch','#TestDrive','#PruebaSegura','#GPS','#CdJuarez'], 'Couple test-driving, phone showing CarMatch GPS, green route, trusted contacts notified --ar 9:16 --v 6.1 --style raw', 'Activates CarMatch → GPS → family notified → check-in. "PRUEBA SEGURA." 15s 9:16.', ad('interaccion', 'Cd. Juárez +100km, parejas 25-45', 50, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(10, 5, 'facebook', 'La app más segura de México', 'Badge "LA MÁS SEGURA" shield dorado', '🛡️ SOS + GPS. Trusted Contacts. Check-ins 20 min. Test drive seguro. Punto seguro.', 'Descarga la app más segura', 'autoridad', ['#CarMatch','#LaMásSegura','#SOS','#GPS','#CdJuarez'], 'Golden shield badge "LA MÁS SEGURA DE MÉXICO" CarMatch logo, premium metallic, dark dramatic --ar 1:1 --v 6.1 --style raw', 'Shield badge golden glow, "LA MÁS SEGURA DE MÉXICO" types in. 10s 1:1.', ad('alcance', 'Cd. Juárez +100km, 21-65', 50, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 11: Expansión ═══
    makeEntry(11, 0, 'tiktok', 'CarMatch llega a Chihuahua', 'Animación expansión Juárez → Chihuahua', '🚀 Cd. Juárez fue primero. Ahora: Chihuahua. Después: Monterrey, Gdl, CDMX.', 'Únete antes de que llegue a tu ciudad', 'expansion', ['#CarMatch','#Chihuahua','#Expansion','#Mexico'], 'Animated map CarMatch expanding Juárez→Chihuahua, glowing expansion wave, Mexican territory --ar 9:16 --v 6.1 --style raw', 'Map: Juárez glows → expansion → Chihuahua lights up. "CARMATCH LLEGA A CHIHUAHUA." 12s 9:16.', ad('alcance', 'Chihuahua capital +100km, 21-55', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(11, 1, 'instagram', 'Monterrey, ¿listos?', 'Skyline Monterrey con logo CarMatch', '🏙️ Monterrey: 5M+ personas. El mercado más grande del norte. CarMatch viene.', 'Sé de los primeros en Monterrey', 'anticipacion', ['#CarMatch','#Monterrey','#Expansion','#Listos'], 'Monterrey skyline sunset, CarMatch logo floating above, anticipation excitement mood --ar 9:16 --v 6.1 --style raw', 'Monterrey skyline, CarMatch logo fades in. "MONTERREY, ¿LISTOS?" Anticipation pulse. 12s 9:16.', ad('alcance', 'Monterrey +100km, 21-55', 50, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(11, 2, 'facebook', 'Black Friday: descuentos especiales', 'Ofertas Black Friday para talleres y vendedores', '🖤 MiniWeb GRATIS 3 meses. Publicación premium GRATIS. Suscripción 50% OFF. Solo hoy.', 'Aprovecha antes de que se acabe', 'urgencia', ['#CarMatch','#BlackFriday','#Descuentos','#SoloHoy'], 'Black Friday CarMatch promotion, dark background gold accents, discount badges premium feel --ar 16:9 --v 6.1 --style raw', 'Deals animate: "MiniWeb GRATIS", "Publicación GRATIS", "50% OFF". Timer. "SOLO HOY." 12s 1:1.', ad('leads', 'Cd. Juárez +200km, 21-65', 50, 'Feed', 1), '1:00 PM'),

    makeEntry(11, 3, 'tiktok', 'Guadalajara, te esperamos', 'Expansión: Chihuahua → Monterrey → Guadalajara', '📍 Chihuahua ✓. 📍 Monterrey ✓. 📍 Guadalajara: PRÓXIMAMENTE.', 'Regístrate para ser notificado', 'anticipacion', ['#CarMatch','#Guadalajara','#Expansion','#Proximamente'], 'Map expansion: Chihuahua ✓ → Monterrey ✓ → Guadalajara pulsing "PRÓXIMAMENTE" --ar 9:16 --v 6.1 --style raw', 'Map: Chihuahua ✓, Monterrey ✓, Guadalajara pulses. "GUADALAJARA, TE ESPERAMOS." 12s 9:16.', ad('alcance', 'Guadalajara +100km, 21-55', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(11, 4, 'instagram', 'CDMX: la gran ciudad', 'Torres Reforma con logo CarMatch', '🏙️ CDMX: 22M personas. El mercado más grande. CarMatch va a llegar.', 'Regístrate para CDMX', 'anticipacion', ['#CarMatch','#CDMX','#Expansion','#GranCiudad'], 'CDMX skyline Reforma towers, CarMatch logo floating grand ambitious, sunset --ar 9:16 --v 6.1 --style raw', 'CDMX skyline reveal, CarMatch logo massive. "CDMX: LA GRAN CIUDAD." 12s 9:16.', ad('alcance', 'CDMX +100km, 21-55', 50, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(11, 5, 'facebook', 'Ya somos 10,000 usuarios', 'Counter celebrando 10K con confeti', '🎉 10,000 USUARIOS! 🚗 5,000+ autos. 🏪 500+ talleres. ⭐ 4.9 estrellas.', 'Únete a los 10,000', 'prueba-social', ['#CarMatch','#10000Usuarios','#Gracias','#Crecimiento'], 'Counter hitting 10,000 with confetti explosion, celebration, CarMatch branding, user icons --ar 1:1 --v 6.1 --style raw', '9,999→10,000. CONFETTI. Stats animate. "GRACIAS." 15s 1:1.', ad('alcance', 'México, 21-65', 50, 'Feed', 3), '7:00 PM'),

    // ═══ SEMANA 12: Expansión ═══
    makeEntry(12, 0, 'tiktok', 'México: el futuro es eléctrico', 'Montaje autos eléctricos en calles mexicanas', '⚡ Tesla en Monterrey. 🔋 BYD en CDMX. 🔌 Leaf en Guadalajara. El futuro es eléctrico.', 'Explora autos eléctricos', 'tendencia', ['#CarMatch','#Electrico','#EV','#Futuro','#Mexico'], 'Montage EVs driving Mexican cities, futuristic, charging stations, clean energy, dramatic --ar 9:16 --v 6.1 --style raw', 'EVs in Mexican cities rapid montage. "EL FUTURO ES ELÉCTRICO. ¿YA ESTÁS LISTO?" 15s 9:16.', ad('alcance', 'México, 25-55, tecnología, medio ambiente', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(12, 1, 'instagram', '2027: el año de CarMatch', 'Visión animada del futuro', '🌟 2027: 100,000 usuarios. 50,000 autos. 5,000 talleres. México completo.', 'Sé parte del futuro', 'vision', ['#CarMatch','#2027','#Vision','#Futuro','#Mexico'], 'Futuristic timeline 2027: 100K users, 50K vehicles, 5K workshops, Mexico map glowing --ar 9:16 --v 6.1 --style raw', 'Timeline animates to 2027: massive growth numbers, Mexico map fills with CarMatch. "EL FUTURO ES AHORA." 15s 9:16.', ad('alcance', 'México, 21-55', 50, 'Reels + Stories', 2), '1:00 PM'),

    makeEntry(12, 2, 'facebook', 'Gracias por confiar', 'Mensaje emocional de agradecimiento', '🙏 A cada usuario, taller, y vendedor: Gracias por creer en CarMatch. Este es solo el comienzo.', 'Comparte con alguien que lo necesite', 'gratitud', ['#CarMatch','#Gracias','#Comunidad','#Mexico'], 'Warm heartfelt message, community photos, CarMatch journey montage, emotional golden lighting --ar 16:9 --v 6.1 --style raw', 'Community montage: users, workshops, families. "GRACIAS POR CONFIAR." Emotional music. 20s 1:1.', ad('alcance', 'México, 21-65', 50, 'Feed', 3), '7:00 PM'),

    makeEntry(12, 3, 'tiktok', 'El auto que cambió tu vida', 'Historia emocional de usuario', '📖 "CarMatch me ayudó a encontrar el auto perfecto para mi familia. Ahora viajamos seguros."', 'Comparte tu historia', 'historia', ['#CarMatch','#Historia','#Vida','#Mexico'], 'Family standing next to their CarMatch-purchased car, road trip background, happy emotional moment --ar 9:16 --v 6.1 --style raw', 'Family with car, road trip, children laughing. Text overlay story. "CARMATCH CAMBIA VIDAS." 18s 9:16.', ad('interaccion', 'México, 25-55, familias', 50, 'Feed + Reels', 2), '12:00 PM'),

    makeEntry(12, 4, 'instagram', 'Nuestro primer año', 'Celebración de primer año', '🎉 365 días de CarMatch. De 0 a 10,000 usuarios. De Cd. Juárez a todo México.', 'Gracias por este año increíble', 'celebracion', ['#CarMatch','#PrimerAño','#Celebracion','#Mexico'], 'Celebration montage: year highlights, milestones, confetti, fireworks over Mexican city --ar 9:16 --v 6.1 --style raw', 'Year highlights rapid montage → milestones → confetti → fireworks. "NUESTRO PRIMER AÑO." 15s 9:16.', ad('alcance', 'México, 21-65', 50, 'Reels + Stories', 2), '7:00 PM'),

    makeEntry(12, 5, 'facebook', 'Lo que viene en 2027', 'Preview de features nuevos', '🔮 2027: Seguro integrado. Financiamiento. Roadside assistance. La app completa para tu auto.', 'Sé el primero en enterarte', 'anticipacion', ['#CarMatch','#2027','#NuevosFeatures','#Futuro'], '2027 roadmap preview: insurance, financing, roadside assistance icons appearing one by one --ar 16:9 --v 6.1 --style raw', '2027 features reveal: insurance → financing → roadside → complete. "LO QUE VIENE." 15s 1:1.', ad('alcance', 'México, 21-55', 50, 'Feed', 3), '7:00 PM'),
]

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CalendarTab() {
    const [activeWeek, setActiveWeek] = useState(1)
    const [expandedDay, setExpandedDay] = useState<string | null>(null)
    const [editingMetrics, setEditingMetrics] = useState<string | null>(null)
    const [showPrompt, setShowPrompt] = useState<{ entry: CalendarEntry; type: 'gemini' | 'kling' } | null>(null)
    const [showAdConfig, setShowAdConfig] = useState<CalendarEntry | null>(null)
    const [filterPlatform, setFilterPlatform] = useState('all')
    const [filterGatillo, setFilterGatillo] = useState('all')
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const weekEntries = useMemo(() => {
        let entries = ALL_ENTRIES.filter(e => e.week === activeWeek)
        if (filterPlatform !== 'all') entries = entries.filter(e => e.platform === filterPlatform)
        if (filterGatillo !== 'all') entries = entries.filter(e => e.gatillo === filterGatillo)
        return entries
    }, [activeWeek, filterPlatform, filterGatillo])

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
                    <span>📅 {overallStats.total} videos</span>
                    <span>💰 ${overallStats.totalBudget.toLocaleString()} MXN total</span>
                    <span>✅ {overallStats.published}/{overallStats.total} publicados</span>
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
                        <p className="text-sm text-white/70">{weekStats.total} videos • {weekStats.platforms.map(p => PLATFORM_CONFIG[p]?.label || p).join(', ')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-white">${weekStats.totalBudget} MXN</p>
                        <p className="text-xs text-white/50">presupuesto anuncios</p>
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
                        <div key={entry.id} className="bg-surface-dark border border-white/10 rounded-xl overflow-hidden">
                            {/* Day Header */}
                            <button
                                onClick={() => setExpandedDay(isExpanded ? null : entry.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-xs text-white/40 font-mono">{entry.date}</span>
                                    <span className="text-sm font-bold text-white/60">{entry.dayName} {entry.dayNum}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${platformConf.bgColor}`}>
                                        {platformConf.label}
                                    </span>
                                    <span className="text-sm font-bold text-white">{entry.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs ${gatilloData.color}`}>{entry.gatilloIcon} {gatilloData.label}</span>
                                    {entry.status === 'published' && <Check className="w-4 h-4 text-green-400" />}
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
                                            onClick={() => setShowPrompt({ entry, type: 'gemini' })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-colors"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" /> Prompt Gemini
                                        </button>
                                        <button
                                            onClick={() => setShowPrompt({ entry, type: 'kling' })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-colors"
                                        >
                                            <Zap className="w-3.5 h-3.5" /> Prompt Kling AI
                                        </button>
                                        <button
                                            onClick={() => setShowAdConfig(entry)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold hover:bg-orange-500/30 transition-colors"
                                        >
                                            <Megaphone className="w-3.5 h-3.5" /> Config Anuncio
                                        </button>
                                        <button
                                            onClick={() => setEditingMetrics(editingMetrics === entry.id ? null : entry.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                                        >
                                            <BarChart3 className="w-3.5 h-3.5" /> Métricas
                                        </button>
                                        <button
                                            onClick={() => copyText(entry.title + '\n' + entry.body + '\n' + entry.cta + '\n' + entry.hashtags.join(' '), entry.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/60 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors"
                                        >
                                            {copiedId === entry.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copiedId === entry.id ? '¡Copiado!' : 'Copiar texto'}
                                        </button>
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
                                                                        value={val}
                                                                        readOnly
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
                                {showPrompt.type === 'gemini' ? '🎨 Prompt Gemini' : '⚡ Prompt Kling AI'}
                            </h3>
                            <button onClick={() => setShowPrompt(null)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white" /></button>
                        </div>
                        <p className="text-sm text-white/60">{showPrompt.entry.title}</p>
                        <div className="bg-black/40 rounded-xl p-4 text-sm text-white/80 font-mono whitespace-pre-wrap">
                            {showPrompt.type === 'gemini' ? showPrompt.entry.aiPromptGemini : showPrompt.entry.aiPromptKling}
                        </div>
                        <button
                            onClick={() => copyText(showPrompt.type === 'gemini' ? showPrompt.entry.aiPromptGemini : showPrompt.entry.aiPromptKling, `prompt-${showPrompt.entry.id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-bold hover:bg-primary-500/30 transition-colors"
                        >
                            {copiedId === `prompt-${showPrompt.entry.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiedId === `prompt-${showPrompt.entry.id}` ? '¡Copiado!' : 'Copiar Prompt'}
                        </button>
                    </div>
                </div>
            )}

            {/* Ad Config Modal */}
            {showAdConfig && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdConfig(null)}>
                    <div className="bg-surface-dark border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-white">⚙️ Configuración de Anuncio</h3>
                            <button onClick={() => setShowAdConfig(null)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white" /></button>
                        </div>
                        <p className="text-sm text-white/60">{showAdConfig.title}</p>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-white/40">Objetivo:</span><span className="text-white font-bold">{showAdConfig.adConfig.objective}</span></div>
                            <div className="flex justify-between"><span className="text-white/40">Audiencia:</span><span className="text-white">{showAdConfig.adConfig.audience}</span></div>
                            <div className="flex justify-between"><span className="text-white/40">Presupuesto:</span><span className="text-white font-bold">${showAdConfig.adConfig.budgetMXN} MXN/día</span></div>
                            <div className="flex justify-between"><span className="text-white/40">Placement:</span><span className="text-white">{showAdConfig.adConfig.placement}</span></div>
                            <div className="flex justify-between"><span className="text-white/40">Duración:</span><span className="text-white">{showAdConfig.adConfig.durationDays} días</span></div>
                            <div className="flex justify-between"><span className="text-white/40">Costo total:</span><span className="text-green-400 font-bold">${showAdConfig.adConfig.budgetMXN * showAdConfig.adConfig.durationDays} MXN</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
