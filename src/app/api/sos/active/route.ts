import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ active: false })

        // Buscar alerta SOS activa donde el usuario sea víctima o contraparte
        // Y que no haya expirado (2 días)
        const activeAlert = await prisma.sOSAlert.findFirst({
            where: {
                status: 'ACTIVE',
                expiresAt: { gte: new Date() },
                OR: [
                    { victimId: session.user.id },
                    { counterpartId: session.user.id }
                ]
            }
        })

        return NextResponse.json({ 
            active: !!activeAlert, 
            isVictim: activeAlert?.victimId === session.user.id,
            alertId: activeAlert?.id 
        })
    } catch (error) {
        console.error('Error checking active SOS:', error)
        return NextResponse.json({ active: false }, { status: 500 })
    }
}

// PATCH: Resolver/Cancelar una alerta SOS
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

        const { alertId, action } = await request.json()

        if (!alertId || !['resolve', 'cancel'].includes(action)) {
            return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
        }

        const alert = await prisma.sOSAlert.findUnique({ where: { id: alertId } })

        if (!alert) {
            return NextResponse.json({ error: 'Alerta no encontrada' }, { status: 404 })
        }

        // Only victim or counterpart can resolve/cancel
        if (alert.victimId !== session.user.id && alert.counterpartId !== session.user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }

        const newStatus = action === 'resolve' ? 'RESOLVED' : 'CANCELLED'

        await prisma.sOSAlert.update({
            where: { id: alertId },
            data: { status: newStatus }
        })

        // Add system message to chat
        await prisma.message.create({
            data: {
                chatId: alert.chatId,
                senderId: 'SYSTEM',
                content: action === 'resolve'
                    ? `✅ La alerta SOS ha sido marcada como resuelta por ${session.user.id === alert.victimId ? 'la víctima' : 'la contraparte'}.`
                    : `❌ La alerta SOS ha sido cancelada.`
            }
        })

        return NextResponse.json({ success: true, status: newStatus })
    } catch (error) {
        console.error('Error resolving SOS:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
