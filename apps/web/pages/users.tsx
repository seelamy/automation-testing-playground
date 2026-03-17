import { GetServerSideProps } from 'next'
import { useState } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Modal from '@/components/Modal'
import SearchBar from '@/components/SearchBar'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

interface User {
  id: number; email: string; name: string | null; role: string; createdAt: string
}

export default function UsersPage({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'USER' })

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name || '').toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditing(null)
    setForm({ name: '', email: '', role: 'USER' })
    setModalOpen(true)
  }

  function openEdit(u: User) {
    setEditing(u)
    setForm({ name: u.name || '', email: u.email, role: u.role })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/users/${editing.id}` : '/api/users'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const saved = await res.json()
      if (editing) {
        setUsers(users.map((u) => (u.id === saved.id ? { ...saved, createdAt: saved.createdAt } : u)))
      } else {
        setUsers([saved, ...users])
      }
      setModalOpen(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this user?')) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (res.ok) setUsers(users.filter((u) => u.id !== id))
  }
  
    async function handlePromote(id: number) {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'ADMIN' }),
      })
      if (res.ok) {
        const updated = await res.json()
        setUsers(users.map((u) => (u.id === updated.id ? { ...updated, createdAt: updated.createdAt } : u)))
      }
    }

  return (
    <ProtectedRoute>
      <Layout>
        <div data-testid="users-page">
          <div className="flex items-center justify-between mb-6">
            <h1 data-testid="users-title" className="text-2xl font-bold">Users</h1>
            <button data-testid="btn-create-user" onClick={openCreate} className="btn-primary">
              + Add User
            </button>
          </div>

          <div className="mb-4 max-w-md">
            <SearchBar value={search} onChange={setSearch} placeholder="Search users..." testId="users-search" />
          </div>

          <div className="card overflow-hidden">
            <table data-testid="users-table" className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} data-testid={`user-row-${u.id}`} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{u.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{u.name || '—'}</td>
                    <td className="px-6 py-4 text-sm">{u.email}</td>
                    <td className="px-6 py-4">
                      <span data-testid={`user-role-${u.id}`} className={u.role === 'ADMIN' ? 'badge-blue' : 'badge-green'}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button data-testid={`btn-edit-user-${u.id}`} onClick={() => openEdit(u)} className="btn-secondary text-xs">
                        Edit
                      </button>
                      <button data-testid={`btn-delete-user-${u.id}`} onClick={() => handleDelete(u.id)} className="btn-danger text-xs">
                        Delete
                      </button>
                        {u.role !== 'ADMIN' && (
                          <button data-testid={`btn-promote-user-${u.id}`} onClick={() => handlePromote(u.id)} className="btn-primary text-xs">
                            Make Admin
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} data-testid="users-empty" className="px-6 py-8 text-center text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Create User'} testId="user-modal">
          <form onSubmit={handleSave} data-testid="user-form" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input data-testid="input-user-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input data-testid="input-user-email" className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select data-testid="select-user-role" className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button data-testid="btn-cancel-user" type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button data-testid="btn-save-user" type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      </Layout>
    </ProtectedRoute>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  return {
    props: {
      initialUsers: users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
    },
  }
}
