import { prisma } from '@/lib/db'

/**
 * Registrar vista de página en analytics
 * Se ejecuta server-side para evitar problemas de CORS
 */
export async function trackPageView(options: {
    url: string
    userId?: string | null
    referrer?: string
    userAgent?: string
}) {
    try {
        await prisma.analyticsEvent.create({
            data: {
                userId: options.userId || null,
                eventType: 'PAGE_VIEW',
                entityType: 'APP',
                metadata: {
                    url: options.url,
                    referrer: options.referrer || null,
                    userAgent: options.userAgent || null,
                    timestamp: new Date().toISOString()
                }
            }
        })
    } catch {
        // Fail silently — analytics no debe bloquear la app
    }
}

/**
 * Registrar evento de usuario (registro, login, logout)
 */
export async function trackUserEvent(options: {
    eventType: 'USER_REGISTERED' | 'USER_LOGGED_IN' | 'USER_LOGGED_OUT'
    userId: string
    metadata?: Record<string, any>
}) {
    try {
        await prisma.analyticsEvent.create({
            data: {
                userId: options.userId,
                eventType: options.eventType,
                entityType: 'USER',
                metadata: {
                    ...options.metadata,
                    timestamp: new Date().toISOString()
                }
            }
        })
    } catch {
        // Fail silently
    }
}

/**
 * Registrar evento de chat/mensaje
 */
export async function trackChatEvent(options: {
    eventType: 'CHAT_CREATED' | 'MESSAGE_SENT' | 'MESSAGE_READ'
    userId: string
    chatId: string
    metadata?: Record<string, any>
}) {
    try {
        await prisma.analyticsEvent.create({
            data: {
                userId: options.userId,
                eventType: options.eventType,
                entityType: 'CHAT',
                entityId: options.chatId,
                metadata: {
                    ...options.metadata,
                    timestamp: new Date().toISOString()
                }
            }
        })
    } catch {
        // Fail silently
    }
}

/**
 * Registrar evento de pago
 */
export async function trackPaymentEvent(options: {
    eventType: 'PAYMENT_INITIATED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED'
    userId: string
    metadata?: Record<string, any>
}) {
    try {
        await prisma.analyticsEvent.create({
            data: {
                userId: options.userId,
                eventType: options.eventType,
                entityType: 'PAYMENT',
                metadata: {
                    ...options.metadata,
                    timestamp: new Date().toISOString()
                }
            }
        })
    } catch {
        // Fail silently
    }
}

/**
 * Registrar evento de publicación
 */
export async function trackListingEvent(options: {
    eventType: 'LISTING_CREATED' | 'LISTING_APPROVED' | 'LISTING_REJECTED'
    userId: string
    entityId: string
    entityType: 'VEHICLE' | 'BUSINESS'
    metadata?: Record<string, any>
}) {
    try {
        await prisma.analyticsEvent.create({
            data: {
                userId: options.userId,
                eventType: options.eventType,
                entityType: options.entityType,
                entityId: options.entityId,
                metadata: {
                    ...options.metadata,
                    timestamp: new Date().toISOString()
                }
            }
        })
    } catch {
        // Fail silently
    }
}

/**
 * Registrar evento de cita
 */
export async function trackAppointmentEvent(options: {
    eventType: 'APPOINTMENT_CREATED' | 'APPOINTMENT_COMPLETED' | 'APPOINTMENT_CANCELLED'
    userId: string
    entityId: string
    metadata?: Record<string, any>
}) {
    try {
        await prisma.analyticsEvent.create({
            data: {
                userId: options.userId,
                eventType: options.eventType,
                entityType: 'APPOINTMENT',
                entityId: options.entityId,
                metadata: {
                    ...options.metadata,
                    timestamp: new Date().toISOString()
                }
            }
        })
    } catch {
        // Fail silently
    }
}

/**
 * Registrar evento de notificación abierta/clickeada
 */
export async function trackNotificationEvent(options: {
    eventType: 'NOTIFICATION_OPENED' | 'NOTIFICATION_CLICKED'
    userId: string
    notificationId: string
    metadata?: Record<string, any>
}) {
    try {
        await prisma.analyticsEvent.create({
            data: {
                userId: options.userId,
                eventType: options.eventType,
                entityType: 'NOTIFICATION',
                entityId: options.notificationId,
                metadata: {
                    ...options.metadata,
                    timestamp: new Date().toISOString()
                }
            }
        })
    } catch {
        // Fail silently
    }
}
