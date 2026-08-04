// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { prisma } from "@/lib/db"
import { serializeDecimal } from "@/lib/serialize"
import MarketClient from "../../market/MarketClient"
import { getCachedBrands, getCachedVehicleTypes, getCachedColors } from "@/lib/cached-data"
import { auth } from "@/lib/auth"
import { Metadata } from 'next'
import Link from "next/link"

// 🌎 Global slug → city name mapping
const CITY_MAP: Record<string, string> = {
    'monterrey': 'Monterrey',
    'guadalajara': 'Guadalajara',
    'ciudad-de-mexico': 'Ciudad de México',
    'cdmx': 'Ciudad de México',
    'mexico-city': 'Ciudad de México',
    'tijuana': 'Tijuana',
    'queretaro': 'Querétaro',
    'merida': 'Mérida',
    'leon': 'León',
    'puebla': 'Puebla',
    'cancun': 'Cancún',
    'acapulco': 'Acapulco',
    'chihuahua': 'Chihuahua',
    'saltillo': 'Saltillo',
    'aguascalientes': 'Aguascalientes',
    'morelia': 'Morelia',
    'veracruz': 'Veracruz',
    'toluca': 'Toluca',
    'cuernavaca': 'Cuernavaca',
    'pachuca': 'Pachuca',
    'reynosa': 'Reynosa',
    'matamoros': 'Matamoros',
    'nuevo-laredo': 'Nuevo Laredo',
    'juarez': 'Juárez',
    'ciudad-juarez': 'Ciudad Juárez',
    // USA
    'miami': 'Miami',
    'los-angeles': 'Los Angeles',
    'houston': 'Houston',
    'dallas': 'Dallas',
    'chicago': 'Chicago',
    'new-york': 'New York',
    'san-antonio': 'San Antonio',
    'phoenix': 'Phoenix',
    'san-diego': 'San Diego',
    'las-vegas': 'Las Vegas',
    'atlanta': 'Atlanta',
    'orlando': 'Orlando',
    'tampa': 'Tampa',
    'austin': 'Austin',
    'denver': 'Denver',
    // Colombia
    'bogota': 'Bogotá',
    'medellin': 'Medellín',
    'cali': 'Cali',
    'barranquilla': 'Barranquilla',
    // Argentina
    'buenos-aires': 'Buenos Aires',
    'cordoba': 'Córdoba',
    'rosario': 'Rosario',
    // España
    'madrid': 'Madrid',
    'barcelona': 'Barcelona',
    'valencia': 'Valencia',
    'sevilla': 'Sevilla',
    'malaga': 'Málaga',
    // Chile
    'santiago': 'Santiago',
    'valparaiso': 'Valparaíso',
    // Perú
    'lima': 'Lima',
    // Ecuador
    'guayaquil': 'Guayaquil',
    'quito': 'Quito',
    // Rep. Dominicana
    'santo-domingo': 'Santo Domingo',
    'santiago-de-los-tenedores': 'Santiago de los Caballeros',
    // Guatemala
    'guatemala': 'Guatemala',
    // Costa Rica
    'san-jose': 'San José',
    // Panamá
    'panama': 'Panamá',
    // Uruguay
    'montevideo': 'Montevideo',
};

