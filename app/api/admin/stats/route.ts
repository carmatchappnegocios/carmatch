
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const isAdminMaster = session.user.email === process.env.ADMIN_EMAIL
        if (!isAdminMaster) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { isAdmin: true }
            })
            if (!user?.isAdmin) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        }

        const statsResults = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isActive: true } }),
            prisma.vehicle.count(),
            prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
            prisma.business.count(),
            prisma.chat.count(),
            prisma.appointment.count(),
            prisma.appointment.count({ where: { status: 'ACCEPTED' } }),
            prisma.systemLog.findMany({ take: 50, orderBy: { createdAt: 'desc' } }),
            prisma.report.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: {
                    reporter: { select: { name: true, email: true } },
                    targetUser: { select: { name: true, email: true } },
                    vehicle: { select: { id: true, title: true } },
                    business: { select: { id: true, name: true } }
                }
            }),
            prisma.user.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, email: true, image: true, isAdmin: true, isActive: true, createdAt: true, credits: true }
            }),
            prisma.vehicle.findMany({
                take: 100,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            }),
            prisma.business.findMany({
                take: 100,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            }),
            prisma.analyticsEvent.count({ where: { eventType: 'SHARE' } }),
            prisma.user.count({ where: { vehicles: { none: {} }, businesses: { none: {} } } }),
            prisma.vehicle.count({ where: { isFreePublication: true } }),
            prisma.vehicle.count({ where: { isFreePublication: false } }),
            prisma.business.count({ where: { isFreePublication: true } }),
            prisma.business.count({ where: { isFreePublication: false } }),
            prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true, creditsAdded: true } }),
            prisma.creditTransaction.aggregate({ where: { amount: { lt: 0 } }, _sum: { amount: true } }),
            prisma.business.count({ where: { isActive: true } }),
            prisma.sOSAlert.count(),
            prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
            prisma.user.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } })
        ])

        const [
            totalUsers, activeUsers, totalVehicles, activeVehicles, totalBusinesses,
            totalChats, totalAppointments, activeAppointments, recentLogs, recentReports,
            recentUsers, recentVehicles, recentBusinesses, shareCount, buyerCount,
            freeVehicles, paidVehicles, freeBusinesses, paidBusinesses, paymentSummary,
            usageSummary, activeBusinesses, sosCount, registrationsToday, registrationsThisMonth
        ] = statsResults

        const totalRevenue = Number(paymentSummary?._sum?.amount || 0)
        const creditsPurchased = paymentSummary?._sum?.creditsAdded || 0
        const creditsUsed = Math.abs(Number(usageSummary?._sum?.amount || 0))
        
        // 💰 Proyección de Ganancias Netas ($10 por crédito)
        const projectedRevenue = creditsPurchased * 10

        // 🧠 Real Trends (Last 14 days)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const [dailyUsers, dailyPayments] = await Promise.all([
            prisma.user.groupBy({
                by: ['createdAt'],
                where: { createdAt: { gte: fourteenDaysAgo } },
                _count: { id: true },
            }),
            prisma.payment.groupBy({
                by: ['createdAt'],
                where: { status: 'COMPLETED', createdAt: { gte: fourteenDaysAgo } },
                _sum: { creditsAdded: true },
            })
        ]);

        const formatTrend = (data: any[], days: number, isCount = true) => {
            const result: number[] = [];
            const map = new Map();
            data.forEach(item => {
                const date = new Date(item.createdAt).toISOString().split('T')[0];
                const val = isCount ? item._count.id : Number(item._sum.creditsAdded || 0) * 10;
                map.set(date, (map.get(date) || 0) + val);
            });
            let cumulative = 0;
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                cumulative += (map.get(dateStr) || 0);
                result.push(cumulative);
            }
            return result;
        };

        const growth = {
            users: formatTrend(dailyUsers, 14),
            revenue: formatTrend(dailyPayments, 14, false)
        };

        // 📊 Sesiones Beta de hoy
        // 🕒 v8.9: Estándar para México (America/Mexico_City)
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
        const todaySessions = await prisma.betaSession.findMany({
            where: { date: today },
            select: { userId: true, maxDuration: true, lastPing: true, deviceOS: true }
        })
        const sessionMap = new Map(todaySessions.map((s: any) => [s.userId, s]))
        const enrichedUsers = (recentUsers as any[]).map(u => ({
            ...u,
            betaToday: sessionMap.get(u.id) || null
        }))

        // 🧠 Procesamiento de Inteligencia de Mercado (Datos Reales)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [recentSearches, vehicleFuelStats, vehicleTransStats, vehicleColorStats] = await Promise.all([
            prisma.searchMetric.findMany({
                where: { createdAt: { gte: thirtyDaysAgo } },
                take: 1000,
                select: { latitude: true, longitude: true, query: true, category: true }
            }),
            prisma.vehicle.groupBy({ by: ['fuel'], _count: { id: true }, where: { status: 'ACTIVE' } }),
            prisma.vehicle.groupBy({ by: ['transmission'], _count: { id: true }, where: { status: 'ACTIVE' } }),
            prisma.vehicle.groupBy({ by: ['color'], _count: { id: true }, where: { status: 'ACTIVE' } })
        ]);

        const intelligence = {
            searches: recentSearches.map(s => ({ 
                latitude: s.latitude, 
                longitude: s.longitude, 
                query: s.query, 
                category: s.category 
            })),
            vehicles: recentVehicles
                .filter(v => v.latitude && v.longitude)
                .map(v => ({ latitude: v.latitude, longitude: v.longitude, title: v.title })),
            businesses: recentBusinesses
                .filter(b => b.latitude && b.longitude)
                .map(b => ({ latitude: b.latitude, longitude: b.longitude, name: b.name, category: b.category })),
            stats: {
                techTrends: {
                    fuels: vehicleFuelStats.map(f => [f.fuel || 'N/A', f._count.id]),
                    transmissions: vehicleTransStats.map(t => [t.transmission || 'N/A', t._count.id]),
                    colors: vehicleColorStats.map(c => [c.color || 'N/A', c._count.id])
                }
            }
        }

        return NextResponse.json({
            users: { total: totalUsers, active: activeUsers, recent: enrichedUsers, growth: growth.users },
            vehicles: { total: totalVehicles, active: activeVehicles, recent: recentVehicles },
            businesses: { total: totalBusinesses, recent: recentBusinesses },
            chats: { total: totalChats },
            appointments: { total: totalAppointments, active: activeAppointments },
            logs: recentLogs,
            reports: recentReports,
            intelligence: intelligence,
            financials: { 
                revenue: growth.revenue, 
                totalRevenue: totalRevenue,
                projectedRevenue: projectedRevenue 
            },
            registrations: { today: registrationsToday, thisMonth: registrationsThisMonth, total: totalUsers },
            detailedStats: {
                shareCount, buyerCount, sellerCount: activeUsers - buyerCount, sosCount,
                vehicleStats: { free: freeVehicles, paid: paidVehicles, active: activeVehicles, inactive: totalVehicles - activeVehicles, total: totalVehicles },
                businessStats: { free: freeBusinesses, paid: paidBusinesses, active: activeBusinesses, inactive: totalBusinesses - activeBusinesses, total: totalBusinesses },
                creditStats: { purchased: creditsPurchased, used: creditsUsed, activeInCirculation: creditsPurchased - creditsUsed }
            }
        })
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
