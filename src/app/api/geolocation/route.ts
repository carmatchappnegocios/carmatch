// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { parseAddressWithAI } from '@/lib/ai/addressParser'
import { checkRateLimit } from '@/lib/rate-limit'

/**
 * API endpoint para geocodificación reversa
 * Convierte coordenadas GPS a nombre de ciudad usando MapBox Geocoding API
 * 
 * GET /api/geolocation?lat=25.6866&lng=-100.3161
 * 
 * Respuesta:
 * {
 *   "city": "Monterrey",
 *   "state": "Nuevo León",
 *   "country": "México"
 * }
 */
export async function GET(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const rl = checkRateLimit(`geolocation:${ip}`, { max: 60, windowMs: 60_000 })
        if (!rl.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
        }

        const searchParams = request.nextUrl.searchParams
        const lat = searchParams.get('lat')
        const lng = searchParams.get('lng')
        const query = searchParams.get('q')
        const detect = searchParams.get('detect') === 'true'

        // MODO 0: AUTODETECCIÓN POR IP (SILENCIOSO)
        if (detect) {
            // Vercel Geolocation Headers
            const city = request.headers.get('x-vercel-ip-city')
            const region = request.headers.get('x-vercel-ip-country-region')
            const country = request.headers.get('x-vercel-ip-country')
            const lat = request.headers.get('x-vercel-ip-latitude')
            const lng = request.headers.get('x-vercel-ip-longitude')

            if (city && lat && lng) {
                return NextResponse.json({
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng),
                    city: city,
                    state: region || '',
                    country: country || '',
                    countryCode: country?.toUpperCase() || ''
                })
            }

            // Fallback: Si no hay headers de Vercel, podríamos usar una API externa desde el servidor
            // o simplemente devolver 404 para que el cliente intente otra vía.
            // Para robustez, intentaremos ipapi.co desde el servidor si falla Vercel
            try {
                const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]
                if (ip) {
                    const ipRes = await fetch(`https://ipapi.co/${ip}/json/`)
                    if (ipRes.ok) {
                        const data = await ipRes.json()
                        if (data.latitude && data.longitude) {
                            return NextResponse.json({
                                latitude: data.latitude,
                                longitude: data.longitude,
                                city: data.city,
                                state: data.region || '',
                                country: data.country_name || '',
                                countryCode: data.country_code || ''
                            })
                        }
                    }
                }
            } catch (e) {
                console.error("Server-side IP fetch failed:", e)
            }
            
            return NextResponse.json({ error: 'No se pudo detectar la ubicación por IP' }, { status: 404 })
        }

        // MODO 1: BÚSQUEDA POR TEXTO (Forward Geocoding)
        // MODO 1: BÚSQUEDA POR TEXTO (Forward Geocoding)
        if (query) {
            const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

            // Bias de ubicación
            const biasLat = searchParams.get('biasLat') ? parseFloat(searchParams.get('biasLat')!) : undefined
            const biasLng = searchParams.get('biasLng') ? parseFloat(searchParams.get('biasLng')!) : undefined

            // INTELIGENCIA ARTIFICIAL GEMINI 🧠
            // Refinamos la búsqueda con AI para inferir ciudad/estado si faltan
            let finalQuery = query;

            // Solo usamos AI si el query parece incompleto (corto) o si el usuario lo pide implícitamente
            // Para asegurar máxima precisión como pidió el usuario, lo usamos siempre en este endpoint de "búsqueda exacta".
            try {
                const aiParsed = await parseAddressWithAI(query, biasLat, biasLng);
                if (aiParsed && aiParsed.full_search_query) {
                    console.log(`🤖 AI Refined Address: "${query}" -> "${aiParsed.full_search_query}"`);
                    finalQuery = aiParsed.full_search_query;
                }
            } catch (e) {
                console.warn("AI Parse skipped due to error, using raw query");
            }

            const limit = parseInt(searchParams.get('limit') || '1')

            // 🚀 PRIORIDAD 1: MAPBOX (Mayor Precisión)
            if (mapboxToken) {
                try {
                    const searchWithMapbox = async (q: string) => {
                        // 🔒 STRICT MODE: Priorizamos Ciudades (place), Localidades (locality) y Distritos (district - como Alcaldías)
                        // 'postcode' se añade para búsquedas directas de CP.
                        // 'neighborhood' se OMITE explícitamente para evitar colonias.
                        let mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapboxToken}&language=es&limit=${limit}&types=country,region,district,place,locality,postcode`

                        if (biasLat && biasLng) mapboxUrl += `&proximity=${biasLng},${biasLat}`
                        const mbRes = await fetch(mapboxUrl)
                        if (!mbRes.ok) return null
                        const mbData = await mbRes.json()
                        return (mbData.features && mbData.features.length > 0) ? mbData.features : null
                    }

                    // Intentar con AI
                    let features = await searchWithMapbox(finalQuery)

                    // FALLBACK: Si falló AI, intentar con RAW previo
                    if (!features && finalQuery !== query) {
                        console.log(`🔄 Mapbox Fallback: AI failed, trying raw query "${query}"`);
                        features = await searchWithMapbox(query)
                    }

                    if (features) {
                        if (limit > 1) {
                            return NextResponse.json(features.map((f: any) => {
                                const context = f.context || []
                                const city = f.place_type.includes('place') ? f.text :
                                    (context.find((c: any) => c.id.startsWith('place'))?.text ||
                                        context.find((c: any) => c.id.startsWith('locality'))?.text ||
                                        context.find((c: any) => c.id.startsWith('district'))?.text || f.text)

                                const state = context.find((c: any) => c.id.startsWith('region'))?.text || ''
                                const country = context.find((c: any) => c.id.startsWith('country'))?.text || ''
                                const countryCode = context.find((c: any) => c.id.startsWith('country'))?.short_code?.toUpperCase() || ''

                                return {
                                    latitude: f.center[1], // Mapbox is [lng, lat]
                                    longitude: f.center[0],
                                    address: f.place_name,
                                    city,
                                    state,
                                    country,
                                    countryCode
                                }
                            }))
                        }

                        const f = features[0]
                        const context = f.context || []
                        const city = f.place_type.includes('place') ? f.text :
                            (context.find((c: any) => c.id.startsWith('place'))?.text ||
                                context.find((c: any) => c.id.startsWith('locality'))?.text ||
                                context.find((c: any) => c.id.startsWith('district'))?.text || f.text)

                        const state = context.find((c: any) => c.id.startsWith('region'))?.text || ''
                        const country = context.find((c: any) => c.id.startsWith('country'))?.text || ''
                        const countryCode = context.find((c: any) => c.id.startsWith('country'))?.short_code?.toUpperCase() || ''

                        return NextResponse.json({
                            latitude: f.center[1],
                            longitude: f.center[0],
                            city,
                            state,
                            country,
                            countryCode
                        })
                    }
                } catch (e) {
                    console.error("Mapbox search error, falling back to Nominatim", e)
                }
            }

            // 🐢 PRIORIDAD 2: NOMINATIM (Fallback Gratuito)
            try {
                const searchWithNominatim = async (q: string) => {
                    let nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=${limit}&addressdetails=1`
                    const nomRes = await fetch(nominatimUrl, { headers: { 'User-Agent': 'CarMatchApp/1.0' } })
                    if (!nomRes.ok) return null
                    const nomData = await nomRes.json()
                    return (nomData && nomData.length > 0) ? nomData : null
                }

                // Intentar con AI
                let nomData = await searchWithNominatim(finalQuery)

                // FALLBACK: Si falló AI, intentar con RAW previo
                if (!nomData && finalQuery !== query) {
                    console.log(`🔄 Nominatim Fallback: AI failed, trying raw query "${query}"`);
                    nomData = await searchWithNominatim(query)
                }

                if (limit > 1) {
                    return NextResponse.json(nomData
                        .filter((f: any) => {
                            // 🛡️ ACTUALIZADO: Filtro Estricto para Nomad
                            // Eliminamos barrios, villas pequeñas si se confunden, y resultados que no sean place/boundary
                            const type = f.addresstype || f.type
                            const allowed = ['city', 'town', 'municipality', 'administrative', 'state', 'country', 'village', 'county', 'district', 'borough']
                            return allowed.includes(type)
                        })
                        .map((f: any) => ({
                            latitude: parseFloat(f.lat),
                            longitude: parseFloat(f.lon),
                            address: f.display_name,
                            city: f.address?.city || f.address?.town || f.address?.municipality || '',
                            state: f.address?.state || '',
                            country: f.address?.country || '',
                            countryCode: f.address?.country_code?.toUpperCase() || ''
                        }))
                        .filter((f: any) => f.city) // Asegurar que tenga ciudad
                    )
                }

                const f = nomData[0]
                return NextResponse.json({
                    latitude: parseFloat(f.lat),
                    longitude: parseFloat(f.lon),
                    city: f.address?.city || f.address?.town || f.address?.village || f.address?.municipality || 'Ubicación encontrada',
                    state: f.address?.state || '',
                    country: f.address?.country || '',
                    countryCode: f.address?.country_code?.toUpperCase() || ''
                })
            } catch (e) {
                console.error("Nominatim search error:", e)
            }

            return NextResponse.json({ error: 'Ubicación no encontrada' }, { status: 404 })
        }

        // MODO 2: COORDENADAS (Reverse Geocoding) - Lógica existente
        // Validar parámetros
        if (!lat || !lng) {
            return NextResponse.json(
                { error: 'Faltan parámetros lat y lng o q' },
                { status: 400 }
            )
        }

        const latitude = parseFloat(lat)
        const longitude = parseFloat(lng)

        // Validar rangos
        if (
            isNaN(latitude) ||
            isNaN(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return NextResponse.json(
                { error: 'Coordenadas inválidas' },
                { status: 400 }
            )
        }

        // Verificar que existe la API key de MapBox
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

        // Si tenemos Token de MapBox, usamos MapBox (Mejor precisión)
        if (mapboxToken) {
            // Modificado: Pedimos tipos 'address' y 'poi' para tener calle y número
            const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&types=address,poi,place,region,country&language=es`

            const response = await fetch(mapboxUrl, {
                next: { revalidate: 3600 }
            })

            if (response.ok) {
                const data = await response.json()

                let street = ''
                let streetNumber = ''
                let colony = ''
                let city = ''
                let state = ''
                let country = ''
                let countryCode = ''

                if (data.features && data.features.length > 0) {
                    // Tomamos el feature más relevante (usualmente el primero es address o poi)
                    const feature = data.features[0]

                    if (feature.place_type.includes('address') || feature.place_type.includes('poi')) {
                        street = feature.text || ''
                        streetNumber = feature.address || '' // Mapbox pone el número en 'address' si el 'text' es la calle
                    }

                    // Parsear el contexto para los demás campos
                    const context = feature.context || []

                    // Mapbox context order varies, so we search by ID prefix
                    const neighborhood = context.find((c: any) => c.id.startsWith('neighborhood'))
                    const locality = context.find((c: any) => c.id.startsWith('locality'))
                    const place = context.find((c: any) => c.id.startsWith('place'))
                    const district = context.find((c: any) => c.id.startsWith('district'))
                    const region = context.find((c: any) => c.id.startsWith('region'))
                    const countryCtx = context.find((c: any) => c.id.startsWith('country'))

                    colony = neighborhood?.text || ''
                    // Prioridad ciudad: locality > place > district
                    city = locality?.text || place?.text || district?.text || ''
                    state = region?.text || ''
                    country = countryCtx?.text || ''
                    countryCode = countryCtx?.short_code?.toUpperCase() || ''

                    // Fallback si no hay calle en el feature principal pero el feature es "place" (ciudad)
                    if (!street && feature.text && (feature.place_type.includes('street') || feature.place_type.includes('poi'))) {
                        street = feature.text
                    }
                }

                return NextResponse.json({
                    street,
                    streetNumber,
                    colony,
                    city: city || 'Ubicación seleccionada',
                    state,
                    country,
                    countryCode
                })
            }
        }

        // FALLBACK: OpenStreetMap (Nominatim) - Gratuito y sin API Key
        // Nota: Requiere User-Agent válido
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`

        const response = await fetch(nominatimUrl, {
            headers: {
                'User-Agent': 'CarMatchApp/1.0 (contact@carmatch.app)'
            },
            next: { revalidate: 3600 } // Cache respetuoso
        })

        if (!response.ok) {
            throw new Error(`Nominatim Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        const address = data.address || {}

        return NextResponse.json({
            street: address.road || address.street || address.pedestrian || '',
            streetNumber: address.house_number || '',
            colony: address.suburb || address.neighbourhood || address.residential || '',
            city: address.city || address.town || address.village || address.municipality || 'Ubicación detectada',
            state: address.state || address.region || '',
            country: address.country || '',
            countryCode: address.country_code?.toUpperCase() || ''
        })

    } catch (error) {
        console.error('Error en geocodificación:', error)
        // Fallback final silencioso para no romper la UI
        return NextResponse.json({
            city: 'Ubicación actual',
            state: '',
            country: ''
        })
    }
}
