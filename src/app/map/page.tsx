// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { serializeDecimal } from '@/lib/serialize'
import { redirect } from 'next/navigation'
import MapClient from './MapClient'
import { Suspense } from 'react'

// 💰 OPTIMIZACIÓN: Dynamic import para Mapbox
export const dynamic = 'force-dynamic'

export const metadata = {
    title: "Map Store | Talleres Mecánicos, Grúas y Servicios 24/7 | CarMatch Mapa",
    description: "📍 Encuentra talleres mecánicos, desponchadoras, refaccionarias y servicios automotrices cerca de ti. 🚨 Asistencia vital, grúas 24 horas y puntos de encuentro seguros en el Mapa CarMatch.",
    keywords: [
        "taller mecanico cerca de mi", "mecanico 24 horas", "grua cerca de mi",
        "desponchadora abierta", "refaccionaria cerca", "electrico automotriz",
        "llanteras 24 horas", "servicio a domicilio mecanico", "mapa talleres",
        "CarMatch Map Store", "puntos de encuentro seguros", "diagnostico automotriz"
    ],
    openGraph: {
        title: "Map Store | Encuentra Servicios Automotrices Cerca de Ti",
        description: "El directorio más completo de talleres y servicios mecánicos en tiempo real. ¡Encuentra ayuda ahora mismo!",
        images: [{ url: "/portada_1024x500.png?v=23", width: 1024, height: 500, alt: "CarMatch" }],
    }
}

export default async function MapPage() {
    const session = await auth()

    // 🗺️ JSON-LD for MapStore (Service Directory)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "CarMatch Map Store",
        "description": "Directorio en tiempo real de servicios automotrices, talleres y asistencia vial.",
        "url": "https://www.carmatchapp.net/map-store",
        "provider": {
            "@type": "Organization",
            "name": "CarMatch",
            "url": "https://www.carmatchapp.net"
        },
        "specialty": "Automotive Services"
    }

    const user = session?.user?.email
        ? await prisma.user.findUnique({ where: { email: session.user.email } })
        : null

    // Fetch active businesses OR businesses owned by the current user (if logged in)
    let whereCondition: any = {
        isActive: true
    }

    if (user?.id) {
        whereCondition = {
            OR: [
                { isActive: true },
                { userId: user.id }
            ]
        }
    }

    const businesses = await prisma.business.findMany({
        where: whereCondition,
        take: 100, // Light SSR: only markers, details load on click via bounds API
        select: {
            id: true,
            name: true,
            category: true,
            latitude: true,
            longitude: true,
            city: true,
            is24Hours: true,
            hasEmergencyService: true,
            hasHomeService: true,
            isSafeMeetingPoint: true,
            hasMiniWeb: true,
            userId: true,
        }
    })

    return (
        <div className="absolute inset-0 z-20 flex flex-col bg-background overflow-hidden overscroll-none lg:pb-4">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Suspense fallback={<div className="flex-1 flex w-full h-full items-center justify-center bg-background"><div className="w-8 h-8 md:w-12 md:h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                <MapClient
                    businesses={businesses.map((b: any) => serializeDecimal(b)) as any}
                    user={user ? serializeDecimal(user) as any : null}
                />
            </Suspense>
        </div>
    )
}
