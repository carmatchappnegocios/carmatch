import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ active: false })

        // Buscar alerta SOS activa donde el usuario sea víctima o contraparte
        // Y que no haya expirado (2 días)
        const activeAlert = await prisma.sOSAlert.findFirst({
            where: {
                status: 'ACTIVE',
                expiresAt: { gte: new Date() },
                OR: [
                    { victimId: session.user.id },
                    { counterpartId: session.user.id }
                ]
            }
        })

        return NextResponse.json({ 
            active: !!activeAlert, 
            isVictim: activeAlert?.victimId === session.user.id,
            alertId: activeAlert?.id 
        })
    } catch (error) {
        console.error('Error checking active SOS:', error)
        return NextResponse.json({ active: false }, { status: 500 })
    }
}
