import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../public/vehicles/route'

vi.mock('@/lib/db', () => ({
    prisma: {
        vehicle: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
    },
}))

vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 59, resetAt: Date.now() + 60000 })),
}))

function makeRequest(url: string) {
    return new Request(`http://localhost${url}`, {
        headers: { 'x-forwarded-for': '127.0.0.1' },
    })
}

describe('GET /api/public/vehicles', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns proper structure with vehicles and pagination', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles')
        const res = await GET(req as any)
        const json = await res.json()

        expect(json).toHaveProperty('vehicles')
        expect(json).toHaveProperty('pagination')
        expect(Array.isArray(json.vehicles)).toBe(true)
        expect(json.pagination).toHaveProperty('page')
        expect(json.pagination).toHaveProperty('limit')
        expect(json.pagination).toHaveProperty('total')
        expect(json.pagination).toHaveProperty('totalPages')
    })

    it('defaults page=1 and limit=24', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles')
        await GET(req as any)

        expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ skip: 0, take: 24 })
        )

        const countCall = vi.mocked(prisma.vehicle.count)
        expect(countCall).toHaveBeenCalled()
    })

    it('applies page and limit from query params', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles?page=3&limit=10')
        const res = await GET(req as any)
        const json = await res.json()

        expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ skip: 20, take: 10 })
        )
        expect(json.pagination.page).toBe(3)
        expect(json.pagination.limit).toBe(10)
    })

    it('clamps limit to max 100', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles?limit=500')
        await GET(req as any)

        expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 100 })
        )
    })

    it('clamps page to minimum 1', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles?page=-5')
        const res = await GET(req as any)
        const json = await res.json()

        expect(json.pagination.page).toBe(1)
    })

    it('applies brand filter', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles?brand=Toyota')
        await GET(req as any)

        expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    brand: { contains: 'Toyota', mode: 'insensitive' },
                }),
            })
        )
    })

    it('applies price range filter', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles?minPrice=5000&maxPrice=20000')
        await GET(req as any)

        expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    price: { gte: 5000, lte: 20000 },
                }),
            })
        )
    })

    it('applies year range filter', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles?minYear=2015&maxYear=2023')
        await GET(req as any)

        expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    year: { gte: 2015, lte: 2023 },
                }),
            })
        )
    })

    it('applies sort options', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles?sort=price-asc')
        await GET(req as any)

        expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ orderBy: { price: 'asc' } })
        )
    })

    it('defaults sort to newest (createdAt desc)', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles')
        await GET(req as any)

        expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ orderBy: { createdAt: 'desc' } })
        )
    })

    it('applies search as OR across title, brand, model, description', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles?search=civic')
        await GET(req as any)

        expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    OR: [
                        { title: { contains: 'civic', mode: 'insensitive' } },
                        { brand: { contains: 'civic', mode: 'insensitive' } },
                        { model: { contains: 'civic', mode: 'insensitive' } },
                        { description: { contains: 'civic', mode: 'insensitive' } },
                    ],
                }),
            })
        )
    })

    it('always filters by ACTIVE status', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockResolvedValue([])
        vi.mocked(prisma.vehicle.count).mockResolvedValue(0)

        const req = makeRequest('/api/public/vehicles')
        await GET(req as any)

        expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ status: 'ACTIVE' }),
            })
        )
    })

    it('returns 500 on database error', async () => {
        const { prisma } = await import('@/lib/db')
        vi.mocked(prisma.vehicle.findMany).mockRejectedValue(new Error('DB down'))

        const req = makeRequest('/api/public/vehicles')
        const res = await GET(req as any)

        expect(res.status).toBe(500)
    })
})
