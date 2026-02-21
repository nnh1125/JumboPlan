import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const program = await prisma.program.upsert({
    where: { id: "BSCS" },
    update: {},
    create: {
      id: "BSCS",
      school: "Computer Science",
      name: "Bachelor of Science in Computer Science",
      catalogYear: "2024-2025",
    },
  });

  console.log("Seeded program:", program);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });