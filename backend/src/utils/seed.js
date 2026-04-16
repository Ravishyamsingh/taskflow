require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Ensuring demo data exists...");

  const demoUsers = [
    {
      name: "Admin User",
      email: "admin@taskflow.dev",
      password: "Admin@123",
      role: "ADMIN",
    },
    {
      name: "Ravi Shyam",
      email: "ravi@taskflow.dev",
      password: "User@1234",
      role: "USER",
    },
    {
      name: "Jane Doe",
      email: "jane@taskflow.dev",
      password: "User@1234",
      role: "USER",
    },
  ];

  const users = {};

  for (const demo of demoUsers) {
    const hashed = await bcrypt.hash(demo.password, 12);
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {
        name: demo.name,
        password: hashed,
        role: demo.role,
      },
      create: {
        name: demo.name,
        email: demo.email,
        password: hashed,
        role: demo.role,
      },
    });
    users[demo.email] = user;
  }

  const raviId = users["ravi@taskflow.dev"].id;
  const janeId = users["jane@taskflow.dev"].id;

  const seedTasks = [
    {
      title: "Design API schema",
      description: "Plan DB models and relationships",
      status: "COMPLETED",
      priority: 3,
      userId: raviId,
    },
    {
      title: "Build auth system",
      description: "JWT + bcrypt password hashing",
      status: "COMPLETED",
      priority: 3,
      userId: raviId,
    },
    {
      title: "Write CRUD endpoints",
      description: "Tasks API with filtering and pagination",
      status: "IN_PROGRESS",
      priority: 2,
      userId: raviId,
    },
    {
      title: "Add Swagger docs",
      description: "Document all endpoints with JSDoc",
      status: "PENDING",
      priority: 2,
      userId: raviId,
    },
    {
      title: "Deploy to production",
      description: "Railway production deployment",
      status: "PENDING",
      priority: 3,
      userId: janeId,
    },
  ];

  const totalTasks = await prisma.task.count();
  if (totalTasks === 0) {
    await prisma.task.createMany({ data: seedTasks });
    console.log(`✅ ${seedTasks.length} demo tasks created`);
  } else {
    console.log("ℹ️ Tasks already exist. Skipping demo task creation.");
  }

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
