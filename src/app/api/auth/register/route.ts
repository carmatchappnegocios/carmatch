import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { validateAndNormalizeEmail } from "@/lib/email-validation"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { escapeHtml } from "@/lib/sanitize"

function getIpFromHeaders(request: Request): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function POST(request: Request) {
    try {
        const ip = getIpFromHeaders(request)
        const rateLimit = checkRateLimit(`register:${ip}`, RATE_LIMITS.register)
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Demasiados registros. Intenta más tarde." },
                { status: 429 }
            )
        }

        const { email, password, name, website } = await request.json()

        // Honeypot check: bots fill hidden fields
        if (website) {
            return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 400 })
        }

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email y contraseña son requeridos" },
                { status: 400 }
            )
        }

        // Server-side email validation + normalization
        const validation = validateAndNormalizeEmail(email)
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            )
        }

        const normalizedEmail = validation.normalized

        // Password strength check
        if (password.length < 6) {
            return NextResponse.json(
                { error: "La contraseña debe tener al menos 6 caracteres" },
                { status: 400 }
            )
        }

        // Check if user already exists (with normalized email)
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Este email ya está registrado" },
                { status: 400 }
            )
        }

        // Check if this email or IP is blocked (fraud prevention)
        const blockedEmail = await prisma.blockedIdentity.findFirst({
            where: { blockedByEmail: normalizedEmail }
        })
        if (blockedEmail) {
            return NextResponse.json(
                { error: "No se pudo crear la cuenta" },
                { status: 403 }
            )
        }

        const blockedIp = await prisma.blockedIdentity.findFirst({
            where: { blockedByIp: ip }
        })
        if (blockedIp) {
            return NextResponse.json(
                { error: "No se pudo crear la cuenta" },
                { status: 403 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create user with normalized email (sanitize name to prevent XSS)
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                name: escapeHtml(name?.trim()) || normalizedEmail.split("@")[0],
            },
        })

        // 📊 REGISTRAR EVENTO: Usuario registrado
        try {
            const { trackUserEvent } = await import('@/lib/tracking')
            await trackUserEvent({
                eventType: 'USER_REGISTERED',
                userId: user.id,
                metadata: { email: normalizedEmail, method: 'email', ip }
            })
        } catch {
            // Fail silently
        }

        // 📊 REGISTRAR CONVERSIÓN WAITLIST: Si el email estaba en la waitlist
        try {
            const waitlistEntry = await prisma.waitlist.findUnique({
                where: { email: normalizedEmail }
            })
            if (waitlistEntry) {
                await prisma.analyticsEvent.create({
                    data: {
                        userId: user.id,
                        eventType: 'WAITLIST_CONVERSION',
                        entityType: 'USER',
                        metadata: {
                            waitlistSource: waitlistEntry.source,
                            waitlistCreatedAt: waitlistEntry.createdAt,
                            timestamp: new Date().toISOString()
                        }
                    }
                })
            }
        } catch {
            // Fail silently
        }

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error registering user:", error)
        return NextResponse.json(
            { error: "Error al crear la cuenta" },
            { status: 500 }
        )
    }
}
