
import { prisma } from '@/lib/db'

// Rango objetivo de interacciones mensuales simuladas
const MIN_TARGET = 58
const MAX_TARGET = 123

/**
 * Motor de Dopamina: Genera engagement simulado para mantener retencin
 * Regla: Solo mtricas de vanidad (Vistas, Likes annimos). NUNCA mensajes o citas falsas.
 */
export async function processDopamineLogic(targetId: string, type: 'VEHICLE' | 'BUSINESS') {
    const today = new Date()
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

    // 0. Verificar que el item esté activo y aprobado antes de generar dopamina
    if (type === 'VEHICLE') {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: targetId },
            select: { status: true, moderationStatus: true }
        })
        if (!vehicle || vehicle.status !== 'ACTIVE' || vehicle.moderationStatus !== 'APPROVED') {
            return null
        }
    } else {
        const business = await prisma.business.findUnique({
            where: { id: targetId },
            select: { isActive: true }
        })
        if (!business || !business.isActive) {
            return null
        }
    }

    // 1. Obtener o Crear registro de métricas simuladas para este mes
    let metric = await prisma.simulatedMetric.findUnique({
        where: {
            targetId_month: {
                targetId,
                month: monthKey
            }
        }
    })

    // Si no existe, inicializar con un objetivo aleatorio para este mes
    if (!metric) {
        const randomTarget = Math.floor(Math.random() * (MAX_TARGET - MIN_TARGET + 1)) + MIN_TARGET
        metric = await prisma.simulatedMetric.create({
            data: {
                targetId,
                targetType: type,
                month: monthKey,
                target: randomTarget,
                count: 0
            }
        })
    }

    // 2. Verificar si debemos simular interacción hoy
    // Estrategia: Distribuir el objetivo restante en los días restantes del mes
    // Probabilidad = (Meta - Actual) / Días_Restantes
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const daysLeft = Math.max(1, daysInMonth - today.getDate())
    const countNeeded = Math.max(0, metric.target - metric.count)

    if (countNeeded <= 0) return null // Meta cumplida

    const probability = countNeeded / daysLeft
    // Factor de aleatoriedad extra (0.5 a 1.5) para que no sea lineal
    const randomFactor = 0.5 + Math.random()

    // Decisión de simular
    if (Math.random() < (probability * randomFactor)) {
        // ACTUALIZAR CONTADOR
        await prisma.simulatedMetric.update({
            where: { id: metric.id },
            data: { count: { increment: 1 } }
        })

        return type === 'VEHICLE'
            ? generateVehicleNotification()
            : generateBusinessNotification()
    }

    return null
}

function generateVehicleNotification() {
    const messages = [
        "A un usuario le encantó tu vehículo ❤️",
        "Tu auto apareció en 15 búsquedas hoy 🔥",
        "Alguien guardó tu auto en favoritos ⭐",
        "Tu publicación está ganando popularidad 🚀"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
}

function generateBusinessNotification() {
    const messages = [
        "10 personas vieron tu perfil de negocio hoy 🏢",
        "Tu taller apareció en búsquedas cercanas 🗺️",
        "Clientes potenciales están viendo tu ubicación 📍",
        "Tu negocio es popular en tu zona hoy 🔥"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
}
