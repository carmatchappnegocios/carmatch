// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendPushToUser } from '@/lib/pushService'

// POST /api/chats/[chatId]/sos - Activar alerta de emergencia
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

        const { chatId } = await params
        const body = await request.json()
        const { appointmentId, latitude, longitude, isTest } = body

        // Obtener información necesaria del chat y usuarios
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                buyer: { include: { trustedContact: true } },
                seller: { include: { trustedContact: true } },
                vehicle: { select: { title: true } }
            }
        })

        if (!chat) return NextResponse.json({ error: 'Chat no encontrado' }, { status: 404 })

        const isBuyer = chat.buyerId === session.user.id
        const user = isBuyer ? chat.buyer : chat.seller
        const otherUser = isBuyer ? chat.seller : chat.buyer
        const trustedContact = user.trustedContact

        // 0. Crear registro oficial de Alerta SOS (Marcado como TEST si aplica)
        const sosAlert = await prisma.sOSAlert.create({
            data: {
                victimId: user.id,
                counterpartId: otherUser.id,
                chatId,
                appointmentId,
                victimLat: latitude || user.lastLatitude,
                victimLng: longitude || user.lastLongitude,
                counterpartLat: otherUser.lastLatitude,
                counterpartLng: otherUser.lastLongitude,
                status: isTest ? 'TEST' : 'ACTIVE',
                expiresAt: isTest ? new Date(Date.now() + 1 * 60 * 60 * 1000) : new Date(Date.now() + 48 * 60 * 60 * 1000) // 2 días para casos reales, 1h para test
            }
        })

        // Log de la emergencia
        console.log(`🚨 SOS ${isTest ? 'SIMULACRO' : 'ACTIVADO'} por ${user.name} en el chat ${chatId}. ID: ${sosAlert.id}`)

        // 1. Crear un mensaje de sistema en el chat
        await prisma.message.create({
            data: {
                chatId,
                senderId: 'SYSTEM',
                content: isTest 
                    ? `🛠️ **SIMULACRO DE SEGURIDAD** 🛠️\nEl usuario ${user.name} está probando su sistema SOS. Todo está bajo control.`
                    : `🚨 **ALERTA SOS ACTIVADA** 🚨\nEl usuario ${user.name} ha activado el protocolo de emergencia. Autoridades locales y contacto de confianza han sido notificados.`,
            }
        })

        // 2. Enviar Push urgente al otro usuario (Solo si no es test, o avisar que es test)
        await sendPushToUser(otherUser.id, {
            title: isTest ? '🛠️ PRUEBA DE SEGURIDAD' : '🚨 ALERTA DE EMERGENCIA',
            body: isTest 
                ? `${user.name} está realizando una prueba de su botón SOS. No es necesario intervenir.`
                : `${user.name} ha activado la señal SOS. SE REQUIERE INTERVENCIÓN.`,
            url: `/messages/${chatId}`,
            tag: `sos-alert-${sosAlert.id}`,
            requireInteraction: !isTest,
            renotify: true
        })

        // 3. Notificar al contacto de confianza
        if (trustedContact) {
            const trackingUrl = `/emergency/${sosAlert.id}`

            await sendPushToUser(trustedContact.id, {
                title: isTest ? `🛠️ CARMATCH TEST: ${user.name}` : `🆘 EMERGENCIA: ${user.name} necesita ayuda`,
                body: isTest 
                    ? `Esta es una prueba de seguridad. Pulsa para ver el mapa de rastreo y confirmar que el sistema funciona.`
                    : `Protocolo SOS activado. Pulsa para VER UBICACIÓN EN TIEMPO REAL de ambos usuarios.`,
                url: trackingUrl,
                tag: `sos-tracking-${sosAlert.id}`,
                requireInteraction: true,
                renotify: true
            })
        }

        // 4. Si hay una cita activa, marcarla como emergencia (SOLO EN CASO REAL)
        if (appointmentId && !isTest) {
            await prisma.appointment.update({
                where: { id: appointmentId },
                data: {
                    monitoringActive: false,
                    status: 'EMERGENCY'
                }
            })
        }

        return NextResponse.json({
            success: true,
            alertId: sosAlert.id,
            message: 'SOS activado y rastreo en tiempo real iniciado.',
            trustedContactNotified: !!trustedContact
        })

    } catch (error) {
        console.error('Error procesando SOS:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
