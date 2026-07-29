import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { reason, description, targetUserId, vehicleId, businessId, imageUrl } = await req.json()

        if (!reason) {
            return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
        }

        const report = await prisma.report.create({
            data: {
                reporterId: session.user.id,
                reason,
                description: description || null,
                targetUserId: targetUserId || null,
                vehicleId: vehicleId || null,
                businessId: businessId || null,
                imageUrl: imageUrl || null,
                status: 'PENDING'
            }
        })

        console.log(`[REPORT] New report ${report.id} by ${session.user.id}: ${reason}`)

        return NextResponse.json({ success: true, reportId: report.id })
    } catch (error) {
        console.error('Error creating report:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const reports = await prisma.report.findMany({
            where: { reporterId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        return NextResponse.json({ reports })
    } catch (error) {
        console.error('Error fetching reports:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
