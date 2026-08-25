import { NextResponse } from "next/server"

export async function GET() {
    const envCheck = {
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_ID_length: process.env.GOOGLE_CLIENT_ID?.length || 0,
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CLIENT_SECRET_length: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
        GOOGLE_CLIENT_SECRET_endsWith_pMrY: process.env.GOOGLE_CLIENT_SECRET?.endsWith("pMrY") || false,
        AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
        AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NEXTAUTH_SECRET_length: process.env.NEXTAUTH_SECRET?.length || 0,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
        NODE_ENV: process.env.NODE_ENV,
    }

    return NextResponse.json(envCheck, { status: 200 })
}
