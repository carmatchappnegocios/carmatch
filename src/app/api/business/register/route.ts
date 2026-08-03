import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * @deprecated Use POST /api/businesses instead
 */
export async function POST(request: NextRequest) {
    return NextResponse.redirect(new URL('/api/businesses', request.url), { status: 308 })
}
