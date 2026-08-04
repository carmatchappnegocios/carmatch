// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { upsertNotification } from '@/lib/notifications-service'

export async function GET(request: NextRequest) {
    try {
        // Verificar cron secret
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

        // Buscar negocios próximos a expirar o ya expirados
        const businesses = await prisma.business.findMany({
            where: {
                expiresAt: {
                    lte: twoDaysFromNow // Expiran en <= 2 días
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
                views: {
                    where: {
                        createdAt: {
                            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
                        }
                    }
                }
            }
        })

        let autoRenewed = 0
        let notificationsSent = 0
        let expiredDueToNoCredits = 0

        for (const business of businesses) {
            if (!business.expiresAt) continue

            const daysLeft = Math.ceil((business.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            const hasExpired = daysLeft < 0
            const aboutToExpire = daysLeft >= 0 && daysLeft <= 2

            // AUTO-RENOVACIÓN AUTOMÁTICA SI EXPIRA
            if (hasExpired || daysLeft === 0) {
                const user = business.user

                if (user.credits >= 1) {
                    // TIENE CRÉDITOS → AUTO-RENOVAR
                    const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: user.id },
                            data: { credits: { decrement: 1 } }
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
                    await upsertNotification({
                        userId: user.id,
                        type: 'MESSAGE_RECEIVED',
                        title: '✅ Negocio renovado automáticamente',
                        message: `Tu negocio "${business.name}" se renovó automáticamente por 30 días más. Créditos restantes: ${user.credits - 1}`,
                        link: `/my-businesses?businessId=${business.id}`,
                        businessId: business.id,
                        metadata: {
                            businessName: business.name,
                            creditsUsed: 1,
                            creditsRemaining: user.credits - 1,
                            newExpiresAt: newExpiresAt.toISOString()
                        }
                    })

                    autoRenewed++
                } else {
                    // SIN CRÉDITOS → Desactivar + Notificación con STATS
                    await prisma.business.update({
                        where: { id: business.id },
                        data: { isActive: false }
                    })

                    // Calcular estadísticas reales
                    const totalViews = business.views.length
                    const estimatedLeads = Math.floor(totalViews * 0.15) // 15% conversión
                    const potentialRevenue = estimatedLeads * 50 // $50 por lead estimado

                    await upsertNotification({
                        userId: user.id,
                        type: 'BUSINESS_EXPIRED_NO_CREDITS',
                        title: '⚠️ Negocio desactivado - Compra créditos',
                        message: `Tu negocio "${business.name}" se desactivó por falta de créditos.\n\n📊 Últimos 30 días:\n• ${totalViews} vistas\n• ~${estimatedLeads} clientes potenciales\n• Est. $${potentialRevenue} en oportunidades\n\n💡 Reactívalo con 1 crédito y sigue captando clientes.`,
                        link: '/profile?tab=credits',
                        businessId: business.id,
                        metadata: {
                            businessName: business.name,
                            stats: {
                                views: totalViews,
                                estimatedLeads: estimatedLeads,
                                potentialRevenue: potentialRevenue,
                                period: '30 days'
                            },
                            action: 'buy_credits'
                        }
                    })

                    expiredDueToNoCredits++
                }
            } else if (aboutToExpire && daysLeft === 2) {
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

                    await upsertNotification({
                        userId: business.userId,
                        type: 'BUSINESS_EXPIRES_2_DAYS',
                        title: userHasCredits ? '🔄 Próxima renovación automática' : '⏰ Sin créditos - Compra ahora',
                        message: userHasCredits
                            ? `Tu negocio "${business.name}" se renovará automáticamente en 2 días (1 crédito). Créditos disponibles: ${business.user.credits}`
                            : `Tu negocio "${business.name}" expira en 2 días pero no tienes créditos. Compra ahora para renovación automática.`,
                        link: userHasCredits ? `/my-businesses?businessId=${business.id}` : '/profile?tab=credits',
                        businessId: business.id,
                        metadata: {
                            businessName: business.name,
                            daysLeft: 2,
                            willAutoRenew: userHasCredits
                        }
                    })

                    notificationsSent++
                }
            }
        }

        return NextResponse.json({
            success: true,
            autoRenewed,
            expiredDueToNoCredits,
            notificationsSent
        })

    } catch (error) {
        console.error('Error in cron job:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
