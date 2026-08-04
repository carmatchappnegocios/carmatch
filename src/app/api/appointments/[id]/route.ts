// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendPushToUser } from '@/lib/pushService'
import { upsertNotification, NotificationType } from '@/lib/notifications-service'

// PUT /api/appointments/[id] - Actualizar estado de la cita
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

        const { id } = await params
        const { status } = await request.json()

        // Verificar vehículo activo antes de permitir cambios de estado (Excepto CANCELLED quizás, pero mejor bloquear todo si el carro ya no está)
        const checkAppointment = await prisma.appointment.findUnique({
            where: { id },
            include: { chat: { include: { vehicle: true } } }
        })

        if (!checkAppointment || checkAppointment.chat.vehicle.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'El anuncio ya no está activo. No se pueden realizar cambios en la cita.' }, { status: 410 })
        }

        const isParticipant =
            checkAppointment.chat.buyerId === session.user.id ||
            checkAppointment.chat.sellerId === session.user.id
        if (!isParticipant) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }

        const allowedStatuses = ['ACCEPTED', 'REJECTED', 'CANCELLED', 'PENDING', 'COMPLETED']
        if (!status || !allowedStatuses.includes(status)) {
            return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status },
            include: {
                chat: {
                    include: { vehicle: true }
                }
            }
        })

        // Notificar al otro usuario
        const receiverId = appointment.proposerId === session.user.id
            ? (appointment.chat.buyerId === session.user.id ? appointment.chat.sellerId : appointment.chat.buyerId)
            : appointment.proposerId

        const statusLabel = status === 'ACCEPTED' ? 'aceptado' : status === 'REJECTED' ? 'rechazado' : status === 'CANCELLED' ? 'cancelado' : 'actualizado'
        const statusIcon = status === 'ACCEPTED' ? '✅' : status === 'REJECTED' ? '❌' : '📅'

        // Map status to valid NotificationType
        const notificationType = status === 'ACCEPTED' ? 'APPOINTMENT_ACCEPTED'
            : status === 'REJECTED' ? 'APPOINTMENT_REJECTED'
            : 'APPOINTMENT_MODIFIED'

        // 1. Notificación Interna
        await upsertNotification({
            userId: receiverId,
            type: notificationType,
            title: `Cita ${statusLabel}`,
            message: `${session.user.name} ha ${statusLabel} la cita para el vehículo ${appointment.chat.vehicle.title}`,
            link: `/messages/${appointment.chatId}?appointmentId=${id}`,
            metadata: { appointmentId: id, chatId: appointment.chatId }
        })

        // 2. Notificación Push
        await sendPushToUser(receiverId, {
            title: `${statusIcon} Cita ${statusLabel}`,
            body: `${session.user.name} ha ${statusLabel} tu propuesta de reunión.`,
            url: `/messages/${appointment.chatId}?appointmentId=${id}`,
            tag: `appointment-update-${id}`
        })

        return NextResponse.json(appointment)
    } catch (error) {
        console.error('Error actualizando estado de cita:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// PATCH /api/appointments/[id] - Editar detalles de la cita
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

        const { id } = await params
        const body = await request.json()
        const { date, location, address, latitude, longitude } = body

        // Verificar propiedad de la cita a través del chat
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { chat: true }
        })

        if (!appointment) return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })

        if (appointment.chat.buyerId !== session.user.id && appointment.chat.sellerId !== session.user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }

        // Bloquear edición si el vehículo no está activo
        const chatWithVehicle = await prisma.chat.findUnique({
            where: { id: appointment.chatId },
            include: { vehicle: true }
        })

        if (chatWithVehicle?.vehicle?.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'No se puede editar la cita porque el vehículo no está activo.' }, { status: 410 })
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: {
                date: date ? new Date(date) : undefined,
                location: location || undefined,
                address: address || undefined,
                latitude: latitude !== undefined ? latitude : undefined,
                longitude: longitude !== undefined ? longitude : undefined,
                // 🔥 Lógica de Justicia: Al editar, la cita vuelve a estar pendiente 
                // para que el OTRO usuario la apruebe.
                status: 'PENDING',
                proposerId: session.user.id
            },
            include: {
                chat: {
                    include: { vehicle: true }
                }
            }
        })

        // Notificar al otro usuario del cambio (que ahora debe aprobar)
        const receiverId = updatedAppointment.chat.buyerId === session.user.id
            ? updatedAppointment.chat.sellerId
            : updatedAppointment.chat.buyerId

        await upsertNotification({
            userId: receiverId,
            type: 'APPOINTMENT_MODIFIED',
            title: 'Cita modificada',
            message: `${session.user.name} ha propuesto cambios en la cita. Por favor, revísalos y aprueba si estás de acuerdo.`,
            link: `/messages/${updatedAppointment.chatId}?appointmentId=${id}`,
            metadata: { appointmentId: id, chatId: updatedAppointment.chatId }
        })

        await sendPushToUser(receiverId, {
            title: '🔄 Cambios en la cita',
            body: `${session.user.name} modificó la reunión. Requiere tu aprobación.`,
            url: `/messages/${updatedAppointment.chatId}?appointmentId=${id}`
        })

        return NextResponse.json(updatedAppointment)

    } catch (error) {
        console.error('Error actualizando detalles de cita:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
