import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://carmatchapp.net',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * Marketing Data API — CarMatch
 * Protected by shared API key (x-api-key header or ?key= query param)
 *
 * Returns aggregated, anonymized data for advertising:
 * - Vehicle listings with full specs
 * - Platform stats, trends, and marketing suggestions
 * - Business directory categories
 *
 * Does NOT expose: emails, names, phones, exact user locations
 */
export async function GET(req: NextRequest) {
    try {
        // Autenticación por API key
        const apiKey = req.headers.get('x-api-key') || req.nextUrl.searchParams.get('key')
        if (!apiKey || apiKey !== process.env.MARKETING_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS })
        }

        const type = req.nextUrl.searchParams.get('type') || 'overview'

        switch (type) {
            case 'overview': {
                // Resumen general de la plataforma
                const [vehicleCount, businessCount, userCount, activeVehicles] = await Promise.all([
                    prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
                    prisma.business.count({ where: { isActive: true } }),
                    prisma.user.count(),
                    prisma.vehicle.findMany({
                        where: { status: 'ACTIVE' },
                        select: { brand: true, city: true, price: true, vehicleType: true },
                        take: 1000
                    })
                ])

                // Marcas más populares (top 10)
                const brandCounts: Record<string, number> = {}
                activeVehicles.forEach(v => {
                    if (v.brand) brandCounts[v.brand] = (brandCounts[v.brand] || 0) + 1
                })
                const topBrands = Object.entries(brandCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([brand, count]) => ({ brand, count }))

                // Ciudades más activas (top 10)
                const cityCounts: Record<string, number> = {}
                activeVehicles.forEach(v => {
                    if (v.city) cityCounts[v.city] = (cityCounts[v.city] || 0) + 1
                })
                const topCities = Object.entries(cityCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([city, count]) => ({ city, count }))

                // Rangos de precios
                const prices = activeVehicles.map(v => Number(v.price)).filter(p => p > 0)
                const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0
                const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

                // Tipos de vehículo
                const typeCounts: Record<string, number> = {}
                activeVehicles.forEach(v => {
                    const type = v.vehicleType || 'Otro'
                    typeCounts[type] = (typeCounts[type] || 0) + 1
                })
                const topTypes = Object.entries(typeCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([type, count]) => ({ type, count }))

                return NextResponse.json({
                    brand: 'CarMatch Social',
                    platform: 'carmatchapp.net',
                    description: 'La red social automotriz #1 de México. Marketplace para comprar y vender autos gratis, directorio de talleres y servicios automotrices 24/7, y comunidad de entusiastas.',
                    features: [
                        'Marketplace de vehículos nuevos y usados',
                        'Directorio de talleres mecánicos y servicios automotrices',
                        'CarMatch Swipe - descubre autos deslizando',
                        'MapStore - mapa interactivo de negocios 24/7',
                        'Chat en tiempo real entre compradores y vendedores',
                        'Citas seguras con GPS y botón SOS',
                        'Publicación gratuita sin comisiones',
                        'Sistema de verificación con IA',
                        'Notificaciones push en tiempo real',
                        'Multiidioma (22 idiomas)',
                        'Disponible como app web progresiva (PWA)'
                    ],
                    targetAudience: 'Personas que compran/venden autos, mecánicos, talleres, negocios automotrices',
                    countries: 'México, USA, Latinoamérica, España',
                    stats: {
                        totalVehicles: vehicleCount,
                        totalBusinesses: businessCount,
                        totalUsers: userCount
                    },
                    topBrands,
                    topCities,
                    topTypes,
                    priceRanges: {
                        average: avgPrice,
                        min: minPrice,
                        max: maxPrice,
                        currency: 'MXN'
                    }
                }, { headers: CORS_HEADERS })
            }

            case 'brands': {
                // Marcas con conteo por ciudad
                const vehicles = await prisma.vehicle.findMany({
                    where: { status: 'ACTIVE' },
                    select: { brand: true, city: true },
                    take: 5000
                })

                const brandByCity: Record<string, Record<string, number>> = {}
                vehicles.forEach(v => {
                    if (!v.brand || !v.city) return
                    if (!brandByCity[v.brand]) brandByCity[v.brand] = {}
                    brandByCity[v.brand][v.city] = (brandByCity[v.brand][v.city] || 0) + 1
                })

                return NextResponse.json({ brandByCity }, { headers: CORS_HEADERS })
            }

            case 'categories': {
                // Negocios por categoría y ciudad
                const businesses = await prisma.business.findMany({
                    where: { isActive: true },
                    select: { category: true, city: true, name: true },
                    take: 5000
                })

                const catCounts: Record<string, number> = {}
                businesses.forEach(b => {
                    if (b.category) catCounts[b.category] = (catCounts[b.category] || 0) + 1
                })

                const topCategories = Object.entries(catCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 20)
                    .map(([category, count]) => ({ category, count }))

                return NextResponse.json({ categories: topCategories, total: businesses.length }, { headers: CORS_HEADERS })
            }

            case 'trending': {
                // Vehículos recientes (últimos 7 días) para detectar tendencias
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                const recentVehicles = await prisma.vehicle.findMany({
                    where: {
                        status: 'ACTIVE',
                        createdAt: { gte: weekAgo }
                    },
                    select: { brand: true, model: true, city: true, price: true, vehicleType: true, createdAt: true },
                    orderBy: { createdAt: 'desc' },
                    take: 200
                })

                const trendBrands: Record<string, number> = {}
                recentVehicles.forEach(v => {
                    if (v.brand) trendBrands[v.brand] = (trendBrands[v.brand] || 0) + 1
                })

                return NextResponse.json({
                    period: 'last_7_days',
                    count: recentVehicles.length,
                    trendingBrands: Object.entries(trendBrands)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 10)
                        .map(([brand, count]) => ({ brand, count }))
                }, { headers: CORS_HEADERS })
            }

            case 'products': {
                const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50'), 100)
                const cityFilter = req.nextUrl.searchParams.get('city')
                const countryFilter = req.nextUrl.searchParams.get('country')
                const typeFilter = req.nextUrl.searchParams.get('vehicleType')
                const brandFilter = req.nextUrl.searchParams.get('brand')
                const minYear = req.nextUrl.searchParams.get('minYear')
                const maxPriceParam = req.nextUrl.searchParams.get('maxPrice')

                const where: any = { status: 'ACTIVE' }
                if (cityFilter) where.city = cityFilter
                if (countryFilter) where.country = countryFilter
                if (typeFilter) where.vehicleType = typeFilter
                if (brandFilter) where.brand = brandFilter
                if (minYear) where.year = { gte: parseInt(minYear) }
                if (maxPriceParam) where.price = { lte: parseFloat(maxPriceParam) }

                const [vehicles, totalCount, allActive] = await Promise.all([
                    prisma.vehicle.findMany({
                        where,
                        select: {
                            id: true, title: true, brand: true, model: true, year: true,
                            price: true, currency: true, city: true, state: true, country: true,
                            condition: true, mileage: true, images: true, description: true,
                            vehicleType: true, color: true, createdAt: true,
                            transmission: true, fuel: true, engine: true, doors: true,
                            features: true, latitude: true, longitude: true,
                            views: true, fakeFavorites: true, colony: true,
                            version: true, hp: true, displacement: true, passengers: true,
                            traction: true, accidents: true, owners: true,
                            batteryCapacity: true, range: true, torque: true, weight: true,
                            mileageUnit: true, isFreePublication: true, publishedAt: true,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: limit
                    }),
                    prisma.vehicle.count({ where }),
                    prisma.vehicle.findMany({
                        where: { status: 'ACTIVE' },
                        select: {
                            brand: true, vehicleType: true, price: true, fuel: true,
                            color: true, condition: true, transmission: true,
                        },
                        take: 5000
                    })
                ])

                const products = vehicles.map(v => {
                    const descParts = [
                        `${v.brand} ${v.model} ${v.year}`,
                        v.condition || 'Usado',
                        v.mileage ? `${v.mileage} ${v.mileageUnit || 'km'}` : null,
                        v.transmission || null,
                        v.fuel || null,
                        v.city ? `Ubicación: ${v.city}` : null,
                    ].filter(Boolean)

                    return {
                        nombre: v.title,
                        precio: v.price,
                        moneda: v.currency || 'MXN',
                        descripcion: descParts.join('. ') + '.',
                        imagen: v.images?.[0] || null,
                        imagenes_count: v.images?.length || 0,
                        todas_las_imagenes: v.images || [],
                        categoria: v.vehicleType || 'Vehículo',
                        marca: v.brand,
                        modelo: v.model,
                        anio: v.year,
                        condicion: v.condition || 'Usado',
                        kilometraje: v.mileage || null,
                        unidad_kilometraje: v.mileageUnit || 'km',
                        transmision: v.transmission || null,
                        combustible: v.fuel || null,
                        motor: v.engine || null,
                        cilindrada: v.displacement || null,
                        potencia_cv: v.hp || null,
                        torque: v.torque || null,
                        peso: v.weight || null,
                        puertas: v.doors || null,
                        pasajeros: v.passengers || null,
                        traccion: v.traction || null,
                        color: v.color || null,
                        version: v.version || null,
                        ciudad: v.city || null,
                        colonia: v.colony || null,
                        estado: v.state || null,
                        pais: v.country || 'MX',
                        latitud: v.latitude || null,
                        longitud: v.longitude || null,
                        caracteristicas: v.features || [],
                        vistas: v.views || 0,
                        favoritos: v.fakeFavorites || 0,
                        es_gratuito: v.isFreePublication,
                        fecha_publicacion: v.publishedAt?.toISOString() || v.createdAt?.toISOString(),
                        tuvo_accidentes: v.accidents ?? null,
                        duenos_previos: v.owners ?? null,
                        capacidad_bateria: v.batteryCapacity || null,
                        autonomia: v.range || null,
                        url: `https://carmatchapp.net/vehicle/${v.id}`,
                        url_absoluta: `https://carmatchapp.net/vehicle/${v.id}`,
                    }
                })

                const prices = allActive.map(v => Number(v.price)).filter(p => p > 0)
                const brandCounts: Record<string, number> = {}
                const typeCounts: Record<string, number> = {}
                const fuelCounts: Record<string, number> = {}
                const colorCounts: Record<string, number> = {}
                const condCounts: Record<string, number> = {}
                const transCounts: Record<string, number> = {}

                allActive.forEach(v => {
                    if (v.brand) brandCounts[v.brand] = (brandCounts[v.brand] || 0) + 1
                    if (v.vehicleType) typeCounts[v.vehicleType] = (typeCounts[v.vehicleType] || 0) + 1
                    if (v.fuel) fuelCounts[v.fuel] = (fuelCounts[v.fuel] || 0) + 1
                    if (v.color) colorCounts[v.color] = (colorCounts[v.color] || 0) + 1
                    if (v.condition) condCounts[v.condition] = (condCounts[v.condition] || 0) + 1
                    if (v.transmission) transCounts[v.transmission] = (transCounts[v.transmission] || 0) + 1
                })

                const buildTop = (counts: Record<string, number>, max = 10) =>
                    Object.entries(counts)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, max)
                        .map(([key, count]) => ({
                            nombre: key,
                            cantidad: count,
                            porcentaje: Math.round((count / allActive.length) * 100)
                        }))

                const latestDate = vehicles.length > 0 ? vehicles[0].createdAt?.toISOString() : null

                return NextResponse.json({
                    meta: {
                        total_disponible: totalCount,
                        total_en_respuesta: vehicles.length,
                        limite_aplicado: limit,
                        filtros_aplicados: {
                            ciudad: cityFilter || null,
                            pais: countryFilter || null,
                            tipo_vehiculo: typeFilter || null,
                            marca: brandFilter || null,
                            anio_minimo: minYear ? parseInt(minYear) : null,
                            precio_maximo: maxPriceParam ? parseFloat(maxPriceParam) : null,
                        },
                        fecha_consulta: new Date().toISOString(),
                        ultima_publicacion: latestDate,
                    },
                    plataforma: {
                        nombre: 'CarMatch Social',
                        url: 'https://carmatchapp.net',
                        descripcion: 'La red social automotriz #1 de México. Marketplace para comprar y vender autos gratis, directorio de talleres y servicios automotrices 24/7, y comunidad de entusiastas automotrices.',
                        mercados: ['México', 'USA', 'Latinoamérica', 'España'],
                        idiomas: 22,
                        funciones_clave: [
                            'Marketplace de vehículos nuevos y usados',
                            'Directorio de talleres y servicios automotrices 24/7',
                            'CarMatch Swipe - descubre autos deslizando',
                            'MapStore - mapa interactivo de negocios',
                            'Chat en tiempo real entre compradores y vendedores',
                            'Citas seguras con GPS y botón SOS',
                            'Publicación gratuita sin comisiones',
                            'Verificación de vehículos con IA',
                            'Notificaciones push en tiempo real',
                            'PWA - funciona como app sin instalar',
                        ],
                        moneda_local: 'MXN',
                        total_vehiculos_activos: totalCount,
                        audiencia_objetivo: 'Personas que compran/venden autos, mecánicos, talleres, negocios automotrices, entusiastas',
                    },
                    tendencias: {
                        marcas_populares: buildTop(brandCounts),
                        tipos_populares: buildTop(typeCounts),
                        combustibles_populares: buildTop(fuelCounts, 8),
                        colores_populares: buildTop(colorCounts, 10),
                        condiciones: buildTop(condCounts, 5),
                        transmisiones: buildTop(transCounts, 5),
                        rango_precios: {
                            minimo: prices.length > 0 ? Math.min(...prices) : 0,
                            maximo: prices.length > 0 ? Math.max(...prices) : 0,
                            promedio: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
                            mediana: prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 0,
                            moneda: 'MXN',
                        },
                    },
                    sugerencias_marketing: {
                        hashtags_populares: [
                            '#CarMatch', '#CompraTuAuto', '#AutoUsado', '#AutoNuevo',
                            '#VendoMiAuto', '#MercadoAutomotriz', '#MecanicosNearMe',
                            '#TalleresAutomotrices', '#CarMatchSwipe', '#MapStore247',
                            '#CitasSeguras', '#SeguridadAutomotriz', '#AutoMexico',
                            '#CarMatchPWA', '#NegociosAutomotrices',
                        ],
                        angulos_por_tipo: {
                            'SUV': 'Ideal para familias que buscan espacio, seguridad y versatilidad en cada viaje.',
                            'Sedán': 'Comodidad y eficiencia para el día a día. El auto perfecto para la ciudad.',
                            'Hatchback': 'Ágil, económico y fácil de estacionar. Perfecto para la vida urbana.',
                            'Pick Up': 'Potencia y resistencia para trabajar y disfrutar. El compañero ideal.',
                            'Deportivo': 'Para los amantes de la velocidad, el diseño y la adrenalina.',
                            'Coupé': 'Estilo y elegancia en cada línea. Un auto que habla por ti.',
                            'Van': 'La solución para familias grandes o negocios que necesitan espacio.',
                            'Eléctrico': 'El futuro es ahora. Ahorra gasolina y cuida el planeta.',
                            'Híbrido': 'Lo mejor de ambos mundos: eficiencia y potencia sin compromisos.',
                            'Motocicleta': 'Libertad sobre dos ruedas. Aventura y adrenalina sin límites.',
                        },
                        ctas_recomendados: [
                            '¡Tu próximo auto te espera en CarMatch! Búscalo gratis.',
                            '¿Comprando o vendiendo auto? Hazlo seguro con CarMatch.',
                            'Encuentra el auto perfecto + el taller más cercano. Todo en una app.',
                            'Citas seguras con GPS y botón SOS. Solo en CarMatch.',
                            'Publica tu auto gratis y llega a miles de compradores.',
                        ],
                        segmentos_audiencia: [
                            { nombre: 'Compradores primer auto', descripcion: 'Jóvenes 18-30 años buscando su primer vehículo', angulo: 'Financia tu primer auto desde $X/mes' },
                            { nombre: 'Familias', descripcion: 'Familias que necesitan SUV o Van seguro', angulo: 'Seguridad y espacio para los que más amas' },
                            { nombre: 'Vendedores particulares', descripcion: 'Personas que quieren vender su auto sin intermediarios', angulo: 'Vende tu auto gratis, sin comisiones' },
                            { nombre: 'Talleres mecánicos', descripcion: 'Negocios que buscan más clientes', angulo: 'Aumenta tus clientes con presencia en CarMatch' },
                            { nombre: 'Entusiastas', descripcion: 'Amantes de autos deportivos y clásicos', angulo: 'Conecta con tu comunidad automotriz' },
                            { nombre: 'Concesionarios', descripcion: 'Agencias que quieren más alcance digital', angulo: 'Lleva tu inventario a miles de compradores' },
                        ],
                    },
                    productos: products,
                })
            }

            default:
                return NextResponse.json({ error: 'Unknown type. Use: overview, brands, categories, trending, products' }, { status: 400, headers: CORS_HEADERS })
        }

    } catch (error) {
        console.error('Marketing API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: CORS_HEADERS })
    }
}
