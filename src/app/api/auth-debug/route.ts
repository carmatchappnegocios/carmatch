import { NextResponse } from 'next/server'

export async function GET() {
    const secret = process.env.NEXTAUTH_SECRET || ''
    const googleId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || ''
    const googleSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || ''

    const result: any = {
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? `OK (${secret.length} chars)` : 'MISSING',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? `OK (${googleId.substring(0, 20)}...)` : 'MISSING',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? `OK (...${googleSecret.slice(-4)})` : 'MISSING',
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? 'OK' : 'MISSING',
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? 'OK' : 'MISSING',
        DATABASE_URL: process.env.DATABASE_URL ? 'OK' : 'MISSING',
        DIRECT_URL: process.env.DIRECT_URL ? 'OK' : 'MISSING',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'MISSING',
        NODE_ENV: process.env.NODE_ENV || 'MISSING',
    }

    try {
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()
        await prisma.$queryRaw`SELECT 1`
        result.DATABASE_CONNECTION = 'OK'
        await prisma.$disconnect()
    } catch (e: any) {
        result.DATABASE_CONNECTION = `ERROR: ${e.message}`
    }

    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
}
