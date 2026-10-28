import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function DELETE() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const isAdminMaster = session.user.email === process.env.ADMIN_EMAIL
        if (!isAdminMaster) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { isAdmin: true }
            })
            if (!user?.isAdmin) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        }

        const result = await prisma.systemLog.deleteMany({})

        return NextResponse.json({ deleted: result.count })
    } catch (error) {
        console.error('[Admin Logs] Error clearing logs:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
