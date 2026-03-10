import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // create users
  const users = []
  for (let i = 1; i <= 10; i++) {
    users.push(
      await prisma.user.create({
        data: {
          email: `user${i}@example.com`,
          name: `User ${i}`,
          role: i === 1 ? 'ADMIN' : 'USER',
        },
      })
    )
  }

  // create products
  const products = []
  for (let i = 1; i <= 5; i++) {
    products.push(
      await prisma.product.create({
        data: {
          name: `Product ${i}`,
          description: `Description for product ${i}`,
          priceCents: 1000 * i,
        },
      })
    )
  }

  // create orders and payments
  for (let i = 1; i <= 10; i++) {
    const order = await prisma.order.create({
      data: {
        userId: users[i - 1].id,
        productId: products[(i % products.length)].id,
        quantity: (i % 3) + 1,
      },
    })

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amountCents: order.quantity * products[(i % products.length)].priceCents,
        status: i % 2 === 0 ? 'COMPLETED' : 'PENDING',
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
