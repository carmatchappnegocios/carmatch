
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/appointments/[id]/safety-check
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

        const { id } = await params
        const { action } = await request.json()

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { chat: true }
        })

        if (!appointment) return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })

        if (appointment.chat.buyerId !== session.user.id && appointment.chat.sellerId !== session.user.id) {
            return NextResponse.json({ error: 'No tienes permiso para esta cita' }, { status: 403 })
        }

        if (!['STILL', 'FINISH', 'SOS'].includes(action)) {
            return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
        }

        if (action === 'STILL') {
            await prisma.appointment.update({
                where: { id },
                data: {
                    lastSafetyCheck: new Date(),
                    missedResponseCount: 0 // Resetear contador al responder
                }
            })
        } else if (action === 'FINISH') {
            await prisma.appointment.update({
                where: { id },
                data: {
                    status: 'FINISHED',
                    monitoringActive: false
                }
            })
        } else if (action === 'SOS') {
            // Activar protocolo SOS - crear SOSAlert real
            const chat = await prisma.chat.findUnique({
                where: { id: appointment.chatId },
                include: { buyer: true, seller: true }
            })
            
            if (chat) {
                const isBuyer = chat.buyerId === session.user.id
                const victim = isBuyer ? chat.buyer : chat.seller
                const counterpart = isBuyer ? chat.seller : chat.buyer

                await prisma.sOSAlert.create({
                    data: {
                        victimId: victim.id,
                        counterpartId: counterpart.id,
                        chatId: appointment.chatId,
                        appointmentId: id,
                        victimLat: victim.lastLatitude,
                        victimLng: victim.lastLongitude,
                        counterpartLat: counterpart.lastLatitude,
                        counterpartLng: counterpart.lastLongitude,
                        status: 'ACTIVE',
                        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
                    }
                })
            }

            await prisma.appointment.update({
                where: { id },
                data: {
                    status: 'EMERGENCY',
                    monitoringActive: false
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in safety check response:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
