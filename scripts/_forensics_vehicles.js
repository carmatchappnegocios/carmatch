// 🔬 FORENSE: ¿dónde están los vehículos? (consulta cruda, sin filtros)
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // 1. Conteo crudo de TODA la tabla Vehicle
    const total = await prisma.vehicle.count()
    console.log('TOTAL Vehicle (count):', total)

    // 2. Los 3 IDs que existían antes
    const ids = ['cmvsw3xdk0001la081h3cmimn']  // F-150
    const f150 = await prisma.vehicle.findUnique({ where: { id: ids[0] }, select: { id: true, title: true, userId: true, status: true } }).catch(e => ({ err: e.message }))
    console.log('F-150 por ID:', JSON.stringify(f150))

    // 3. Buscar por título (por si cambió el userId)
    const byTitle = await prisma.vehicle.findMany({
        where: { OR: [{ title: { contains: 'F-150' } }, { title: { contains: 'Gladiator' } }, { title: { contains: 'Expedition' } }] },
        select: { id: true, title: true, userId: true, status: true, moderationStatus: true },
    })
    console.log('Por título (F-150/Gladiator/Expedition):', JSON.stringify(byTitle, null, 2))

    // 4. Cualquier vehículo sin importar status/owner
    const anyVehicles = await prisma.vehicle.findMany({ select: { id: true, title: true, userId: true, status: true }, orderBy: { createdAt: 'desc' }, take: 20 })
    console.log('Cualquier vehículo (últimos 20):', anyVehicles.length)
    anyVehicles.forEach(v => console.log('  •', v.title, '| owner=', v.userId, '|', v.status))

    // 5. ¿Qué usuarios existen ahora?
    const users = await prisma.user.findMany({ select: { id: true, email: true, _count: { select: { vehicles: true } } } })
    console.log('\nUsuarios y su conteo de vehículos:')
    users.forEach(u => console.log(`  • ${u.email} (${u.id}) → ${u._count.vehicles} vehículos`))

    // 6. ¿Hay algún registro de borrado reciente? (AnalyticsEvent / SystemLog)
    try {
        const logs = await prisma.systemLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, message: true, createdAt: true } })
        console.log('\nÚltimos SystemLog:')
        logs.forEach(l => console.log('  •', l.createdAt.toISOString(), '|', (l.message || '').slice(0, 120)))
    } catch (e) { console.log('\nSystemLog:', e.message.slice(0, 100)) }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
