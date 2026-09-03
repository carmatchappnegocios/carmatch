import Stripe from 'stripe'

export const STRIPE_API_VERSION = '2025-02-24.acacia' as const

export function createStripeClient(): Stripe {
    return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: STRIPE_API_VERSION,
    })
}

/**
 * Find or create a Stripe customer for the given user
 */
export async function getOrCreateStripeCustomer(
    stripe: Stripe,
    email: string,
    name: string | null,
    userId: string
): Promise<Stripe.Customer> {
    const customers = await stripe.customers.list({
        email,
        limit: 1
    })

    if (customers.data.length > 0) {
        return customers.data[0]
    }

    return await stripe.customers.create({
        email,
        name: name || 'Cliente CarMatch',
        metadata: { userId }
    })
}
