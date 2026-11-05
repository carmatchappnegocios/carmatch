import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const res = await prisma.notification.deleteMany({ where: { isFake: true } });
  console.log('Deleted fake notifications:', res.count);
  const res2 = await prisma.notification.deleteMany({ where: { title: { contains: 'le gustó tu vehículo' } } });
  console.log('Deleted similar title:', res2.count);
  await prisma.$disconnect();
}
main();