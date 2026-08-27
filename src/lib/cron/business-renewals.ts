
import { prisma } from '@/lib/db'

export async function processBusinessRenewals() {
    const now = new Date()
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

    // Buscar negocios próximos a expirar o ya expirados
    const businesses = await prisma.business.findMany({
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

    for (const business of businesses) {
        if (!business.expiresAt) continue

        const daysLeft = Math.ceil((business.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const hasExpired = daysLeft < 0
        const aboutToExpire = daysLeft >= 0 && daysLeft <= 2
        const isActive = business.isActive

        // AUTO-RENOVACIÓN SI EXPIRA
        if (hasExpired || daysLeft === 0) {
            const user = business.user

            // Solo intentar renovar si está activo
            if (!isActive) {
                console.log(`⏭️ Negocio ${business.id} ya está inactivo, ignorando expiración`)
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
                    prisma.creditTransaction.create({
                        data: {
                            userId: user.id,
                            amount: -1,
                            description: `Auto-renovación de negocio: ${business.name}`,
                            relatedId: business.id,
                            details: { action: 'AUTO_RENEW_BUSINESS', businessId: business.id }
                        }
                    }),
                    prisma.business.update({
                        where: { id: business.id },
                        data: {
                            isActive: true,
                            expiresAt: newExpiresAt
                        }
                    })
                ])

                // Notificación de renovación exitosa
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: 'BUSINESS_AUTO_RENEWED',
                        title: '✅ Negocio renovado automáticamente',
                        message: `Tu negocio "${business.name}" se renovó automáticamente por 30 días más. Créditos restantes: ${user.credits - 1}`,
                        link: `/business/${business.id}`,
                        metadata: {
                            businessId: business.id,
                            businessName: business.name,
                            creditsUsed: 1,
                            creditsRemaining: user.credits - 1,
                            newExpiresAt: newExpiresAt.toISOString()
                        }
                    }
                })

                console.log(`✅ Negocio auto-renovado: ${business.name} (${business.id})`)
                autoRenewed++
            } else {
                // SIN CRÉDITOS → Desactivar
                await prisma.business.update({
                    where: { id: business.id },
                    data: { isActive: false }
                })

                // Calcular estadísticas
                const totalFavorites = business.favorites.length
                const estimatedViews = totalFavorites * 5 // Estimación: 1 favorito por cada 5 visitas

                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: 'BUSINESS_EXPIRED_NO_CREDITS',
                        title: '⚠️ Negocio desactivado - Compra créditos',
                        message: `Tu negocio "${business.name}" se desactivó por falta de créditos.\n\n📊 Últimos 30 días:\n• ${totalFavorites} favoritos\n• ~${estimatedViews} visitas estimadas\n\n💡 Reactívalo con 1 crédito/mes y sigue atrayendo clientes.`,
                        link: '/profile?tab=credits',
                        metadata: {
                            businessId: business.id,
                            businessName: business.name,
                            stats: {
                                favorites: totalFavorites,
                                estimatedViews: estimatedViews,
                                period: '30 days'
                            },
                            action: 'buy_credits'
                        }
                    }
                })

                console.log(`❌ Negocio expirado sin créditos: ${business.name} (${business.id})`)
                expiredDueToNoCredits++
            }
        } else if (aboutToExpire && daysLeft === 2 && isActive) {
            // Notificación preventiva 2 días antes
            const existingNotif = await prisma.notification.findFirst({
                where: {
                    userId: business.userId,
                    type: 'BUSINESS_EXPIRES_2_DAYS',
                    metadata: {
                        path: ['businessId'],
                        equals: business.id
                    },
                    createdAt: {
                        gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
                    }
                }
            })

            if (!existingNotif) {
                const userHasCredits = business.user.credits >= 1

                await prisma.notification.create({
                    data: {
                        userId: business.userId,
                        type: 'BUSINESS_EXPIRES_2_DAYS',
                        title: userHasCredits ? '🔄 Próxima renovación de negocio' : '⏰ Sin créditos - Compra ahora',
                        message: userHasCredits
                            ? `Tu negocio "${business.name}" se renovará automáticamente en 2 días (1 crédito). Créditos disponibles: ${business.user.credits}`
                            : `Tu negocio "${business.name}" expira en 2 días pero no tienes créditos. Compra ahora para renovación automática.`,
                        link: userHasCredits ? `/my-businesses?businessId=${business.id}` : '/profile?tab=credits',
                        metadata: {
                            businessId: business.id,
                            businessName: business.name,
                            daysLeft: 2,
                            willAutoRenew: userHasCredits
                        }
                    }
                })

                console.log(`🔔 Notificación negocio 2 días: ${business.name} (${business.id})`)
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
