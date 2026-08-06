// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { MetadataRoute } from 'next'

// ⚡ Forzar generación dinámica (runtime) para que Prisma no se ejecute en build time
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'
import { generateVehicleSlug, generateBusinessSlug } from '@/lib/slug'

// URL Base del sitio
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.carmatchapp.net'

// 🌎 Ciudades globales para SEO (pre-rendered URLs aunque no haya vehículos aún)
const GLOBAL_CITY_SLUGS = [
    'monterrey', 'guadalajara', 'ciudad-de-mexico', 'tijuana', 'queretaro', 'merida', 'leon', 'puebla',
    'cancun', 'acapulco', 'chihuahua', 'saltillo', 'aguascalientes', 'morelia', 'veracruz', 'toluca',
    'cuernavaca', 'pachuca', 'reynosa', 'matamoros', 'nuevo-laredo', 'juarez', 'ciudad-juarez',
    'miami', 'los-angeles', 'houston', 'dallas', 'chicago', 'new-york', 'san-antonio', 'phoenix',
    'san-diego', 'las-vegas', 'atlanta', 'orlando', 'tampa', 'austin', 'denver',
    'bogota', 'medellin', 'cali', 'barranquilla',
    'buenos-aires', 'cordoba', 'rosario',
    'madrid', 'barcelona', 'valencia', 'sevilla', 'malaga',
    'santiago', 'valparaiso',
    'lima',
    'guayaquil', 'quito',
    'santo-domingo',
    'guatemala',
    'san-jose',
    'panama',
    'montevideo',
]

// 🔧 Categorías de servicios para SEO
const SERVICE_CATEGORY_SLUGS = [
    'mecanico', 'llantera', 'gruas', 'estetica', 'refacciones', 'cerrajeria',
    'frenos', 'electrico', 'audio', 'gasolinera', 'diesel', 'transmisiones',
    'cristales', 'tapiceria', 'hojalateria', 'performance', 'mofles', 'radiadores',
    'rectificadora', 'blindaje', 'offroad', 'suspension', 'aire_acondicionado',
    'importadoras', 'iluminacion', 'rotulacion', 'inyectores', 'electrolinera',
    'taller_ev', 'lubricantes', 'boutique', 'caseta', 'hospital', 'policia',
    'aeropuerto', 'estacion_tren',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Obtener Vehículos Activos (Limitado a 5000)
    const vehicles = await prisma.vehicle.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, updatedAt: true, brand: true, model: true, year: true, city: true },
        orderBy: { updatedAt: 'desc' },
        take: 5000
    })

    // 2. Obtener Negocios Activos
    const businesses = await prisma.business.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, updatedAt: true, city: true, category: true },
        orderBy: { updatedAt: 'desc' },
        take: 20000
    })

    // 2.1 Generar rutas de Directorio Local (Ciudad + Categoría)
    const directoryUrls: any[] = []
    const processedCombos = new Set<string>()

    businesses.forEach(b => {
        if (b.city && b.category) {
            const combo = `${b.city.toLowerCase()}-${b.category.toLowerCase()}`
            if (!processedCombos.has(combo)) {
                processedCombos.add(combo)
                directoryUrls.push({
                    url: `${BASE_URL}/negocios/${encodeURIComponent(b.city.toLowerCase())}/${encodeURIComponent(b.category.toLowerCase())}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.9,
                })
            }
        }
    })

    // 2.2 Ciudades de vehículos (dinámico desde DB)
    const cityVehicleUrls: any[] = []
    const processedCities = new Set<string>()

    const allVehicles = await prisma.vehicle.findMany({
        where: { status: 'ACTIVE' },
        select: { city: true },
    })

    allVehicles.forEach(v => {
        if (v.city) {
            const cityKey = v.city.toLowerCase()
            if (!processedCities.has(cityKey)) {
                processedCities.add(cityKey)
                cityVehicleUrls.push({
                    url: `${BASE_URL}/autos-en/${encodeURIComponent(cityKey)}`,
                    lastModified: new Date(),
                    changeFrequency: 'daily' as const,
                    priority: 0.95,
                })
            }
        }
    })

    // 2.3 Ciudades globales predefinidas (SEO proactive — incluso si no hay vehículos aún)
    const globalCityUrls = GLOBAL_CITY_SLUGS
        .filter(slug => !processedCities.has(slug.replace(/-/g, ' ')))
        .map(slug => ({
            url: `${BASE_URL}/autos-en/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.85,
        }))

    // 2.4 Categorías de servicios MapStore
    const serviceCategoryUrls = SERVICE_CATEGORY_SLUGS.map(slug => ({
        url: `${BASE_URL}/map?category=${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // 3. Mapear Vehículos
    const vehicleUrls = vehicles.map((vehicle) => {
        const slug = generateVehicleSlug(vehicle.brand || '', vehicle.model || '', vehicle.year || 0, vehicle.city)
        return {
            url: `${BASE_URL}/comprar/${slug}-${vehicle.id}`,
            lastModified: vehicle.updatedAt,
            changeFrequency: 'daily' as const,
            priority: 1.0,
        }
    })

    // 4. Mapear Negocios
    const businessUrls = businesses.map((business) => {
        const slug = generateBusinessSlug(business.name, business.city || '')
        return {
            url: business.slug ? `${BASE_URL}/${business.slug}` : `${BASE_URL}/negocio/${slug}-${business.id}`,
            lastModified: business.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }
    })

    // 5. Rutas Estáticas
    const staticRoutes = [
        '',
        '/market',
        '/map',
        '/map-store',
        '/swipe',
        '/terms',
        '/privacy',
        '/publishing-rules',
        '/market?category=Automóvil',
        '/market?category=Motocicleta',
        '/market?category=Camión',
        '/market?category=Maquinaria',
        '/market?category=Especial',
        '/autos/Ford',
        '/autos/Chevrolet',
        '/autos/Toyota',
        '/autos/Nissan',
        '/autos/Honda',
        '/autos/Volkswagen',
        '/autos/Jeep',
        '/autos/BMW',
        '/autos/Mercedes-Benz',
        '/autos/cluster/4x4-todo-terreno',
        '/autos/cluster/electricos-y-hibridos',
        '/autos/cluster/blindados-seguridad',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
    }))

    // Blog posts
    const { blogPosts } = await import('@/data/blog-posts')
    const blogUrls = blogPosts.map(post => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        ...staticRoutes,
        ...globalCityUrls,
        ...serviceCategoryUrls,
        ...directoryUrls,
        ...cityVehicleUrls,
        ...vehicleUrls,
        ...businessUrls,
        ...blogUrls,
    ]
}
