
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPushToUser } from '@/lib/pushService'

/**
 * Endpoint para disparar notificaciones de engagement (Mañana y Noche)
 * Los recordatorios de citas están en appointment-monitor (monitor.ts)
 */
export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    try {
        const now = new Date()
        const hour = now.getHours()
        const isMorning = hour >= 6 && hour < 12

        const title = isMorning ? '¡Buenos días! 🚗✨' : '¡Noche de CarMatch! 🌙'
        const body = isMorning
            ? 'Mira los nuevos vehículos publicados hoy en tu zona.'
            : 'Checa si tienes nuevos mensajes o actualizaciones de tus publicaciones.'

        const activeSubscriptions = await prisma.pushSubscription.findMany({
            distinct: ['userId'],
            select: { userId: true }
        })

        const engagementPromises = activeSubscriptions.map(sub =>
            sendPushToUser(sub.userId, {
                title,
                body,
                url: '/market'
            })
        )

        await Promise.all(engagementPromises)

        return NextResponse.json({
            success: true,
            notifiedEngagement: activeSubscriptions.length,
            type: isMorning ? 'morning' : 'night'
        })
    } catch (error) {
        console.error('Error in daily push cron:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
