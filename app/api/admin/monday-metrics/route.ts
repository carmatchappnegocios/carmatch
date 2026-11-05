import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

function getMexicoWeekday(date: Date) {
  // Get weekday in America/Mexico_City
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', weekday: 'short' })
  const weekdayName = fmt.format(date)
  // Map names to numbers: Sun=0 ... Sat=6
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return map[weekdayName] ?? date.getDay()
}

function getMexicoStartOfDay(date: Date) {
  const year = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric' }).format(date)
  const month = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', month: '2-digit' }).format(date)
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', day: '2-digit' }).format(date)
  // Build UTC date representing Mexico midnight
  return new Date(`${year}-${month}-${day}T00:00:00-06:00`)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date()
  const dayOfWeek = getMexicoWeekday(now)
  const isMonday = dayOfWeek === 1

  // Backward compatible week metrics
  const mexicoStartOfToday = getMexicoStartOfDay(now)
  const startOfWeek = new Date(mexicoStartOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))

  const metrics = await prisma.$transaction([
    prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.vehicle.count({ where: { createdAt: { gte: startOfWeek }, status: 'ACTIVE' } }),
    prisma.business.count({ where: { createdAt: { gte: startOfWeek }, isActive: true } }),
    prisma.searchMetric.count({ where: { createdAt: { gte: startOfWeek } } }),
  ])

  // Monday 48h per-piece metrics
  const periodEnd = now
  const periodStart = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  let perPieceMetrics: any[] = []
  let mondayWindow = null

  if (isMonday) {
    try {
      // Per vehicle metrics for last 48h using raw SQL for performance
      const rows = await prisma.$queryRawUnsafe(`
        SELECT 
          v.id,
          v.title,
          v.brand,
          v.model,
          v.year,
          v.price,
          v.city,
          COUNT(DISTINCT f.id) AS favorites_48h,
          COUNT(DISTINCT c.id) AS chats_48h,
          COUNT(DISTINCT m.id) AS messages_48h,
          COUNT(DISTINCT CASE WHEN ae."eventType" = 'VEHICLE_VIEWED' THEN ae.id END) AS views_48h
        FROM "Vehicle" v
        LEFT JOIN "Favorite" f ON f."vehicleId" = v.id AND f."createdAt" > NOW() - INTERVAL '48 hours'
        LEFT JOIN "Chat" c ON c."vehicleId" = v.id AND c."createdAt" > NOW() - INTERVAL '48 hours'
        LEFT JOIN "Message" m ON m."chatId" IN (SELECT id FROM "Chat" WHERE "vehicleId" = v.id AND "createdAt" > NOW() - INTERVAL '48 hours') AND m."createdAt" > NOW() - INTERVAL '48 hours'
        LEFT JOIN "AnalyticsEvent" ae ON ae."entityId" = v.id AND ae."eventType" = 'VEHICLE_VIEWED' AND ae."createdAt" > NOW() - INTERVAL '48 hours'
        WHERE v.status = 'ACTIVE'
          AND v."publishedAt" > NOW() - INTERVAL '30 days'
        GROUP BY v.id
        HAVING COUNT(DISTINCT f.id) > 0 OR COUNT(DISTINCT c.id) > 0 OR COUNT(DISTINCT CASE WHEN ae."eventType" = 'VEHICLE_VIEWED' THEN ae.id END) > 0
        ORDER BY (COUNT(DISTINCT f.id) * 3 + COUNT(DISTINCT CASE WHEN ae."eventType" = 'VEHICLE_VIEWED' THEN ae.id END)) DESC
        LIMIT 200
      `) as any[]

      perPieceMetrics = rows.map(r => ({
        vehicleId: r.id,
        title: r.title,
        brand: r.brand,
        model: r.model,
        year: r.year,
        price: Number(r.price),
        city: r.city,
        favorites48h: Number(r.favorites_48h || 0),
        chats48h: Number(r.chats_48h || 0),
        messages48h: Number(r.messages_48h || 0),
        views48h: Number(r.views_48h || 0),
        score48h: Number(r.favorites_48h || 0) * 3 + Number(r.views_48h || 0)
      }))

      mondayWindow = {
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        isMonday: true,
        calculatedAt: now.toISOString()
      }
    } catch (e) {
      console.error('[Monday Metrics] Error computing per-piece metrics', e)
    }
  } else {
    mondayWindow = {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      isMonday: false,
      note: 'Per-piece metrics only calculated on Mondays'
    }
  }

  return NextResponse.json({
    weekStart: startOfWeek.toISOString(),
    newUsers: metrics[0],
    newVehicles: metrics[1],
    newBusinesses: metrics[2],
    searches: metrics[3],
    generatedAt: new Date().toISOString(),
    // New Monday 48h per-piece data
    monday48h: {
      isMonday,
      window: mondayWindow,
      perPieceMetrics,
      totalActivePieces: perPieceMetrics.length
    }
  })
}
