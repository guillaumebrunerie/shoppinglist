const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.shoppingList.create({
    data: {
      id: "shoppingList",
    }
  });

  await prisma.item.create({
    data: {
      shoppingListId: "shoppingList",
      order: 0,
      value: "Tomatoes",
    }
  });
  await prisma.item.create({
    data: {
      shoppingListId: "shoppingList",
      order: 1,
      value: "Carrots",
    }
  });
  await prisma.item.create({
    data: {
      shoppingListId: "shoppingList",
      order: 2,
      value: "Watermelon",
    }
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
