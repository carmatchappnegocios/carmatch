
import { prisma } from '@/lib/db'
import { generateRandomFakeNotifications } from '@/lib/fakeNotifications'

/**
 * Procesa la generación de dopamina (notificaciones falsas) para usuarios
 * DESACTIVADO: no se generan notificaciones falsas
 * @param force Si es true, ignora las probabilidades y contadores para forzar la generación (AUDIT MODE)
 */
export async function processVehicleDopamine(force: boolean = false) {
    // Desactivado completamente
    return {
        success: true,
        usersProcessed: 0,
        totalGenerated: 0
    }
}
