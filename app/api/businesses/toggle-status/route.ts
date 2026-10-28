
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, status } = body

        if (!id || !status) {
            return NextResponse.json({ error: 'ID and status required' }, { status: 400 })
        }

        // Verificar que el negocio pertenezca al usuario
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { businesses: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const business = user.businesses.find(b => b.id === id)

        if (!business) {
            return NextResponse.json({ error: 'Business not found or unauthorized' }, { status: 404 })
        }

        // Si está ACTIVANDO (INACTIVE → ACTIVE)
        if (status === 'ACTIVE' && business.isActive === false) {
            const now = new Date()

            // Verificar si ya expiró o nunca tuvo período
            const needsNewPeriod = !business.expiresAt || business.expiresAt < now

            if (needsNewPeriod) {
                // REQUIERE CRÉDITO - Nuevo período de 30 días
                // Use atomic transaction to prevent race conditions
                const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

                try {
                    await prisma.$transaction([
                        // Atomic: only decrement if credits >= 1
                        prisma.$executeRaw`UPDATE "User" SET credits = credits - 1 WHERE id = ${user.id} AND credits >= 1`,
                        prisma.creditTransaction.create({
                            data: {
                                userId: user.id,
                                amount: -1,
                                description: `Activación de negocio: ${business.name}`,
                                relatedId: id,
                                details: { action: 'ACTIVATE_BUSINESS', businessId: id }
                            }
                        }),
                        prisma.business.update({
                            where: { id },
                            data: {
                                isActive: true,
                                expiresAt: expiresAt
                            }
                        })
                    ])
                } catch {
                    return NextResponse.json({
                        error: 'Necesitas 1 crédito para activar este negocio',
                        needCredits: true
                    }, { status: 402 })
                }

                return NextResponse.json({
                    success: true,
                    creditsRemaining: user.credits - 1,
                    expiresAt: expiresAt
                })
            } else {
                // AÚN NO EXPIRÓ - Reactivar GRATIS (solo cambiar isActive)
                await prisma.business.update({
                    where: { id },
                    data: { isActive: true }
                })

                return NextResponse.json({
                    success: true,
                    message: 'Reactivado sin costo',
                    expiresAt: business.expiresAt
                })
            }
        }


        // Si está DESACTIVANDO → Sin costo, expiresAt NO cambia (tiempo sigue corriendo)
        await prisma.business.update({
            where: { id },
            data: { isActive: false }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error toggling status:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
