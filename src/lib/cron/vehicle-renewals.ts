// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { prisma } from '@/lib/db'

export async function processVehicleRenewals() {
    const now = new Date()
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

    // Buscar vehículos próximos a expirar o ya expirados
    const vehicles = await prisma.vehicle.findMany({
        where: {
            expiresAt: {
                lte: twoDaysFromNow
            }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    credits: true
                }
            },
            favorites: {
                where: {
                    createdAt: {
                        gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            }
        }
    })

    let autoRenewed = 0
    let expiredDueToNoCredits = 0
    let notificationsSent = 0

    for (const vehicle of vehicles) {
        // 🔥 FIX CRÍTICO: No saltar vehículos solo porque no estén activos
        // Necesitamos procesar TODOS los vehículos que tienen expiresAt
        if (!vehicle.expiresAt) continue

        const daysLeft = Math.ceil((vehicle.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const hasExpired = daysLeft < 0
        const aboutToExpire = daysLeft >= 0 && daysLeft <= 2

        // Solo procesar vehículos ACTIVOS para renovación/expiración
        const isActive = vehicle.status === 'ACTIVE'

        // AUTO-RENOVACIÓN AUTOMÁTICA SI EXPIRA
        if (hasExpired || daysLeft === 0) {
            const user = vehicle.user

            // Solo intentar renovar si está activo
            if (!isActive) {
                console.log(`⏭️ Vehículo ${vehicle.id} ya está ${vehicle.status}, ignorando expiración`)
                continue
            }

            if (user.credits >= 1) {
                // TIENE CRÉDITOS → AUTO-RENOVAR por 1 MES
                const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: user.id },
                        data: { credits: { decrement: 1 } }
                    }),
                    prisma.vehicle.update({
                        where: { id: vehicle.id },
                        data: {
                            status: 'ACTIVE',
                            expiresAt: newExpiresAt
                        }
                    })
                ])

                // Notificación de renovación exitosa
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: 'VEHICLE_AUTO_RENEWED',
                        title: '✅ Vehículo renovado automáticamente',
                        message: `Tu vehículo "${vehicle.title}" se renovó automáticamente por 30 días más. Créditos restantes: ${user.credits - 1}`,
                        link: `/vehicle/${vehicle.id}`,
                        metadata: {
                            vehicleId: vehicle.id,
                            vehicleTitle: vehicle.title,
                            creditsUsed: 1,
                            creditsRemaining: user.credits - 1,
                            newExpiresAt: newExpiresAt.toISOString()
                        }
                    }
                })

                console.log(`✅ Auto-renovado: ${vehicle.title} (${vehicle.id})`)
                autoRenewed++
            } else {
                // SIN CRÉDITOS → Desactivar + Notificación con STATS
                await prisma.vehicle.update({
                    where: { id: vehicle.id },
                    data: { status: 'INACTIVE' }
                })

                // Calcular estadísticas reales
                const totalFavorites = vehicle.favorites.length
                const estimatedInterest = Math.floor(totalFavorites * 0.2)
                const potentialOffers = estimatedInterest * parseFloat(vehicle.price.toString()) * 0.8

                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: 'VEHICLE_EXPIRED_NO_CREDITS',
                        title: '⚠️ Vehículo desactivado - Compra créditos',
                        message: `Tu vehículo "${vehicle.title}" se desactivó por falta de créditos.\n\n📊 Últimos 30 días:\n• ${totalFavorites} favoritos\n• ~${estimatedInterest} personas interesadas\n• Est. $${potentialOffers.toFixed(0)} en ofertas potenciales\n\n💡 Reactívalo con 1 crédito/mes y sigue recibiendo ofertas.`,
                        link: '/profile?tab=credits',
                        metadata: {
                            vehicleId: vehicle.id,
                            vehicleTitle: vehicle.title,
                            stats: {
                                favorites: totalFavorites,
                                estimatedInterest: estimatedInterest,
                                potentialOffers: potentialOffers,
                                period: '30 days'
                            },
                            action: 'buy_credits'
                        }
                    }
                })

                console.log(`❌ Expirado sin créditos: ${vehicle.title} (${vehicle.id})`)
                expiredDueToNoCredits++
            }
        } else if (aboutToExpire && daysLeft === 2 && isActive) {
            // Notificación preventiva 2 días antes (solo para vehículos activos)
            const existingNotif = await prisma.notification.findFirst({
                where: {
                    userId: vehicle.userId,
                    type: 'VEHICLE_EXPIRES_2_DAYS',
                    metadata: {
                        path: ['vehicleId'],
                        equals: vehicle.id
                    },
                    createdAt: {
                        gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
                    }
                }
            })

            if (!existingNotif) {
                const userHasCredits = vehicle.user.credits >= 1

                await prisma.notification.create({
                    data: {
                        userId: vehicle.userId,
                        type: 'VEHICLE_EXPIRES_2_DAYS',
                        title: userHasCredits ? '🔄 Próxima renovación automática' : '⏰ Sin créditos - Compra ahora',
                        message: userHasCredits
                            ? `Tu vehículo "${vehicle.title}" se renovará automáticamente en 2 días (1 crédito). Créditos disponibles: ${vehicle.user.credits}`
                            : `Tu vehículo "${vehicle.title}" expira en 2 días pero no tienes créditos. Compra ahora para renovación automática.`,
                        link: userHasCredits ? `/vehicle/${vehicle.id}` : '/profile?tab=credits',
                        metadata: {
                            vehicleId: vehicle.id,
                            vehicleTitle: vehicle.title,
                            daysLeft: 2,
                            willAutoRenew: userHasCredits
                        }
                    }
                })

                console.log(`🔔 Notificación 2 días: ${vehicle.title} (${vehicle.id})`)
                notificationsSent++
            }
        }
    }

    return {
        autoRenewed,
        expiredDueToNoCredits,
        notificationsSent
    }
}
