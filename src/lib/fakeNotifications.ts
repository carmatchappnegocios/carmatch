
/**
 * Sistema de Notificaciones de Dopamina
 * Genera notificaciones falsas pero creíbles para mantener engagement
 * Se mezclan con notificaciones reales de usuarios
 */

import { prisma } from './db'
import { upsertNotification } from './notifications-service'
import { generateBusinessSlug } from './slug'

/**
 * Obtiene o crea el contador de notificaciones falsas para el mes actual
 */
export async function getFakeNotificationCounter(userId: string) {
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Contar publicaciones activas (vehículos + negocios)
    const [activeVehicles, activeBusinesses] = await Promise.all([
        prisma.vehicle.count({ where: { userId, status: 'ACTIVE' } }),
        prisma.business.count({ where: { userId, isActive: true } })
    ])

    const totalPublications = activeVehicles + activeBusinesses
    const targetPerPublication = 168 // Max requested by user
    const targetCount = Math.max(1, totalPublications * targetPerPublication)

    let counter = await prisma.fakeNotificationCounter.findFirst({
        where: { userId, monthYear }
    })

    if (!counter) {
        // Crear nuevo contador para este mes
        counter = await prisma.fakeNotificationCounter.create({
            data: {
                userId,
                monthYear,
                targetCount,
                currentCount: 0
            }
        })
    } else if (counter.targetCount !== targetCount) {
        // Actualizar el objetivo si el número de publicaciones cambió
        counter = await prisma.fakeNotificationCounter.update({
            where: { id: counter.id },
            data: { targetCount }
        })
    }

    return counter
}

/**
 * Incrementa el contador de dopamina (real o falso)
 */
export async function incrementDopamineCounter(userId: string) {
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    try {
        await prisma.fakeNotificationCounter.update({
            where: {
                userId_monthYear: { userId, monthYear }
            },
            data: {
                currentCount: { increment: 1 },
                lastGenerated: new Date()
            }
        })
    } catch (e) {
        // Si no existe el contador, lo crea primero
        await getFakeNotificationCounter(userId)
        await prisma.fakeNotificationCounter.update({
            where: {
                userId_monthYear: { userId, monthYear }
            },
            data: {
                currentCount: { increment: 1 },
                lastGenerated: new Date()
            }
        })
    }
}

/**
 * Verifica si puede generar más notificaciones falsas este mes
 */
export async function canGenerateFakeNotification(userId: string): Promise<boolean> {
    const counter = await getFakeNotificationCounter(userId)
    return counter.currentCount < counter.targetCount
}

/**
 * Crea una notificación falsa de "like" en un vehículo
 */
export async function createFakeVehicleLike(userId: string, vehicleId: string) {
    const canCreate = await canGenerateFakeNotification(userId)
    if (!canCreate) return null

    const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { brand: true, model: true, status: true, moderationStatus: true }
    })

    if (!vehicle || vehicle.status !== 'ACTIVE' || vehicle.moderationStatus !== 'APPROVED') return null

    const notification = await upsertNotification({
        userId,
        type: 'VEHICLE_FAVORITED',
        title: '👍 ¡Nuevo Like en tu vehículo!',
        message: `A alguien le gustó tu "${vehicle.brand} ${vehicle.model}"`,
        vehicleId,
        link: `/profile?vehicleId=${vehicleId}`,
        isFake: true
    })

    // Increment fake favorites count on Vehicle
    await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { fakeFavorites: { increment: 1 } }
    })

    // Incrementar contador
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    await prisma.fakeNotificationCounter.update({
        where: {
            userId_monthYear: { userId, monthYear }
        },
        data: {
            currentCount: { increment: 1 },
            lastGenerated: new Date()
        }
    })

    return notification
}

/**
 * Crea una notificación falsa de "vista" en un vehículo
 */
export async function createFakeVehicleView(userId: string, vehicleId: string) {
    const canCreate = await canGenerateFakeNotification(userId)
    if (!canCreate) return null

    const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { status: true, moderationStatus: true }
    })

    if (!vehicle || vehicle.status !== 'ACTIVE' || vehicle.moderationStatus !== 'APPROVED') return null

    const viewCount = Math.floor(Math.random() * 8) + 3 // 3-10 vistas

    const notification = await upsertNotification({
        userId,
        type: 'VEHICLE_VIEWED',
        title: `👀 Tu vehículo está siendo visto`,
        message: `${viewCount} personas vieron tu publicación hoy`,
        vehicleId,
        link: `/profile?vehicleId=${vehicleId}`,
        isFake: true
    })

    // Increment view count on Vehicle
    await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { views: { increment: viewCount } }
    })

    // Incrementar contador
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    await prisma.fakeNotificationCounter.update({
        where: {
            userId_monthYear: { userId, monthYear }
        },
        data: {
            currentCount: { increment: 1 },
            lastGenerated: new Date()
        }
    })

    return notification
}

/**
 * Crea una notificación falsa de búsqueda de negocio
 */
