// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { upsertNotification } from '@/lib/notifications-service'

// Helper function to process vehicle renewals
async function processVehicleRenewals(now: Date) {
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
        if (!vehicle.expiresAt) continue

        const daysLeft = Math.ceil((vehicle.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const hasExpired = daysLeft < 0
        const aboutToExpire = daysLeft >= 0 && daysLeft <= 2
        const isActive = vehicle.status === 'ACTIVE'

        if (hasExpired || daysLeft === 0) {
            const user = vehicle.user
            if (!isActive) continue

            if (user.credits >= 1) {
                const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: user.id },
                        data: { credits: { decrement: 1 } }
                    }),
                    prisma.vehicle.update({
                        where: { id: vehicle.id },
                        data: { status: 'ACTIVE', expiresAt: newExpiresAt }
                    })
                ])
                await upsertNotification({
                    userId: user.id,
                    type: 'VEHICLE_AUTO_RENEWED',
                    title: '✅ Vehículo renovado automáticamente',
                    message: `Tu vehículo "${vehicle.title}" se renovó automáticamente por 30 días más. Créditos restantes: ${user.credits - 1}`,
                    link: `/vehicle/${vehicle.id}`,
                    vehicleId: vehicle.id,
                    metadata: {
                        vehicleTitle: vehicle.title,
                        creditsUsed: 1,
                        creditsRemaining: user.credits - 1,
                        newExpiresAt: newExpiresAt.toISOString()
                    }
                })
                autoRenewed++
            } else {
                await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'INACTIVE' } })
                const totalFavorites = vehicle.favorites.length
                const estimatedInterest = Math.floor(totalFavorites * 0.2)
                const potentialOffers = estimatedInterest * parseFloat(vehicle.price.toString()) * 0.8
                await upsertNotification({
                    userId: user.id,
                    type: 'VEHICLE_EXPIRED_NO_CREDITS',
                    title: '⚠️ Vehículo desactivado - Compra créditos',
                    message: `Tu vehículo "${vehicle.title}" se desactivó por falta de créditos.\n\n📊 Últimos 30 días:\n• ${totalFavorites} favoritos\n• ~${estimatedInterest} personas interesadas\n• Est. $${potentialOffers.toFixed(0)} en ofertas potenciales\n\n💡 Reactívalo con 1 crédito/mes y sigue recibiendo ofertas.`,
                    link: '/profile?tab=credits',
                    vehicleId: vehicle.id,
                    metadata: {
                        vehicleTitle: vehicle.title,
                        stats: { favorites: totalFavorites, estimatedInterest, potentialOffers, period: '30 days' },
                        action: 'buy_credits'
                    }
                })
                expiredDueToNoCredits++
            }
        } else if (aboutToExpire && daysLeft === 2 && isActive) {
            const existingNotif = await prisma.notification.findFirst({
                where: {
                    userId: vehicle.userId,
                    type: 'VEHICLE_EXPIRES_2_DAYS',
                    metadata: { path: ['vehicleId'], equals: vehicle.id },
                    createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
                }
            })
            if (!existingNotif) {
                const userHasCredits = vehicle.user.credits >= 1
                await upsertNotification({
                    userId: vehicle.userId,
                    type: 'VEHICLE_EXPIRES_2_DAYS',
                    title: userHasCredits ? '🔄 Próxima renovación automática' : '⏰ Sin créditos - Compra ahora',
                    message: userHasCredits
                        ? `Tu vehículo "${vehicle.title}" se renovará automáticamente en 2 días (1 crédito). Créditos disponibles: ${vehicle.user.credits}`
                        : `Tu vehículo "${vehicle.title}" expira en 2 días pero no tienes créditos. Compra ahora para renovación automática.`,
                    link: userHasCredits ? `/vehicle/${vehicle.id}` : '/profile?tab=credits',
                    vehicleId: vehicle.id,
                    metadata: { willAutoRenew: userHasCredits }
                })
                notificationsSent++
            }
        }
    }
    return { autoRenewed, expiredDueToNoCredits, notificationsSent }
}

