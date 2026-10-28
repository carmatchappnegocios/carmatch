
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializeDecimal } from '@/lib/serialize'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const minLat = parseFloat(searchParams.get('minLat') || '')
        const maxLat = parseFloat(searchParams.get('maxLat') || '')
        const minLng = parseFloat(searchParams.get('minLng') || '')
        const maxLng = parseFloat(searchParams.get('maxLng') || '')
        const category = searchParams.get('category')
        const searchQuery = searchParams.get('search')
        const zoom = parseInt(searchParams.get('zoom') || '12')

        if (isNaN(minLat) || isNaN(maxLat) || isNaN(minLng) || isNaN(maxLng)) {
            return NextResponse.json({ error: 'Missing or invalid bounds' }, { status: 400 })
        }

        const takeLimit = zoom >= 15 ? 200 : zoom >= 13 ? 500 : 1000

        let lngFilter: any = {
            gte: minLng,
            lte: maxLng
        }

        if (minLng > maxLng) {
            lngFilter = {
                OR: [
                    { gte: minLng },
                    { lte: maxLng }
                ]
            }
        }

        const where: any = {
            isActive: true,
            latitude: { gte: minLat, lte: maxLat },
            longitude: lngFilter,
        }

        if (category && category !== 'all') {
            where.category = category
        }

        if (searchQuery) {
            where.OR = [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
                { services: { hasSome: [searchQuery] } }
            ]
        }

        const businesses = await prisma.business.findMany({
            where,
            select: {
                id: true,
                name: true,
                category: true,
                latitude: true,
                longitude: true,
                city: true,
                state: true,
                address: true,
                street: true,
                streetNumber: true,
                colony: true,
                images: true,
                description: true,
                services: true,
                phone: true,
                whatsapp: true,
                hours: true,
                is24Hours: true,
                hasEmergencyService: true,
                hasHomeService: true,
                isSafeMeetingPoint: true,
                hasMiniWeb: true,
            },
            take: takeLimit
        })

        return NextResponse.json({
            businesses: serializeDecimal(businesses)
        })

    } catch (error) {
        console.error('Error fetching businesses by bounds:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
