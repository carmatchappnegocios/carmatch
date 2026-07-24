'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

/**
 * 🌍 Global Scouter Action
 * Fetches gas stations from OpenStreetMap (Overpass API) based on a search query.
 */
export async function scoutGlobalStations(query: string) {
    try {
        const session = await auth()
        // @ts-ignore
        if (!session?.user?.id || !session.user.isAdmin) {
            return { success: false, error: 'Unauthorized' }
        }

        // 1. Geocode the query to get a center point (Nominatim)
        console.log(`[SCOUTER] Geocoding location: ${query}...`);
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
            headers: { 'User-Agent': 'CarMatchScouter/1.0' }
        })
        const geoData = await geoRes.json()
        if (!geoData || geoData.length === 0) return { success: false, error: 'Ubicación no encontrada' }

        const { lat, lon } = geoData[0]
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)

        // 2. Query Overpass API for gas stations within 25km radius
        // Node query for amenity=fuel
        const overpassQuery = `[out:json];node["amenity"="fuel"](around:25000,${latitude},${longitude});out;`
        console.log(`[SCOUTER] Fetching Overpass data for ${latitude},${longitude} (25km radius)...`);
        
        const overpassRes = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`)
        if (!overpassRes.ok) throw new Error(`Overpass API Error: ${overpassRes.statusText}`)
        
        const overpassData = await overpassRes.json()
        const elements = overpassData.elements || []
        
        console.log(`[SCOUTER] Found ${elements.length} stations. Starting import...`);

        let imported = 0
        let skipped = 0

        // 3. Process and Save to DB
        for (const el of elements) {
            const name = el.tags?.name || el.tags?.brand || `Gasolinera ${el.id}`
            const stationLat = el.lat
            const stationLng = el.lon

            // Duplicate prevention: check for existing gasolinera within ~100m
            const existing = await prisma.business.findFirst({
                where: {
                    latitude: { gte: stationLat - 0.001, lte: stationLat + 0.001 },
                    longitude: { gte: stationLng - 0.001, lte: stationLng + 0.001 },
                    category: 'gasolinera'
                }
            })

            if (existing) {
                skipped++
                continue
            }

            try {
                await prisma.business.create({
                    data: {
                        userId: session.user.id,
                        name: name,
                        category: 'gasolinera',
                        description: el.tags?.brand ? `Estación de combustible ${el.tags.brand}` : 'Estación de combustible abierta al público.',
                        address: el.tags?.['addr:street'] ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim() : 'Dirección obtenida vía satélite',
                        city: el.tags?.['addr:city'] || query.split(',')[0],
                        state: el.tags?.['addr:state'] || '',
                        country: el.tags?.['addr:country'] || '',
                        latitude: stationLat,
                        longitude: stationLng,
                        isActive: true,
                        isFreePublication: true,
                        images: [],
                        services: ['Gasolina', 'Diesel', 'Aire', 'Tienda'],
                    }
                })
                imported++
            } catch (err) {
                console.error(`[SCOUTER] Failed to import station ${el.id}:`, err)
                skipped++
            }
        }

        return { success: true, imported, skipped, total: elements.length }
    } catch (error: any) {
        console.error('[SCOUTER] Action Error:', error)
        return { success: false, error: error.message }
    }
}
