
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateVehicleHash, hashImageUrl, normalizePriceRange, hashGPSLocation } from '@/lib/vehicleHash'
import { calculateDistance } from '@/lib/geolocation'

/**
 * POST /api/fraud/check
 * Endpoint para verificar si una publicación es fraude o requiere crédito
 * 
 * POLÍTICA DE MONETIZACIÓN ACTUALIZADA:
 * - Primer vehículo: 6 mes gratis
 * - Vehículos adicionales: 7 días gratis → luego 1 crédito/mes
 * - Republicación de mismo vehículo: COBRAR crédito inmediatamente (no bloquear)
 * - Segundo vehículo idéntico: COBRAR crédito siempre
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            images,
            vehicleData,
            gpsLocation,
            useCredit
        } = body

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: 'Se requiere al menos una imagen' }, { status: 400 });
        }

        // 1. Generar huella única del vehículo
        const priceRange = normalizePriceRange(vehicleData.price);
        const coverImageHash = await hashImageUrl(images[0]);
        const vehicleHash = generateVehicleHash({
            brand: vehicleData.brand,
            model: vehicleData.model,
            year: vehicleData.year,
            priceRange,
            coverImageHash
        });

        const gpsHash = hashGPSLocation(gpsLocation?.latitude, gpsLocation?.longitude);

        // 2. Obtener datos del usuario (créditos y contador histórico)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { credits: true, lifetimeVehicleCount: true }
        });

        const activeVehiclesCount = await prisma.vehicle.count({
            where: {
                userId: session.user.id,
                status: 'ACTIVE'
            }
        });

        const lifetimeCount = user?.lifetimeVehicleCount || 0;
        const userCredits = user?.credits || 0;

        // 3. Buscar si este VEHÍCULO EXACTO ya fue publicado por ESTE USUARIO
        const userVehicles = await prisma.vehicle.findMany({
            where: {
                userId: session.user.id,
                brand: vehicleData.brand,
                model: vehicleData.model,
                year: vehicleData.year,
                // Excluir el vehículo actual si se está editando
                ...(body.currentVehicleId ? { id: { not: body.currentVehicleId } } : {}),
                OR: [
                    { status: 'ACTIVE' },
                    { status: 'INACTIVE' },
                    { status: 'SOLD' }
                ]
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 5
        });

        // 4. Detectar republicación (mismo vehículo que ya existió)
        for (const existingVehicle of userVehicles) {
            // Calcular similaridad
            let similarityScore = 0;

            // Marca + Modelo + Año exactos
            if (existingVehicle.brand === vehicleData.brand &&
                existingVehicle.model === vehicleData.model &&
                existingVehicle.year === vehicleData.year) {
                similarityScore += 40;
            }

            // Precio similar (±10%)
            const existingPrice = existingVehicle.price.toNumber();
            if (Math.abs(existingPrice - vehicleData.price) / existingPrice < 0.1) {
                similarityScore += 20;
            }

            // Primera imagen similar (comparar URLs)
            if (existingVehicle.images.length > 0 && images.length > 0) {
                // Si la URL es exactamente la misma (republicación con misma foto)
                if (existingVehicle.images[0] === images[0]) {
                    similarityScore += 30;
                } else {
                    // Si al menos comparten alguna foto
                    const sharedImages = existingVehicle.images.filter(img => images.includes(img));
                    if (sharedImages.length > 0) {
                        similarityScore += 15;
                    }
                }
            }

            // Si es MUY similar (>= 70%) y NO es una edición (ya filtrado arriba)
            if (similarityScore >= 70) {
                const daysSinceLastUpdate = Math.floor(
                    (new Date().getTime() - new Date(existingVehicle.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
                );

                // Si está actualmente ACTIVO, probablemente es un error del usuario intentando publicar de nuevo en vez de editar
                // PERO, si el usuario insiste, le avisamos.
                if (existingVehicle.status === 'ACTIVE') {
                    return NextResponse.json({
                        action: 'REDIRECT', // Redirigir a la publicación existente para que la edite
                        isFraud: true,
                        score: similarityScore,
                        redirectTo: `/vehicle/${existingVehicle.id}`,
                        message: `Ya tienes este vehículo publicado. Te estamos redirigiendo para que puedas editarlo.`
                    });
                }
            }
        }

        // 5. Verificar si es una EDICIÓN de un vehículo ya ACTIVO y NO VENCIDO
        if (body.currentVehicleId) {
            const currentVehicle = await prisma.vehicle.findUnique({
                where: { id: body.currentVehicleId },
                select: { status: true, expiresAt: true }
            });

            if (currentVehicle?.status === 'ACTIVE' && currentVehicle.expiresAt && currentVehicle.expiresAt > new Date()) {
                return NextResponse.json({
                    isFraud: false,
                    score: 0,
                    action: 'ALLOW',
                    userCredits,
                    lifetimeCount
                });
            }
        }

        // 6. Verificar límite de vehículos gratis (Primeros 25 HISTÓRICOS)
        // El auto #25 es el último gratis (asumiendo que empezamos en 0).
        // Si lifetimeCount >= 25, significa que ya publicó 25 autos (0 al 24).
        // El auto #26 (count 25) es el primero que cobra.
        if (lifetimeCount >= 25 && !useCredit) {
            return NextResponse.json({
                action: 'REQUIRE_CREDIT',
                isFraud: false,
                score: 0,
                message: userCredits > 0
                    ? `Has alcanzado el límite de 25 vehículos gratuitos. Tienes ${userCredits} créditos disponibles. ¿Deseas usar 1 para publicar?`
                    : `Has alcanzado el límite de 25 vehículos gratuitos. Para publicar más necesitas 1 crédito.`,
                requiresCredit: true,
                userCredits,
                lifetimeCount
            });
        }

        // 6. Fraud cruzado: no buscamos proactivamente (imposible con millones de autos iguales)
        // Se rastrea al usuario DESPUES de una denuncia/bloqueo via /api/admin/blocked-identity

        return NextResponse.json({
            isFraud: false,
            score: 0,
            action: 'ALLOW',
            userCredits,
            lifetimeCount
        });

    } catch (error) {
        console.error('❌ Error in fraud check:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
