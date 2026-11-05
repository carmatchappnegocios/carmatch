require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, brand: true, model: true, version: true, title: true, year: true },
    take: 200
  });
  const dup = vehicles.filter(v => {
    const t = v.title;
    // check if brand model appears twice
    const bm = `${v.brand} ${v.model}`;
    // count occurrences case-insensitive
    const re = new RegExp(bm.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\$&'), 'gi');
    const matches = t.match(re);
    return matches && matches.length > 1;
  });
  console.log('dup title count', dup.length);
  console.log(JSON.stringify(dup.slice(0,10), null, 2));
  await prisma.$disconnect();
})();