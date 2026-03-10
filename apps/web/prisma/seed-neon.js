// Direct PostgreSQL seed script - bypasses Prisma client lock
// Uses 'pg' library to seed Neon database directly

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL env variable is required')
  process.exit(1)
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('Connected to Neon PostgreSQL')

  // Clear existing data (in order to respect foreign keys)
  await client.query('DELETE FROM "Payment"')
  await client.query('DELETE FROM "Order"')
  await client.query('DELETE FROM "Product"')
  await client.query('DELETE FROM "User"')
  console.log('Cleared existing data')

  // Reset sequences
  await client.query('ALTER SEQUENCE "User_id_seq" RESTART WITH 1')
  await client.query('ALTER SEQUENCE "Product_id_seq" RESTART WITH 1')
  await client.query('ALTER SEQUENCE "Order_id_seq" RESTART WITH 1')
  await client.query('ALTER SEQUENCE "Payment_id_seq" RESTART WITH 1')

  // Create users
  for (let i = 1; i <= 10; i++) {
    await client.query(
      'INSERT INTO "User" (email, name, role) VALUES ($1, $2, $3)',
      [`user${i}@example.com`, `User ${i}`, i === 1 ? 'ADMIN' : 'USER']
    )
  }
  console.log('Created 10 users')

  // Create products
  const products = [
    ['Pro Subscription', 'Monthly pro plan', 2999],
    ['Enterprise License', 'Annual enterprise license', 49900],
    ['API Access Token', '10,000 API calls/month', 999],
    ['Cloud Storage 100GB', 'Additional cloud storage', 1499],
    ['Support Package', '24/7 priority support', 19900],
  ]
  for (const [name, desc, price] of products) {
    await client.query(
      'INSERT INTO "Product" (name, description, "priceCents") VALUES ($1, $2, $3)',
      [name, desc, price]
    )
  }
  console.log('Created 5 products')

  // Create orders and payments
  const statuses = ['PENDING','COMPLETED','FAILED','COMPLETED','COMPLETED','PENDING','COMPLETED','COMPLETED','PENDING','COMPLETED']
  for (let i = 0; i < 10; i++) {
    const userId = (i % 10) + 1
    const productId = (i % 5) + 1
    const qty = (i % 3) + 1

    // Get product price
    const prodRes = await client.query('SELECT "priceCents" FROM "Product" WHERE id = $1', [productId])
    const priceCents = prodRes.rows[0].priceCents

    const orderRes = await client.query(
      'INSERT INTO "Order" ("userId", "productId", quantity) VALUES ($1, $2, $3) RETURNING id',
      [userId, productId, qty]
    )
    const orderId = orderRes.rows[0].id

    await client.query(
      'INSERT INTO "Payment" ("orderId", "amountCents", status) VALUES ($1, $2, $3)',
      [orderId, priceCents * qty, statuses[i]]
    )
  }
  console.log('Created 10 orders and 10 payments')

  // Verify
  const counts = await client.query(`
    SELECT 
      (SELECT COUNT(*) FROM "User") as users,
      (SELECT COUNT(*) FROM "Product") as products,
      (SELECT COUNT(*) FROM "Order") as orders,
      (SELECT COUNT(*) FROM "Payment") as payments
  `)
  console.log('Verification:', counts.rows[0])
  console.log('Seed complete!')

  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
