// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.


import { NextResponse } from 'next/server';
import { interpretSearchQuery } from '@/lib/ai/searchInterpreter';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
        const rl = checkRateLimit(`ai-search:${ip}`, RATE_LIMITS.aiSearch)
        if (!rl.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
        }

        const body = await req.json();
        const { query, context, city } = body; // context: 'MARKET' or 'MAP'

        if (!query) {
            return NextResponse.json({ filters: {} });
        }

        const filters = await interpretSearchQuery(query, context || 'MARKET', city);

        return NextResponse.json(filters);
    } catch (error) {
        console.error("API Search Error:", error);
        return NextResponse.json({}, { status: 500 });
    }
}
