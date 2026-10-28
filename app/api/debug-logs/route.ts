import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isAdmin: true }
        })

        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const logs = await prisma.systemLog.findMany({
            where: {
                OR: [
                    { source: 'Cloudinary' },
                    { message: { contains: 'Worker', mode: 'insensitive' } },
                    { message: { contains: 'Generando', mode: 'insensitive' } },
                    { message: { contains: 'Pollinations', mode: 'insensitive' } },
                    { message: { contains: 'Studio', mode: 'insensitive' } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 30
        })

        const studioMsgs = await prisma.studioMessage.findMany({
            where: { imagePrompt: { not: null } },
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: { id: true, content: true, images: true, imagePrompt: true, createdAt: true }
        });

        return NextResponse.json({ logs, studioMsgs });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
