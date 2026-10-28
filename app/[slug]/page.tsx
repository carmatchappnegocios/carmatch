
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Metadata } from 'next'
import MiniWebClient from './MiniWebClient'
import { cache } from 'react'

interface Props {
    params: Promise<{ slug: string }>
    searchParams: Promise<any>
}

const reservedRoutes = ['market', 'swipe', 'map', 'map-store', 'profile', 'credits', 'publish', 'auth', 'api', 'admin', 'messages', 'notifications', 'my-businesses', 'favorites', 'terms', 'privacy']

const getBusiness = cache(async (slug: string) => {
    return prisma.business.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            category: true,
            description: true,
            address: true,
            city: true,
            state: true,
            country: true,
            phone: true,
            whatsapp: true,
            facebook: true,
            instagram: true,
            tiktok: true,
            website: true,
            telegram: true,
            images: true,
            services: true,
            is24Hours: true,
            hasEmergencyService: true,
            hasHomeService: true,
            hours: true,
            hasMiniWeb: true,
            slug: true,
            latitude: true,
            longitude: true,
            miniWebTheme: true,
            miniWebSections: true,
            miniWebHero: true,
            miniWebLogo: true,
            miniWebSeo: true,
            miniWebServices: true,
            miniWebPromos: true,
            miniWebFaq: true,
        }
    })
})

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { slug } = await params

    if (reservedRoutes.includes(slug)) {
        return {}
    }

    const business = await getBusiness(slug)

    if (!business) {
        return {
            title: 'Negocio no encontrado | CarMatch',
        }
    }

    const seoTitle = (business.miniWebSeo as any)?.metaTitle || `${business.name} | Sitio Oficial en CarMatch`
    const seoDescription = (business.miniWebSeo as any)?.metaDescription || business.description?.substring(0, 160) || `Visita el sitio oficial de ${business.name} en ${business.city}. Servicios de ${business.category}.`
    const seoImage = (business.miniWebSeo as any)?.ogImage || business.images[0]

    return {
        title: seoTitle,
        description: seoDescription,
        openGraph: {
            title: business.name,
            description: seoDescription.substring(0, 100),
            images: seoImage ? [seoImage] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: business.name,
            description: seoDescription.substring(0, 100),
            images: seoImage ? [seoImage] : [],
        }
    }
}

export default async function MiniWebPage({ params, searchParams }: Props) {
    const { slug } = await params

    if (reservedRoutes.includes(slug)) {
        notFound()
    }

    const business = await getBusiness(slug)

    // 3. Validaciones
    if (!business) {
        notFound()
    }

    // 4. Si tiene slug pero NO ha activado Mini-Web, redirigir a la vista estándar
    if (!business.hasMiniWeb) {
        redirect(`/business/${business.id}`)
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": business.category === 'TALLER' ? "AutoRepair" : "LocalBusiness",
        "name": business.name,
        "description": business.description || `Servicios profesionales de ${business.category} en ${business.city}.`,
        "image": business.images.length > 0 ? business.images[0] : undefined,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": business.address,
            "addressLocality": business.city,
            "addressRegion": business.state || undefined,
            "addressCountry": business.country || "MX"
        },
        "url": `https://www.carmatchapp.net/${slug}`,
        "knowsAbout": business.services,
        "provider": {
            "@type": "Organization",
            "name": "CarMatch",
            "url": "https://www.carmatchapp.net"
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MiniWebClient business={business as any} />
        </>
    )
}
