// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'

/**
 * REPORT SYSTEM: Reportar publicaciones ofensivas o fraudulentas.
 * 🛡️ REGLA DE SEGURIDAD: Solo usuarios registrados pueden reportar.
 * 🛡️ REGLA ANTI-SABOTAJE: El reporte NO oculta la publicación de inmediato 
 * para evitar que usuarios malintencionados borren la competencia. Solo el admin decide.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        
        // 🛡️ SECURITY FIX: Solo usuarios logueados pueden reportar para evitar spam anónimo masivo
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Debes iniciar sesión para reportar una publicación' }, { status: 401 })
        }

        const reporterId = session.user.id

        // Rate limiting: max 10 reports per day per user
        const rateLimit = checkRateLimit(`report:${reporterId}`, { windowMs: 24 * 60 * 60 * 1000, max: 10 })
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: 'Límite de reportes alcanzado. Intenta de nuevo mañana.' }, { status: 429 })
        }

        const body = await request.json()
        const { reason, description, imageUrl, vehicleId, businessId, targetUserId } = body

        if (!reason) {
            return NextResponse.json({ error: 'Faltan datos requeridos (motivo)' }, { status: 400 })
        }

        const report = await prisma.report.create({
            data: {
                reporterId: reporterId,
                reason,
                description,
                imageUrl: imageUrl || null,
                vehicleId: vehicleId || null,
                businessId: businessId || null,
                targetUserId: targetUserId || null,
                status: 'PENDING'
            }
        })

        return NextResponse.json(report)
    } catch (error) {
        console.error('Error creating report:', error)
        return NextResponse.json({ error: 'Error al enviar reporte' }, { status: 500 })
    }
}
