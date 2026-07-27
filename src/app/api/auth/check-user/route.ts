import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateAndNormalizeEmail } from "@/lib/email-validation"

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: "Email es requerido" },
                { status: 400 }
            )
        }

        const validation = validateAndNormalizeEmail(email)
        if (!validation.valid) {
            // Always return the same response to prevent enumeration
            return NextResponse.json({ exists: false })
        }

        const user = await prisma.user.findUnique({
            where: { email: validation.normalized },
            select: { id: true },
        })

        return NextResponse.json({ exists: !!user })
    } catch (error) {
        console.error("Error checking user:", error)
        // Always return the same response to prevent enumeration
        return NextResponse.json({ exists: false })
    }
}
