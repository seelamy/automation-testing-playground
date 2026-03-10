// Production seed script for Neon PostgreSQL
// Run: DATABASE_URL="your-neon-url" npx ts-node prisma/seed-prod.ts

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding production database...')

  // Create users
  const users = []
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        name: `User ${i}`,
        role: i === 1 ? 'ADMIN' : 'USER',
      },
    })
    users.push(user)
  }
  console.log(`Created ${users.length} users`)

  // Create products
  const productData = [
    { name: 'Pro Subscription', description: 'Monthly pro plan', priceCents: 2999 },
    { name: 'Enterprise License', description: 'Annual enterprise license', priceCents: 49900 },
    { name: 'API Access Token', description: '10,000 API calls/month', priceCents: 999 },
    { name: 'Cloud Storage 100GB', description: 'Additional cloud storage', priceCents: 1499 },
    { name: 'Support Package', description: '24/7 priority support', priceCents: 19900 },
  ]
  const products = []
  for (const p of productData) {
    const product = await prisma.product.upsert({
      where: { id: products.length + 1 },
      update: {},
      create: p,
    })
    products.push(product)
  }
  console.log(`Created ${products.length} products`)

  // Create orders and payments
  const statuses = ['PENDING', 'COMPLETED', 'FAILED', 'COMPLETED', 'COMPLETED', 'PENDING', 'COMPLETED', 'COMPLETED', 'PENDING', 'COMPLETED']
  for (let i = 0; i < 10; i++) {
    const user = users[i % users.length]
    const product = products[i % products.length]
    const qty = (i % 3) + 1

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: qty,
      },
    })

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amountCents: product.priceCents * qty,
        status: statuses[i],
      },
    })
  }
  console.log('Created 10 orders and 10 payments')
  console.log('Seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
