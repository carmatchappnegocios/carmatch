// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.


import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST: Update my own location
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const body = await req.json()
        const { latitude, longitude } = body

        if (!latitude || !longitude) {
            return NextResponse.json({ error: 'Faltan coordenadas' }, { status: 400 })
        }

        const lat = parseFloat(latitude)
        const lng = parseFloat(longitude)
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return NextResponse.json({ error: 'Coordenadas inválidas' }, { status: 400 })
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                lastLatitude: lat,
                lastLongitude: lng,
                lastLocationUpdate: new Date()
            }
        })

        // 🚀 REAL-TIME SOS UPDATE CHECK
        // Si el usuario está involucrado en una emergencia activa, emitir evento socket
        try {
            const activeAlert = await prisma.sOSAlert.findFirst({
                where: {
                    status: 'ACTIVE',
                    expiresAt: { gte: new Date() },
                    OR: [
                        { victimId: session.user.id },
                        { counterpartId: session.user.id }
                    ]
                },
                include: {
                    victim: { select: { id: true, name: true } },
                    counterpart: { select: { id: true, name: true } }
                }
            })

            if (activeAlert) {
                const io = (global as any).io
                if (io) {
                    const victimLat = activeAlert.victimId === session.user.id ? parseFloat(latitude) : activeAlert.victimLat
                    const victimLng = activeAlert.victimId === session.user.id ? parseFloat(longitude) : activeAlert.victimLng
                    const counterpartLat = activeAlert.counterpartId === session.user.id ? parseFloat(latitude) : activeAlert.counterpartLat
                    const counterpartLng = activeAlert.counterpartId === session.user.id ? parseFloat(longitude) : activeAlert.counterpartLng

                    // Update alert in DB as well to keep sync history
                    await prisma.sOSAlert.update({
                        where: { id: activeAlert.id },
                        data: {
                            victimLat,
                            victimLng,
                            counterpartLat,
                            counterpartLng,
                            updatedAt: new Date()
                        }
                    })

                    const payload = {
                        alertId: activeAlert.id,
                        status: activeAlert.status,
                        victim: {
                            id: activeAlert.victimId,
                            name: activeAlert.victim.name,
                            lat: victimLat,
                            lng: victimLng,
                            lastUpdate: new Date()
                        },
                        counterpart: activeAlert.counterpart ? {
                            id: activeAlert.counterpartId,
                            name: activeAlert.counterpart.name || 'Desconocido',
                            lat: counterpartLat,
                            lng: counterpartLng,
                            lastUpdate: new Date()
                        } : null,
                        createdAt: activeAlert.createdAt
                    }

                    io.to(`emergency:${activeAlert.id}`).emit('emergency-update', payload)
                    console.log(`✅ [SOCKET] Emitted emergency-update for user ${session.user.id} in alert ${activeAlert.id}`)
                }
            }
        } catch (e) {
            console.error('Error emitting location socket event:', e)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating location:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

// GET: Get another user's location (Restricted)
export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const targetUserId = searchParams.get('targetId')

        if (!targetUserId) {
            return new NextResponse('Target ID required', { status: 400 })
        }

        // Security check: Only allow location access with active appointment OR active SOS alert
        // This prevents location tracking without a legitimate safety context
        const activeAppointment = await prisma.appointment.findFirst({
            where: {
                status: { in: ['CONFIRMED', 'IN_PROGRESS', 'EMERGENCY'] },
                OR: [
                    { chat: { buyerId: session.user.id, sellerId: targetUserId } },
                    { chat: { sellerId: session.user.id, buyerId: targetUserId } }
                ]
            }
        })

        const activeSOS = await prisma.sOSAlert.findFirst({
            where: {
                status: 'ACTIVE',
                expiresAt: { gte: new Date() },
                OR: [
                    { victimId: session.user.id, counterpartId: targetUserId },
                    { victimId: targetUserId, counterpartId: session.user.id }
                ]
            }
        })

        if (!activeAppointment && !activeSOS) {
            return new NextResponse('Forbidden: No active appointment or SOS alert', { status: 403 })
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
                lastLatitude: true,
                lastLongitude: true,
                lastLocationUpdate: true,
                id: true,
                name: true
            }
        })

        if (!targetUser) {
            return new NextResponse('User not found', { status: 404 })
        }

        return NextResponse.json(targetUser)
    } catch (error) {
        console.error('Error fetching location:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
