import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/admin/blocked-identity - Block a user's identity (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const isAdminMaster = session.user.email === process.env.ADMIN_EMAIL
        if (!isAdminMaster) {
            const admin = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { isAdmin: true }
            })
            if (!admin?.isAdmin) {
                return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
            }
        }

        const { targetUserId, reason } = await request.json()

        if (!targetUserId || !reason) {
            return NextResponse.json({ error: 'targetUserId y reason son requeridos' }, { status: 400 })
        }

        // Get target user info
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, email: true }
        })

        if (!targetUser) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        // Create blocked identity records for email
        const blocks = []

        // Block by email
        blocks.push(
            prisma.blockedIdentity.create({
                data: {
                    blockedUserId: targetUserId,
                    blockedByEmail: targetUser.email,
                    reason,
                    blockedBy: session.user.id
                }
            })
        )

        // Block by each IP
        for (const ip of ips) {
            blocks.push(
                prisma.blockedIdentity.create({
                    data: {
                        blockedUserId: targetUserId,
                        blockedByIp: ip,
                        reason,
                        blockedBy: session.user.id
                    }
                })
            )
        }

        await Promise.all(blocks)

        // Also deactivate the user
        await prisma.user.update({
            where: { id: targetUserId },
            data: { isActive: false }
        })

        return NextResponse.json({
            success: true,
            message: `Usuario bloqueado. ${ips.length} IPs bloqueadas.`,
            blocksCreated: blocks.length
        })
    } catch (error) {
        console.error('Error blocking identity:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// GET /api/admin/blocked-identity - List all blocked identities
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const isAdminMaster = session.user.email === process.env.ADMIN_EMAIL
        if (!isAdminMaster) {
            const admin = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { isAdmin: true }
            })
            if (!admin?.isAdmin) {
                return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
            }
        }

        const blocks = await prisma.blockedIdentity.findMany({
            orderBy: { blockedAt: 'desc' },
            take: 100
        })

        return NextResponse.json(blocks)
    } catch (error) {
        console.error('Error fetching blocked identities:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
