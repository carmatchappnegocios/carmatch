require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const vehicles = await prisma.vehicle.findMany({
    where: { brand: { contains: 'Ford', mode: 'insensitive' } },
    select: { id: true, brand: true, model: true, version: true, title: true, year: true },
    take: 20
  });
  console.log('count', vehicles.length);
  console.log(JSON.stringify(vehicles.slice(0,5), null, 2));
  await prisma.$disconnect();
})();