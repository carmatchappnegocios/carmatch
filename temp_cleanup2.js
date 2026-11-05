import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main(){
  const res = await prisma.notification.deleteMany({ where: { isFake: true } });
  console.log('Deleted fake notifications:', res.count);
  await prisma.$disconnect();
}
main();