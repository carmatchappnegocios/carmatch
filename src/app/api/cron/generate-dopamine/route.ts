// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateDopamineMessage } from '@/lib/dopamineMessages'
import { upsertNotification } from '@/lib/notifications-service'

// Forzar dinámico para que no se cachee
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentMonth = new Date().getMonth() + 1

        const businesses = await prisma.business.findMany({
            where: { isActive: true },
            include: { analytics: true }
        })

        let generatedCount = 0

        for (const business of businesses) {
            let analytics = (business as any).analytics
            if (!analytics) {
                analytics = await prisma.businessAnalytics.create({
                    data: { businessId: business.id, currentMonth }
                })
            }

            if (analytics.currentMonth !== currentMonth) {
                analytics = await prisma.businessAnalytics.update({
                    where: { id: analytics.id },
                    data: { monthlyFakeCount: 0, currentMonth }
                })
            }

            if (analytics.monthlyFakeCount >= 150) continue
            if (Math.random() > 0.7) continue

            const count = Math.floor(Math.random() * 3) + 1

            for (let i = 0; i < count; i++) {
                const message = generateDopamineMessage(business as any)

                await upsertNotification({
                    userId: business.userId,
                    type: 'BUSINESS_ACTIVITY',
                    title: '📊 Actividad en tu negocio',
                    message,
                    link: `/business/${business.id}`,
                    isFake: true,
                    businessId: business.id
                })

                await prisma.businessNotificationLog.create({
                    data: {
                        businessId: business.id,
                        type: 'FAKE',
                        message,
                        category: 'DOPAMINE'
                    }
                })

                await prisma.businessAnalytics.update({
                    where: { businessId: business.id },
                    data: {
                        monthlyFakeCount: { increment: 1 },
                        lastFakeNotification: new Date(),
                        fakeViews: { increment: 1 }
                    }
                })

                generatedCount++
            }
        }

        return NextResponse.json({
            success: true,
            generated: generatedCount,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Error in generate-dopamine:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
