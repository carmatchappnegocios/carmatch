require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const vehicles = await prisma.vehicle.findMany({
    where: { version: { contains: 'Ford', mode: 'insensitive' } },
    select: { id: true, brand: true, model: true, version: true, title: true, year: true },
    take: 50
  });
  console.log('count', vehicles.length);
  console.log(JSON.stringify(vehicles.slice(0,10), null, 2));
  await prisma.$disconnect();
})();