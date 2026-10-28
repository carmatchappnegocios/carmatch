import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/beta-sessions
 * Devuelve todas las sesiones beta del día actual para el panel de admin.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 🕒 v8.9: Estándar para México (America/Mexico_City)
        const { searchParams } = new URL(request.url)
        const queryDate = searchParams.get('date')
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
        const dateToFilter = queryDate || today

        const sessions = await prisma.betaSession.findMany({
            where: { date: dateToFilter },
            include: {
                user: {
                    select: { id: true, name: true, email: true, image: true }
                }
            },
            orderBy: { maxDuration: 'desc' }
        })

        // Serializar fechas para el cliente
        const result = sessions.map(s => ({
            id: s.id,
            userId: s.userId,
            userName: s.user.name,
            userEmail: s.user.email,
            userImage: s.user.image,
            date: s.date,
            maxDuration: s.maxDuration,
            completedToday: s.completedToday,
            deviceOS: s.deviceOS,
            lastPing: s.lastPing.toISOString(),
            sessionStart: s.sessionStart.toISOString(),
        }))

        return NextResponse.json({ success: true, sessions: result, today })
    } catch (error: any) {
        console.error('[BetaSessions API]', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
