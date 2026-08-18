// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendPushToUser } from '@/lib/pushService'
import { upsertNotification } from '@/lib/notifications-service'

// POST /api/chats/[chatId]/messages - Enviar un mensaje
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        const { chatId } = await params
        const body = await request.json()
        const { content } = body

        if (!content || content.trim() === '') {
            return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 })
        }

        if (content.length > 5000) {
            return NextResponse.json({ error: 'El mensaje no puede exceder 5000 caracteres' }, { status: 400 })
        }

        // Verificar que el chat existe y el usuario es parte de él
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: { vehicle: true }
        })

        if (!chat) {
            return NextResponse.json({ error: 'Chat no encontrado' }, { status: 404 })
        }

        if (chat.buyerId !== user.id && chat.sellerId !== user.id) {
            return NextResponse.json({ error: 'No tienes acceso a este chat' }, { status: 403 })
        }

        // Verificar que el vehículo sigue activo
        if (chat.vehicle.status !== 'ACTIVE') {
            return NextResponse.json({
                error: 'Este vehículo ya no está disponible. Posiblemente se vendió.',
                vehicleStatus: chat.vehicle.status
            }, { status: 410 }) // 410 Gone
        }

        // Crear el mensaje
        const message = await prisma.message.create({
            data: {
                chatId,
                senderId: user.id,
                content: content.trim()
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        })

        // Actualizar el timestamp del chat
        await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() }
        })

        // TODO: Crear notificación para el otro usuario
        const receiverId = chat.buyerId === user.id ? chat.sellerId : chat.buyerId

        // 📊 REGISTRAR EVENTO: Mensaje enviado
        try {
            const { trackChatEvent } = await import('@/lib/tracking')
            await trackChatEvent({
                eventType: 'MESSAGE_SENT',
                userId: user.id,
                chatId,
                metadata: {
                    vehicleId: chat.vehicleId,
                    messageLength: content.trim().length,
                    receiverId
                }
            })
        } catch {
            // Fail silently
        }

        await upsertNotification({
            userId: receiverId,
            fromUserId: user.id,
            type: 'NEW_MESSAGE',
            title: 'Nuevo mensaje',
            message: `${user.name} te envió un mensaje sobre ${chat.vehicle.title}`,
            link: `/messages/${chatId}`,
            metadata: {
                chatId,
                vehicleId: chat.vehicleId
            }
        })

        // 2. Enviar notificación Push (Sistema)
        await sendPushToUser(receiverId, {
            title: `Mensaje de ${user.name}`,
            body: content.length > 50 ? content.substring(0, 47) + '...' : content,
        })

        // 3. Emitir evento Socket.IO en tiempo real al chat room
        try {
            const io = (global as any).io
            if (io) {
                io.to(`chat:${chatId}`).emit('new-message', message)
                // También emitir al usuario receptor para actualizar la lista de chats
                io.to(`user:${receiverId}`).emit('chat-updated', {
                    chatId,
                    lastMessage: message,
                    vehicleId: chat.vehicleId
                })
            }
        } catch {
            // Socket.IO no disponible (Vercel serverless) — push notification es el fallback
        }

        return NextResponse.json(message)

    } catch (error) {
        console.error('Error al enviar mensaje:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}


// GET /api/chats/[chatId]/messages - Obtener mensajes de un chat
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        const { chatId } = await params

        // Check if we should mark messages as read (only when user opens chat actively)
        const markAsRead = request.nextUrl.searchParams.get('markAsRead') === 'true'

        // Verificar que el chat existe y el usuario es parte de él
        const chat = await prisma.chat.findUnique({
            where: { id: chatId }
        })

        if (!chat) {
            return NextResponse.json({ error: 'Chat no encontrado' }, { status: 404 })
        }

        if (chat.buyerId !== user.id && chat.sellerId !== user.id) {
            return NextResponse.json({ error: 'No tienes acceso a este chat' }, { status: 403 })
        }

        const messages = await prisma.message.findMany({
            where: {
                chatId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        })

        // Obtener citas (Appointments)
        const appointments = await prisma.appointment.findMany({
            where: { chatId }
        })

        // Combinar y ordenar cronológicamente
        let timeline = [
            ...messages.map(m => ({ ...m, type: 'MESSAGE' })),
            ...appointments.map(a => ({
                ...a,
                type: 'APPOINTMENT',
                senderId: a.proposerId,
                sender: messages.find(m => m.senderId === a.proposerId)?.sender || { id: a.proposerId, name: 'Usuario', image: null }
            }))
        ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        // Marcar mensajes como leídos (solo cuando el usuario abre el chat activamente)
        let unreadMessages = { count: 0 }
        if (markAsRead) {
            unreadMessages = await prisma.message.updateMany({
                where: {
                    chatId,
                    senderId: { not: user.id },
                    isRead: false
                },
                data: { isRead: true }
            })
        }

        // 📊 REGISTRAR EVENTO: Mensajes leídos (solo si había mensajes sin leer)
        if (unreadMessages.count > 0) {
            try {
                const { trackChatEvent } = await import('@/lib/tracking')
                await trackChatEvent({
                    eventType: 'MESSAGE_READ',
                    userId: user.id,
                    chatId,
                    metadata: {
                        messagesRead: unreadMessages.count
                    }
                })
            } catch {
                // Fail silently
            }
        }

        return NextResponse.json(timeline)

    } catch (error) {
        console.error('Error al obtener mensajes:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
