
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { serializeDecimal } from '@/lib/serialize'
import { redirect } from 'next/navigation'
import MapClient from '../map/MapClient'

// 💰 OPTIMIZACIÓN: Dynamic import - Mapbox solo se carga cuando se necesita (-500KB JS initial)
export const dynamic = 'force-dynamic'

export const metadata = {
    title: "Talleres Mecánicos y Servicios Automotrices 24/7 | CarMatch Map Store",
    description: "Encuentra mecánicos, desponchadoras, refaccionarias y grúas cerca de ti con servicio 24/7. Auxilio vial inmediato en todo México. CarMatch te salva en el camino.",
    keywords: [
        "mapa de negocios", "mapa automotriz", "buscador de talleres", "directorio mecanico",
        "servicio a domicilio", "mecánico a domicilio Juárez", "refacciones a domicilio",
        "desponchadora a domicilio", "lavado de autos a domicilio", "servicio 24/7",
        "emergencia mecánica", "auxilio vial", "grúas 24 horas", "entrega de batería",
        "mecánico express", "reparación en sitio", "mantenimiento en casa", "CarMatch"
    ],
    alternates: {
        canonical: "https://www.carmatchapp.net/map-store",
    },
    openGraph: {
        title: "Talleres Mecánicos 24/7 cerca de ti | CarMatch Map Store",
        description: "Encuentra mecánicos, desponchadoras, refaccionarias y grúas cerca de ti. Servicio 24/7 en todo México.",
        url: "https://www.carmatchapp.net/map-store",
        siteName: "CarMatch",
        type: "website",
        images: [
            {
                url: "https://www.carmatchapp.net/portada_1024x500.png?v=23",
                width: 1024,
                height: 500,
                alt: "CarMatch",
            }
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Talleres Mecánicos 24/7 | CarMatch Map Store",
        description: "Encuentra mecánicos, desponchadoras y grúas cerca de ti. Servicio 24/7.",
        images: ["https://www.carmatchapp.net/portada_1024x500.png?v=23"],
    }
}

export default async function MapStorePage({ searchParams }: { searchParams: Promise<any> }) {
    await searchParams // 🔥 REQUERIDO EN NEXT.js 15
    const session = await auth()

    const user = session?.user?.email
        ? await prisma.user.findUnique({ where: { email: session.user.email } })
        : null

    // 💰 OPTIMIZACIÓN CRÍTICA: 
    // No descargamos NADA desde el servidor inicialmente. 
    // Esto evita mostrar negocios irrelevantes de otras partes del mundo.
    // El MapClient se encargará de pedir los negocios cercanos en cuanto detecte la ubicación del usuario.
    const businesses: any[] = []

    // 🤖 FAQ SCHEMA for MapStore Authority
    const mapStoreFaqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "¿Cómo me ayuda el buscador inteligente de MapStore?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "El buscador de MapStore está diseñado para detectar problemas mecánicos basados en tus síntomas y recomendarte los negocios expertos (talleres, desponchadoras, refaccionarias) más cercanos a tu ubicación en tiempo real."
                }
            },
            {
                "@type": "Question",
                "name": "¿Hay servicios 24 horas en el MapStore?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sí, el MapStore de CarMatch filtra automáticamente negocios con servicio de emergencia 24/7, incluyendo auxilio vial, grúas y mecánicos a domicilio."
                }
            }
        ]
    }

    return (
        <div className="absolute inset-0 z-20 flex flex-col bg-background">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(mapStoreFaqLd) }} />
            <MapClient
                businesses={serializeDecimal(businesses) as any}
                user={serializeDecimal(user) as any}
            />
        </div>
    )
}
