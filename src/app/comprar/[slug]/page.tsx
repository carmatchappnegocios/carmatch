// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { Metadata } from 'next'
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import VehicleDetailClient from "../../vehicle/[id]/VehicleDetailClient"
import { auth } from '@/lib/auth'
import { serializeDecimal } from "@/lib/serialize"
import { generateVehicleSlug } from '@/lib/slug'
import { getBrandEntity } from '@/lib/entities'
import { Suspense } from 'react'

interface Props {
    params: Promise<{ slug: string }>
    searchParams: Promise<any>
}

function extractIdFromSlug(slug: string) {
    const parts = slug.split('-')
    return parts[parts.length - 1]
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { slug } = await params
    const id = extractIdFromSlug(slug)

    const vehicle = await prisma.vehicle.findUnique({
        where: { id },
    })

    if (!vehicle) {
        return { title: 'CarMatch' }
    }

    // 🚀 CTR OPTIMIZED TITLE: Incluye Marca, Modelo, Año, Ciudad y PRECIO para capturar clics rápidos
    const formattedPrice = new Intl.NumberFormat('es-MX', { style: 'currency', currency: vehicle.currency || 'MXN' }).format(vehicle.price.toNumber())
    const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year} en ${vehicle.city} | ${formattedPrice} | Venta en CarMatch`

    // 📝 META DESCRIPTION: Optimizada para IA y Buscadores (Long-tail)
    const description = `¿Buscas un ${vehicle.brand} ${vehicle.model}? Este modelo ${vehicle.year} está en venta en ${vehicle.city} por ${formattedPrice}. Motor ${vehicle.engine}, Transmisión ${vehicle.transmission}. ¡Míralo ahora en CarMatch, el marketplace #1 sin comisiones!`

    // 🏷️ DYNAMIC KEYWORDS: Basadas en la categoría para nichos como RZRs, Motos o Tractores
    const categoryKeywords: string[] = []
    if (vehicle.vehicleType?.toLowerCase().includes('moto') || vehicle.vehicleType?.toLowerCase().includes('atv')) {
        categoryKeywords.push("motocicletas usadas", "motos baratas", "cuatrimoto 4x4", "biker", "refacciones moto")
    } else if (vehicle.vehicleType?.toLowerCase().includes('tractor') || vehicle.vehicleType?.toLowerCase().includes('maquinaria')) {
        categoryKeywords.push("maquinaria pesada", "tractor john deere", "maquinaria agricola", "cat", "caterpillar", "jcb")
    } else if (vehicle.vehicleType?.toLowerCase().includes('rzr') || vehicle.vehicleType?.toLowerCase().includes('utv')) {
        categoryKeywords.push("rzr usado", "polaris", "can am", "offroad", "utv mexico", "4x4 recreativo")
    }

    return {
        title,
        description,
        keywords: [
            `comprar ${vehicle.brand} ${vehicle.model}`,
            `venta de ${vehicle.model} ${vehicle.year}`,
            `${vehicle.brand} usados en ${vehicle.city}`,
            `autos en ${vehicle.city}`,
            `${vehicle.model} precio`,
            ...categoryKeywords,
            "CarMatch",
            "MarketCar"
        ],
        openGraph: {
            title,
            description,
            images: vehicle.images.length > 0 ? [vehicle.images[0]] : [],
            url: `https://www.carmatchapp.net/comprar/${slug}`,
            siteName: 'CarMatch',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: vehicle.images.length > 0 ? [vehicle.images[0]] : [],
        },
        alternates: {
            canonical: `https://www.carmatchapp.net/comprar/${slug}`,
        }
    }
}
export default async function ComprarVehiclePage({ params, searchParams }: Props) {
    const { slug } = await params
    const id = extractIdFromSlug(slug)
    const session = await auth()

    const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                    phone: true,
                    isAdmin: true
                }
            },
            _count: {
                select: {
                    favorites: true
                }
            },
            favorites: session?.user?.email ? {
                where: {
                    user: {
                        email: session.user.email
                    }
                },
                select: { id: true }
            } : {
                where: { id: 'none' },
                take: 0
            }
        }
    })

    if (!vehicle) {
        notFound()
    }

    const brandEntity = getBrandEntity(vehicle.brand)

    // 🤖 ENTITY DETERMINATION: Detectamos el tipo de objeto para Schema.org (IA Friendly)
    let schemaType = "Car"
    const lowerType = vehicle.vehicleType?.toLowerCase() || ""
    if (lowerType.includes('moto') || lowerType.includes('atv')) schemaType = "Motorcycle"
    else if (lowerType.includes('autobus') || lowerType.includes('bus')) schemaType = "Bus"
    else if (lowerType.includes('maquinaria') || lowerType.includes('tractor') || lowerType.includes('rzr')) schemaType = "Vehicle" // Types genéricos para recreativo e industrial

    // 🚗 JSON-LD for AI and Google (Schema.org Entity Enriched)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "name": `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        "description": vehicle.description || `Se vende ${vehicle.brand} ${vehicle.model} ${vehicle.year} en ${vehicle.city}. En excelente estado, trato directo.`,
        "image": vehicle.images.map(img => ({
            "@type": "ImageObject",
            "url": img,
            "caption": `${vehicle.brand} ${vehicle.model} ${vehicle.year} en ${vehicle.city}`
        })),
        "brand": {
            "@id": brandEntity || undefined,
            "@type": "Brand",
            "name": vehicle.brand,
            "sameAs": brandEntity || undefined
        },
        "model": vehicle.model,
        "modelDate": vehicle.year,
        "color": vehicle.color,
        "vehicleTransmission": vehicle.transmission,
        "fuelType": vehicle.fuel,
        "vehicleEngine": {
            "@type": "EngineSpecification",
            "name": vehicle.engine || "No especificado",
        },
        "offers": {
            "@type": "Offer",
            "price": vehicle.price.toNumber(),
            "priceCurrency": vehicle.currency || "MXN",
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/UsedCondition",
            "url": `https://www.carmatchapp.net/comprar/${slug}`,
            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            "seller": {
                "@type": "Organization",
                "name": "CarMatch",
                "url": "https://www.carmatchapp.net"
            }
        }
    }

    // 🤖 FAQ SCHEMA for AI Answers
    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `¿Cuál es el precio del ${vehicle.brand} ${vehicle.model} ${vehicle.year}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `El precio de este ${vehicle.brand} ${vehicle.model} es de $${vehicle.price.toLocaleString()} ${vehicle.currency}.`
                }
            }
        ]
    }

    // 🔗 BREADCRUMBS JSON-LD (Wikipedia Style Hierarchy)
    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "CarMatch", "item": "https://www.carmatchapp.net" },
            { "@type": "ListItem", "position": 2, "name": "Comprar", "item": "https://www.carmatchapp.net/market" },
            { "@type": "ListItem", "position": 3, "name": vehicle.brand, "item": `https://www.carmatchapp.net/market?brand=${encodeURIComponent(vehicle.brand)}` },
            { "@type": "ListItem", "position": 4, "name": vehicle.model, "item": `https://www.carmatchapp.net/comprar/${slug}` }
        ]
    }

    // 🔄 RELATED VEHICLES
    const relatedVehicles = await prisma.vehicle.findMany({
        where: {
            AND: [
                { id: { not: vehicle.id } },
                { status: 'ACTIVE' },
                { OR: [{ brand: vehicle.brand }, { vehicleType: vehicle.vehicleType }] }
            ]
        },
        take: 6,
        select: { id: true, title: true, price: true, year: true, images: true, city: true }
    })

    const vehicleData = {
        ...vehicle,
        price: vehicle.price.toNumber(),
        isFavorited: vehicle.favorites && vehicle.favorites.length > 0,
        features: vehicle.features || [],
        favorites: undefined,
        user: {
            ...vehicle.user,
            isAdmin: vehicle.user.isAdmin || vehicle.user.email === process.env.ADMIN_EMAIL
        }
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background pt-[70px]"><div className="w-8 h-8 md:w-12 md:h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                <VehicleDetailClient
                    vehicle={vehicleData as any}
                    currentUserEmail={session?.user?.email}
                    currentUserId={session?.user?.id}
                    relatedVehicles={serializeDecimal(relatedVehicles)}
                />
            </Suspense>
        </>
    )
}

