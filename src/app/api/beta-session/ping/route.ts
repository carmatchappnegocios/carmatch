import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Umbrales del sistema de sesión
const PING_INTERVAL_MS = 30_000       // El cliente pinga cada 30s
const GAP_THRESHOLD_SECONDS = 60      // Si el gap > 60s = sesión interrumpida → reset
const GOAL_SECONDS = 240              // 4 minutos = completado

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ ok: false }, { status: 401 })
        }

        const userId = session.user.id
        const now = new Date()
        
        // 🕒 BUG FIX v6.1: Reloj de Tester Sincronizado (UTC-6 MX)
        // 🕒 v8.9: Estándar Indestructible para México (America/Mexico_City)
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
 // "YYYY-MM-DD" en tiempo de México

        const userAgent = request.headers.get('user-agent') || ''
        let deviceOS = 'Unknown'
        if (/android/i.test(userAgent)) deviceOS = 'Android'
        else if (/ipad|iphone|ipod/i.test(userAgent)) deviceOS = 'iOS'
        else if (/windows/i.test(userAgent)) deviceOS = 'Windows'
        else if (/mac/i.test(userAgent)) deviceOS = 'Mac'

        const existing = await prisma.betaSession.findUnique({
            where: { userId_date: { userId, date: today } }
        })

        if (!existing) {
            // Primer ping del día → crear sesión
            await prisma.betaSession.create({
                data: { 
                    userId, 
                    date: today, 
                    sessionStart: now, 
                    lastPing: now, 
                    maxDuration: 1, 
                    completedToday: false,
                    deviceOS 
                }
            })

            // 📊 REGISTRAR EVENTO: Sesión iniciada
            try {
                await prisma.analyticsEvent.create({
                    data: {
                        userId,
                        eventType: 'SESSION_STARTED',
                        entityType: 'SESSION',
                        metadata: {
                            deviceOS,
                            date: today,
                            timestamp: now.toISOString()
                        }
                    }
                })
            } catch {
                // Fail silently
            }

            return NextResponse.json({ ok: true, completedToday: false, secondsInSession: 1 })
        }

        // Si ya completó hoy, no hace nada más (no seguimos contando)
        if (existing.completedToday) {
            return NextResponse.json({ ok: true, completedToday: true, secondsInSession: GOAL_SECONDS })
        }

        const msSinceLastPing = now.getTime() - existing.lastPing.getTime()
        const secondsSinceLastPing = Math.floor(msSinceLastPing / 1000)

        if (secondsSinceLastPing > GAP_THRESHOLD_SECONDS) {
            // SESIÓN INTERRUMPIDA: El usuario salió antes de completar.
            // ← Reiniciar comptador desde cero
            await prisma.betaSession.update({
                where: { userId_date: { userId, date: today } },
                data: { 
                    sessionStart: now, 
                    lastPing: now, 
                    maxDuration: 1,
                    completedToday: false,
                    deviceOS 
                }
            })
            return NextResponse.json({ ok: true, completedToday: false, secondsInSession: 1, reset: true })
        }

        // SESIÓN CONTINUA: Calcular segundos acumulados en esta sesión
        const currentContinuousSeconds = Math.floor((now.getTime() - existing.sessionStart.getTime()) / 1000)
        const isCompleted = currentContinuousSeconds >= GOAL_SECONDS

        await prisma.betaSession.update({
            where: { userId_date: { userId, date: today } },
            data: { 
                lastPing: now, 
                maxDuration: currentContinuousSeconds,
                completedToday: isCompleted,
                deviceOS 
            }
        })

        // 📊 REGISTRAR EVENTO: Sesión completada (4 minutos alcanzados)
        if (isCompleted && !existing.completedToday) {
            try {
                await prisma.analyticsEvent.create({
                    data: {
                        userId,
                        eventType: 'SESSION_ENDED',
                        entityType: 'SESSION',
                        metadata: {
                            durationSeconds: currentContinuousSeconds,
                            deviceOS,
                            completed: true,
                            date: today,
                            timestamp: now.toISOString()
                        }
                    }
                })
            } catch {
                // Fail silently
            }
        }

        return NextResponse.json({ 
            ok: true, 
            completedToday: isCompleted, 
            secondsInSession: currentContinuousSeconds 
        })

    } catch (error) {
        console.error('[BetaSession] Ping error:', error)
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}
