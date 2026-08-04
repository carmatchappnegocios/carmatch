import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
        const rl = checkRateLimit(`waitlist:${ip}`, { windowMs: 60000, max: 3 })
        if (!rl.allowed) {
            return NextResponse.json({ error: 'Demasiados intentos. Intenta más tarde.' }, { status: 429 })
        }

        const { email, name } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const signup = await prisma.waitlist.create({
            data: { email, name }
        })

        return NextResponse.json(signup)
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Ya estás registrado como pionero.' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Error al registrarse' }, { status: 500 })
    }
}
