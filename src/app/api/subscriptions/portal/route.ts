import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createStripeClient } from '@/lib/stripe'

export async function POST(request: NextRequest) {
    const stripe = createStripeClient()

    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { businessId } = await request.json()

        if (!businessId) {
            return NextResponse.json({ error: 'businessId requerido' }, { status: 400 })
        }

        // Verify the business belongs to this user and has a stripe customer
        const business = await prisma.business.findFirst({
            where: { id: businessId, userId: session.user.id }
        })

        if (!business) {
            return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
        }

        // Find the Stripe customer ID from the business or user
        let stripeCustomerId = business.stripeCustomerId

        if (!stripeCustomerId) {
            // Try to find from user's other businesses or Stripe by email
            const user = await prisma.user.findUnique({ where: { id: session.user.id } })
            if (user?.email) {
                const customers = await stripe.customers.list({ email: user.email, limit: 1 })
                if (customers.data.length > 0) {
                    stripeCustomerId = customers.data[0].id
                }
            }
        }

        if (!stripeCustomerId) {
            return NextResponse.json({ error: 'No se encontró cuenta de facturación' }, { status: 404 })
        }

        // Create Stripe Customer Portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${request.headers.get('origin')}/my-businesses`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (error) {
        console.error('Error creating portal session:', error)
        return NextResponse.json({ error: 'Error al abrir portal de facturación' }, { status: 500 })
    }
}
