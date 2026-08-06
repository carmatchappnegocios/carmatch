// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.


import { NextResponse } from 'next/server';
import { interpretSearchQuery } from '@/lib/ai/searchInterpreter';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

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

        // 📊 ALMACENAR BÚSQUEDA: Registrar métrica de búsqueda con filtros completos
        try {
            const session = await auth()
            await prisma.searchMetric.create({
                data: {
                    query,
                    category: context || 'MARKET',
                    latitude: 0,
                    longitude: 0,
                    userId: session?.user?.id || null,
                    brand: filters.brand || null,
                    model: filters.model || null,
                    minPrice: filters.minPrice ? Number(filters.minPrice) : null,
                    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : null,
                    minYear: filters.minYear || null,
                    maxYear: filters.maxYear || null,
                    vehicleType: filters.vehicleType || null,
                    color: filters.color || null,
                    fuel: filters.fuel || null,
                    transmission: filters.transmission || null,
                    cylinders: filters.cylinders || null,
                    features: filters.features || []
                }
            })
        } catch {
            // Fail silently — analytics no debe bloquear la búsqueda
        }

        return NextResponse.json(filters);
    } catch (error) {
        console.error("API Search Error:", error);
        return NextResponse.json({}, { status: 500 });
    }
}