export async function createFakeBusinessSearch(userId: string, businessId: string) {
    const canCreate = await canGenerateFakeNotification(userId)
    if (!canCreate) return null

    const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { isActive: true, slug: true, name: true, city: true }
    })

    if (!business || !business.isActive) return null

    const searchCount = Math.floor(Math.random() * 8) + 2 // 2-9 búsquedas
    const businessLink = `/negocio/${generateBusinessSlug(business.name, business.city)}-${businessId}`

    const notification = await upsertNotification({
        userId,
        type: 'BUSINESS_SEARCHED',
        title: '🔍 Personas buscaron tu negocio',
        message: `${searchCount} personas buscaron negocios como el tuyo hoy`,
        businessId,
        link: businessLink,
        isFake: true
    })

    // Increment fake searches on Business Analytics
    await prisma.businessAnalytics.upsert({
        where: { businessId },
        create: {
            businessId,
            currentMonth: new Date().getMonth() + 1,
            fakeSearches: searchCount
        },
        update: {
            fakeSearches: { increment: searchCount }
        }
    })

    // Incrementar contador
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    await prisma.fakeNotificationCounter.update({
        where: {
            userId_monthYear: { userId, monthYear }
        },
        data: {
            currentCount: { increment: 1 },
            lastGenerated: new Date()
        }
    })

    return notification
}

/**
 * Crea una notificación falsa de vista de negocio
 */
export async function createFakeBusinessView(userId: string, businessId: string) {
    const canCreate = await canGenerateFakeNotification(userId)
    if (!canCreate) return null

    const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { isActive: true, slug: true, name: true, city: true }
    })

    if (!business || !business.isActive) return null

    const viewCount = Math.floor(Math.random() * 5) + 1 // 1-5 vistas
    const message = viewCount === 1
        ? 'Alguien seleccionó tu negocio como opción'
        : `${viewCount} personas seleccionaron tu negocio como opción`
    const businessLink = `/negocio/${generateBusinessSlug(business.name, business.city)}-${businessId}`

    const notification = await upsertNotification({
        userId,
        type: 'BUSINESS_VIEWED',
        title: '⭐ Tu negocio está siendo visto',
        message,
        businessId,
        link: businessLink,
        isFake: true
    })

    // Increment fake views on Business Analytics
    await prisma.businessAnalytics.upsert({
        where: { businessId },
        create: {
            businessId,
            currentMonth: new Date().getMonth() + 1,
            fakeViews: viewCount
        },
        update: {
            fakeViews: { increment: viewCount }
        }
    })

    // Incrementar contador
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    await prisma.fakeNotificationCounter.update({
        where: {
            userId_monthYear: { userId, monthYear }
        },
        data: {
            currentCount: { increment: 1 },
            lastGenerated: new Date()
        }
    })

    return notification
}

/**
 * Genera notificaciones falsas aleatorias para un usuario
 * Distribuidas a lo largo del mes
 */
export async function generateRandomFakeNotifications(userId: string) {
    const counter = await getFakeNotificationCounter(userId)

    // Solo generar si aún no alcanza el objetivo
    if (counter.currentCount >= counter.targetCount) {
        return { generated: 0, remaining: 0 }
    }

    // Calcular cuántas faltan por generar
    const remaining = counter.targetCount - counter.currentCount

    // Generar suficientes para alcanzar el objetivo mensual (distribuidas en 30 días)
    const dailyTarget = Math.ceil(counter.targetCount / 30)
    // Variación aleatoria del 20% para que no sea exacto
    const toGenerate = Math.min(
        Math.floor(dailyTarget * (0.8 + Math.random() * 0.4)),
        remaining
    )

    // Obtener vehículos y negocios del usuario
    const vehicles = await prisma.vehicle.findMany({
        where: { userId, status: 'ACTIVE' },
        take: 5
    })

    const businesses = await prisma.business.findMany({
        where: { userId, isActive: true },
        take: 5
    })

    let generated = 0

    for (let i = 0; i < toGenerate; i++) {
        // Decidir tipo de notificación
        const hasVehicles = vehicles.length > 0
        const hasBusinesses = businesses.length > 0

        if (!hasVehicles && !hasBusinesses) break

        const types = []
        if (hasVehicles) {
            types.push('vehicle_like', 'vehicle_view')
        }
        if (hasBusinesses) {
            types.push('business_search', 'business_view')
        }

        const randomType = types[Math.floor(Math.random() * types.length)]

        try {
            switch (randomType) {
                case 'vehicle_like':
                    const randomVehicle1 = vehicles[Math.floor(Math.random() * vehicles.length)]
                    await createFakeVehicleLike(userId, randomVehicle1.id)
                    generated++
                    break

                case 'vehicle_view':
                    const randomVehicle2 = vehicles[Math.floor(Math.random() * vehicles.length)]
                    await createFakeVehicleView(userId, randomVehicle2.id)
                    generated++
                    break

                case 'business_search':
                    const randomBusiness1 = businesses[Math.floor(Math.random() * businesses.length)]
                    await createFakeBusinessSearch(userId, randomBusiness1.id)
                    generated++
                    break

                case 'business_view':
                    const randomBusiness2 = businesses[Math.floor(Math.random() * businesses.length)]
                    await createFakeBusinessView(userId, randomBusiness2.id)
                    generated++
                    break
            }
        } catch (error) {
            console.error('Error generando notificación falsa:', error)
        }
    }

    return {
        generated,
        remaining: counter.targetCount - counter.currentCount - generated
    }
}
