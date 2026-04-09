import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashSync } from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "isontheedgee@gmail.com" },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: "isontheedgee@gmail.com",
        name: "Admin",
        password: hashSync("m1nh4s3nh4", 12),
        role: "admin",
      },
    });
    console.log("Superuser created: isontheedgee@gmail.com");
  } else {
    console.log("Superuser already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
