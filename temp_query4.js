require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, brand: true, model: true, version: true, title: true, year: true },
    where: { title: { contains: '  ' } },
    take: 100
  });
  const dup = vehicles.filter(v => {
    if (!v.version) return false;
    const prefix = `${v.brand} ${v.model}`.toLowerCase().replace(/\s+/g,' ');
    const ver = v.version.toLowerCase().replace(/\s+/g,' ');
    return ver.startsWith(prefix);
  });
  console.log('dup count', dup.length);
  console.log(JSON.stringify(dup.slice(0,10), null, 2));
  await prisma.$disconnect();
})();