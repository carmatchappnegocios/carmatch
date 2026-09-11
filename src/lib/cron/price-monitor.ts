import { prisma } from '@/lib/prisma'

export async function monitorPriceDrops() {
  try {
    const activeWatches = await prisma.vehicleWatch.findMany({
      where: { isActive: true },
      include: {
        vehicle: {
          select: { id: true, price: true, title: true, brand: true, model: true, images: true, currency: true }
        },
        user: {
          select: { id: true, name: true }
        }
      }
    })

    let notificationsCreated = 0

    for (const watch of activeWatches) {
      if (!watch.vehicle || watch.vehicle.price === watch.watchedPrice) continue

      const currentPrice = Number(watch.vehicle.price)
      const watchedPrice = Number(watch.watchedPrice)

      if (currentPrice >= watchedPrice) continue

      const dropPercent = ((watchedPrice - currentPrice) / watchedPrice) * 100

      if (dropPercent < 5) continue

      const existingNotif = await prisma.priceDropNotification.findFirst({
        where: {
          watchId: watch.id,
          vehicleId: watch.vehicleId,
          notifiedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })

      if (existingNotif) continue

      await prisma.priceDropNotification.create({
        data: {
          watchId: watch.id,
          userId: watch.userId,
          vehicleId: watch.vehicleId,
          oldPrice: watchedPrice,
          newPrice: currentPrice,
          dropPercent,
        }
      })

      await prisma.notification.create({
        data: {
          userId: watch.userId,
          type: 'PRICE_DROP',
          title: '💰 ¡Bajó de precio!',
          message: `${watch.vehicle.brand} ${watch.vehicle.model} bajó de $${watchedPrice.toLocaleString()} a $${currentPrice.toLocaleString()} (${dropPercent.toFixed(0)}% menos)`,
          link: `/vehicle/${watch.vehicleId}`,
          vehicleId: watch.vehicleId,
        }
      })

      await prisma.vehicleWatch.update({
        where: { id: watch.id },
        data: { lastCheckedPrice: currentPrice, lastCheckedAt: new Date() }
      })

      notificationsCreated++
    }

    return { success: true, notificationsCreated, totalWatches: activeWatches.length }
  } catch (error) {
    console.error('Error monitoring price drops:', error)
    return { success: false, error: 'Internal error' }
  }
}
