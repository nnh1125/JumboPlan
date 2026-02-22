import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding courses...");

  await prisma.course.createMany({
    data: [
      {
        id: "CS11",
        subject: "CS",
        number: "11",
        title: "Introduction to Computer Science",
        credits: 4,
      },
      {
        id: "CS15",
        subject: "CS",
        number: "15",
        title: "Data Structures",
        credits: 4,
      },
      {
        id: "CS40",
        subject: "CS",
        number: "40",
        title: "Machine Structure and Assembly",
        credits: 4,
      },
      {
        id: "MATH32",
        subject: "MATH",
        number: "32",
        title: "Calculus II",
        credits: 4,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Courses seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });