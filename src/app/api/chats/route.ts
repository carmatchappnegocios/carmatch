// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/chats - Obtener todos los chats del usuario
export async function GET(request: NextRequest) {
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

        // Obtener chats donde el usuario es comprador o vendedor
        const chats = await prisma.chat.findMany({
            where: {
                OR: [
                    { buyerId: user.id },
                    { sellerId: user.id }
                ]
            },
            include: {
                vehicle: {
                    select: {
                        id: true,
                        title: true,
                        brand: true,
                        model: true,
                        year: true,
                        price: true,
                        images: true,
                        city: true,
                        status: true
                    }
                },
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        })

        // Marcar cuál es el "otro" usuario (con quien hablas)
        const chatIds = chats.map(c => c.id)
        const unreadCounts = await prisma.message.groupBy({
            by: ['chatId'],
            where: {
                chatId: { in: chatIds },
                isRead: false,
                senderId: { not: user.id }
            },
            _count: { id: true }
        })
        const unreadMap = new Map(unreadCounts.map(u => [u.chatId, u._count.id]))

        const chatsWithOther = chats
            .filter(chat => chat.messages.length > 0)
            .map(chat => {
                const isBuyer = chat.buyerId === user.id
                const otherUser = isBuyer ? chat.seller : chat.buyer
                const lastMessage = chat.messages[0]

                return {
                    ...chat,
                    otherUser,
                    isBuyer,
                    lastMessage,
                    unreadCount: unreadMap.get(chat.id) || 0
                }
            })

        return NextResponse.json(chatsWithOther)

    } catch (error) {
        console.error('Error al obtener chats:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// POST /api/chats - Crear o obtener un chat existente
export async function POST(request: NextRequest) {
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

        const body = await request.json()
        const { vehicleId } = body

        if (!vehicleId) {
            return NextResponse.json({ error: 'vehicleId es requerido' }, { status: 400 })
        }

        // Verificar que el vehículo existe
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId }
        })

        if (!vehicle) {
            return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
        }

        // No puedes chatear contigo mismo
        if (vehicle.userId === user.id) {
            return NextResponse.json({ error: 'No puedes chatear contigo mismo' }, { status: 400 })
        }

        // 🛡️ REGLA CARMATCH: No se puede iniciar contacto si el vehículo no está activo
        if (vehicle.status !== 'ACTIVE') {
            return NextResponse.json({
                error: 'Este vehículo ya no está disponible para contacto.',
                status: vehicle.status
            }, { status: 403 })
        }

        // Buscar chat existente o crear uno nuevo
        let chat = await prisma.chat.findUnique({
            where: {
                vehicleId_buyerId: {
                    vehicleId,
                    buyerId: user.id
                }
            },
            include: {
                vehicle: true,
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        city: true
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        city: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            }
        })

        if (!chat) {
            // Crear nuevo chat
            chat = await prisma.chat.create({
                data: {
                    vehicleId,
                    buyerId: user.id,
                    sellerId: vehicle.userId
                },
                include: {
                    vehicle: true,
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            city: true
                        }
                    },
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            city: true
                        }
                    },
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true
                                }
                            }
                        }
                    }
                }
            })

            // 📊 REGISTRAR EVENTO: Chat creado
            try {
                const { trackChatEvent } = await import('@/lib/tracking')
                await trackChatEvent({
                    eventType: 'CHAT_CREATED',
                    userId: user.id,
                    chatId: chat.id,
                    metadata: {
                        vehicleId,
                        vehicleTitle: vehicle.title,
                        sellerId: vehicle.userId
                    }
                })
            } catch {
                // Fail silently
            }
        }

        return NextResponse.json(chat)

    } catch (error) {
        console.error('Error al crear/obtener chat:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
