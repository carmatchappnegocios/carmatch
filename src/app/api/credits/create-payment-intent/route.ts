import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { BASE_PRICE_MXN, PREMIUM_PRICE_USD, EMERGING_MARKETS, EXCHANGE_API } from '@/lib/pricing'
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

        const { country, quantity } = await request.json()

        let amountInCents = 0
        let currency = 'mxn'

        if (country === 'MX') {
            // México: cobrar en MXN
            const totalMxn = BASE_PRICE_MXN * quantity
            amountInCents = Math.round(totalMxn * 100)
            currency = 'mxn'
        } else if (EMERGING_MARKETS.includes(country as typeof EMERGING_MARKETS[number])) {
            // Emergentes: convertir $20 MXN a USD
            let usdToMxnRate = 16.50
            try {
                const response = await fetch(EXCHANGE_API, { next: { revalidate: 3600 } })
                if (response.ok) {
                    const data = await response.json()
                    usdToMxnRate = 1 / data.rates.USD
                }
            } catch (e) {
                console.warn('Error fetching rate', e)
            }
            const priceUsd = BASE_PRICE_MXN / usdToMxnRate
            const totalUsd = Math.max(priceUsd, 1.00) * quantity
            amountInCents = Math.round(totalUsd * 100)
            currency = 'usd'
        } else {
            // Desarrollados: $4.99 USD fijo
            const totalUsd = PREMIUM_PRICE_USD * quantity
            amountInCents = Math.round(totalUsd * 100)
            currency = 'usd'
        }

        // --- PREPARAR CLIENTE STRIPE (Requerido para SPEI) ---
        const stripeCustomer = await getOrCreateStripeCustomer(
            stripe,
            session.user.email,
            session.user.name ?? null,
            session.user.id
        )

        // Crear PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            customer: stripeCustomer.id,
            amount: amountInCents,
            currency: currency,
            payment_method_types: ['card', 'oxxo', 'customer_balance'],
            payment_method_options: {
                customer_balance: {
                    funding_type: 'bank_transfer',
                    bank_transfer: {
                        type: 'mx_bank_transfer',
                    },
                },
            },
            metadata: {
                userId: session.user.id,
                credits: quantity.toString(),
                country: country,
                type: 'CREDIT_PURCHASE'
            }
        })

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret
        })

    } catch (error) {
        console.error('Error creating payment intent:', error)
        return NextResponse.json({ error: 'Error al iniciar pago' }, { status: 500 })
    }
}