function resolveCityName(slug: string): string {
    const normalized = slug.toLowerCase().trim()
    if (CITY_MAP[normalized]) return CITY_MAP[normalized]
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export async function generateMetadata({
    params,
    searchParams: _searchParams
}: {
    params: Promise<{ cityName: string }>,
    searchParams: Promise<any>
}): Promise<Metadata> {
    const { cityName } = await params
    const city = resolveCityName(cityName)
    const title = `Autos Usados en ${city} | Compra y Venta de Vehículos | CarMatch®`
    const description = `Explora el marketplace más grande de ${city}. Autos usados, motocicletas y maquinaria pesada con trato directo. ¡Compra o vende hoy mismo en CarMatch!`

    return {
        title,
        description,
        keywords: [
            `autos en ${city}`, `venta de autos ${city}`, `carros usados ${city}`,
            `motos en ${city}`, `comprar auto ${city}`, `marketplace autos ${city}`,
            `autos baratos ${city}`, `seminuevos ${city}`, `vehiculos ${city}`,
            `carMatch ${city}`, `comprar carro ${city}`, `vender auto ${city}`
        ],
        alternates: {
            canonical: `https://carmatchapp.net/autos-en/${cityName}`,
        },
        openGraph: {
            title,
            description,
            url: `https://carmatchapp.net/autos-en/${cityName}`,
            siteName: 'CarMatch',
            type: 'website',
            images: [
                {
                    url: 'https://carmatchapp.net/portada_1024x500.png?v=23',
                    width: 1024,
                    height: 500,
                    alt: `Autos en venta en ${city} - CarMatch`,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['https://carmatchapp.net/portada_1024x500.png?v=23'],
        },
    }
}

export default async function CityPage({
    params,
    searchParams: _searchParams
}: {
    params: Promise<{ cityName: string }>,
    searchParams: Promise<any>
}) {
    const { cityName } = await params
    const city = resolveCityName(cityName)
    const session = await auth()

    const currentUser = session?.user?.email
        ? await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, isAdmin: true }
        })
        : null

    const currentUserId = currentUser?.id || 'guest'

    const vehicles = await prisma.vehicle.findMany({
        where: {
            status: "ACTIVE",
            city: { contains: city, mode: 'insensitive' }
        },
        include: {
            user: {
                select: { name: true, image: true, isAdmin: true }
            },
            favorites: currentUser ? {
                where: { userId: currentUser.id },
                select: { id: true }
            } : {
                where: { id: 'none' },
                take: 0
            }
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
    })

    const items = vehicles.map(v => ({
        ...v,
        feedType: 'VEHICLE' as const,
        isFavorited: v.favorites.length > 0,
        isBoosted: v.user.isAdmin
    }))

    const [brands, vehicleTypes, colors] = await Promise.all([
        getCachedBrands(),
        getCachedVehicleTypes(),
        getCachedColors()
    ])

    const itemListLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Vehículos disponibles en ${city}`,
        "description": `Listado de los mejores autos, motos y maquinaria pesada en venta en la ciudad de ${city}.`,
        "itemListElement": items.slice(0, 10).map((v, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://carmatchapp.net/comprar/${v.brand}-${v.model}-${v.year}-${v.city}-${v.id}`.toLowerCase(),
            "name": `${v.brand} ${v.model} ${v.year}`
        }))
    }

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "CarMatch", "item": "https://carmatchapp.net" },
            { "@type": "ListItem", "position": 2, "name": "Autos por Ciudad", "item": "https://carmatchapp.net/market" },
            { "@type": "ListItem", "position": 3, "name": `Autos en ${city}`, "item": `https://carmatchapp.net/autos-en/${cityName}` }
        ]
    }

    return (
        <div className="min-h-screen bg-background">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            <div className="pt-24 px-6 max-w-7xl mx-auto text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-black mb-2 text-text-primary uppercase tracking-tighter">
                    COMPRA Y VENTA EN <span className="text-primary-500">{city}</span>
                </h1>
                <p className="text-xl text-gray-400 mb-8 max-w-3xl">
                    Los vehículos más buscados por la comunidad de CarMatch en {city}. Trato directo, sin comisiones.
                </p>
            </div>

            {items.length > 0 ? (
                <MarketClient
                    initialItems={serializeDecimal(items) as any}
                    currentUserId={currentUserId}
                    brands={brands}
                    vehicleTypes={vehicleTypes}
                    colors={colors}
                    searchParams={{}}
                />
            ) : (
                <div className="max-w-2xl mx-auto px-6 py-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500/10 flex items-center justify-center">
                        <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-3">
                        Aún no hay vehículos en {city}
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        Sé el primero en publicar tu auto, moto o maquinaria en {city}. ¡Llega a miles de compradores potenciales!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/my-businesses?action=new"
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition active:scale-95"
                        >
                            Publicar mi Vehículo
                        </Link>
                        <Link
                            href="/market"
                            className="px-6 py-3 bg-surface-highlight hover:bg-surface-highlight/80 text-text-primary border border-white/10 rounded-xl font-bold transition active:scale-95"
                        >
                            Ver todos los vehículos
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
