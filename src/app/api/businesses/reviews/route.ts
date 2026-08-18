import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET: Obtener reseñas de un negocio
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const businessId = searchParams.get('businessId')

        if (!businessId) {
            return NextResponse.json({ error: 'businessId es requerido' }, { status: 400 })
        }

        const reviews = await prisma.businessReview.findMany({
            where: { businessId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Calcular estadísticas
        const stats = await prisma.businessReview.aggregate({
            where: { businessId },
            _avg: { rating: true },
            _count: { rating: true }
        })

        // Distribución de estrellas
        const distribution = await prisma.businessReview.groupBy({
            by: ['rating'],
            where: { businessId },
            _count: { rating: true }
        })

        const distributionMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        distribution.forEach(d => {
            distributionMap[d.rating as keyof typeof distributionMap] = d._count.rating
        })

        return NextResponse.json({
            reviews,
            stats: {
                average: stats._avg.rating || 0,
                total: stats._count.rating || 0,
                distribution: distributionMap
            }
        })

    } catch (error) {
        console.error('Error fetching reviews:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// POST: Crear una reseña
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { businessId, rating, comment } = await request.json()

        if (!businessId || !rating) {
            return NextResponse.json({ error: 'businessId y rating son requeridos' }, { status: 400 })
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'El rating debe ser entre 1 y 5' }, { status: 400 })
        }

        // Verificar que el negocio existe
        const business = await prisma.business.findUnique({
            where: { id: businessId },
            select: { id: true, isActive: true, userId: true }
        })

        if (!business) {
            return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
        }

        if (!business.isActive) {
            return NextResponse.json({ error: 'Este negocio no está disponible' }, { status: 400 })
        }

        // No permitir que el dueño se reseñe a sí mismo
        if (business.userId === session.user.id) {
            return NextResponse.json({ error: 'No puedes reseñar tu propio negocio' }, { status: 400 })
        }

        // Verificar si ya existe una reseña de este usuario
        const existingReview = await prisma.businessReview.findUnique({
            where: {
                userId_businessId: {
                    userId: session.user.id,
                    businessId
                }
            }
        })

        if (existingReview) {
            // Actualizar reseña existente
            const updated = await prisma.businessReview.update({
                where: { id: existingReview.id },
                data: {
                    rating,
                    comment: comment || null
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    }
                }
            })
            return NextResponse.json(updated)
        }

        // Crear nueva reseña
        const review = await prisma.businessReview.create({
            data: {
                userId: session.user.id,
                businessId,
                rating,
                comment: comment || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        })

        return NextResponse.json(review, { status: 201 })

    } catch (error) {
        console.error('Error creating review:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
