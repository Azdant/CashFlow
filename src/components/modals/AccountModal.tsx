'use client'

// ============================================================
// CashFlow — AccountModal
// Popup untuk manage akun / wallet
// ============================================================

import { useState } from 'react'
import { Account, AccountInput, AccountType } from '@/types'
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ICONS, ACCOUNT_COLORS } from '@/lib/utils'

interface Props {
  account?: Account
  onClose: () => void
  onSave: (input: AccountInput) => Promise<void>
  onDelete?: () => Promise<void>
}

const COLORS = ['#059669', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#0891b2', '#d97706', '#6b7280']

export default function AccountModal({ account, onClose, onSave, onDelete }: Props) {
  const isEdit = !!account

  const [name, setName] = useState(account?.name || '')
  const [type, setType] = useState<AccountType>(account?.type || 'bank')
  const [color, setColor] = useState(account?.color || ACCOUNT_COLORS[type])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nama akun wajib diisi')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onSave({
        name: name.trim(),
        type,
        color,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan akun')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('Hapus akun ini? Semua transaksi akan tetap ada tapi tidak terhubung ke akun.')) return

    setLoading(true)
    try {
      await onDelete()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus akun')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl p-6 max-w-lg mx-auto animated-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {isEdit ? 'Edit Akun' : 'Tambah Akun'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          {/* Nama Akun */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Akun
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: BCA, GoPay, Dompet Tunai"
              className="input"
            />
          </div>

          {/* Tipe Akun */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Akun
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(ACCOUNT_TYPES as AccountType[]).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t)
                    setColor(ACCOUNT_COLORS[t])
                  }}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all text-center',
                    type === t
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="text-2xl mb-1">{ACCOUNT_TYPE_ICONS[t]}</div>
                  <div className="text-xs font-medium text-gray-700">
                    {ACCOUNT_TYPE_LABELS[t]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Warna */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warna
            </label>
            <div className="grid grid-cols-8 gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-10 h-10 rounded-lg border-2 transition-all',
                    color === c ? 'border-gray-800 scale-110' : 'border-gray-300'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          {isEdit && onDelete && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 disabled:opacity-50"
            >
              Hapus
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper untuk cn
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
