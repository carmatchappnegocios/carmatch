
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { deleteFromCloudinary } from '@/lib/cloudinary'

/**
 * CRON JOB: Limpieza de Imágenes y Base de Datos
 * Se ejecuta 1 vez al día a las 3 AM UTC.
 * 
 * NO maneja renovaciones - eso está en daily-maintenance.
 */
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        const log = []
        const today = new Date()

        // 1. AUTO-DELETE IMÁGENES ANTIGUAS (vehículos SOLD/INACTIVE > 30 días)
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        const oldVehicles = await prisma.vehicle.findMany({
            where: {
                OR: [
                    { status: 'SOLD', updatedAt: { lt: thirtyDaysAgo } },
                    { status: 'INACTIVE', updatedAt: { lt: thirtyDaysAgo } }
                ],
                images: { isEmpty: false }
            },
            select: { id: true, images: true, brand: true, model: true }
        })

        let deletedImagesCount = 0
        for (const vehicle of oldVehicles) {
            for (const imageUrl of vehicle.images) {
                try {
                    await deleteFromCloudinary(imageUrl)
                    deletedImagesCount++
                } catch (error) {
                    console.error(`Failed to delete image ${imageUrl}:`, error)
                }
            }

            await prisma.vehicle.update({
                where: { id: vehicle.id },
                data: { images: [] }
            })
        }

        if (oldVehicles.length > 0) {
            log.push(`[CLEANUP] Deleted ${deletedImagesCount} old images from Cloudinary and cleared image arrays for ${oldVehicles.length} vehicles.`)
        }
        
        // 2. PODA DE TABLAS PESADAS (OPTIMIZACIÓN DE COSTOS)
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const fifteenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)
        const thirtyDaysAgoData = thirtyDaysAgo

        const { count: delSystemLogs } = await prisma.systemLog.deleteMany({ where: { createdAt: { lt: sevenDaysAgo } } })
        const { count: delAutoUpdates } = await prisma.autoUpdateLog.deleteMany({ where: { createdAt: { lt: fifteenDaysAgo } } })
        const { count: delAnalytics } = await prisma.analyticsEvent.deleteMany({ where: { createdAt: { lt: thirtyDaysAgoData } } })
        const { count: delSearchMetrics } = await prisma.searchMetric.deleteMany({ where: { createdAt: { lt: thirtyDaysAgoData } } })
        const { count: delOppLogs } = await prisma.opportunityLog.deleteMany({ where: { createdAt: { lt: thirtyDaysAgoData } } })
        const { count: delBusNotifLogs } = await prisma.businessNotificationLog.deleteMany({ where: { createdAt: { lt: thirtyDaysAgoData } } })
        
        // 3. FRENO DE EMERGENCIA (MAX 150,000 REGISTROS)
        const LIMIT = 150000
        let brakeSystemLogs = 0
        let brakeAnalytics = 0

        const currentSystemLogs = await prisma.systemLog.count()
        if (currentSystemLogs > LIMIT) {
            const lastToKeep = await prisma.systemLog.findMany({
                orderBy: { createdAt: 'desc' },
                skip: LIMIT - 1,
                take: 1,
                select: { createdAt: true }
            })
            if (lastToKeep.length > 0) {
                const { count } = await prisma.systemLog.deleteMany({
                    where: { createdAt: { lt: lastToKeep[0].createdAt } }
                })
                brakeSystemLogs = count
            }
        }

        const currentAnalytics = await prisma.analyticsEvent.count()
        if (currentAnalytics > LIMIT) {
            const lastToKeep = await prisma.analyticsEvent.findMany({
                orderBy: { createdAt: 'desc' },
                skip: LIMIT - 1,
                take: 1,
                select: { createdAt: true }
            })
            if (lastToKeep.length > 0) {
                const { count } = await prisma.analyticsEvent.deleteMany({
                    where: { createdAt: { lt: lastToKeep[0].createdAt } }
                })
                brakeAnalytics = count
            }
        }

        // 4. Limpieza de Notificaciones (Leídas y Fakes)
        const { count: delReadNotif } = await prisma.notification.deleteMany({ 
            where: { isRead: true, updatedAt: { lt: sevenDaysAgo } } 
        })
        const { count: delFakeNotif } = await prisma.notification.deleteMany({ 
            where: { isFake: true, createdAt: { lt: fifteenDaysAgo } } 
        })

        if (brakeSystemLogs > 0 || brakeAnalytics > 0) {
            log.push(`[EMERGENCY] Pruned ${brakeSystemLogs} SystemLogs and ${brakeAnalytics} Analytics to stay under ${LIMIT} limit.`)
        }
        log.push(`[DATABASE] Pruned technical logs: ${delSystemLogs} SystemLogs, ${delAnalytics} Analytics, ${delSearchMetrics} SearchMetrics.`)
        log.push(`[DATABASE] Cleaned ${delReadNotif + delFakeNotif} old/fake notifications.`)

        return NextResponse.json({
            success: true,
            processed: log,
            stats: {
                imagesDeleted: deletedImagesCount,
                vehiclesCleaned: oldVehicles.length,
                dbCleanup: {
                    systemLogs: delSystemLogs + brakeSystemLogs,
                    autoUpdates: delAutoUpdates,
                    analyticsEvents: delAnalytics + brakeAnalytics,
                    searchMetrics: delSearchMetrics,
                    opportunityLogs: delOppLogs,
                    businessNotifLogs: delBusNotifLogs,
                    readNotifications: delReadNotif,
                    fakeNotifications: delFakeNotif,
                    emergencyBrake: {
                        systemLogs: brakeSystemLogs,
                        analyticsEvents: brakeAnalytics
                    }
                }
            }
        })

    } catch (error) {
        console.error('Cron Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
