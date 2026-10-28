import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/email-tokens'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.redirect(new URL('/auth?error=invalid-token', process.env.NEXTAUTH_URL || 'https://carmatchapp.net'))
        }

        const email = await verifyToken(token)

        if (!email) {
            return NextResponse.redirect(new URL('/auth?error=expired-token', process.env.NEXTAUTH_URL || 'https://carmatchapp.net'))
        }

        // Mark email as verified
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        })

        return NextResponse.redirect(new URL('/auth?verified=true', process.env.NEXTAUTH_URL || 'https://carmatchapp.net'))
    } catch (error) {
        console.error('Error verifying email:', error)
        return NextResponse.redirect(new URL('/auth?error=verification-failed', process.env.NEXTAUTH_URL || 'https://carmatchapp.net'))
    }
}
