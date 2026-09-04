
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * 🛠️ Helpers para parseo robusto de tipos
 */
const safeInt = (val: any) => {
    if (val === null || val === undefined || val === '') return null;
    const parsed = parseInt(val.toString().replace(/[^0-9-]/g, ''));
    return isNaN(parsed) ? null : parsed;
};

const safeFloat = (val: any) => {
    if (val === null || val === undefined || val === '') return null;
    const parsed = parseFloat(val.toString().replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? null : parsed;
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: { user: { select: { name: true, image: true } } }
        })

        if (!vehicle) {
            return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
        }

        return NextResponse.json({ vehicle })
    } catch (error) {
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { id: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        const { id } = await params
        const body = await request.json()
        const { status } = body

        // Allowlist: never accept raw body into Prisma (blocks mass assignment)
        const ALLOWED_VEHICLE_FIELDS = [
            'brand', 'model', 'version', 'year', 'price', 'currency', 'description',
            'images', 'city', 'state', 'country', 'latitude', 'longitude', 'address',
            'transmission', 'mileage', 'mileageUnit', 'fuel', 'engine', 'doors', 'color',
            'condition', 'vehicleType', 'displacement', 'cargoCapacity', 'features',
            'operatingHours', 'passengers', 'hp', 'torque', 'aspiration', 'cylinders',
            'batteryCapacity', 'range', 'weight', 'axles', 'traction', 'category'
        ] as const
        const updateData: Record<string, any> = {}
        for (const key of ALLOWED_VEHICLE_FIELDS) {
            if (body[key] !== undefined) updateData[key] = body[key]
        }

        // Verificar propiedad del vehículo
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            select: { userId: true, status: true, title: true, brand: true, model: true, version: true, year: true }
        })

        if (!vehicle) {
            return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
        }

        if (vehicle.userId !== user.id) {
            return NextResponse.json({ error: 'No tienes permiso para editar este vehículo' }, { status: 403 })
        }

        // Validar que el status sea un valor válido del enum
        if (status && !['ACTIVE', 'INACTIVE', 'SOLD'].includes(status)) {
            return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
        }

        // 🛡️ ESTRATEGIA DE APROBACIÓN: Bloquear reactivación de vendidos para evitar mención de créditos/pagos
        if (vehicle.status === 'SOLD' && status === 'ACTIVE') {
            return NextResponse.json({
                error: 'Este vehículo ya ha sido marcado como vendido y no puede reactivarse por seguridad.',
                needsCredit: false
            }, { status: 403 })
        }

        // Si se está editando, reseteamos la moderación si cambian datos clave
        const keyFieldsChanged = updateData.brand || updateData.model || updateData.year || updateData.images
        const finalUpdateData: any = { ...updateData }

        let creditDeducted = false

        // 💳 LÓGICA DE ACTUALIZACIÓN CON TRANSACCIÓN ATÓMICA
        // Envolvemos todo en una transacción interactiva para asegurar consistencia
        const updatedVehicle = await prisma.$transaction(async (tx) => {
            // 1. Si requiere crédito, procesar cobro PRIMERO dentro de la transacción
            if (body.useCredit === true && (status === 'ACTIVE' || vehicle.status !== 'ACTIVE')) {
                const userWithCredits = await tx.user.findUnique({
                    where: { id: user.id },
                    select: { credits: true }
                })

                if ((userWithCredits?.credits || 0) < 1) {
                    throw new Error('Saldo de créditos insuficiente')
                }

                // Deducción de crédito
                await tx.user.update({
                    where: { id: user.id },
                    data: { credits: { decrement: 1 } }
                })

                // Registro de transacción
                await tx.creditTransaction.create({
                    data: {
                        userId: user.id,
                        amount: -1,
                        description: `Activación de anuncio: ${vehicle.title}`,
                        relatedId: id,
                        details: { action: 'ACTIVATE_VEHICLE', vehicleId: id }
                    }
                })

                // Configurar datos de activación
                const newExpiry = new Date()
                newExpiry.setDate(newExpiry.getDate() + 30)
                finalUpdateData.expiresAt = newExpiry
                finalUpdateData.status = 'ACTIVE'
                finalUpdateData.moderationStatus = 'APPROVED'
                creditDeducted = true
            }

            // 2. Procesar campos dinámicos
            if (updateData.operatingHours !== undefined) finalUpdateData.operatingHours = safeInt(updateData.operatingHours)
            if (updateData.mileage !== undefined) finalUpdateData.mileage = safeInt(updateData.mileage)
            if (updateData.year !== undefined) finalUpdateData.year = safeInt(updateData.year)
            if (updateData.price !== undefined) finalUpdateData.price = safeFloat(updateData.price)
            if (updateData.doors !== undefined) finalUpdateData.doors = safeInt(updateData.doors)
            if (updateData.passengers !== undefined) finalUpdateData.passengers = safeInt(updateData.passengers)
            if (updateData.displacement !== undefined) finalUpdateData.displacement = safeInt(updateData.displacement)
            if (updateData.cargoCapacity !== undefined) finalUpdateData.cargoCapacity = safeFloat(updateData.cargoCapacity)

            // Nuevos campos técnicos
            if (updateData.hp !== undefined) finalUpdateData.hp = safeInt(updateData.hp)
            if (updateData.torque !== undefined) finalUpdateData.torque = updateData.torque || null
            if (updateData.aspiration !== undefined) finalUpdateData.aspiration = updateData.aspiration || null
            if (updateData.cylinders !== undefined) finalUpdateData.cylinders = safeInt(updateData.cylinders)
            if (updateData.batteryCapacity !== undefined) finalUpdateData.batteryCapacity = safeFloat(updateData.batteryCapacity)
            if (updateData.range !== undefined) finalUpdateData.range = safeInt(updateData.range)
            if (updateData.weight !== undefined) finalUpdateData.weight = safeInt(updateData.weight)
            if (updateData.axles !== undefined) finalUpdateData.axles = safeInt(updateData.axles)

            if (status) {
                finalUpdateData.status = status
            }

            // Sincronizar título
            if (updateData.brand || updateData.model || updateData.year || updateData.version || finalUpdateData.moderationStatus === 'APPROVED') {
                const nextBrand = updateData.brand || vehicle.brand
                const nextModel = updateData.model || vehicle.model
                const nextVersion = updateData.version || (vehicle as any).version || ''
                const nextYear = updateData.year !== undefined ? updateData.year : (vehicle as any).year
                finalUpdateData.title = `${nextBrand} ${nextModel} ${nextVersion} ${nextYear}`.replace(/\s+/g, ' ').trim()
            }

            if (keyFieldsChanged) {
                finalUpdateData.moderationStatus = 'PENDING_AI'
            }

            return await tx.vehicle.update({
                where: { id },
                data: finalUpdateData
            })
        })

        // 🔔 NOTIFICACIÓN: Si cambia a ACTIVO desde un estado inactivo
        if (updatedVehicle.status === 'ACTIVE' && vehicle.status !== 'ACTIVE') {
            try {
                await notifyFavoriters(id, vehicle.title, vehicle.brand, vehicle.model)
            } catch (notificationError) {
                console.error('Error enviando notificaciones (non-blocking):', notificationError)
                // No bloqueamos la respuesta si falla el envío de notificaciones
            }
        }

        return NextResponse.json({
            success: true,
            vehicle: updatedVehicle,
            creditDeducted
        })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorStack = error instanceof Error ? error.stack : undefined

        console.error('❌ Error actualizando vehículo:', {
            error: errorMessage,
            stack: errorStack,
            timestamp: new Date().toISOString()
        })

        // Mejorar manejo de errores para el cliente
        if (errorMessage.includes('créditos insuficiente')) {
            return NextResponse.json({ error: 'Saldo de créditos insuficiente' }, { status: 402 })
        }

        return NextResponse.json({
            error: errorMessage === 'Saldo de créditos insuficiente' ? errorMessage : 'Error interno',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: errorMessage.includes('créditos insuficiente') ? 402 : 500 })
    }
}

