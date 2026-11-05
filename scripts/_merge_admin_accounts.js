// 🔧 FUSIÓN DE CUENTAS: mueve vehicles de la cuenta huérfana a la real
//     Uso: node scripts\_merge_admin_accounts.js [--dry]
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ORPHAN = 'cmvrgtt1z0000l5089nyc6lg6'   // carmatch.negocios@gmail.com (keyword+PIN, email viejo)
const REAL  = 'cmr4f1wvh0000if04874l5ms1'    // carmatchapp.negocios@gmail.com (real, Google)
const DRY = process.argv.includes('--dry')

async function main() {
    const orphan = await prisma.user.findUnique({ where: { id: ORPHAN }, select: { email: true, isAdmin: true, name: true } })
    const real = await prisma.user.findUnique({ where: { id: REAL }, select: { email: true, isAdmin: true } })
    if (!orphan || !real) throw new Error('Cuentas no encontradas')
    console.log('HUÉRFANA:', orphan.email, '| isAdmin=', orphan.isAdmin)
    console.log('REAL    :', real.email, '| isAdmin=', real.isAdmin)

    const orphansVehicles = await prisma.vehicle.findMany({ where: { userId: ORPHAN }, select: { id: true, title: true } })
    console.log('\nVehículos a mover:', orphansVehicles.length)
    orphansVehicles.forEach(v => console.log('  •', v.title))

    if (DRY) { console.log('\n(dry-run: no se modificó nada)'); return }

    // 1. Mover vehículos a la cuenta real
    const moved = await prisma.vehicle.updateMany({
        where: { userId: ORPHAN },
        data: { userId: REAL },
    })
    console.log('\n✅ Vehículos movidos:', moved.count)

    // 2. (OPCIONAL con --deadmin) Quitar isAdmin a la huérfana.
    //    ⚠️ SOLO después de fijar ADMIN_EMAIL en Vercel; si no, el ayudante pierde permisos.
    if (process.argv.includes('--deadmin')) {
        await prisma.user.update({
            where: { id: ORPHAN },
            data: { isAdmin: false, name: 'Cuenta fusionada (admin)' },
        })
        console.log('✅ Huérfana: isAdmin=false, renombrada (se conserva por 1 chat)')
    } else {
        console.log('ℹ️  Huérfana intacta (usa --deadmin tras fijar ADMIN_EMAIL en Vercel)')
    }

    // 3. Verificación final
    const realCount = await prisma.vehicle.count({ where: { userId: REAL } })
    const orphanCount = await prisma.vehicle.count({ where: { userId: ORPHAN } })
    const realVehicles = await prisma.vehicle.findMany({
        where: { userId: REAL }, select: { title: true, status: true }, orderBy: { createdAt: 'desc' },
    })
    console.log('\n=== VERIFICACIÓN ===')
    console.log(`Cuenta real (${real.email}): ${realCount} vehículos`)
    realVehicles.forEach(v => console.log('   •', v.title, `[${v.status}]`))
    console.log(`Cuenta huérfana: ${orphanCount} vehículos`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
