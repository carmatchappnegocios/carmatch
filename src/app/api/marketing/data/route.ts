import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * API para el proyecto de Marketing de CarMatch
 * Protegida por API key compartida
 * 
 * Retorna datos agregados y anónimos para crear publicidad:
 * - Marcas y categorías populares por ciudad
 * - Rangos de precios
 * - Ciudades con más actividad
 * - Negocios activos por categoría
 * 
 * NO expone: emails, nombres, teléfonos, ubicaciones exactas de usuarios
 */
export async function GET(req: NextRequest) {
    try {
        // Autenticación por API key
        const apiKey = req.headers.get('x-api-key') || req.nextUrl.searchParams.get('key')
        if (!apiKey || apiKey !== process.env.MARKETING_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
                const prices = activeVehicles.map(v => v.price).filter(p => p > 0)
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
                })
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

                return NextResponse.json({ brandByCity })
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

                return NextResponse.json({ categories: topCategories, total: businesses.length })
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
                })
            }

            case 'products': {
                // Vehículos activos en formato compatible con LEONIDAS Marketing
                const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50'), 100)
                const cityFilter = req.nextUrl.searchParams.get('city')

                const where: any = { status: 'ACTIVE' }
                if (cityFilter) where.city = cityFilter

                const vehicles = await prisma.vehicle.findMany({
                    where,
                    select: {
                        id: true,
                        title: true,
                        brand: true,
                        model: true,
                        year: true,
                        price: true,
                        currency: true,
                        city: true,
                        condition: true,
                        mileage: true,
                        images: true,
                        description: true,
                        vehicleType: true,
                        color: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' },
                    take: limit
                })

                // Formato compatible con LEONIDAS Marketing API
                const products = vehicles.map(v => ({
                    nombre: v.title,
                    precio: v.price,
                    moneda: v.currency || 'MXN',
                    descripcion: `${v.brand} ${v.model} ${v.year} - ${v.condition || 'Usado'}. ${v.mileage ? `Kilometraje: ${v.mileage}km` : ''}. Ubicación: ${v.city}.`,
                    imagen: v.images?.[0] || null,
                    categoria: v.vehicleType || 'Vehículo',
                    marca: v.brand,
                    modelo: v.model,
                    anio: v.year,
                    ciudad: v.city,
                    color: v.color,
                    url: `https://carmatchapp.net/vehicle/${v.id}`
                }))

                return NextResponse.json({
                    brand: 'CarMatch Social',
                    platform: 'carmatchapp.net',
                    total: vehicles.length,
                    productos: products
                })
            }

            default:
                return NextResponse.json({ error: 'Unknown type. Use: overview, brands, categories, trending, products' }, { status: 400 })
        }

    } catch (error) {
        console.error('Marketing API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
