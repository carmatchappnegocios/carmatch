
import { prisma } from '@/lib/db'
import { generateDopamineMessage } from '@/lib/dopamineMessages'
import { generateBusinessSlug } from '@/lib/slug'

export async function processBusinessDopamine(force: boolean = false) {
    // DESACTIVADO: no se generan notificaciones falsas de negocio
    return {
        success: true,
        generated: 0
    }
}
