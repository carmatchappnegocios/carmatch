import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { checkRateLimit } from '@/lib/rate-limit'
import { passwordResetTokens } from '../forgot-password/route'

function getIpFromHeaders(request: Request): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function POST(request: Request) {
    try {
        const ip = getIpFromHeaders(request)

        const { token, newPassword } = await request.json()

        if (!token || typeof token !== 'string') {
            return NextResponse.json(
                { error: 'Token es requerido' },
                { status: 400 }
            )
        }

        if (!newPassword || typeof newPassword !== 'string') {
            return NextResponse.json(
                { error: 'Nueva contraseña es requerida' },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres' },
                { status: 400 }
            )
        }

        const rateLimit = checkRateLimit(`reset-password:${ip}`, {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5,
        })
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Demasiados intentos. Intenta más tarde.' },
                { status: 429 }
            )
        }

        const entry = passwordResetTokens.get(token)

        if (!entry) {
            return NextResponse.json(
                { error: 'Token inválido o expirado' },
                { status: 400 }
            )
        }

        if (Date.now() > entry.expiresAt) {
            passwordResetTokens.delete(token)
            return NextResponse.json(
                { error: 'Token inválido o expirado' },
                { status: 400 }
            )
        }

        const hashedPassword = await hashPassword(newPassword)

        await prisma.user.update({
            where: { id: entry.userId },
            data: {
                password: hashedPassword,
                lastPasswordChange: new Date(),
            },
        })

        passwordResetTokens.delete(token)

        return NextResponse.json({
            success: true,
            message: 'Contraseña actualizada correctamente',
        })
    } catch (error) {
        console.error('Error in reset-password:', error)
        return NextResponse.json(
            { error: 'Error al restablecer la contraseña' },
            { status: 500 }
        )
    }
}
