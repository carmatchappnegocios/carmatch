import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'
import { BASE_PRICE_MXN, PREMIUM_PRICE_USD, EMERGING_MARKETS } from '@/lib/pricing'
import { createStripeClient, getOrCreateStripeCustomer } from '@/lib/stripe'


export async function POST(request: NextRequest) {
    const stripe = createStripeClient()


    try {
        const session = await auth()
        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const rateLimit = checkRateLimit(`credits:checkout:${session.user.id}`, { windowMs: 60000, max: 5 })
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' }, { status: 429 })
        }

        const { quantity, country = 'MX' } = await request.json()

        if (!quantity || quantity < 1 || !Number.isInteger(quantity) || quantity > 1000) {
            return NextResponse.json({ error: 'Cantidad inválida (1-1000)' }, { status: 400 })
        }

        let priceInCents: number
        let currency: string

        if (country === 'MX') {
            // México: cobrar en MXN
            priceInCents = Math.round(BASE_PRICE_MXN * quantity * 100)
            currency = 'mxn'
        } else if (EMERGING_MARKETS.includes(country as typeof EMERGING_MARKETS[number])) {
            // Emergentes: cobrar en MXN (convertido a USD en Stripe)
            priceInCents = Math.round(BASE_PRICE_MXN * quantity * 100)
            currency = 'mxn'
        } else {
            // Desarrollados: cobrar $4.99 USD fijo
            priceInCents = Math.round(PREMIUM_PRICE_USD * quantity * 100)
            currency = 'usd'
        }

        // --- PREPARAR CLIENTE STRIPE (Requerido para SPEI) ---
        const stripeCustomer = await getOrCreateStripeCustomer(
            stripe,
            session.user.email,
            session.user.name,
            session.user.id
        )

        // Lógica de Métodos de Pago Inteligente
        const checkoutParams: any = {
            customer: stripeCustomer.id,
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            // █▓▒░ CONFIGURACIÓN CRÍTICA DE PRECIOS (20/40 MXN) ░▒▓█
                            // Cambiar esto afecta directamente el cobro automático en Stripe.
                            // La lógica de precios se define en las constantes BASE_PRICE_MXN y PREMIUM_PRICE_MXN.
                            // Asegúrate de que cualquier cambio aquí refleje la estrategia de precios global.
                            name: `Paquete de Créditos (${quantity})`,
                            description: `Créditos para publicar vehículos en CarMatch`,
                            images: ['https://carmatch.mx/logo.png'],
                        },
                        unit_amount: priceInCents,
                    },
                    quantity: quantity,
                },
            ],
            mode: 'payment',
            success_url: `${request.headers.get('origin')}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}/credits?canceled=true`,
            payment_intent_data: {
                metadata: {
                    userId: session.user.id,
                    credits: quantity.toString(),
                    type: 'CREDIT_PURCHASE'
                },
            },
            metadata: {
                userId: session.user.id,
                credits: quantity.toString(),
                type: 'CREDIT_PURCHASE'
            },
        }

        // Si es México, forzamos OXXO y SPEI para que no "desaparezcan"
        if (country === 'MX') {
            checkoutParams.payment_method_types = ['card', 'oxxo', 'customer_balance']
            checkoutParams.payment_method_options = {
                customer_balance: {
                    funding_type: 'bank_transfer',
                    bank_transfer: {
                        type: 'mx_bank_transfer',
                    },
                },
            }
        } else {
            // Para el resto del mundo (China, etc.), Stripe activará Alipay, WeChat, etc. automáticamente
            checkoutParams.automatic_payment_methods = { enabled: true }
        }

        // Crear sesión de Checkout
        const checkoutSession = await stripe.checkout.sessions.create(checkoutParams)

        // 📊 REGISTRAR EVENTO: Checkout iniciado
        try {
            await prisma.analyticsEvent.create({
                data: {
                    userId: session.user.id,
                    eventType: 'PAYMENT_INITIATED',
                    entityType: 'PAYMENT',
                    metadata: {
                        quantity,
                        country,
                        amount: priceInCents / 100,
                        currency,
                        paymentMethods: country === 'MX' ? ['card', 'oxxo', 'spei'] : ['automatic'],
                        timestamp: new Date().toISOString()
                    }
                }
            })
        } catch {
            // Fail silently
        }

        return NextResponse.json({ url: checkoutSession.url })

    } catch (error: any) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json({ error: 'Error al iniciar pago' }, { status: 500 })
    }
}
