import { GetServerSideProps } from 'next'
import { useState } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Modal from '@/components/Modal'
import prisma from '@/lib/prisma'
import { formatCents, formatDate } from '@/lib/utils'

interface PaymentRow {
  id: number; orderId: number; amountCents: number; status: string; createdAt: string
  userName: string; productName: string
}
interface ProductOption { id: number; name: string; priceCents: number }

const STEPS = ['Select Product', 'Quantity & Review', 'Payment Info', 'Confirm'] as const

export default function PaymentsPage({ payments: initial, products }: { payments: PaymentRow[]; products: ProductOption[] }) {
  const [payments] = useState(initial)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null)
  const [qty, setQty] = useState(1)
  const [cardNumber, setCardNumber] = useState('')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  function startCheckout() {
    setStep(0); setSelectedProduct(null); setQty(1); setCardNumber(''); setSuccess(false)
    setCheckoutOpen(true)
  }

  async function handleConfirm() {
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 1500)) // mock processing
    setProcessing(false)
    setSuccess(true)
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div data-testid="payments-page">
          <div className="flex items-center justify-between mb-6">
            <h1 data-testid="payments-title" className="text-2xl font-bold">Payments</h1>
            <button data-testid="btn-new-checkout" onClick={startCheckout} className="btn-primary">
              💳 New Checkout
            </button>
          </div>

          <div className="card overflow-hidden">
            <table data-testid="payments-table" className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} data-testid={`payment-row-${p.id}`} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{p.id}</td>
                    <td className="px-6 py-4 text-sm">{p.userName}</td>
                    <td className="px-6 py-4 text-sm">{p.productName}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatCents(p.amountCents)}</td>
                    <td className="px-6 py-4">
                      <span data-testid={`payment-status-${p.id}`} className={p.status === 'COMPLETED' ? 'badge-green' : p.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-step Checkout Modal */}
        <Modal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Checkout" testId="checkout-modal">
          {/* Step indicator */}
          <div data-testid="checkout-steps" className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div data-testid={`checkout-step-${i}`} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {success ? (
            <div data-testid="checkout-success" className="text-center py-6">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-700">Payment Successful!</h3>
              <p className="text-gray-500 mt-2">Your order has been placed.</p>
              <button data-testid="btn-checkout-done" onClick={() => setCheckoutOpen(false)} className="btn-primary mt-4">Done</button>
            </div>
          ) : (
            <>
              {/* Step 0: Select Product */}
              {step === 0 && (
                <div data-testid="checkout-step-product" className="space-y-3">
                  <p className="text-sm font-medium mb-2">Select a product:</p>
                  {products.map((p) => (
                    <button
                      key={p.id}
                      data-testid={`checkout-product-${p.id}`}
                      onClick={() => { setSelectedProduct(p); setStep(1) }}
                      className={`w-full text-left p-4 rounded-lg border transition-colors hover:border-primary-500 ${selectedProduct?.id === p.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-500">{formatCents(p.priceCents)}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1: Quantity */}
              {step === 1 && selectedProduct && (
                <div data-testid="checkout-step-quantity" className="space-y-4">
                  <p className="text-sm">Product: <strong>{selectedProduct.name}</strong></p>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input data-testid="input-checkout-qty" type="number" min={1} max={99} className="input" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
                  </div>
                  <p data-testid="checkout-subtotal" className="text-lg font-bold">
                    Total: {formatCents(selectedProduct.priceCents * qty)}
                  </p>
                  <div className="flex justify-between pt-2">
                    <button data-testid="btn-checkout-back-1" onClick={() => setStep(0)} className="btn-secondary">Back</button>
                    <button data-testid="btn-checkout-next-1" onClick={() => setStep(2)} className="btn-primary">Next</button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Info */}
              {step === 2 && (
                <div data-testid="checkout-step-payment" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Number</label>
                    <input data-testid="input-card-number" className="input" placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiry</label>
                      <input data-testid="input-card-expiry" className="input" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CVC</label>
                      <input data-testid="input-card-cvc" className="input" placeholder="123" />
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <button data-testid="btn-checkout-back-2" onClick={() => setStep(1)} className="btn-secondary">Back</button>
                    <button data-testid="btn-checkout-next-2" onClick={() => setStep(3)} className="btn-primary">Review Order</button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && selectedProduct && (
                <div data-testid="checkout-step-confirm" className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Product</span><span className="font-medium">{selectedProduct.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-medium">{qty}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Card</span><span className="font-medium">**** {cardNumber.slice(-4) || '4242'}</span></div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatCents(selectedProduct.priceCents * qty)}</span></div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <button data-testid="btn-checkout-back-3" onClick={() => setStep(2)} className="btn-secondary">Back</button>
                    <button data-testid="btn-checkout-confirm" onClick={handleConfirm} disabled={processing} className="btn-primary">
                      {processing ? 'Processing...' : 'Confirm & Pay'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal>
      </Layout>
    </ProtectedRoute>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const [paymentRows, products] = await Promise.all([
    prisma.payment.findMany({
      include: { order: { include: { user: true, product: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
  ])

  return {
    props: {
      payments: paymentRows.map((p) => ({
        id: p.id, orderId: p.orderId, amountCents: p.amountCents, status: p.status,
        createdAt: p.createdAt.toISOString(),
        userName: p.order.user.name || p.order.user.email,
        productName: p.order.product.name,
      })),
      products: products.map((p) => ({ id: p.id, name: p.name, priceCents: p.priceCents })),
    },
  }
}
