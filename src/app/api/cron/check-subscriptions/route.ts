
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * CRON JOB: Auto-Renovación de Suscripciones
 */
export async function GET(request: Request) {
    // 🔐 Seguridad básica: Validar token de cron (en producción usar headers como Authorization)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const now = new Date()

        // 1. Buscar vehículos expirados que todavía están marcados como ACTIVOS
        const expiredVehicles = await prisma.vehicle.findMany({
            where: {
                status: 'ACTIVE',
                expiresAt: {
                    lt: now
                }
            },
            include: {
                user: true
            },
            take: 100
        })

        if (expiredVehicles.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No hay vehículos expirados pendientes de procesar.'
            })
        }

        const results = {
            renewed: 0,
            deactivated: 0
        }

        for (const vehicle of expiredVehicles) {
            const user = vehicle.user

            if (user.credits >= 1) {
                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: user.id },
                        data: { credits: { decrement: 1 } }
                    }),
                    prisma.vehicle.update({
                        where: { id: vehicle.id },
                        data: {
                            expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                            updatedAt: now
                        }
                    }),
                    prisma.creditTransaction.create({
                        data: {
                            userId: user.id,
                            amount: -1,
                            description: `Renovación mensual: ${vehicle.brand} ${vehicle.model}`,
                            relatedId: vehicle.id,
                            details: { type: 'AUTO_RENEWAL', vehicleTitle: vehicle.title }
                        }
                    })
                ])
                results.renewed++
            } else {
                await prisma.vehicle.update({
                    where: { id: vehicle.id },
                    data: {
                        status: 'INACTIVE',
                    }
                })
                results.deactivated++
            }
        }

        return NextResponse.json({
            success: true,
            processed: expiredVehicles.length,
            details: results
        })

    } catch (error) {
        console.error('Error en Cron de Renovación:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
