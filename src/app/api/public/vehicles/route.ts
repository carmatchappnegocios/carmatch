import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'

/**
 * Public vehicle search endpoint — no auth required.
 * GET /api/public/vehicles
 * 
 * Params: search, brand, model, city, minPrice, maxPrice, minYear, maxYear,
 *         vehicleType, category, transmission, fuel, color, condition,
 *         sort (price-asc|price-desc|year-asc|year-desc|newest),
 *         page (default 1), limit (default 24, max 100)
 */
export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    const rl = checkRateLimit(`public-vehicles:${ip}`, { windowMs: 60000, max: 60 })
    if (!rl.allowed) {
        return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const brand = searchParams.get('brand') || ''
    const model = searchParams.get('model') || ''
    const city = searchParams.get('city') || ''
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minYear = searchParams.get('minYear')
    const maxYear = searchParams.get('maxYear')
    const vehicleType = searchParams.get('vehicleType') || ''
    const category = searchParams.get('category') || ''
    const transmission = searchParams.get('transmission') || ''
    const fuel = searchParams.get('fuel') || ''
    const color = searchParams.get('color') || ''
    const condition = searchParams.get('condition') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24')))

    try {
        const where: any = {
            status: 'ACTIVE'
        }

        if (brand) where.brand = { contains: brand, mode: 'insensitive' }
        if (model) where.model = { contains: model, mode: 'insensitive' }
        if (city) where.city = { contains: city, mode: 'insensitive' }
        if (vehicleType) where.vehicleType = vehicleType
        if (category) where.category = category
        if (transmission) where.transmission = transmission
        if (fuel) where.fuel = fuel
        if (color) where.color = { contains: color, mode: 'insensitive' }
        if (condition) where.condition = condition

        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = parseFloat(minPrice)
            if (maxPrice) where.price.lte = parseFloat(maxPrice)
        }

        if (minYear || maxYear) {
            where.year = {}
            if (minYear) where.year.gte = parseInt(minYear)
            if (maxYear) where.year.lte = parseInt(maxYear)
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ]
        }

        let orderBy: any = { createdAt: 'desc' }
        if (sort === 'price-asc') orderBy = { price: 'asc' }
        else if (sort === 'price-desc') orderBy = { price: 'desc' }
        else if (sort === 'year-asc') orderBy = { year: 'asc' }
        else if (sort === 'year-desc') orderBy = { year: 'desc' }

        const [vehicles, total] = await Promise.all([
            prisma.vehicle.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    brand: true,
                    model: true,
                    year: true,
                    price: true,
                    city: true,
                    vehicleType: true,
                    images: true,
                    mileage: true,
                    transmission: true,
                    fuel: true,
                    color: true,
                    condition: true,
                    createdAt: true,
                    user: { select: { name: true, image: true } },
                    _count: { select: { favorites: true } }
                },
                orderBy,
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.vehicle.count({ where })
        ])

        return NextResponse.json({
            vehicles: vehicles.map(v => ({
                ...v,
                favoriteCount: v._count.favorites,
                sellerName: v.user.name,
                sellerImage: v.user.image,
                user: undefined,
                _count: undefined
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
