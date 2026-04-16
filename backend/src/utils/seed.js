require("dotenv").config({ path: "../.env" });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash("Admin@123", 12);
  const userPass = await bcrypt.hash("User@1234", 12);

  // Create admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@taskflow.dev",
      password: adminPass,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create regular users
  const user1 = await prisma.user.create({
    data: {
      name: "Ravi Shyam",
      email: "ravi@taskflow.dev",
      password: userPass,
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Jane Doe",
      email: "jane@taskflow.dev",
      password: userPass,
      role: "USER",
    },
  });
  console.log(`✅ Users created: ${user1.email}, ${user2.email}`);

  // Seed tasks
  const tasks = [
    { title: "Design API schema", description: "Plan DB models and relationships", status: "COMPLETED", priority: 3, userId: user1.id },
    { title: "Build auth system", description: "JWT + bcrypt password hashing", status: "COMPLETED", priority: 3, userId: user1.id },
    { title: "Write CRUD endpoints", description: "Tasks API with filtering & pagination", status: "IN_PROGRESS", priority: 2, userId: user1.id },
    { title: "Add Swagger docs", description: "Document all endpoints with JSDoc", status: "PENDING", priority: 2, userId: user1.id },
    { title: "Write unit tests", description: "Test auth and task controllers", status: "PENDING", priority: 1, userId: user1.id },
    { title: "Setup CI/CD pipeline", description: "GitHub Actions for auto deploy", status: "PENDING", priority: 2, userId: user2.id },
    { title: "Deploy to production", description: "Railway or Render hosting", status: "PENDING", priority: 3, userId: user2.id },
    { title: "Review frontend integration", description: "Test API calls from React app", status: "IN_PROGRESS", priority: 2, userId: user2.id },
  ];

  await prisma.task.createMany({ data: tasks });
  console.log(`✅ ${tasks.length} tasks seeded`);

  console.log("\n📋 Seed credentials:");
  console.log("   Admin  → admin@taskflow.dev / Admin@123");
  console.log("   User 1 → ravi@taskflow.dev  / User@1234");
  console.log("   User 2 → jane@taskflow.dev  / User@1234\n");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
