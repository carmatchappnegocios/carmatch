
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const STRIPE_API_VERSION = '2025-02-24.acacia' as const
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: STRIPE_API_VERSION,
    })

    if (!WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    await prisma.systemLog.create({
        data: {
            level: 'INFO',
            source: 'StripeWebhook',
            message: `Webhook POST recibido - Iniciando verificación`,
            metadata: {
                url: request.url,
                sig: sig?.substring(0, 20) + '...',
                bodyLength: body.length
            }
        }
    })

    let event: Stripe.Event

    try {
        if (!sig) throw new Error('No signature')
        event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`)
        await prisma.systemLog.create({
            data: {
                level: 'ERROR',
                source: 'StripeWebhook',
                message: `Error de Firma: ${err.message}`,
                metadata: { sig: sig?.substring(0, 20), bodyPreview: body.substring(0, 100) }
            }
        })
        return NextResponse.json({ error: 'Firma invalida' }, { status: 400 })
    }

    await prisma.systemLog.create({
        data: {
            level: 'INFO',
            source: 'StripeWebhook',
            message: `Evento verificado: ${event.type}`,
            metadata: { eventId: event.id, type: event.type }
        }
    })

    try {
        // ✅ CASO 1: Pago con Tarjeta (Inmediato)
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session
            const metadata = session.metadata

            if (session.payment_status === 'paid' && metadata?.type === 'CREDIT_PURCHASE') {
                const userId = metadata.userId
                const creditsToAdd = parseInt(metadata.credits || '0')
                const transactionId = (session.payment_intent as string) || session.id

                if (userId && creditsToAdd > 0 && transactionId) {
                    await processCreditPurchase(
                        userId, creditsToAdd, transactionId,
                        session.amount_total! / 100, session.currency!,
                        'Compra de créditos (Tarjeta)'
                    )
                }
            } else if (metadata?.type === 'BUSINESS_SUBSCRIPTION_MONTHLY') {
                const businessId = metadata.businessId
                if (businessId && businessId !== 'pending') {
                    // Retrieve subscription from Stripe to get the subscription ID
                    let stripeSubscriptionId: string | null = null
                    if (typeof session.subscription === 'string') {
                        stripeSubscriptionId = session.subscription
                    } else if (session.subscription?.id) {
                        stripeSubscriptionId = session.subscription.id
                    }

                    const expiresAt = new Date()
                    expiresAt.setMonth(expiresAt.getMonth() + 1)

                    await prisma.business.update({
                        where: { id: businessId },
                        data: {
                            isActive: true,
                            isFreePublication: false,
                            expiresAt,
                            stripeSubscriptionId: stripeSubscriptionId || undefined,
                            stripeCustomerId: session.customer as string || undefined,
                            subscriptionStatus: 'active',
                            trialEndsAt: null,
                        }
                    })

                    await prisma.systemLog.create({
                        data: {
                            level: 'SUCCESS',
                            source: 'StripeWebhook',
                            message: `🏢 Suscripción activada para negocio: ${businessId}`,
                            metadata: { businessId, userId: metadata.userId, expiresAt: expiresAt.toISOString(), stripeSubscriptionId }
                        }
                    })
                }
            }
        }

        // ✅ CASO 2: Pago Async Confirmado (SPEI / OXXO)
        if (event.type === 'checkout.session.async_payment_succeeded') {
            const session = event.data.object as Stripe.Checkout.Session
            const metadata = session.metadata

            await prisma.systemLog.create({
                data: {
                    level: 'INFO',
                    source: 'StripeWebhook',
                    message: `💸 Pago async confirmado (SPEI/OXXO): session ${session.id}`,
                    metadata: { sessionId: session.id, userId: metadata?.userId, paymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null }
                }
            })

            if (metadata?.type === 'CREDIT_PURCHASE') {
                const userId = metadata.userId
                const creditsToAdd = parseInt(metadata.credits || '0')
                const transactionId = (session.payment_intent as string) || `spei_${session.id}`

                if (userId && creditsToAdd > 0) {
                    await processCreditPurchase(
                        userId, creditsToAdd, transactionId,
                        session.amount_total! / 100, session.currency!,
                        'Compra de créditos (SPEI/OXXO)'
                    )
                }
            } else if (metadata?.type === 'BUSINESS_SUBSCRIPTION_MONTHLY') {
                // SPEI/OXXO subscription payment confirmed
                const businessId = metadata.businessId
                if (businessId && businessId !== 'pending') {
                    let stripeSubscriptionId: string | null = null
                    if (typeof session.subscription === 'string') {
                        stripeSubscriptionId = session.subscription
                    } else if (session.subscription?.id) {
                        stripeSubscriptionId = session.subscription.id
                    }

                    const expiresAt = new Date()
                    expiresAt.setMonth(expiresAt.getMonth() + 1)

                    await prisma.business.update({
                        where: { id: businessId },
                        data: {
                            isActive: true,
                            isFreePublication: false,
                            expiresAt,
                            stripeSubscriptionId: stripeSubscriptionId || undefined,
                            stripeCustomerId: session.customer as string || undefined,
                            subscriptionStatus: 'active',
                        }
                    })

                    await prisma.systemLog.create({
                        data: {
                            level: 'SUCCESS',
                            source: 'StripeWebhook',
                            message: `🏢 Suscripción activada (SPEI/OXXO): negocio ${businessId}`,
                            metadata: { businessId, stripeSubscriptionId }
                        }
                    })
                }
            }
        }

        // ✅ CASO 3: Fallo async (SPEI vence sin pago)
        if (event.type === 'checkout.session.async_payment_failed') {
            const session = event.data.object as Stripe.Checkout.Session
            await prisma.systemLog.create({
                data: {
                    level: 'WARN',
                    source: 'StripeWebhook',
                    message: `⚠️ Pago async FALLÓ: session ${session.id}`,
                    metadata: { sessionId: session.id, userId: session.metadata?.userId }
                }
            })
        }

        // ✅ CASO 4: Suscripción cancelada — buscar por stripeSubscriptionId en DB
        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription

            const business = await prisma.business.findFirst({
                where: { stripeSubscriptionId: subscription.id }
            })

            if (business) {
                await prisma.business.update({
                    where: { id: business.id },
                    data: {
                        isActive: false,
                        subscriptionStatus: 'canceled',
                    }
                })

                await prisma.systemLog.create({
                    data: {
                        level: 'WARN',
                        source: 'StripeWebhook',
                        message: `🏢 Suscripción cancelada: negocio ${business.id}`,
                        metadata: { businessId: business.id, subscriptionId: subscription.id }
                    }
                })
            }
        }

        // ✅ CASO 5: Suscripción actualizada (renovación, cambio de plan, etc.)
        if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object as Stripe.Subscription

            const business = await prisma.business.findFirst({
                where: { stripeSubscriptionId: subscription.id }
            })

            if (business) {
                const newStatus = subscription.status === 'active' ? 'active'
                    : subscription.status === 'past_due' ? 'past_due'
                    : subscription.status === 'canceled' ? 'canceled'
                    : subscription.status

                // Extend expiresAt on successful renewal
                let expiresAtUpdate = undefined
                if (subscription.status === 'active' && subscription.current_period_end) {
                    expiresAtUpdate = new Date(subscription.current_period_end * 1000)
                }

                await prisma.business.update({
                    where: { id: business.id },
                    data: {
                        subscriptionStatus: newStatus,
                        ...(expiresAtUpdate ? { expiresAt: expiresAtUpdate, isActive: true } : {}),
                        ...(subscription.status === 'canceled' ? { isActive: false } : {}),
                    }
                })

                await prisma.systemLog.create({
                    data: {
                        level: 'INFO',
                        source: 'StripeWebhook',
                        message: `🏢 Suscripción actualizada: negocio ${business.id} → ${newStatus}`,
                        metadata: { businessId: business.id, subscriptionId: subscription.id, status: newStatus }
                    }
                })
            }
        }

        // ✅ CASO 6: Pago de factura exitoso (renovación de suscripción)
        if (event.type === 'invoice.paid') {
            const invoice = event.data.object as Stripe.Invoice
            const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id

            if (subscriptionId) {
                const business = await prisma.business.findFirst({
                    where: { stripeSubscriptionId: subscriptionId }
                })

                if (business) {
                    // Extend expiresAt based on the new period end
                    const periodEnd = (invoice as any).period_end
                    const expiresAt = periodEnd ? new Date(periodEnd * 1000) : (() => {
                        const d = new Date(); d.setMonth(d.getMonth() + 1); return d
                    })()

                    await prisma.business.update({
                        where: { id: business.id },
                        data: {
                            isActive: true,
                            expiresAt,
                            subscriptionStatus: 'active',
                        }
                    })

                    await prisma.systemLog.create({
                        data: {
                            level: 'SUCCESS',
                            source: 'StripeWebhook',
                            message: `🏢 Renovación de suscripción exitosa: negocio ${business.id}`,
                            metadata: { businessId: business.id, subscriptionId, expiresAt: expiresAt.toISOString() }
                        }
                    })
                }
            }
        }

        // ✅ CASO 7: Pago de suscripción fallido — desactivar negocio + notificar
        if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object as Stripe.Invoice
            const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id

            if (subscriptionId) {
                const business = await prisma.business.findFirst({
                    where: { stripeSubscriptionId: subscriptionId }
                })

                if (business) {
                    await prisma.business.update({
                        where: { id: business.id },
                        data: {
                            subscriptionStatus: 'past_due',
                        }
                    })

                    // Notify user about failed payment
                    try {
                        await prisma.notification.create({
                            data: {
                                userId: business.userId,
                                type: 'SYSTEM',
                                title: 'Pago de suscripción fallido',
                                message: `El pago de tu suscripción de $20 MXN/mes para "${business.name}" falló. Por favor actualiza tu método de pago para evitar la desactivación de tu negocio.`,
                                metadata: JSON.stringify({ businessId: business.id, subscriptionId, invoiceId: invoice.id }),
                            }
                        })
                    } catch {
                        // Notification might fail if schema differs
                    }

                    await prisma.systemLog.create({
                        data: {
                            level: 'WARN',
                            source: 'StripeWebhook',
                            message: `⚠️ Pago de suscripción fallido: negocio ${business.id}`,
                            metadata: { businessId: business.id, subscriptionId, invoiceId: invoice.id }
                        }
                    })
                }
            }
        }

    } catch (error) {
        console.error('Error procesando el evento de webhook:', error)
        await prisma.systemLog.create({
            data: {
                level: 'ERROR',
                source: 'StripeWebhook',
                message: error instanceof Error ? error.message : 'Unknown error',
                metadata: { event: event.id, type: event.type }
            }
        })
        return NextResponse.json({ error: 'Process error' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}

// Función auxiliar reutilizable (idempotente por transactionId)
async function processCreditPurchase(
    userId: string, credits: number, transactionId: string,
    amount: number, currency: string, description: string = 'Compra de créditos'
) {
    try {
        await prisma.$transaction([
            prisma.payment.create({
                data: {
                    userId,
                    amount,
                    currency: currency.toUpperCase(),
                    transactionId,
                    status: 'COMPLETED',
                    creditsAdded: credits
                }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: credits } }
            }),
            prisma.creditTransaction.create({
                data: {
                    userId,
                    amount: credits,
                    description,
                    relatedId: transactionId,
                    details: { gateway: 'stripe', amount, currency }
                }
            })
        ])
    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            console.log(`[StripeWebhook] Pago ${transactionId} ya procesado (race condition). Saliendo.`)
            return
        }
        throw error
    }

    await prisma.systemLog.create({
        data: {
            level: 'SUCCESS',
            source: 'PaymentService',
            message: `✅ ${credits} créditos sumados al usuario ${userId}`,
            metadata: { transactionId, credits, userId }
        }
    })

    try {
        await prisma.analyticsEvent.create({
            data: {
                userId,
                eventType: 'PAYMENT_COMPLETED',
                entityType: 'PAYMENT',
                metadata: {
                    amount,
                    currency,
                    credits,
                    transactionId,
                    description,
                    timestamp: new Date().toISOString()
                }
            }
        })
    } catch {
        // Fail silently
    }

    console.log(`✅ ${credits} créditos sumados al usuario ${userId} via ${transactionId}`)
}
