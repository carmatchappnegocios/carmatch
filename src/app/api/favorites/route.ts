// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notifyRealFavorite } from '@/lib/realNotifications'

/**
 * GET /api/favorites
 * Obtiene la lista de vehículos favoritos del usuario actual
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        // Obtener favoritos con detalles del vehículo
        const favorites = await prisma.favorite.findMany({
            where: {
                userId: user.id
            },
            include: {
                vehicle: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Mapear para devolver solo los vehículos (con fecha de favorited si es necesario)
        const favoriteVehicles = favorites.map(fav => ({
            ...fav.vehicle,
            favoritedAt: fav.createdAt
        }))

        return NextResponse.json({ favorites: favoriteVehicles })

    } catch (error) {
        console.error('Error al obtener favoritos:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

/**
 * POST /api/favorites
 * Toggle favorite: Si existe lo borra, si no existe lo crea
 * Body: { vehicleId: string }
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { vehicleId, action = 'toggle' } = body

        if (!vehicleId) {
            return NextResponse.json({ error: 'Vehicle ID requerido' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        // 🛡️ Race condition fix: Use transaction with atomic operations
        if (action === 'toggle' || action === 'add') {
            try {
                // Try to create - if unique constraint fails, it means it already exists
                await prisma.favorite.create({
                    data: {
                        userId: user.id,
                        vehicleId
                    }
                })

                // Notificación al dueño del vehículo
                await notifyRealFavorite(user.id, vehicleId, 'vehicle')

                return NextResponse.json({
                    isFavorited: true,
                    message: 'Agregado a favoritos'
                })
            } catch (error: unknown) {
                // Unique constraint violation = already favorited
                if (error instanceof Error && error.message.includes('Unique constraint')) {
                    if (action === 'add') {
                        return NextResponse.json({
                            isFavorited: true,
                            message: 'Ya está en favoritos'
                        })
                    }
                    // Toggle: remove it
                    await prisma.favorite.deleteMany({
                        where: {
                            userId: user.id,
                            vehicleId
                        }
                    })
                    return NextResponse.json({
                        isFavorited: false,
                        message: 'Eliminado de favoritos'
                    })
                }
                throw error
            }
        } else if (action === 'remove') {
            const deleted = await prisma.favorite.deleteMany({
                where: {
                    userId: user.id,
                    vehicleId
                }
            })
            return NextResponse.json({
                isFavorited: false,
                message: deleted.count > 0 ? 'Eliminado de favoritos' : 'No estaba en favoritos'
            })
        }

    } catch (error) {
        console.error('Error al gestionar favorito:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
