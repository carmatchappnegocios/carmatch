'use server'

/**
 * 🩺 DIAGNÓSTICO REST v6.7 — "VERACIDAD TOTAL"
 * Valida la conexión nativa Bypass REST v1.
 */

import { geminiFlash } from '@/lib/ai/geminiModels'

export interface AiHealthReport {
    status: 'ok' | 'error' | 'warning'
    timestamp: string
    latencyMs: number
    message: string
    details?: string
    versionTested: string
    models?: { name: string; status: 'ok' | 'error', error?: string }[]
}

export async function testGeminiHealth(): Promise<AiHealthReport> {
    const start = Date.now()
    
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
        if (!apiKey) throw new Error('API Key faltante en el servidor')

        // Prueba el motor REST Bridge
        try {
            await geminiFlash.generateContent('ping');
            
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                latencyMs: Date.now() - start,
                message: 'Infraestructura de IA Operativa (REST Bypass v6.7)',
                versionTested: 'Survivor v6.7 (REST v1 Stable)',
                models: [{ name: 'REST v1 Bridge', status: 'ok' }]
            }
        } catch (e: any) {
            return {
                status: 'error',
                timestamp: new Date().toISOString(),
                latencyMs: Date.now() - start,
                message: 'Fallo Crítico de Infraestructura',
                versionTested: 'v6.7',
                details: e.message,
                models: [{ name: 'REST v1 Bridge', status: 'error', error: e.message }]
            }
        }
    } catch (error: any) {
        return {
            status: 'error',
            timestamp: new Date().toISOString(),
            latencyMs: Date.now() - start,
            message: 'Configuración de Credenciales Inválida',
            versionTested: 'v6.7 (Emergency)',
            details: error.message
        }
    }
}
