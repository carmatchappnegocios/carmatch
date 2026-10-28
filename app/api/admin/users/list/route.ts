import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Robust admin check: 1) session.isAdmin, 2) email match, 3) direct DB query
        let isAdmin = !!(session.user as any).isAdmin
        if (!isAdmin && session.user.email && process.env.ADMIN_EMAIL) {
            isAdmin = session.user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
        }
        if (!isAdmin && session.user.email) {
            const dbUser = await prisma.user.findUnique({
                where: { email: session.user.email.toLowerCase() },
                select: { isAdmin: true }
            })
            isAdmin = !!dbUser?.isAdmin
        }
        
        if (!isAdmin) {
            console.warn('[Admin Users] Access denied for:', session.user.email)
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '100')
        const search = searchParams.get('search') || ''
        const includeBeta = searchParams.get('includeBeta') === 'true'
        const skip = (page - 1) * limit

        const where: any = {}
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    isAdmin: true,
                    isActive: true,
                    createdAt: true,
                    credits: true,
                    // Include beta session for today if requested
                    ...(includeBeta && {
                        betaSessions: {
                            where: {
                                date: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
                            },
                            select: {
                                maxDuration: true,
                                lastPing: true,
                                deviceOS: true
                            }
                        }
                    })
                }
            }),
            prisma.user.count({ where })
        ])

        // Enrich with beta session data
        const enrichedUsers = users.map(user => ({
            ...user,
            betaToday: user.betaSessions?.[0] || null,
            betaSessions: undefined // Remove raw sessions
        }))

        // Also get beta users count (users with beta session today)
        const betaUsersToday = await prisma.betaSession.count({
            where: {
                date: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
            }
        })

        return NextResponse.json({
            users: enrichedUsers,
            total,
            betaUsersToday,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error('Error fetching admin users:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}