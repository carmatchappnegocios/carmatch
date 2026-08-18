import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// PATCH: Actualizar una reseña (solo el autor)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { id } = await params
        const { rating, comment } = await request.json()

        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return NextResponse.json({ error: 'El rating debe ser entre 1 y 5' }, { status: 400 })
        }

        // Verificar que la reseña existe y pertenece al usuario
        const existingReview = await prisma.businessReview.findUnique({
            where: { id }
        })

        if (!existingReview) {
            return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 })
        }

        if (existingReview.userId !== session.user.id) {
            return NextResponse.json({ error: 'No autorizado para editar esta reseña' }, { status: 403 })
        }

        const updated = await prisma.businessReview.update({
            where: { id },
            data: {
                ...(rating !== undefined && { rating }),
                ...(comment !== undefined && { comment: comment || null })
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

    } catch (error) {
        console.error('Error updating review:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// DELETE: Eliminar una reseña (solo el autor)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { id } = await params

        // Verificar que la reseña existe y pertenece al usuario
        const existingReview = await prisma.businessReview.findUnique({
            where: { id }
        })

        if (!existingReview) {
            return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 })
        }

        if (existingReview.userId !== session.user.id) {
            return NextResponse.json({ error: 'No autorizado para eliminar esta reseña' }, { status: 403 })
        }

        await prisma.businessReview.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error deleting review:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
