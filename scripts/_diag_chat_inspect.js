// 🔍 INSPECCIÓN del chat que involucra la cuenta huérfana (solo lectura)
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ORPHAN = 'cmvrgtt1z0000l5089nyc6lg6'   // carmatch.negocios@gmail.com
const CHAT = 'cmvsw70pj000bla08hx98arpk'

async function main() {
    const chat = await prisma.chat.findUnique({
        where: { id: CHAT },
        select: {
            id: true, createdAt: true, vehicleId: true,
            buyer: { select: { id: true, email: true } },
            seller: { select: { id: true, email: true } },
            vehicle: { select: { id: true, title: true, userId: true } },
            _count: { select: { messages: true, appointments: true } },
        },
    })
    console.log('=== CHAT ===')
    console.log(JSON.stringify(chat, null, 2))

    const messages = await prisma.message.findMany({
        where: { chatId: CHAT },
        orderBy: { createdAt: 'asc' },
        select: { id: true, content: true, sender: { select: { email: true } }, createdAt: true },
    })
    console.log('\n=== MENSAJES (' + messages.length + ') ===')
    messages.forEach(m => console.log(`[${m.sender?.email}] ${m.content}  (${m.createdAt.toISOString()})`))

    // ¿Alguna otra cosa "viva" referencie a la huérfana? (sesiones, notifs, etc.)
    const sessions = await prisma.session.count({ where: { userId: ORPHAN } })
    const betaSessions = await prisma.betaSession.count({ where: { userId: ORPHAN } })
    const notifications = await prisma.notification.count({ where: { userId: ORPHAN } })
    const sentMessages = await prisma.message.count({ where: { senderId: ORPHAN } })
    const reportsMade = await prisma.report.count({ where: { reporterId: ORPHAN } })
    const reportsAgainst = await prisma.report.count({ where: { targetUserId: ORPHAN } })
    const sosVictim = await prisma.sOSAlert.count({ where: { victimId: ORPHAN } })
    const sosCounterpart = await prisma.sOSAlert.count({ where: { counterpartId: ORPHAN } })
    const trustedBy = await prisma.user.count({ where: { trustedContactId: ORPHAN } })

    console.log('\n=== OTRAS REFERENCIAS A LA HUÉRFANA ===')
    console.log('sessions        :', sessions)
    console.log('betaSessions    :', betaSessions)
    console.log('notifications   :', notifications)
    console.log('sentMessages    :', sentMessages)
    console.log('reportsMade     :', reportsMade)
    console.log('reportsAgainst  :', reportsAgainst)
    console.log('sosVictim       :', sosVictim)
    console.log('sosCounterpart  :', sosCounterpart)
    console.log('otros que usan como trustedContact:', trustedBy)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
