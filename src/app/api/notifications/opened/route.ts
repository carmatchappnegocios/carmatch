import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/notifications/opened
 * Registra que el usuario abrió/clickeó una notificación
 * Body: { notificationId: string, action: 'opened' | 'clicked' }
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { notificationId, action = 'opened' } = body

        if (!notificationId) {
            return NextResponse.json({ error: 'notificationId requerido' }, { status: 400 })
        }

        // Verificar que la notificación pertenece al usuario
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        })

        if (!notification || notification.userId !== session.user.id) {
            return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
        }

        // Marcar como leída si no lo está
        if (!notification.isRead) {
            await prisma.notification.update({
                where: { id: notificationId },
                data: { isRead: true }
            })
        }

        // 📊 REGISTRAR EVENTO: Notificación abierta/clickeada
        try {
            await prisma.analyticsEvent.create({
                data: {
                    userId: session.user.id,
                    eventType: action === 'clicked' ? 'NOTIFICATION_CLICKED' : 'NOTIFICATION_OPENED',
                    entityType: 'NOTIFICATION',
                    entityId: notificationId,
                    metadata: {
                        notificationType: notification.type,
                        link: notification.link,
                        timestamp: new Date().toISOString()
                    }
                }
            })
        } catch {
            // Fail silently
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