// Helper function to process business renewals
async function processBusinessRenewals(now: Date) {
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const businesses = await prisma.business.findMany({
        where: { expiresAt: { lte: twoDaysFromNow } },
        include: {
            user: { select: { id: true, name: true, email: true, credits: true } },
            favorites: { where: { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } }
        }
    })

    let autoRenewed = 0
    let expiredDueToNoCredits = 0
    let notificationsSent = 0

    for (const business of businesses) {
        if (!business.expiresAt) continue
        const daysLeft = Math.ceil((business.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const hasExpired = daysLeft < 0
        const aboutToExpire = daysLeft >= 0 && daysLeft <= 2
        const isActive = business.isActive

        if (hasExpired || daysLeft === 0) {
            const user = business.user
            if (!isActive) continue

            if (user.credits >= 1) {
                const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
                await prisma.$transaction([
                    prisma.user.update({ where: { id: user.id }, data: { credits: { decrement: 1 } } }),
                    prisma.business.update({ where: { id: business.id }, data: { isActive: true, expiresAt: newExpiresAt } })
                ])
                await upsertNotification({
                    userId: user.id,
                    type: 'BUSINESS_AUTO_RENEWED',
                    title: '✅ Negocio renovado automáticamente',
                    message: `Tu negocio "${business.name}" se renovó automáticamente por 30 días más. Créditos restantes: ${user.credits - 1}`,
                    link: `/my-businesses?businessId=${business.id}`,
                    businessId: business.id,
                    metadata: { businessName: business.name, creditsUsed: 1, creditsRemaining: user.credits - 1, newExpiresAt: newExpiresAt.toISOString() }
                })
                autoRenewed++
            } else {
                await prisma.business.update({ where: { id: business.id }, data: { isActive: false } })
                const totalFavorites = business.favorites.length
                const estimatedViews = totalFavorites * 5
                await upsertNotification({
                    userId: user.id,
                    type: 'BUSINESS_EXPIRED_NO_CREDITS',
                    title: '⚠️ Negocio desactivado - Compra créditos',
                    message: `Tu negocio "${business.name}" se desactivó por falta de créditos.\n\n📊 Últimos 30 días:\n• ${totalFavorites} favoritos\n• ~${estimatedViews} visitas estimadas\n\n💡 Reactívalo con 1 crédito/mes y sigue atrayendo clientes.`,
                    link: '/profile?tab=credits',
                    businessId: business.id,
                    metadata: { businessName: business.name, stats: { favorites: totalFavorites, estimatedViews, period: '30 days' }, action: 'buy_credits' }
                })
                expiredDueToNoCredits++
            }
        } else if (aboutToExpire && daysLeft === 2 && isActive) {
            const existingNotif = await prisma.notification.findFirst({
                where: {
                    userId: business.userId,
                    type: 'BUSINESS_EXPIRES_2_DAYS',
                    metadata: { path: ['businessId'], equals: business.id },
                    createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
                }
            })
            if (!existingNotif) {
                const userHasCredits = business.user.credits >= 1
                await upsertNotification({
                    userId: business.userId,
                    type: 'BUSINESS_EXPIRES_2_DAYS',
                    title: userHasCredits ? '🔄 Próxima renovación de negocio' : '⏰ Sin créditos - Compra ahora',
                    message: userHasCredits
                        ? `Tu negocio "${business.name}" se renovará automáticamente en 2 días (1 crédito). Créditos disponibles: ${business.user.credits}`
                        : `Tu negocio "${business.name}" expira en 2 días pero no tienes créditos. Compra ahora para renovación automática.`,
                    link: userHasCredits ? `/my-businesses?businessId=${business.id}` : '/profile?tab=credits',
                    businessId: business.id,
                    metadata: { willAutoRenew: userHasCredits }
                })
                notificationsSent++
            }
        }
    }
    return { autoRenewed, expiredDueToNoCredits, notificationsSent }
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log("🦾 Iniciando mantenimiento diario unificado...")
        const now = new Date()

        const vehicleResults = await processVehicleRenewals(now)
        console.log("🚗 Resultados Vehículos:", vehicleResults)

        const businessResults = await processBusinessRenewals(now)
        console.log("🏢 Resultados Negocios:", businessResults)

        return NextResponse.json({
            success: true,
            vehicles: vehicleResults,
            businesses: businessResults,
            timestamp: now.toISOString()
        })

    } catch (error) {
        console.error('Error in daily maintenance cron:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
