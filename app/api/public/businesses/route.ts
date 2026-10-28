import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'

/**
 * Public business search endpoint — no auth required.
 * GET /api/public/businesses
 * 
 * Params: search, category, city, sort (newest|rating|name),
 *         page (default 1), limit (default 24, max 100)
 */
export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    const rl = checkRateLimit(`public-businesses:${ip}`, { windowMs: 60000, max: 60 })
    if (!rl.allowed) {
        return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const city = searchParams.get('city') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24')))

    try {
        const where: any = {
            isActive: true
        }

        if (category) where.category = category
        if (city) where.city = { contains: city, mode: 'insensitive' }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } }
            ]
        }

        let orderBy: any = { createdAt: 'desc' }
        if (sort === 'name') orderBy = { name: 'asc' }

        const [businesses, total] = await Promise.all([
            prisma.business.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    category: true,
                    description: true,
                    address: true,
                    city: true,
                    phone: true,
                    whatsapp: true,
                    images: true,
                    hours: true,
                    latitude: true,
                    longitude: true,
                    slug: true,
                    hasEmergencyService: true,
                    hasHomeService: true,
                    is24Hours: true,
                    createdAt: true,
                    reviews: { select: { rating: true } }
                },
                orderBy,
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.business.count({ where })
        ])

        const result = businesses.map(b => {
            const ratings = b.reviews.map(r => r.rating)
            const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null
            return {
                ...b,
                averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
                reviewCount: ratings.length,
                reviews: undefined
            }
        })

        return NextResponse.json({
            businesses: result,
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
