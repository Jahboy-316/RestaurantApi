const bcrypt = require("bcrypt");
const prisma = require("../src/config/db");

async function seed() {
  console.log("Seeding database with demo data...");

  // 1. Create Users
  const passwordHash = await bcrypt.hash("password123", 10);

  const customer = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Customer",
      email: "alice@example.com",
      password: passwordHash,
      role: "CUSTOMER"
    }
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: {},
    create: {
      name: "Restaurant Staff",
      email: "staff@example.com",
      password: passwordHash,
      role: "STAFF"
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin Manager",
      email: "admin@example.com",
      password: passwordHash,
      role: "ADMIN"
    }
  });

  console.log("Users seeded (alice@example.com, staff@example.com, admin@example.com / password123)");

  // 2. Create Categories
  const burgersCategory = await prisma.category.upsert({
    where: { name: "Burgers" },
    update: {},
    create: { name: "Burgers" }
  });

  const pizzasCategory = await prisma.category.upsert({
    where: { name: "Pizzas" },
    update: {},
    create: { name: "Pizzas" }
  });

  const drinksCategory = await prisma.category.upsert({
    where: { name: "Beverages" },
    update: {},
    create: { name: "Beverages" }
  });

  const dessertsCategory = await prisma.category.upsert({
    where: { name: "Desserts" },
    update: {},
    create: { name: "Desserts" }
  });

  console.log("Categories seeded");

  // 3. Create Menu Items
  const sampleItems = [
    {
      name: "Classic Cheeseburger",
      description: "Charbroiled Angus beef patty, cheddar cheese, crisp lettuce, tomato, pickles, and house sauce.",
      price: "12.99",
      isAvailable: true,
      categoryId: burgersCategory.id
    },
    {
      name: "Smoky BBQ Bacon Burger",
      description: "Crispy applewood smoked bacon, caramelized onions, smoked gouda, and tangy barbecue drizzle.",
      price: "15.49",
      isAvailable: true,
      categoryId: burgersCategory.id
    },
    {
      name: "Margherita Pizza",
      description: "San Marzano tomato sauce, fresh mozzarella di bufala, basil leaves, and extra virgin olive oil.",
      price: "14.99",
      isAvailable: true,
      categoryId: pizzasCategory.id
    },
    {
      name: "Pepperoni Passion Pizza",
      description: "Loaded with spicy artisanal pepperoni, mozzarella blend, and rich oregano marinara.",
      price: "17.49",
      isAvailable: true,
      categoryId: pizzasCategory.id
    },
    {
      name: "Artisan Lemonade",
      description: "Freshly squeezed Meyer lemons with organic cane sugar and crushed mint leaves.",
      price: "4.50",
      isAvailable: true,
      categoryId: drinksCategory.id
    },
    {
      name: "Cold Brew Espresso",
      description: "Smooth 18-hour steeped single-origin Ethiopian coffee poured over crystal ice.",
      price: "5.00",
      isAvailable: true,
      categoryId: drinksCategory.id
    },
    {
      name: "Molten Chocolate Lava Cake",
      description: "Warm dark chocolate ganache center served with a scoop of Madagascar vanilla bean gelato.",
      price: "8.99",
      isAvailable: true,
      categoryId: dessertsCategory.id
    },
    {
      name: "Classic Italian Tiramisu",
      description: "Espresso-soaked savoiardi ladyfingers layered with rich mascarpone zabaglione and cocoa.",
      price: "7.99",
      isAvailable: true,
      categoryId: dessertsCategory.id
    }
  ];

  for (const item of sampleItems) {
    const existing = await prisma.menuItem.findFirst({
      where: { name: item.name }
    });
    if (!existing) {
      await prisma.menuItem.create({ data: item });
    }
  }

  console.log("Menu items seeded");

  // 4. Create Tables
  const tableData = [
    { tableNumber: 1, capacity: 2, isAvailable: true },
    { tableNumber: 2, capacity: 4, isAvailable: true },
    { tableNumber: 3, capacity: 6, isAvailable: true }
  ];

  for (const t of tableData) {
    await prisma.restaurantTable.upsert({
      where: { tableNumber: t.tableNumber },
      update: {},
      create: t
    });
  }

  console.log("Tables seeded");
  console.log("Database seeded successfully!");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
