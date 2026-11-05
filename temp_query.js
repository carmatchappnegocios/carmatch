require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const vehicles = await prisma.vehicle.findMany({
    where: { brand: 'Ford', model: 'F-150' },
    select: { id: true, brand: true, model: true, version: true, title: true, year: true },
    take: 10
  });
  console.log(JSON.stringify(vehicles, null, 2));
  await prisma.$disconnect();
})();