const { PrismaClient } = require('@prisma/client');
const {
  users,
  invoices,
  customers,
  revenue,
  modules,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedUsers() {
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });
  }
}

async function seedInvoices() {
  for (const invoice of invoices) {
    await prisma.invoice.create({
      data: {
        customer_id: invoice.customer_id,
        amount: invoice.amount,
        status: invoice.status,
        date: new Date(invoice.date),
      },
    });
  }
}

async function seedCustomers() {
  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { email: customer.email },
      update: {
        id: customer.id,
        name: customer.name,
        image_url: customer.image_url,
      },
      create: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
      },
    });
  }
}

async function seedRevenue() {
  for (const rev of revenue) {
    await prisma.revenue.upsert({
      where: { month: rev.month },
      update: {},
      create: {
        month: rev.month,
        revenue: rev.revenue,
      },
    });
  }
}

async function seedModules() {
  for (const module of modules) {
    await prisma.module.upsert({
      where: { moduleName: module.moduleName, id: module.id },
      update: {
        description: module.description,
        createdAt: new Date(),
      },
      create: {
        moduleName: module.moduleName,
        description: module.description,
        createdAt: new Date(),
      },
    });
  }
}

async function main() {
  await prisma.$connect();
  // await seedCustomers();
  // await seedUsers();
  // await seedInvoices();
  // await seedRevenue();
  await seedModules();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
