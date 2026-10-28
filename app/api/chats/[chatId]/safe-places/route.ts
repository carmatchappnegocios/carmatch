
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { safeGenerateContent } from '@/lib/ai/geminiClient'

// Función para calcular punto medio entre dos coordenadas GPS
function getMidpoint(lat1: number, lon1: number, lat2: number, lon2: number) {
    const latMid = (lat1 + lat2) / 2
    const lonMid = (lon1 + lon2) / 2
    return { lat: latMid, lon: lonMid }
}

// Función para calcular distancia en km entre dos puntos GPS (Haversine)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

// GET /api/chats/[chatId]/safe-places - Sugerir lugares seguros para reunirse
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        const { chatId } = await params
        const searchParams = request.nextUrl.searchParams
        const userLatParam = searchParams.get('lat')
        const userLonParam = searchParams.get('lon')

        // Obtener el chat con la información del vehículo
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                vehicle: true
            }
        })

        if (!chat) {
            return NextResponse.json({ error: 'Chat no encontrado' }, { status: 404 })
        }

        if (chat.buyerId !== user.id && chat.sellerId !== user.id) {
            return NextResponse.json({ error: 'No tienes acceso a este chat' }, { status: 403 })
        }

        // Verificar que el vehículo tiene coordenadas GPS
        if (!chat.vehicle.latitude || !chat.vehicle.longitude) {
            return NextResponse.json({
                error: 'El vehículo no tiene ubicación GPS registrada',
                suggestions: []
            }, { status: 200 })
        }

        let centerLat = chat.vehicle.latitude
        let centerLon = chat.vehicle.longitude
        let isMidpoint = false

        // Si el usuario envió sus coordenadas, calculamos el punto medio
        if (userLatParam && userLonParam) {
            const uLat = parseFloat(userLatParam)
            const uLon = parseFloat(userLonParam)
            if (!isNaN(uLat) && !isNaN(uLon)) {
                const midpoint = getMidpoint(centerLat, centerLon, uLat, uLon)
                centerLat = midpoint.lat
                centerLon = midpoint.lon
                isMidpoint = true
            }
        }

        // IA Tip Lógica básica si falla Gemini
        let aiTip = isMidpoint
            ? '💡 Hemos calculado un punto medio justo para ambos. Siempre reúnanse de día.'
            : '💡 Te sugerimos lugares cerca del vehículo. Siempre reúnete en un lugar público.'

        try {
            const prompt = `
                Actúa como el "SUPER ANALISTA DE DATOS" de CarMatch.
                Contexto: Se planea una reunión para ver un ${chat.vehicle.brand} ${chat.vehicle.model}.
                Ubicación central: ${chat.vehicle.city}.
                ¿Es punto medio?: ${isMidpoint ? 'SÍ' : 'NO'}.

                Genera un "TIP DE ANALISTA" (máx 150 caracteres) que sea técnico y de seguridad.
                Ejemplo: "🚨 ANALISTA: El punto medio detectado es ideal. Recomiendo revisar el número de serie con luz natural y verificar que el motor no esté caliente al llegar."

                Responde SOLO con el texto del tip.
            `
            const response = await safeGenerateContent(prompt)
            if (response.text()) {
                aiTip = response.text().trim()
            }
        } catch (err) {
            console.error('Error in Safe Places AI:', err)
        }

        // 🚔 PUNTOS SEGUROS POR DEFECTO: Estacionamientos y centros públicos
        const DEFAULT_SAFE_PLACES: Record<string, { name: string; lat: number; lon: number; icon: string; features: string[] }[]> = {
            'Monterrey': [
                { name: 'Estacionamiento Centro de Monterrey', lat: 25.6866, lon: -100.3161, icon: '🅿️', features: ['Estacionamiento público', 'Cámaras de seguridad', 'Zona céntrica'] },
                { name: 'Macroplaza - Centro Cívico', lat: 25.6714, lon: -100.3088, icon: '🏛️', features: ['Zona pública', 'Seguridad municipal', 'Alta afluencia'] }
            ],
            'Ciudad de México': [
                { name: 'Estacionamiento Palacio de los Deportes', lat: 19.3061, lon: -99.1541, icon: '🅿️', features: ['Estacionamiento público', 'Cámaras', 'Zona segura'] },
                { name: 'Centro Histórico - Zócalo', lat: 19.4326, lon: -99.1332, icon: '🏛️', features: ['Zona turística', 'Seguridad pública', 'Alta vigilancia'] }
            ],
            'Guadalajara': [
                { name: 'Estacionamiento Periférico Centro', lat: 20.6597, lon: -103.3496, icon: '🅿️', features: ['Estacionamiento público', 'Cámaras', 'Centro de la ciudad'] },
                { name: 'Plaza de Armas - Centro', lat: 20.6597, lon: -103.3496, icon: '🏛️', features: ['Zona cívica', 'Seguridad municipal'] }
            ],
            'Tijuana': [
                { name: 'Estacionamiento Centro Comercial', lat: 32.5149, lon: -117.0382, icon: '🅿️', features: ['Estacionamiento público', 'Zona comercial'] },
                { name: 'Plaza Río Tijuana', lat: 32.5324, lon: -117.0184, icon: '🏛️', features: ['Centro comercial', 'Seguridad privada'] }
            ],
            'Querétaro': [
                { name: 'Estacionamiento Centro Histórico', lat: 20.5888, lon: -100.3899, icon: '🅿️', features: ['Estacionamiento público', 'Zona histórica'] },
                { name: 'Plaza de Armas Querétaro', lat: 20.5888, lon: -100.3899, icon: '🏛️', features: ['Zona cívica', 'Seguridad pública'] }
            ],
            'Mérida': [
                { name: 'Estacionamiento Centro Mérida', lat: 20.9674, lon: -89.5926, icon: '🅿️', features: ['Estacionamiento público', 'Centro histórico'] },
                { name: 'Plaza Grande Mérida', lat: 20.9674, lon: -89.5926, icon: '🏛️', features: ['Zona cívica', 'Seguridad turística'] }
            ],
            'León': [
                { name: 'Estacionamiento Centro León', lat: 21.1221, lon: -101.6821, icon: '🅿️', features: ['Estacionamiento público', 'Centro de la ciudad'] },
                { name: 'Plaza de los Fundadores', lat: 21.1221, lon: -101.6821, icon: '🏛️', features: ['Zona cívica', 'Alta afluencia'] }
            ],
            'Puebla': [
                { name: 'Estacionamiento Centro Histórico Puebla', lat: 19.0414, lon: -98.2063, icon: '🅿️', features: ['Estacionamiento público', 'Zona histórica'] },
                { name: 'Zócalo de Puebla', lat: 19.0414, lon: -98.2063, icon: '🏛️', features: ['Zona cívica', 'Seguridad pública'] }
            ],
            'Miami': [
                { name: 'Bayside Marketplace Parking', lat: 25.7819, lon: -80.1870, icon: '🅿️', features: ['Public parking', 'CCTV cameras', 'Busy area'] },
                { name: 'Bayfront Park', lat: 25.7753, lon: -80.1866, icon: '🏛️', features: ['Public park', 'Police presence'] }
            ],
            'Los Angeles': [
                { name: 'Downtown LA Public Parking', lat: 34.0407, lon: -118.2468, icon: '🅿️', features: ['Public parking garage', 'CCTV', 'Central location'] },
                { name: 'Grand Park LA', lat: 34.0567, lon: -118.2470, icon: '🏛️', features: ['Public park', 'Safe zone'] }
            ],
            'Houston': [
                { name: 'Downtown Houston Parking', lat: 29.7604, lon: -95.3698, icon: '🅿️', features: ['Public parking', 'Central area'] },
                { name: 'Discovery Green Park', lat: 29.7585, lon: -95.3563, icon: '🏛️', features: ['Public park', 'Well-lit area'] }
            ],
            'Dallas': [
                { name: 'Downtown Dallas Parking', lat: 32.7767, lon: -96.7970, icon: '🅿️', features: ['Public parking', 'Downtown area'] },
                { name: 'Klyde Warren Park', lat: 32.7881, lon: -96.8056, icon: '🏛️', features: ['Public park', 'Central location'] }
            ],
            'Chicago': [
                { name: 'Millennium Park Garage', lat: 41.8827, lon: -87.6233, icon: '🅿️', features: ['Public parking', 'Highly monitored'] },
                { name: 'Millennium Park', lat: 41.8826, lon: -87.6233, icon: '🏛️', features: ['Public park', 'Police presence'] }
            ],
            'New York': [
                { name: 'Times Square Public Parking', lat: 40.7580, lon: -73.9855, icon: '🅿️', features: ['Public parking', 'High surveillance'] },
                { name: 'Bryant Park', lat: 40.7536, lon: -73.9832, icon: '🏛️', features: ['Public park', 'Busy area'] }
            ],
            'Bogotá': [
                { name: 'Estacionamiento Centro Bogotá', lat: 4.7110, lon: -74.0721, icon: '🅿️', features: ['Estacionamiento público', 'Centro de la ciudad'] },
                { name: 'Plaza de Bolívar', lat: 4.7110, lon: -74.0721, icon: '🏛️', features: ['Zona cívica', 'Seguridad pública'] }
            ],
            'Medellín': [
                { name: 'Estacionamiento Centro Medellín', lat: 6.2476, lon: -75.5658, icon: '🅿️', features: ['Estacionamiento público', 'Centro'] },
                { name: 'Plaza Botero', lat: 6.2476, lon: -75.5658, icon: '🏛️', features: ['Zona turística', 'Seguridad'] }
            ],
            'Buenos Aires': [
                { name: 'Estacionamiento Centro Buenos Aires', lat: -34.6037, lon: -58.3816, icon: '🅿️', features: ['Estacionamiento público', 'Centro'] },
                { name: 'Plaza de Mayo', lat: -34.6037, lon: -58.3816, icon: '🏛️', features: ['Zona cívica', 'Seguridad'] }
            ],
            'Madrid': [
                { name: 'Parking Centro Madrid', lat: 40.4168, lon: -3.7038, icon: '🅿️', features: ['Public parking', 'Central area'] },
                { name: 'Puerta del Sol', lat: 40.4168, lon: -3.7038, icon: '🏛️', features: ['Public square', 'High surveillance'] }
            ],
            'Barcelona': [
                { name: 'Parking Centro Barcelona', lat: 41.3851, lon: 2.1734, icon: '🅿️', features: ['Public parking', 'Central location'] },
                { name: 'Plaça de Catalunya', lat: 41.3874, lon: 2.1686, icon: '🏛️', features: ['Public square', 'Well-monitored'] }
            ],
            'Santiago': [
                { name: 'Estacionamiento Centro Santiago', lat: -33.4489, lon: -70.6693, icon: '🅿️', features: ['Estacionamiento público', 'Centro'] },
                { name: 'Plaza de Armas Santiago', lat: -33.4489, lon: -70.6693, icon: '🏛️', features: ['Zona cívica', 'Seguridad'] }
            ],
            'Lima': [
                { name: 'Estacionamiento Centro Lima', lat: -12.0464, lon: -77.0428, icon: '🅿️', features: ['Estacionamiento público', 'Centro'] },
                { name: 'Plaza Mayor Lima', lat: -12.0464, lon: -77.0428, icon: '🏛️', features: ['Zona histórica', 'Seguridad'] }
            ]
        }

        const cityDefaults = DEFAULT_SAFE_PLACES[chat.vehicle.city] || []
        const defaultSuggestions = cityDefaults.map((p, idx) => ({
            id: `default-${idx}`,
            name: p.name,
            type: 'default',
            description: 'Punto seguro público recomendado por CarMatch',
            address: p.name,
            distance: Number(getDistance(centerLat, centerLon, p.lat, p.lon).toFixed(1)),
            latitude: p.lat,
            longitude: p.lon,
            icon: p.icon,
            isOfficialBusiness: false,
            safetyFeatures: p.features
        }))

        // 🛍️ CARGAR NEGOCIOS REGISTRADOS QUE SON PUNTOS SEGUROS
        const nearbySafeBusinesses = await prisma.business.findMany({
            where: {
                isSafeMeetingPoint: true,
                isActive: true,
                city: chat.vehicle.city
            },
            take: 10
        })

        const businessSugerences = nearbySafeBusinesses.map(b => ({
            id: `business-${b.id}`,
            name: b.name,
            type: 'business',
            description: b.description || 'Negocio verificado en CarMatch.',
            address: b.address,
            distance: Number(getDistance(centerLat, centerLon, b.latitude, b.longitude).toFixed(1)),
            latitude: b.latitude,
            longitude: b.longitude,
            icon: '🏪',
            isOfficialBusiness: true,
            safetyFeatures: ['Negocio verificado', 'Cámaras del local', 'Personal presente']
        }))

        // Combinar y ordenar por distancia (defaults primero, luego negocios)
        const allSuggestions = [...defaultSuggestions, ...businessSugerences].sort((a, b) => Number(a.distance) - Number(b.distance))

        return NextResponse.json({
            suggestions: allSuggestions,
            vehicleLocation: {
                city: chat.vehicle.city,
                latitude: chat.vehicle.latitude,
                longitude: chat.vehicle.longitude
            },
            centerLocation: {
                latitude: centerLat,
                longitude: centerLon,
                isMidpoint
            },
            tip: aiTip
        })

    } catch (error) {
        console.error('Error al obtener lugares seguros:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
