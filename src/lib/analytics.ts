// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.


type EventType =
    | 'VIEW' | 'CLICK' | 'CONTACT' | 'SEARCH' | 'FAVORITE' | 'SHARE' | 'MAPSTORE_SEARCH' | 'BUSINESS_CLICK'
    | 'VEHICLE_VIEW' | 'BUSINESS_CARD_OPEN'
    | 'PAGE_VIEW'
    | 'USER_REGISTERED' | 'USER_LOGGED_IN' | 'USER_LOGGED_OUT'
    | 'CHAT_CREATED' | 'MESSAGE_SENT' | 'MESSAGE_READ'
    | 'NOTIFICATION_OPENED' | 'NOTIFICATION_CLICKED'
    | 'PAYMENT_INITIATED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED'
    | 'LISTING_CREATED' | 'LISTING_APPROVED' | 'LISTING_REJECTED'
    | 'DISLIKE'
    | 'MAP_PIN_CLICKED' | 'MAP_ZOOM_CHANGED'
    | 'IMAGE_VIEWED' | 'IMAGE_GALLERY_OPENED'
    | 'APPOINTMENT_CREATED' | 'APPOINTMENT_COMPLETED' | 'APPOINTMENT_CANCELLED'
    | 'WAITLIST_CONVERSION'
    | 'SESSION_STARTED' | 'SESSION_ENDED'
type EntityType = 'VEHICLE' | 'BUSINESS' | 'APP' | 'PROFILE' | 'USER' | 'CHAT' | 'MESSAGE' | 'NOTIFICATION' | 'PAYMENT' | 'LISTING' | 'APPOINTMENT' | 'MAP' | 'SESSION'

interface TrackOptions {
    entityId?: string
    metadata?: Record<string, any>
}

/**
 * Enviar evento al Cerebro de Estadísticas
 */
export async function trackEvent(
    eventType: EventType,
    entityType: EntityType,
    options: TrackOptions = {}
) {
    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType,
                entityType,
                entityId: options.entityId,
                metadata: options.metadata
            })
        })
    } catch (error) {
        // Fail silently para no afectar UX
        console.error('Analytics fail:', error)
    }
}

/**
 * Tracking específico para MapStore
 */
export async function trackMapStoreSearch(options: {
    category: string          // 'taller_mecanico' | 'refacciones' | etc.
    subcategory?: string      // 'general'
    searchQuery: string       // texto de búsqueda
    city: string
    latitude: number
    longitude: number
    nearestBusinessId?: string
    distanceKm?: number
    clicked?: boolean
}) {
    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType: 'MAPSTORE_SEARCH',
                category: options.category,
                subcategory: options.subcategory || 'general',
                searchQuery: options.searchQuery,
                city: options.city,
                latitude: options.latitude,
                longitude: options.longitude,
                businessId: options.nearestBusinessId,
                distanceKm: options.distanceKm,
                clicked: options.clicked || false
            })
        })
    } catch (error) {
        console.error('MapStore analytics fail:', error)
    }
}

/**
 * Tracking de click en negocio
 */
export async function trackBusinessClick(businessId: string, city: string) {
    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType: 'BUSINESS_CLICK',
                businessId,
                city,
                clicked: true
            })
        })
    } catch (error) {
        console.error('Business click analytics fail:', error)
    }
}
