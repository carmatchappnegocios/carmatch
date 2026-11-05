const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
    const v = await prisma.vehicle.findUnique({
        where: { id: 'cmvsw3xdk0001la081h3cmimn' },
        select: { id: true, title: true, userId: true, status: true },
    })
    console.log('Vehículo del chat:', JSON.stringify(v))
    const f150 = await prisma.vehicle.findFirst({
        where: { title: { contains: 'F-150' } },
        select: { id: true, title: true, userId: true },
    })
    console.log('F-150            :', JSON.stringify(f150))
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
