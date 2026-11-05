// 🔍 CONFIRMACIÓN FINAL antes de borrar: todo lo que referencia a la huérfana
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ORPHAN = 'cmvrgtt1z0000l5089nyc6lg6'   // carmatch.negocios@gmail.com

async function main() {
    const orphan = await prisma.user.findUnique({
        where: { id: ORPHAN },
        select: { id: true, email: true, isAdmin: true },
    })
    console.log('=== CUENTA A BORRAR ===')
    console.log(JSON.stringify(orphan))

    const vehicles = await prisma.vehicle.count({ where: { userId: ORPHAN } })
    const favorites = await prisma.favorite.count({ where: { userId: ORPHAN } })
    const businessFav = await prisma.businessFavorite.count({ where: { userId: ORPHAN } })
    const businesses = await prisma.business.count({ where: { userId: ORPHAN } })
    const chatsAsBuyer = await prisma.chat.findMany({ where: { buyerId: ORPHAN }, select: { id: true } })
    const chatsAsSeller = await prisma.chat.findMany({ where: { sellerId: ORPHAN }, select: { id: true } })
    const accounts = await prisma.account.count({ where: { userId: ORPHAN } })
    const sentMessages = await prisma.message.count({ where: { senderId: ORPHAN } })
    const notifications = await prisma.notification.count({ where: { userId: ORPHAN } })
    const sessions = await prisma.session.count({ where: { userId: ORPHAN } })
    const betaSessions = await prisma.betaSession.count({ where: { userId: ORPHAN } })
    const payments = await prisma.payment.count({ where: { userId: ORPHAN } }).catch(() => 'n/a')
    const creditTx = await prisma.creditTransaction.count({ where: { userId: ORPHAN } }).catch(() => 'n/a')

    console.log('\n=== REFERENCIAS VIVAS ===')
    console.log('vehicles      :', vehicles)
    console.log('favorites     :', favorites)
    console.log('businessFav   :', businessFav)
    console.log('businesses    :', businesses)
    console.log('chats comprador:', chatsAsBuyer.length, JSON.stringify(chatsAsBuyer))
    console.log('chats vendedor :', chatsAsSeller.length, JSON.stringify(chatsAsSeller))
    console.log('accounts      :', accounts)
    console.log('sentMessages  :', sentMessages)
    console.log('notifications :', notifications)
    console.log('sessions      :', sessions)
    console.log('betaSessions  :', betaSessions)
    console.log('payments      :', payments)
    console.log('creditTx      :', creditTx)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
