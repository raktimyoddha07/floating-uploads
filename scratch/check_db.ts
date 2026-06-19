import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== Channels ===");
  const channels = await prisma.channel.findMany();
  console.log(JSON.stringify(channels, null, 2));

  console.log("\n=== Upload Requests ===");
  const reqs = await prisma.uploadRequest.findMany({
    include: {
      channel: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });
  console.log(JSON.stringify(reqs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
