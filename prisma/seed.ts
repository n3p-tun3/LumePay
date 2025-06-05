import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Add any non-waitlist seed data here
  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 