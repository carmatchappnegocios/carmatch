// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { generateBusinessSlug } from './slug'
import { prisma } from './db'
import { incrementDopamineCounter } from './fakeNotifications'
import { upsertNotification } from './notifications-service'

/**
 * Genera una notificación real cuando alguien guarda en favoritos
 */
export async function notifyRealFavorite(userId: string, targetId: string, type: 'vehicle' | 'business') {
    const isVehicle = type === 'vehicle'

    // Obtener detalles del item y el dueño
    const item = isVehicle
        ? await prisma.vehicle.findUnique({
            where: { id: targetId },
            select: { userId: true, title: true, status: true, moderationStatus: true }
        })
        : await prisma.business.findUnique({
            where: { id: targetId },
            select: { userId: true, name: true, isActive: true, slug: true, city: true }
        })

    if (!item || item.userId === userId) return // No notificarse a sí mismo

    // Verificar estado
    if (isVehicle) {
        const v = item as any
        if (v.status !== 'ACTIVE' || v.moderationStatus !== 'APPROVED') return
    } else {
        const b = item as any
        if (!b.isActive) return
    }

    if (isVehicle) {
        await upsertNotification({
            userId: item.userId,
            fromUserId: userId,
            type: 'VEHICLE_FAVORITED',
            title: '👍 ¡A alguien le gustó tu vehículo!',
            message: `Alguien le dio like a tu "${(item as any).title}".`,
            vehicleId: targetId,
            isFake: false,
            link: `/vehicle/${targetId}`
        })

        // Incrementar contador de dopamina del dueño
        await incrementDopamineCounter(item.userId)
    } else {
        const b = item as any
        const slug = generateBusinessSlug(b.name, b.city)
        await upsertNotification({
            userId: item.userId,
            fromUserId: userId,
            type: 'BUSINESS_VIEWED', 
            title: '👍 ¡A alguien le gusta tu negocio!',
            message: `Alguien le dio like a tu negocio "${b.name}".`,
            businessId: targetId,
            isFake: false,
            link: `/negocio/${slug}-${targetId}`
        })
        
        await incrementDopamineCounter(item.userId)
    }
}

/**
 * Genera una notificación real por vista (limitado a una por usuario/día para evitar spam)
 */
export async function trackRealView(userId: string | null, targetId: string, type: 'vehicle' | 'business') {
    const isVehicle = type === 'vehicle'
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 1. Registrar la vista en Analytics (o tabla específica)
    // Usaremos la tabla de AnalyticsEvent para esto
    await prisma.analyticsEvent.create({
        data: {
            userId,
            eventType: isVehicle ? 'VEHICLE_VIEW' : 'BUSINESS_CARD_OPEN',
            entityType: isVehicle ? 'VEHICLE' : 'BUSINESS',
            entityId: targetId
        }
    })

    // 1.1 Registrar tambien en la tabla contadora especifica (BusinessView) si es negocio
    // Esto cumple con el requerimiento: "cada vez que abran su etiqueta del mapa cuenta como vista"
    if (!isVehicle) {
        await prisma.businessView.create({
            data: {
                businessId: targetId,
                userId: userId
            }
        })
    }

    // 2. Notificar al dueño si es una vista "significativa" (ej. no del mismo dueño)
    const item = isVehicle
        ? await prisma.vehicle.findUnique({
            where: { id: targetId },
            select: { userId: true, title: true, status: true, moderationStatus: true }
        })
        : await prisma.business.findUnique({
            where: { id: targetId },
            select: { userId: true, name: true, isActive: true, slug: true, city: true }
        })

    if (!item || (userId && item.userId === userId)) return

    // Verificar estado
    if (isVehicle) {
        const v = item as any
        if (v.status !== 'ACTIVE' || v.moderationStatus !== 'APPROVED') return
    } else {
        const b = item as any
        if (!b.isActive) return
    }

    // Verificar si ya notificamos por este item hoy para este usuario (para no spamear al dueño)
    // En un sistema real usaríamos Redis, aquí consultamos la tabla de notificaciones recientes
    const recentNotif = await prisma.notification.findFirst({
        where: {
            userId: item.userId,
            type: isVehicle ? 'VEHICLE_VIEWED' : 'BUSINESS_VIEWED',
            vehicleId: isVehicle ? targetId : null,
            businessId: !isVehicle ? targetId : null,
            createdAt: { gte: today }
        }
    })

    if (!recentNotif) {
        const b = item as any
        const semanticLink = isVehicle 
            ? `/vehicle/${targetId}` 
            : `/negocio/${generateBusinessSlug(b.name, b.city)}-${targetId}`

        await upsertNotification({
            userId: item.userId,
            type: isVehicle ? 'VEHICLE_VIEWED' : 'BUSINESS_VIEWED',
            title: isVehicle ? '👀 ¡Interés real!' : '⭐ ¡Alguien ve tu negocio!',
            message: isVehicle
                ? `Una persona está viendo los detalles de tu "${(item as any).title}".`
                : `Un cliente potencial acaba de abrir la información de tu negocio "${(item as any).name}".`,
            vehicleId: isVehicle ? targetId : undefined,
            businessId: !isVehicle ? targetId : undefined,
            isFake: false,
            link: semanticLink
        })

        // Incrementar contador de dopamina del dueño
        await incrementDopamineCounter(item.userId)
    }
}
