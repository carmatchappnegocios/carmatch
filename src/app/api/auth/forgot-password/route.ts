import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { validateAndNormalizeEmail } from '@/lib/email-validation'
import { checkRateLimit } from '@/lib/rate-limit'
import { passwordResetTokens, TOKEN_EXPIRY_MS } from '@/lib/password-reset-tokens'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email es requerido' },
                { status: 400 }
            )
        }

        const validation = validateAndNormalizeEmail(email)
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            )
        }

        const normalizedEmail = validation.normalized

        const rateLimit = checkRateLimit(`forgot-password:${normalizedEmail}`, {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 3,
        })
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Demasiadas solicitudes. Intenta más tarde.' },
                { status: 429 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true },
        })

        if (user) {
            const token = crypto.randomBytes(32).toString('hex')
            const expiresAt = Date.now() + TOKEN_EXPIRY_MS

            passwordResetTokens.set(token, {
                token,
                userId: user.id,
                expiresAt,
            })

            const baseUrl = process.env.NEXTAUTH_URL || 'https://carmatchapp.net'
            const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

            try {
                const { Resend } = await import('resend')
                const resend = new Resend(process.env.RESEND_API_KEY)

                await resend.emails.send({
                    from: 'CarMatch <noreply@carmatchapp.net>',
                    to: normalizedEmail,
                    subject: 'Restablece tu contraseña - CarMatch',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #f97316;">Restablece tu contraseña</h2>
                            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                            <a href="${resetUrl}" style="display: inline-block; background: #f97316; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">
                                Restablecer contraseña
                            </a>
                            <p style="color: #666; font-size: 13px;">Este enlace expira en 1 hora.</p>
                            <p style="color: #666; font-size: 13px;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
                        </div>
                    `,
                })
            } catch (emailError) {
                console.error('Error sending reset email:', emailError)
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.',
        })
    } catch (error) {
        console.error('Error in forgot-password:', error)
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 500 }
        )
    }
}
