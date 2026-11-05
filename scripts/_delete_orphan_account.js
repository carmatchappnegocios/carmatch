// 🗑️ BORRADO de la cuenta huérfana (carmatch.negocios@gmail.com)
//     Uso: node scripts\_delete_orphan_account.js [--yes]
//     Seguro: solo borra si la cuenta NO tiene vehículos ni chats activos.
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ORPHAN = 'cmvrgtt1z0000l5089nyc6lg6'   // carmatch.negocios@gmail.com (keyword+PIN, email viejo)
const REAL  = 'cmr4f1wvh0000if04874l5ms1'    // carmatchapp.negocios@gmail.com (real, Google)
const CONFIRM = process.argv.includes('--yes')

async function main() {
    const orphan = await prisma.user.findUnique({
        where: { id: ORPHAN },
        select: { id: true, email: true, isAdmin: true },
    })
    if (!orphan) { console.log('⚠️  La cuenta huérfana ya no existe. Nada que hacer.'); return }
    console.log('BORRAR:', orphan.email, '| id=', orphan.id, '| isAdmin=', orphan.isAdmin)

    // 🛡️ Guardas de seguridad: no borrar si tiene datos "vivos" que puedan perderse.
    const vehicles = await prisma.vehicle.count({ where: { userId: ORPHAN } })
    const chatsAsBuyer = await prisma.chat.count({ where: { buyerId: ORPHAN } })
    const chatsAsSeller = await prisma.chat.count({ where: { sellerId: ORPHAN } })
    const businesses = await prisma.business.count({ where: { userId: ORPHAN } })

    console.log('\nGuardas:', { vehicles, chatsAsBuyer, chatsAsSeller, businesses })
    if (vehicles > 0 || chatsAsBuyer > 0 || chatsAsSeller > 0 || businesses > 0) {
        console.error('❌ Abortado: la cuenta aún tiene datos. Muévelos/fusiona antes de borrar.')
        process.exit(2)
    }

    if (!CONFIRM) { console.log('\n(dry-run: sin --yes no se borra nada)'); return }

    // El borrado en cascada elimina: 1 notificación + 2 betaSessions (propios de la huérfana).
    await prisma.user.delete({ where: { id: ORPHAN } })
    console.log('\n✅ Cuenta huérfana eliminada (cascada: notificaciones y betaSessions propias).')

    // Verificación final
    const gone = await prisma.user.findUnique({ where: { id: ORPHAN }, select: { id: true } })
    const real = await prisma.user.findUnique({
        where: { id: REAL },
        select: { email: true, isAdmin: true, _count: { select: { vehicles: true } } },
    })
    console.log('\n=== VERIFICACIÓN ===')
    console.log('Huérfana existe?', gone ? 'SÍ ❌' : 'NO ✅')
    console.log('Cuenta real:', JSON.stringify(real))
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
