import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, isAdmin: true } })
  if (!dbUser?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { action, view, metadata } = await req.json().catch(() => ({}))

  try {
    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        message: action || 'ADMIN_ACTION',
        metadata: {
          action,
          view,
          userId: dbUser.id,
          ...metadata
        },
        // Asume que systemLog tiene createdAt por defecto
      }
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Audit log error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
