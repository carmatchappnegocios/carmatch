import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateAndNormalizeEmail } from "@/lib/email-validation"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const rl = checkRateLimit(`check-user:${ip}`, RATE_LIMITS.login)
        if (!rl.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
        }

        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: "Email es requerido" },
                { status: 400 }
            )
        }

        const validation = validateAndNormalizeEmail(email)
        if (!validation.valid) {
            // Always return success to prevent email enumeration
            return NextResponse.json({ success: true })
        }

        // Always return success regardless of whether user exists
        // This prevents attackers from enumerating valid email addresses
        await prisma.user.findUnique({
            where: { email: validation.normalized },
            select: { id: true },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error checking user:", error)
        return NextResponse.json({ success: true })
    }
}
