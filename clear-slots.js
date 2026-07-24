const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.weeklySlot.deleteMany();
  console.log(`Deleted ${deleted.count} weekly slots.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
