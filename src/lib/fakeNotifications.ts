
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
 * DESACTIVADO: no se incrementa contador de notificaciones falsas
 */
export async function incrementDopamineCounter(userId: string) {
    // Desactivado para evitar generación de notificaciones falsas
    return
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
 * DESACTIVADO
 */
export async function createFakeVehicleLike(userId: string, vehicleId: string) {
    return null
}

/**
 * Crea una notificación falsa de "vista" en un vehículo
 * DESACTIVADO
 */
export async function createFakeVehicleView(userId: string, vehicleId: string) {
    return null
}

/**
 * Crea una notificación falsa de búsqueda de negocio
 * DESACTIVADO
 */
export async function createFakeBusinessSearch(userId: string, businessId: string) {
    return null
}

/**
 * Crea una notificación falsa de vista de negocio
 * DESACTIVADO
 */
export async function createFakeBusinessView(userId: string, businessId: string) {
    return null
}

/**
 * Genera notificaciones falsas aleatorias para un usuario
 * DESACTIVADO: no se generan notificaciones falsas
 */
export async function generateRandomFakeNotifications(userId: string) {
    // Desactivado completamente
    return { generated: 0, remaining: 0 }
}
