// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { discoverNewBrands, discoverNewModels, discoverNewVehicleTypes } from '@/lib/ai/vehicleDiscovery'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max

export async function GET(request: NextRequest) {
    const startTime = Date.now()

    // Verificar token de seguridad de Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let brandsAdded = 0
    let modelsAdded = 0
    let typesAdded = 0
    const errors: string[] = []

    try {
        // El modelo se maneja automáticamente a través de safeGenerateContent

        // PASO 1: Descubrir nuevas marcas
        try {
            brandsAdded = await discoverNewBrands()
        } catch (error: any) {
            console.error('❌ Error descubriendo marcas:', error)
            errors.push(`Brands: ${error.message}`)
        }

        // PASO 2: Descubrir nuevos modelos
        try {
            modelsAdded = await discoverNewModels()
        } catch (error: any) {
            console.error('❌ Error descubriendo modelos:', error)
            errors.push(`Models: ${error.message}`)
        }

        // PASO 3: Descubrir nuevos tipos
        try {
            typesAdded = await discoverNewVehicleTypes()
        } catch (error: any) {
            console.error('❌ Error descubriendo tipos:', error)
            errors.push(`Types: ${error.message}`)
        }

        const executionTime = Date.now() - startTime
        const status = errors.length > 0 ? 'partial' : 'success'

        // Guardar log
        await prisma.autoUpdateLog.create({
            data: {
                status,
                brandsAdded,
                modelsAdded,
                typesAdded,
                errors: errors.length > 0 ? errors.join('; ') : null,
                executionTime,
                metadata: {
                    timestamp: new Date().toISOString(),
                    model: 'gemini-flash-latest'
                }
            }
        })

        return NextResponse.json({
            success: true,
            stats: {
                brandsAdded,
                modelsAdded,
                typesAdded,
                executionTime
            },
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error('💥 [AUTO-UPDATE] Error crítico:', error)

        await prisma.autoUpdateLog.create({
            data: {
                status: 'failed',
                brandsAdded: 0,
                modelsAdded: 0,
                typesAdded: 0,
                errors: error.message,
                executionTime: Date.now() - startTime
            }
        })

        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        )
    }
}
