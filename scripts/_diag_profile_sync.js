// 🔍 DIAGNÓSTICO: sincronización perfil ↔ vehículos (solo lectura)
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // 1. Todos los usuarios con email parecido a admin/negocios
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { email: { contains: 'negocios' } },
                { isAdmin: true },
            ],
        },
        select: {
            id: true, email: true, name: true, isAdmin: true,
            emailVerified: true, createdAt: true,
            _count: { select: { vehicles: true, businesses: true, accounts: true } },
        },
    })
    console.log('=== USUARIOS ADMIN / NEGOCIOS ===')
    for (const u of users) {
        console.log(`- ${u.email} | isAdmin=${u.isAdmin} | id=${u.id} | vehicles=${u._count.vehicles} | businesses=${u._count.businesses} | googleAccounts=${u._count.accounts} | creado=${u.createdAt.toISOString()}`)
    }

    // 2. Últimos 10 vehículos con su dueño
    const vehicles = await prisma.vehicle.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
            id: true, title: true, status: true, moderationStatus: true,
            createdAt: true, user: { select: { email: true, id: true } },
        },
    })
    console.log('\n=== ÚLTIMOS 10 VEHÍCULOS ===')
    for (const v of vehicles) {
        console.log(`- "${v.title}" | status=${v.status} | mod=${v.moderationStatus} | owner=${v.user?.email} (${v.user?.id}) | ${v.createdAt.toISOString()}`)
    }

    // 3. Sesiones? no. Ver vehicles por cada admin
    console.log('\n=== VEHÍCULOS POR CUENTA ADMIN ===')
    for (const u of users) {
        const vs = await prisma.vehicle.findMany({
            where: { userId: u.id },
            select: { title: true, status: true, moderationStatus: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        })
        console.log(`\n${u.email} → ${vs.length} vehículos:`)
        vs.forEach(v => console.log(`   • "${v.title}" [${v.status}/${v.moderationStatus}] ${v.createdAt.toISOString()}`))
    }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
