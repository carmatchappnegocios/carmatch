import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { endpoint } = await req.json()

        if (!endpoint) {
            return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
        }

        await prisma.pushSubscription.deleteMany({
            where: {
                userId: session.user.id,
                endpoint: endpoint
            }
        })

        console.log('[API] Push subscription removed')
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Push Unsubscribe Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
