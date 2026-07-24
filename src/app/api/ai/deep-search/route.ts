import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { buildVehicleQuery, buildBusinessQuery } from '@/lib/ai/searchQueryBuilder'

export async function POST(req: NextRequest) {
    try {
        const { query, context, filters } = await req.json()

        if (!query && !filters) {
            return NextResponse.json({ results: [] })
        }

        if (context === 'MAP') {
            // Búsqueda en Negocios usando filtros estructurados de la IA si existen
            const where = filters ? buildBusinessQuery(filters) : {
                isActive: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            }

            const businesses = await prisma.business.findMany({
                where,
                select: { 
                    id: true, 
                    name: true, 
                    latitude: true, 
                    longitude: true, 
                    category: true,
                    city: true,
                    address: true,
                    images: true
                },
                take: 20
            })
            return NextResponse.json({ results: businesses, type: 'BUSINESS' })
        } else {
            // Búsqueda en Vehículos usando filtros estructurados
            const where = filters ? buildVehicleQuery(filters) : {
                status: 'ACTIVE',
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            }

            const vehicles = await prisma.vehicle.findMany({
                where,
                select: { 
                    id: true, 
                    title: true, 
                    brand: true, 
                    model: true, 
                    year: true, 
                    price: true, 
                    images: true,
                    city: true
                },
                take: 20
            })
            return NextResponse.json({ results: vehicles, type: 'VEHICLE' })
        }

    } catch (error) {
        console.error('Deep Search Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
