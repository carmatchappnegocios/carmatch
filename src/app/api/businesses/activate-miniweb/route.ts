// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const { businessId } = await request.json()

        if (!businessId) {
            return NextResponse.json({ error: 'ID de negocio requerido' }, { status: 400 })
        }

        // 1. Verificar propiedad y estado actual
        const business = await prisma.business.findUnique({
            where: { id: businessId },
            select: { id: true, userId: true, name: true, hasMiniWeb: true }
        })

        if (!business) {
            return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
        }

        if (business.userId !== session.user.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }

        if (business.hasMiniWeb) {
            return NextResponse.json({ error: 'La Mini-Web ya está activa para este negocio' }, { status: 400 })
        }

        // 2. Verificar créditos y activar con transacción atómica
        try {
            await prisma.$transaction([
                // Atomic: only decrement if credits >= 20
                prisma.$executeRaw`UPDATE "User" SET credits = credits - 20 WHERE id = ${session.user.id} AND credits >= 20`,
                // Activar Mini-Web
                prisma.business.update({
                    where: { id: businessId },
                    data: { hasMiniWeb: true }
                }),
                // Registrar transacción
                prisma.creditTransaction.create({
                    data: {
                        userId: session.user.id,
                        amount: -20,
                        description: `Activación de Mini-Web Premium: ${business.name}`,
                        details: {
                            action: 'ACTIVATE_MINIWEB',
                            businessId,
                            businessName: business.name
                        }
                    }
                })
            ])
        } catch {
            return NextResponse.json({
                error: 'Créditos insuficientes',
                required: 20,
                current: user?.credits || 0
            }, { status: 402 })
        }

        return NextResponse.json({
            success: true,
            message: '¡Mini-Web activada con éxito!',
            hasMiniWeb: true
        })

    } catch (error) {
        console.error('Error activating mini-web:', error)
        return NextResponse.json({ error: 'Error interno al activar Mini-Web' }, { status: 500 })
    }
}