async function notifyFavoriters(vehicleId: string, title: string, brand: string, model: string) {
    try {
        const importWebPush = await import('web-push')
        const webPush = importWebPush.default // Handle CJS/ESM interop if needed

        // 1. Obtener usuarios que dieron favorito (y sus suscripciones push si existen)
        const favorites = await prisma.favorite.findMany({
            where: { vehicleId },
            include: {
                user: {
                    include: {
                        pushSubscriptions: true
                    }
                }
            }
        })

        if (favorites.length === 0) return

        // 2. Preparar payload
        const notificationPayload = {
            title: '¡Vehículo Disponible!',
            body: `El ${brand} ${model} que te gustó está disponible de nuevo.`,
            url: `/vehicle/${vehicleId}`,
            icon: '/icon-192x192.png'
        }

        // 3. Enviar notificaciones
        // (Nota: Esto asume que tienes configurado web-push en lib/push o similar,
        //  aquí estoy usando la lógica cruda para asegurar que funcione, pero idealmente reutilizaría lib/push)

        // REVISANDO: El proyecto tiene `src/lib/push.ts`? Probablemente.
        // Vamos a intentar usar un import dinámico de una función helper si existe, o usar lo que vi en `api/vehicles/route.ts`

        // Viendo `api/vehicles/route.ts` step 83:
        // import('@/lib/pushService').then(async (push) => { ... })

        // Replicamos ese patrón para consistencia
        const pushLib = await import('@/lib/pushService')

        for (const fav of favorites) {
            for (const sub of fav.user.pushSubscriptions) {
                try {
                    await pushLib.sendPushNotification({
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth }
                    }, notificationPayload)
                } catch (err) {
                    console.error('Failed to send push to sub:', sub.id, err)
                    // Opcional: eliminar suscripción si es 410 Gone
                }
            }
        }

    } catch (error) {
        console.error('Error en notifyFavoriters:', error)
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { id: true }
        })

        if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

        const { id } = await params
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            select: { userId: true }
        })

        if (!vehicle) return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
        if (vehicle.userId !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

        await prisma.vehicle.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error eliminando vehículo:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
