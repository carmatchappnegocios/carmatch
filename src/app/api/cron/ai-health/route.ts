import { NextResponse } from 'next/server'
import { testGeminiHealth } from '@/app/admin/actions/ai-health-actions'

export const dynamic = 'force-dynamic'

// 🛡️ REGLA SOBERANA: Este cron valida la salud de la IA y su capacidad de visión.

export async function GET(request: Request) {
    // Vercel Cron Authentication
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const report = await testGeminiHealth()

        if (report.status === 'error') {
            // Aquí podríamos enviar un email, push notification o guardar en BD
            console.error('[CRON AI-HEALTH] CRITICAL ERROR:', report.message, report.details)
            // Respondemos 500 para que Vercel marque el cron como fallido
            return NextResponse.json(report, { status: 500 })
        }

        if (report.status === 'warning') {
            console.warn('[CRON AI-HEALTH] WARNING:', report.message, report.details)
        } else {
            console.log('[CRON AI-HEALTH] OK:', report.latencyMs, 'ms')
        }

        return NextResponse.json(report)
    } catch (e: any) {
        console.error('[CRON AI-HEALTH] CATCH ERROR:', e.message)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
