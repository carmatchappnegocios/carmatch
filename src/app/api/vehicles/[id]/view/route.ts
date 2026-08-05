// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { trackRealView } from '@/lib/realNotifications'

const viewCounts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const entry = viewCounts.get(ip)
    if (!entry || now > entry.resetAt) {
        viewCounts.set(ip, { count: 1, resetAt: now + 60_000 })
        return false
    }
    entry.count++
    return entry.count > 30
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
        if (isRateLimited(ip)) {
            return NextResponse.json({ error: 'Rate limit' }, { status: 429 })
        }

        const session = await auth()
        const { id } = await params
        const vehicleId = id

        await trackRealView(session?.user?.id || null, vehicleId, 'vehicle')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error tracking vehicle view:', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
