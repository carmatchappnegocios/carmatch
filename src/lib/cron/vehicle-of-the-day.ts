import { prisma } from '@/lib/prisma'

export async function selectVehicleOfTheDay() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await prisma.vehicleOfTheDay.findUnique({
      where: { date: today }
    })

    if (existing) {
      return existing
    }

    const recentWinnerCutoff = new Date()
    recentWinnerCutoff.setDate(recentWinnerCutoff.getDate() - 7)

    const recentWinners = await prisma.vehicleOfTheDay.findMany({
      where: { createdAt: { gte: recentWinnerCutoff } },
      select: { vehicleId: true }
    })
    const recentWinnerIds = recentWinners.map(w => w.vehicleId)

    const vehicles = await prisma.$queryRawUnsafe(`
      SELECT 
        v.id,
        v.title,
        v.brand,
        v.model,
        v.year,
        v.price,
        v.city,
        v.images,
        v."userId",
        COUNT(DISTINCT f.id) as "likeCount",
        COUNT(DISTINCT CASE WHEN ae."eventType" = 'VEHICLE_VIEWED' THEN ae.id END) as "viewCount",
        COUNT(DISTINCT CASE WHEN ae."eventType" = 'SHARE' THEN ae.id END) as "shareCount"
      FROM "Vehicle" v
      LEFT JOIN "Favorite" f ON f."vehicleId" = v.id AND f."createdAt" > NOW() - INTERVAL '24 hours'
      LEFT JOIN "AnalyticsEvent" ae ON ae."entityId" = v.id AND ae."createdAt" > NOW() - INTERVAL '24 hours'
      WHERE v.status = 'ACTIVE'
        AND v."expiresAt" > NOW()
        AND (v."images" IS NOT NULL AND array_length(v."images", 1) >= 3)
        ${recentWinnerIds.length > 0 ? `AND v.id NOT IN (${recentWinnerIds.map(id => `'${id}'`).join(',')})` : ''}
      GROUP BY v.id
      ORDER BY (
        (COUNT(DISTINCT f.id) * 3) +
        (COUNT(DISTINCT CASE WHEN ae."eventType" = 'VEHICLE_VIEWED' THEN ae.id END) * 1) +
        (COUNT(DISTINCT CASE WHEN ae."eventType" = 'SHARE' THEN ae.id END) * 5) +
        CASE WHEN v."publishedAt" > NOW() - INTERVAL '48 hours' THEN 20 ELSE 0 END
      ) DESC
      LIMIT 1
    `) as any[]

    if (!vehicles || vehicles.length === 0) {
      return null
    }

    const winner = vehicles[0]
    const likeCount = parseInt(winner.likeCount) || 0
    const viewCount = parseInt(winner.viewCount) || 0
    const shareCount = parseInt(winner.shareCount) || 0
    const score = (likeCount * 3) + (viewCount * 1) + (shareCount * 5) + 20

    let reason = 'Más engagement del día'
    if (shareCount > likeCount) reason = 'Más compartido del día'
    if (likeCount > viewCount) reason = 'Más gustado del día'
    if (viewCount > likeCount * 2) reason = 'Más visto del día'

    const vehicleOfTheDay = await prisma.vehicleOfTheDay.create({
      data: {
        vehicleId: winner.id,
        date: today,
        score,
        reason,
      }
    })

    return vehicleOfTheDay
  } catch (error) {
    console.error('Error selecting vehicle of the day:', error)
    return null
  }
}

export async function sendVehicleOfTheDayNotifications(vehicleOfTheDay: any) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleOfTheDay.vehicleId },
      select: { title: true, brand: true, model: true, price: true, city: true, images: true, currency: true }
    })

    if (!vehicle) return

    const subscribers = await prisma.pushSubscription.findMany({
      select: { userId: true, endpoint: true, p256dh: true, auth: true }
    })

    const uniqueUserIds = [...new Set(subscribers.map(s => s.userId))]

    for (const userId of uniqueUserIds) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'VEHICLE_OF_THE_DAY',
          title: '🔥 Auto del Día',
          message: `${vehicle.brand} ${vehicle.model} ${vehicle.year} por $${vehicle.price.toLocaleString()} ${vehicle.currency} en ${vehicle.city}`,
          link: `/vehicle/${vehicleOfTheDay.vehicleId}`,
          vehicleId: vehicleOfTheDay.vehicleId,
        }
      })
    }
  } catch (error) {
    console.error('Error sending vehicle of the day notifications:', error)
  }
}
