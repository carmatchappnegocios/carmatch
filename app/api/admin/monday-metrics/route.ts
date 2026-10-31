import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  startOfWeek.setHours(0,0,0,0)

  const metrics = await prisma.$transaction([
    prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.vehicle.count({ where: { createdAt: { gte: startOfWeek }, status: 'ACTIVE' } }),
    prisma.business.count({ where: { createdAt: { gte: startOfWeek }, isActive: true } }),
    prisma.searchMetric.count({ where: { createdAt: { gte: startOfWeek } } }),
  ])

  return NextResponse.json({
    weekStart: startOfWeek.toISOString(),
    newUsers: metrics[0],
    newVehicles: metrics[1],
    newBusinesses: metrics[2],
    searches: metrics[3],
    generatedAt: new Date().toISOString()
  })
}
