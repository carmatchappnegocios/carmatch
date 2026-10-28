import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/db'
import { createVerificationToken } from '@/lib/email-tokens'
import { validateAndNormalizeEmail } from '@/lib/email-validation'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY)

function getIpFromHeaders(request: Request): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function POST(request: Request) {
    try {
        const ip = getIpFromHeaders(request)
        const rateLimit = checkRateLimit(`verify:${ip}`, RATE_LIMITS.verifyEmail)
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Demasiadas solicitudes. Intenta más tarde.' },
                { status: 429 }
            )
        }

        const { email } = await request.json()

        const validation = validateAndNormalizeEmail(email)
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 })
        }

        const normalizedEmail = validation.normalized

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, emailVerified: true },
        })

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({ success: true })
        }

        // If already verified, no need to send again
        if (user.emailVerified) {
            return NextResponse.json({ success: true })
        }

        const token = await createVerificationToken(normalizedEmail)
        const baseUrl = process.env.NEXTAUTH_URL || 'https://carmatchapp.net'
        const verifyUrl = `${baseUrl}/api/auth/verify-email/confirm?token=${token}`

        await resend.emails.send({
            from: 'CarMatch <noreply@carmatchapp.net>',
            to: normalizedEmail,
            subject: 'Verifica tu correo - CarMatch',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #f97316;">Bienvenido a CarMatch</h2>
                    <p>Haz clic en el botón para verificar tu correo electrónico:</p>
                    <a href="${verifyUrl}" style="display: inline-block; background: #f97316; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">
                        Verificar mi correo
                    </a>
                    <p style="color: #666; font-size: 13px;">Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
                    <p style="color: #666; font-size: 13px;">Este enlace expira en 24 horas.</p>
                </div>
            `,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error sending verification email:', error)
        return NextResponse.json({ error: 'Error al enviar correo' }, { status: 500 })
    }
}
