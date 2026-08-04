// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextResponse } from 'next/server'
import { processAppointmentSafety } from '@/lib/cron/monitor'

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const result = await processAppointmentSafety()
        return NextResponse.json({ ...result })
    } catch (error) {
        console.error('Error in appointment monitor:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

