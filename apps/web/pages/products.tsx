import { GetServerSideProps } from 'next'
import { useState } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Modal from '@/components/Modal'
import SearchBar from '@/components/SearchBar'
import prisma from '@/lib/prisma'
import { formatCents, formatDate } from '@/lib/utils'

interface Product {
  id: number; name: string; description: string | null; priceCents: number; createdAt: string
}

export default function ProductsPage({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '' })

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditing(null)
    setForm({ name: '', description: '', price: '' })
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, description: p.description || '', price: (p.priceCents / 100).toFixed(2) })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const body = { name: form.name, description: form.description, priceCents: Math.round(parseFloat(form.price) * 100) }
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/products/${editing.id}` : '/api/products'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      const saved = await res.json()
      if (editing) {
        setProducts(products.map((p) => (p.id === saved.id ? { ...saved, createdAt: saved.createdAt } : p)))
      } else {
        setProducts([saved, ...products])
      }
      setModalOpen(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) setProducts(products.filter((p) => p.id !== id))
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div data-testid="products-page">
          <div className="flex items-center justify-between mb-6">
            <h1 data-testid="products-title" className="text-2xl font-bold">Products</h1>
            <button data-testid="btn-create-product" onClick={openCreate} className="btn-primary">
              + Add Product
            </button>
          </div>

          <div className="mb-4 max-w-md">
            <SearchBar value={search} onChange={setSearch} placeholder="Search products..." testId="products-search" />
          </div>

          <div className="card overflow-hidden">
            <table data-testid="products-table" className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} data-testid={`product-row-${p.id}`} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{p.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.description || '—'}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatCents(p.priceCents)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button data-testid={`btn-edit-product-${p.id}`} onClick={() => openEdit(p)} className="btn-secondary text-xs">Edit</button>
                      <button data-testid={`btn-delete-product-${p.id}`} onClick={() => handleDelete(p.id)} className="btn-danger text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} data-testid="products-empty" className="px-6 py-8 text-center text-gray-400">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Create Product'} testId="product-modal">
          <form onSubmit={handleSave} data-testid="product-form" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input data-testid="input-product-name" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea data-testid="input-product-description" className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input data-testid="input-product-price" className="input" type="number" step="0.01" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button data-testid="btn-cancel-product" type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button data-testid="btn-save-product" type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      </Layout>
    </ProtectedRoute>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  return {
    props: {
      initialProducts: products.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    },
  }
}
