// 🔍 DIAGNÓSTICO: qué tiene la cuenta huérfana (solo lectura, consultas directas)
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ORPHAN = 'cmvrgtt1z0000l5089nyc6lg6'   // carmatch.negocios@gmail.com  (keyword+PIN, email viejo)
const REAL  = 'cmr4f1wvh0000if04874l5ms1'    // carmatchapp.negocios@gmail.com (real, Google)

async function main() {
    const orphan = await prisma.user.findUnique({
        where: { id: ORPHAN },
        select: { id: true, email: true, name: true, isAdmin: true, credits: true, emailVerified: true },
    })
    if (!orphan) { console.log('No existe la cuenta huérfana'); return }
    console.log('=== CUENTA HUÉRFANA ===')
    console.log(orphan)

    const vehicles = await prisma.vehicle.findMany({ where: { userId: ORPHAN }, select: { id: true, title: true, status: true, moderationStatus: true, images: true } })
    const favorites = await prisma.favorite.count({ where: { userId: ORPHAN } })
    const accounts = await prisma.account.findMany({ where: { userId: ORPHAN }, select: { provider: true } })
    const chatsAsBuyer = await prisma.chat.count({ where: { buyerId: ORPHAN } })
    const chatsAsSeller = await prisma.chat.count({ where: { sellerId: ORPHAN } })

    console.log('vehicles  :', vehicles.length, JSON.stringify(vehicles.map(v => ({ t: v.title, s: v.status, imgs: (v.images||[]).length }))))
    console.log('favorites :', favorites)
    console.log('accounts  :', JSON.stringify(accounts))
    console.log('chats     :', chatsAsBuyer, 'como comprador /', chatsAsSeller, 'como vendedor')

    const real = await prisma.user.findUnique({ where: { id: REAL }, select: { email: true, credits: true, isAdmin: true, _count: { select: { vehicles: true } } } })
    console.log('\n=== CUENTA REAL ===')
    console.log(JSON.stringify(real))

    // Chats que involucran ambos (para ver si hay que mover)
    const relatedChats = await prisma.chat.findMany({
        where: { OR: [{ buyerId: ORPHAN }, { sellerId: ORPHAN }] },
        select: { id: true, buyerId: true, sellerId: true, vehicleId: true, createdAt: true },
    })
    console.log('\nchats relacionados con huérfana:', JSON.stringify(relatedChats, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
