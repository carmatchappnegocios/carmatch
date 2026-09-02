
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const STRIPE_API_VERSION = '2025-02-24.acacia' as const

export async function POST(request: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: STRIPE_API_VERSION,
    })

    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { businessId } = await request.json()

        if (!businessId) {
            return NextResponse.json({ error: 'businessId requerido' }, { status: 400 })
        }

        // Verify the business belongs to this user
        const business = await prisma.business.findFirst({
            where: { id: businessId, userId: session.user.id }
        })

        if (!business) {
            return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
        }

        if (!business.stripeSubscriptionId) {
            return NextResponse.json({ error: 'Este negocio no tiene suscripción activa' }, { status: 400 })
        }

        // Cancel the Stripe subscription (at period end, so user keeps access until billing cycle ends)
        await stripe.subscriptions.update(business.stripeSubscriptionId, {
            cancel_at_period_end: true,
        })

        await prisma.business.update({
            where: { id: businessId },
            data: { subscriptionStatus: 'canceled' }
        })

        await prisma.systemLog.create({
            data: {
                level: 'INFO',
                source: 'SubscriptionCancel',
                message: `🏢 Suscripción programada para cancelación: negocio ${businessId}`,
                metadata: { businessId, userId: session.user.id, subscriptionId: business.stripeSubscriptionId }
            }
        })

        return NextResponse.json({ success: true, message: 'Suscripción cancelada al final del periodo actual' })
    } catch (error) {
        console.error('Error canceling subscription:', error)
        return NextResponse.json({ error: 'Error al cancelar suscripción' }, { status: 500 })
    }
}
