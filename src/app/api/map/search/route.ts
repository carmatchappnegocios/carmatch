// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const rl = checkRateLimit(`map-search:${session.user.id}`, { windowMs: 60000, max: 30 })
    if (!rl.allowed) {
        return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 })
    }

    const { searchParams } = new URL(req.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const radius = parseFloat(searchParams.get('radius') || '10') // km
    const query = searchParams.get('query') || ''
    const categories = searchParams.get('categories')?.split(',') || []

    if (!lat || !lng) {
        return NextResponse.json({ error: 'Lat/Lng required' }, { status: 400 })
    }

    // Calcular bounding box aproximado para filtrar rápido antes de la fórmula exacta
    // 1 grado lat ~= 111km
    const r_earth = 6378
    const dy = 360 * radius / r_earth
    const dx = 360 * radius / (r_earth * Math.cos(lat * Math.PI / 180))

    const latMin = lat - dy
    const latMax = lat + dy
    const lngMin = lng - dx
    const lngMax = lng + dx

    try {
        // 1. Buscar Negocios
        // 1. Buscar Negocios
        const whereBusiness: any = {
            latitude: { gte: latMin, lte: latMax },
            longitude: { gte: lngMin, lte: lngMax },
            isActive: true  // 🔧 FIX: Business usa 'isActive', no 'status'
        }

        if (categories.length > 0) {
            whereBusiness.category = { in: categories }
        }

        if (query) {
            // Lógica Híbrida Inteligente 🧠
            // 1. Intentar búsqueda de texto normal primero (Nombre o Descripción)
            const textSearchCondition = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ];

            // 2. Si la IA sugiere categorías, añadirlas al filtro OR
            try {
                // Import dinámico para no romper build si falta archivo, aunque ya lo creé
                const { interpretMapQuery } = await import('@/lib/map-ai');
                const aiCategories = await interpretMapQuery(query);

                if (aiCategories.length > 0) {
                    console.log(`🤖 AI interpretó "${query}" como: ${aiCategories.join(', ')}`);
                    // Añadir búsqueda por categoría sugerida
                    whereBusiness.OR = [
                        ...textSearchCondition,
                        { category: { in: aiCategories } }
                    ];
                } else {
                    whereBusiness.OR = textSearchCondition;
                }
            } catch (e) {
                whereBusiness.OR = textSearchCondition;
            }
        }

        const businesses = await prisma.business.findMany({
            where: whereBusiness,
            select: {
                id: true,
                name: true,
                category: true,
                latitude: true,
                longitude: true,
                images: true,
                phone: true,
                address: true,
                description: true
            }
        })

        // 2. Buscar Vehículos (Solo si no hay categorías de negocio específicas seleccionadas, o si se pide explícitamente ver autos)
        // Para simplificar, siempre mostraremos autos a menos que se filtren *solo* negocios.
        // Pero el filtro actual es de categorías de negocio. Asumiremos que si no hay filtros o si hay un switch "ver autos", se muestran.
        // Por ahora, traemos autos siempre.

        let vehicles: any[] = []
        // Solo buscar vehículos si NO hay categorías de negocio seleccionadas (modo exploración general) 
        // O podríamos decidir mezclarlos. El usuario dijo "Map Store", pero el prompt inicial decía "Mapa de Negocios". 
        // Sin embargo, el "Third Feed" dice "Visualiza talleres... y más".
        // Vamos a incluir vehículos para que sea "Super Mapa".

        const whereVehicle: any = {
            latitude: { gte: latMin, lte: latMax },
            longitude: { gte: lngMin, lte: lngMax },
            status: 'ACTIVE'
        }

        if (query) {
            whereVehicle.OR = [
                { brand: { contains: query, mode: 'insensitive' } },
                { model: { contains: query, mode: 'insensitive' } }
            ]
        }

        vehicles = await prisma.vehicle.findMany({
            where: whereVehicle,
            select: {
                id: true,
                brand: true,
                model: true,
                year: true,
                price: true,
                images: true,
                latitude: true,
                longitude: true,
                vehicleType: true
            }
        })

        return NextResponse.json({
            businesses,
            vehicles
        })

    } catch (error) {
        console.error('❌ [Map Search Error]:', error)
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            type: typeof error
        })
        return NextResponse.json({
            error: 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        }, { status: 500 })
    }
}
