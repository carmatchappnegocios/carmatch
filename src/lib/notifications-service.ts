import { prisma } from './db'

export type NotificationType = 
    | 'VEHICLE_FAVORITED' 
    | 'VEHICLE_VIEWED' 
    | 'BUSINESS_VIEWED' 
    | 'BUSINESS_SEARCHED' 
    | 'ENGAGEMENT_FAVORITES'
    | 'BUSINESS_ENGAGEMENT'
    | 'VEHICLE_REACTIVATED'
    | 'NEW_MESSAGE'
    | 'APPOINTMENT_REMINDER'
    | 'APPOINTMENT_REQUEST'
    | 'APPOINTMENT_MODIFIED'
    | 'APPOINTMENT_ACCEPTED'
    | 'APPOINTMENT_REJECTED'
    | 'VEHICLE_AUTO_RENEWED'
    | 'VEHICLE_EXPIRED_NO_CREDITS'
    | 'VEHICLE_EXPIRES_2_DAYS'
    | 'BUSINESS_ACTIVITY'

interface CreateNotificationParams {
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
    vehicleId?: string
    businessId?: string
    fromUserId?: string
    metadata?: any
    isFake?: boolean
}

/**
 * Crea o actualiza una notificación (acumulación)
 */
export async function upsertNotification(params: CreateNotificationParams) {
    const { 
        userId, 
        type, 
        title, 
        message, 
        link, 
        vehicleId, 
        businessId, 
        fromUserId, 
        metadata, 
        isFake = false 
    } = params

    // 🔍 Solo acumulamos notificaciones de tipo Social/Engagement que NO hayan sido leídas
    const aggregatableTypes: NotificationType[] = [
        'VEHICLE_FAVORITED', 
        'VEHICLE_VIEWED', 
        'BUSINESS_VIEWED', 
        'BUSINESS_SEARCHED',
        'ENGAGEMENT_FAVORITES',
        'BUSINESS_ENGAGEMENT',
        'NEW_MESSAGE',
        'BUSINESS_ACTIVITY'
    ]

    if (aggregatableTypes.includes(type)) {
        // Buscar notificación existente NO LEÍDA del mismo tipo y recurso
        const existing = await prisma.notification.findFirst({
            where: {
                userId,
                type,
                isRead: false,
                ...(vehicleId && { vehicleId }),
                ...(businessId && { businessId }),
                ...(fromUserId && type === 'NEW_MESSAGE' && { fromUserId }), // Para mensajes, agrupamos por emisor
                ...(metadata?.chatId && { metadata: { path: ['chatId'], equals: metadata.chatId } })
            },
            orderBy: { createdAt: 'desc' }
        })

        if (existing) {
            const newCount = (existing.count || 1) + 1
            const updatedMessage = generateAggregatedMessage(type, newCount, message)

            return await prisma.notification.update({
                where: { id: existing.id },
                data: {
                    count: newCount,
                    message: updatedMessage,
                    link: link || existing.link,
                    metadata: { ...((existing.metadata as any) || {}), ...(metadata || {}), aggregatedAt: new Date() },
                    // No tocamos createdAt para mantener el orden cronológico real
                    isFake: isFake || existing.isFake
                }
            })
        }
    }

    // Si no es acumulable o no se encontró una existente, crear nueva
    return await prisma.notification.create({
        data: {
            userId,
            type,
            title,
            message,
            link,
            vehicleId,
            businessId,
            fromUserId,
            metadata,
            isFake,
            count: 1
        }
    })
}

/**
 * Genera un mensaje humanizado basado en el contador
 */
function generateAggregatedMessage(type: NotificationType, count: number, originalMessage: string): string {
    // Intentar extraer el nombre del recurso del mensaje original o usar uno genérico
    // Por ejemplo: "A alguien le gustó tu Ford F150" -> "A 2 personas les gustó tu Ford F150"
    
    switch (type) {
        case 'VEHICLE_FAVORITED':
        case 'ENGAGEMENT_FAVORITES':
            return `👍 A ${count} personas les gusta tu vehículo.`
        case 'VEHICLE_VIEWED':
            return `👀 ${count} personas están viendo tu vehículo hoy.`
        case 'BUSINESS_VIEWED':
            return `⭐ ${count} personas han visto tu negocio recientemente.`
        case 'BUSINESS_SEARCHED':
            return `🔍 ${count} personas buscaron negocios como el tuyo.`
        case 'BUSINESS_ENGAGEMENT':
            return `📊 Tu negocio ha recibido ${count} interacciones esta semana.`
        case 'NEW_MESSAGE':
            return `💬 Tienes ${count} nuevos mensajes por leer.`
        case 'BUSINESS_ACTIVITY':
            return `📈 Tu negocio tiene ${count} nuevas actividades hoy.`
        default:
            return `${originalMessage} (${count})`
    }
}
