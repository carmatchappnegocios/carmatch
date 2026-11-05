// 🔬 ALCANCE: ¿qué tablas están vacías? + a qué BD estoy conectado
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Info de conexión (sin exponer credenciales completas)
    const url = process.env.DATABASE_URL || ''
    let connInfo = 'N/A'
    try { const u = new URL(url); connInfo = `${u.protocol}//${u.hostname}${u.pathname}` } catch {}
    console.log('BD conectada:', connInfo)

    const tables = [
        ['User', () => prisma.user.count()],
        ['Vehicle', () => prisma.vehicle.count()],
        ['Chat', () => prisma.chat.count()],
        ['Message', () => prisma.message.count()],
        ['Favorite', () => prisma.favorite.count()],
        ['Notification', () => prisma.notification.count()],
        ['Business', () => prisma.business.count()],
        ['Account', () => prisma.account.count()],
        ['Session', () => prisma.session.count()],
        ['BetaSession', () => prisma.betaSession.count()],
        ['Payment', () => prisma.payment.count()],
        ['CreditTransaction', () => prisma.creditTransaction.count()],
        ['Review', () => prisma.businessReview?.count?.().catch(() => 'err') ?? Promise.resolve('skip')],
        ['Waitlist', () => prisma.waitlist.count().catch(() => 'err')],
        ['SystemLog', () => prisma.systemLog.count().catch(() => 'err')],
        ['AnalyticsEvent', () => prisma.analyticsEvent.count().catch(() => 'err')],
        ['VehicleOfTheDay', () => prisma.vehicleOfTheDay.count().catch(() => 'err')],
    ]
    console.log('\n=== CONTEO POR TABLA ===')
    for (const [name, fn] of tables) {
        try { console.log(`  ${name.padEnd(18)}: ${await fn()}`) }
        catch (e) { console.log(`  ${name.padEnd(18)}: ERROR ${e.message.slice(0,60)}`) }
    }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
