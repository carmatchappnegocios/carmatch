
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const businesses = await prisma.business.findMany({
            where: { userId: session.user.id },
            select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
                isFreePublication: true,
                expiresAt: true,
                subscriptionStatus: true,
                stripeSubscriptionId: true,
                trialEndsAt: true,
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ businesses })
    } catch (error) {
        console.error('Error fetching subscription status:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
